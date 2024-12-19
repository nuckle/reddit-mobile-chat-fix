import browser from 'webextension-polyfill';
import { isEnabled } from '~/entries/utils';
import './style.css';

function injectScript() {
	if (!document.getElementById('injectedChatScript')) {
		const script = document.createElement('script');
		script.id = 'injectedChatScript';
		script.src = browser.runtime.getURL('/src/entries/injectChat.js');
		(document.head || document.documentElement).appendChild(script);
	}
}

function checkAndInjectScript() {
	isEnabled(browser)
		.then((enabled) => {
			if (enabled) {
				injectScript();
			}
		})
		.catch((error) => {
			console.error('Error checking or injecting script:', error);
		});
}

checkAndInjectScript();
