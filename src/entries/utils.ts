import { Browser } from "webextension-polyfill";

export const getAppDomain = (): string => {
	return "*://chat.reddit.com/*";
};

export const getUserAgent = (): string => {
	return "Mozilla/5.0 (Windows NT 6.1; rv:68.0) Gecko/20100101 Goanna/4.7 Firefox/68.0 PaleMoon/28.17.0";
};

export async function isEnabled(browser: Browser): Promise<boolean> {
	try {
		const result = await browser.storage.sync.get("enabled");
		return result.enabled === true;
	} catch (error) {
		console.error("Error getting storage data:", error);
		return false;
	}
}

export async function isUserAgentSpooferEnabled(
	browser: Browser,
): Promise<boolean> {
	try {
		const result = await browser.storage.sync.get(
			"userAgentSpooferEnabled",
		);
		return result.userAgentSpooferEnabled === true;
	} catch (error) {
		console.error("Error getting storage data:", error);
		return false;
	}
}
