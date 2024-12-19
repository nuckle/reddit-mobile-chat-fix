import browser from 'webextension-polyfill';
import {
	isEnabled,
	isUserAgentSpooferEnabled,
	setEnabled,
	setUserAgentSpooferEnabled,
} from '../utils';
import './style.css';

document.querySelector('#app')!.innerHTML = `
  <h1>Extension Settings</h1>
  <div class="settings">
    <label>
      <input type="checkbox" id="toggleExtension" />
      Enable Fix
    </label>
    <label>
      <input type="checkbox" id="toggleUserAgent" />
      User-Agent Spoofer
    </label>
  </div>
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
