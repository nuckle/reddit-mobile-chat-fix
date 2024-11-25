import './style.css';
import browser from 'webextension-polyfill';

browser.storage.sync
	.get('enabled')
	.then((data) => {
		if (data.enabled) {
			injectScript();
		}
	})
	.catch((error) => {
		console.error('Error getting storage data:', error);
	});

function injectScript() {
	if (!document.getElementById('injectedChatScript')) {
		const script = document.createElement('script');
		script.id = 'injectedChatScript';
		script.src = browser.runtime.getURL('/src/entries/injectChat.js');
		(document.head || document.documentElement).appendChild(script);
	}
}
