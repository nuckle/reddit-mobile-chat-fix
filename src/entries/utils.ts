import browser from "webextension-polyfill";

export const getAppDomain = (): string => {
	return "*://chat.reddit.com/*";
};

export const getUserAgent = (): string => {
	return "Mozilla/5.0 (Windows NT 6.1; rv:68.0) Gecko/20100101 Goanna/4.7 Firefox/68.0 PaleMoon/28.17.0";
};

export async function isEnabled(): Promise<boolean | null> {
	try {
		const result = await browser.storage.sync.get("enabled");
		const enabled = result.enabled;
		if (enabled !== null && enabled !== undefined) {
			return enabled === true;
		}
		return null;
	} catch (error) {
		console.error("Error getting storage data for enabled:", error);
		return false;
	}
}

export async function setEnabled(enableValue: boolean) {
	try {
		await browser.storage.sync.set({ enabled: enableValue });
	} catch (error) {
		console.error("Error setting storage data for enabled:", error);
	}
}

export async function isUserAgentSpooferEnabled(): Promise<boolean | null> {
	try {
		const result = await browser.storage.sync.get(
			"userAgentSpooferEnabled",
		);
		const userAgentSpooferEnabled = result.userAgentSpooferEnabled;

		if (
			userAgentSpooferEnabled !== null &&
			userAgentSpooferEnabled !== undefined
		) {
			return result.userAgentSpooferEnabled === true;
		}

		return null;
	} catch (error) {
		console.error(
			"Error getting storage data for userAgentSpooferEnabled:",
			error,
		);
		return false;
	}
}

export async function setUserAgentSpooferEnabled(enableValue: boolean) {
	try {
		await browser.storage.sync.set({
			userAgentSpooferEnabled: enableValue,
		});
	} catch (error) {
		console.error(
			"Error setting storage data for userAgentSpooferEnabled:",
			error,
		);
	}
}
