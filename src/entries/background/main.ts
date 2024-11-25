import browser from 'webextension-polyfill';

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
