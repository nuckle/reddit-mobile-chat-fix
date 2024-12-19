import browser from 'webextension-polyfill';
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
	isEnabled(browser)
		.then((enabled) => {
			toggleExtensionCheckbox.checked =
				enabled !== null ? enabled : false;
		})
		.catch((error) => {
			console.error('Error loading the setting:', error);
		});

	toggleExtensionCheckbox.addEventListener('change', () => {
		if (toggleExtensionCheckbox) {
			setEnabled(browser, toggleExtensionCheckbox.checked).catch(
				(error) => {
					console.error('Error setting the value:', error);
				},
			);
		}
	});
}

const toggleUserAgentCheckbox = document.getElementById(
	'toggleUserAgent',
) as HTMLInputElement | null;

if (toggleUserAgentCheckbox) {
	isUserAgentSpooferEnabled(browser)
		.then((userAgentSpooferEnabled) => {
			toggleUserAgentCheckbox.checked =
				userAgentSpooferEnabled !== null
					? userAgentSpooferEnabled
					: false;
		})
		.catch((error) => {
			console.error('Error loading the setting:', error);
		});

	toggleUserAgentCheckbox.addEventListener('change', () => {
		if (toggleUserAgentCheckbox) {
			setUserAgentSpooferEnabled(
				browser,
				toggleUserAgentCheckbox.checked,
			).catch((error) => {
				console.error('Error setting the value:', error);
			});
		}
	});
}
