import { isEnabled } from '~/entries/utils';
import './style.css';
import browser from 'webextension-polyfill';

isEnabled(browser).then((enabled) => {
	if (enabled) {
		injectScript();
	}
});

function injectScript() {
	if (!document.getElementById('injectedChatScript')) {
		const script = document.createElement('script');
		script.id = 'injectedChatScript';
		script.src = browser.runtime.getURL('/src/entries/injectChat.js');
		(document.head || document.documentElement).appendChild(script);
	}
}
