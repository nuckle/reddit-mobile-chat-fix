import browser from "webextension-polyfill";
import logo from "~/assets/logo.svg";
import "./style.css";

const imageUrl = new URL(logo, import.meta.url).href;

interface StorageData {
	enabled: boolean;
	userAgentSpooferEnabled: boolean;
}

document.querySelector("#app")!.innerHTML = `
  <img class="logo" src="${imageUrl}" height="45" alt="" />
  <label>
    Extension <input type="checkbox" id="toggleExtension" />
  </label>
  <label>
    User-Agent spoofer <input type="checkbox" id="toggleUserAgent" />
  </label>
`;

const toggleExtensionCheckbox = document.getElementById(
	"toggleExtension",
) as HTMLInputElement | null;

if (toggleExtensionCheckbox) {
	// Get the 'enabled' setting from storage
	browser.storage.sync
		.get("enabled")
		.then((data: Partial<StorageData>) => {
			toggleExtensionCheckbox.checked =
				data.enabled !== undefined ? data.enabled : false;
			console.log(data);
		})
		.catch((error) => {
			console.error("Error loading the setting:", error);
		});

	toggleExtensionCheckbox.addEventListener("change", () => {
		if (toggleExtensionCheckbox) {
			browser.storage.sync.set({
				enabled: toggleExtensionCheckbox.checked,
			});
		}
	});
}

const toggleUserAgentCheckbox = document.getElementById(
	"toggleUserAgent",
) as HTMLInputElement | null;

if (toggleUserAgentCheckbox) {
	// Get the 'userAgentSpooferEnabled' setting from storage
	browser.storage.sync
		.get("userAgentSpooferEnabled")
		.then((data: Partial<StorageData>) => {
			toggleUserAgentCheckbox.checked =
				data.userAgentSpooferEnabled !== undefined
					? data.userAgentSpooferEnabled
					: false;
		})
		.catch((error) => {
			console.error("Error loading the setting:", error);
		});

	toggleUserAgentCheckbox.addEventListener("change", () => {
		if (toggleExtensionCheckbox) {
			browser.storage.sync.set({
				userAgentSpooferEnabled: toggleUserAgentCheckbox.checked,
			});
		}
	});
}
