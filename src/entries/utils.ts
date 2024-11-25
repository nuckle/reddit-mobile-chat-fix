import { Browser } from 'webextension-polyfill';

export const getAppDomain = (): string => {
	return '*://chat.reddit.com/*';
};

export const getUserAgent = (): string => {
	return 'Mozilla/5.0 (Windows NT 6.1; rv:68.0) Gecko/20100101 Goanna/4.7 Firefox/68.0 PaleMoon/28.17.0';
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
