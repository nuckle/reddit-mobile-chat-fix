import { Browser } from 'webextension-polyfill';

export const getAppDomain = (): string => {
	return '*://chat.reddit.com/*';
};

export const getUserAgent = (): string => {
	return 'Mozilla/5.0 (Linux; Android 10; RMX2151) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/89.0.4389.86 Mobile Safari/537.36';
};

export function isEnabled(browser: Browser) {
	return browser.storage.sync
		.get('enabled')
		.then((result) => {
			return result.enabled === true; // Return true if enabled is true, otherwise false
		})
		.catch((error) => {
			console.error('Error getting storage data:', error);
		});
}
