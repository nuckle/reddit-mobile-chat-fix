import browser from "webextension-polyfill";
import {
	getAppDomain,
	getUserAgent,
	isEnabled,
	isUserAgentSpooferEnabled,
} from "../../entries/utils";

const domain = getAppDomain();

browser.runtime.onInstalled.addListener(() => {
	console.log("Extension installed");

	browser.storage.sync
		.get("enabled")
		.then((data) => {
			if (data.enabled === undefined) {
				browser.storage.sync.set({ enabled: true });
			}
		})
		.catch((error) => {
			console.error("Error setting default enabled value:", error);
		});

	browser.storage.sync
		.get("userAgentSpooferEnabled")
		.then((data) => {
			if (data.userAgentSpooferEnabled === undefined) {
				browser.storage.sync.set({ userAgentSpooferEnabled: true });
			}
		})
		.catch((error) => {
			console.error(
				"Error setting default enabled value for user agent spoofing:",
				error,
			);
		});
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
										header: "user-agent",
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
		const enabled = await isEnabled(browser);
		const userAgentSpooferEnabled =
			await isUserAgentSpooferEnabled(browser);

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
			areaName === "sync" &&
			(changes.hasOwnProperty("enabled") ||
				changes.hasOwnProperty("userAgentSpooferEnabled"))
		) {
			const enabled = await isEnabled(browser);
			const userAgentSpooferEnabled =
				await isUserAgentSpooferEnabled(browser);

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
			const enabled = await isEnabled(browser);
			const userAgentSpooferEnabled =
				await isUserAgentSpooferEnabled(browser);

			if (!enabled || !userAgentSpooferEnabled) {
				return { requestHeaders: info.requestHeaders };
			}
			const headers = info.requestHeaders?.map((header) => {
				if (header.name.toLowerCase() === "user-agent") {
					return { ...header, value: userAgent };
				}
				return header;
			});

			return { requestHeaders: headers };
		},
		{
			urls: [domain],
			types: ["main_frame", "sub_frame"],
		},
		["blocking", "requestHeaders"],
	);
}

if (chrome?.declarativeNetRequest !== undefined) {
	chromeNetworkCode();
} else {
	firefoxNetworkCode();
}
