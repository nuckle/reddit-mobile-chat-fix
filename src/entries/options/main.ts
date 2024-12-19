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
