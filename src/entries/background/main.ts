import browser from 'webextension-polyfill';
import { getAppDomain } from '~/utils';

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

const userAgent =
	'Mozilla/5.0 (Linux; Android 10; RMX2151) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/89.0.4389.86 Mobile Safari/537.36';

if (chrome.declarativeNetRequest) {
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

	chrome.runtime.onInstalled.addListener(function () {
		chrome?.declarativeNetRequest.updateDynamicRules(rules);
	});
} else {
	browser.webRequest.onBeforeSendHeaders.addListener(
		function (info) {
			const headers = info.requestHeaders;
			if (headers) {
				headers?.forEach(function (header) {
					if (header.name.toLowerCase() == 'user-agent') {
						header.value = userAgent;
					}
				});
			}
			return { requestHeaders: headers };
		},
		{
			urls: [domain],
			types: ['main_frame', 'sub_frame'],
		},
		['blocking', 'requestHeaders'],
	);
}
