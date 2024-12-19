import browser, { Browser } from "webextension-polyfill";
import { isEnabled } from "~/entries/utils";
import "./style.css";

function injectScript() {
	if (!document.getElementById("injectedChatScript")) {
		const script = document.createElement("script");
		script.id = "injectedChatScript";
		script.src = browser.runtime.getURL("/src/entries/injectChat.js");
		(document.head || document.documentElement).appendChild(script);
	}
}

async function checkAndInjectScript(browser: Browser) {
	const enabled = await isEnabled(browser);
	if (enabled) {
		injectScript();
	}
}

await checkAndInjectScript(browser);
