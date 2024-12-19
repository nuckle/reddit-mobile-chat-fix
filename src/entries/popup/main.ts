import logo from '~/assets/logo.svg';
import {
	isEnabled,
	isUserAgentSpooferEnabled,
	setEnabled,
	setUserAgentSpooferEnabled,
} from '../utils';
import './style.css';

const imageUrl = new URL(logo, import.meta.url).href;

document.querySelector('#app')!.innerHTML = `
  <img class="logo" src="${imageUrl}" height="45" alt="" />
  <label>
    Extension <input type="checkbox" id="toggleExtension" />
  </label>
  <label>
    User-Agent spoofer <input type="checkbox" id="toggleUserAgent" />
  </label>
`;

const toggleExtensionCheckbox = document.getElementById(
	'toggleExtension',
) as HTMLInputElement | null;

if (toggleExtensionCheckbox) {
	try {
		const enabled = await isEnabled();
		toggleExtensionCheckbox.checked = enabled !== null ? enabled : false;
	} catch (error) {
		console.error('Error loading the setting:', error);
	}

	toggleExtensionCheckbox.addEventListener('change', async () => {
		if (toggleExtensionCheckbox) {
			await setEnabled(toggleExtensionCheckbox.checked);
		}
	});
}

const toggleUserAgentCheckbox = document.getElementById(
	'toggleUserAgent',
) as HTMLInputElement | null;

if (toggleUserAgentCheckbox) {
	try {
		const userAgentSpooferEnabled = await isUserAgentSpooferEnabled();
		toggleUserAgentCheckbox.checked =
			userAgentSpooferEnabled !== null ? userAgentSpooferEnabled : false;
	} catch (error) {
		console.error('Error loading the setting:', error);
	}

	toggleUserAgentCheckbox.addEventListener('change', async () => {
		if (toggleExtensionCheckbox) {
			await setUserAgentSpooferEnabled(toggleUserAgentCheckbox.checked);
		}
	});
}
