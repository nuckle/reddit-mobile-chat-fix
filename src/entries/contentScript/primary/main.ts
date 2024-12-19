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

async function checkAndInjectScript() {
	const enabled = await isEnabled();
	if (enabled) {
		injectScript();
	}
}

await checkAndInjectScript();
