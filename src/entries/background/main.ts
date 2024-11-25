import browser from 'webextension-polyfill';
import { getAppDomain, getUserAgent, isEnabled } from '../../entries/utils';

const domain = getAppDomain();

browser.runtime.onInstalled.addListener(() => {
	console.log('Extension installed');

	browser.storage.sync
		.get('enabled')
		.then((data) => {
			if (data.enabled === undefined) {
				browser.storage.sync.set({ enabled: true });
			}
		})
		.catch((error) => {
			console.error('Error setting default enabled value:', error);
		});
});

const userAgent = getUserAgent();

if (chrome?.declarativeNetRequest !== undefined) {
	function updateRulesBasedOnEnabled() {
		isEnabled(browser).then((enabled) => {
			if (enabled) {
				const rules = {
					removeRuleIds: [1],
					addRules: [
						{
							id: 1,
							priority: 1,
							action: {
								type: chrome.declarativeNetRequest.RuleActionType.MODIFY_HEADERS,
								requestHeaders: [
									{
										header: 'user-agent',
										operation: chrome.declarativeNetRequest.HeaderOperation.SET,
										value: userAgent,
									},
								],
							},
							condition: {
								resourceTypes: [chrome.declarativeNetRequest.ResourceType.MAIN_FRAME],
								urlFilter: domain,
							},
						},
					],
				};

				chrome.declarativeNetRequest.updateDynamicRules(rules);
			} else {
				chrome.declarativeNetRequest.updateDynamicRules({
					removeRuleIds: [1],
				});
			}
		});
	}

	chrome.runtime.onInstalled.addListener(function () {
		updateRulesBasedOnEnabled();
	});

	chrome.storage.onChanged.addListener(function (changes, areaName) {
		if (areaName === 'sync' && changes.hasOwnProperty('enabled')) {
			updateRulesBasedOnEnabled();
		}
	});
} else {
	browser.webRequest.onBeforeSendHeaders.addListener(
		function (info) {
			return isEnabled(browser).then((enabled) => {
				if (enabled) {
					const headers = info.requestHeaders;
					if (headers) {
						headers.forEach(function (header) {
							if (header.name.toLowerCase() === 'user-agent') {
								header.value = userAgent;
							}
						});
					}
					return { requestHeaders: headers };
				}
				return { requestHeaders: info.requestHeaders };
			});
		},
		{
			urls: [domain],
			types: ['main_frame', 'sub_frame'],
		},
		['blocking', 'requestHeaders'],
	);
}
