import browser from 'webextension-polyfill';
import {
	getAppDomain,
	getUserAgent,
	isEnabled,
	isUserAgentSpooferEnabled,
	setEnabled,
	setUserAgentSpooferEnabled,
} from '../../entries/utils';

const domain = getAppDomain();

browser.runtime.onInstalled.addListener(async () => {
	console.log('Extension installed');

	try {
		const enabled = await isEnabled();

		if (enabled === null) {
			await setEnabled(true);
		}
	} catch (error) {
		console.error(
			'Error setting default storage data value for enabled:',
			error,
		);
	}

	try {
		const userAgentSpooferEnabled = await isUserAgentSpooferEnabled();

		if (userAgentSpooferEnabled === null) {
			await setUserAgentSpooferEnabled(true);
		}
	} catch (error) {
		console.error(
			'Error setting default storage data value for userAgentSpooferEnabled:',
			error,
		);
	}
});

const userAgent = getUserAgent();

function chromeNetworkCode() {
	const RULE_ID = 1;

	function getRules(enabled: boolean) {
		return enabled
			? {
					removeRuleIds: [RULE_ID],
					addRules: [
						{
							id: RULE_ID,
							priority: 1,
							action: {
								type: chrome.declarativeNetRequest
									.RuleActionType.MODIFY_HEADERS,
								requestHeaders: [
									{
										header: 'user-agent',
										operation:
											chrome.declarativeNetRequest
												.HeaderOperation.SET,
										value: userAgent,
									},
								],
							},
							condition: {
								resourceTypes: [
									chrome.declarativeNetRequest.ResourceType
										.MAIN_FRAME,
								],
								urlFilter: domain,
							},
						},
					],
				}
			: {
					removeRuleIds: [RULE_ID],
				};
	}

	chrome.runtime.onInstalled.addListener(async function () {
		const enabled = await isEnabled();
		const userAgentSpooferEnabled = await isUserAgentSpooferEnabled();

		let rules;
		if (!enabled || !userAgentSpooferEnabled) {
			rules = getRules(false);
		} else {
			rules = getRules(true);
		}

		chrome.declarativeNetRequest.updateDynamicRules(rules);
	});

	chrome.storage.onChanged.addListener(async function (changes, areaName) {
		if (
			areaName === 'sync' &&
			(changes.hasOwnProperty('enabled') ||
				changes.hasOwnProperty('userAgentSpooferEnabled'))
		) {
			const enabled = await isEnabled();
			const userAgentSpooferEnabled = await isUserAgentSpooferEnabled();

			let rules;
			if (!enabled || !userAgentSpooferEnabled) {
				rules = getRules(false);
			} else {
				rules = getRules(true);
			}

			chrome.declarativeNetRequest.updateDynamicRules(rules);
		}
	});
}

function firefoxNetworkCode() {
	browser.webRequest.onBeforeSendHeaders.addListener(
		async function (info) {
			const enabled = await isEnabled();
			const userAgentSpooferEnabled = await isUserAgentSpooferEnabled();

			if (!enabled || !userAgentSpooferEnabled) {
				return { requestHeaders: info.requestHeaders };
			}
			const headers = info.requestHeaders?.map((header) => {
				if (header.name.toLowerCase() === 'user-agent') {
					return { ...header, value: userAgent };
				}
				return header;
			});

			return { requestHeaders: headers };
		},
		{
			urls: [domain],
			types: ['main_frame', 'sub_frame'],
		},
		['blocking', 'requestHeaders'],
	);
}

if (chrome?.declarativeNetRequest !== undefined) {
	chromeNetworkCode();
} else {
	firefoxNetworkCode();
}
