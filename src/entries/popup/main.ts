import browser from 'webextension-polyfill';
import logo from '~/assets/logo.svg';
import {
	isEnabled,
	isUserAgentSpooferEnabled,
	setEnabled,
	setUserAgentSpooferEnabled,
} from '../utils';
import './style.css';

interface Setting {
	id: string;
	label: string;
}

const settings: Setting[] = [
	{ id: 'toggleExtension', label: 'Reddit Mobile Chat Fix' },
	{ id: 'toggleUserAgent', label: 'User-Agent Spoofer' },
];

function createSettingElement(setting: Setting): string {
	return `
        <div class="setting-item">
			<label class="setting-label" for="${setting.id}">${setting.label}</label>
            <label class="toggle">
                <input type="checkbox" id="${setting.id}">
                <span class="slider"></span>
            </label>
        </div>
    `;
}

function initializePopup() {
	const app = document.querySelector<HTMLDivElement>('#app')!;
	const imageUrl = new URL(logo, import.meta.url).href;

	app.innerHTML = `
        <div class="header">
            <img src="${imageUrl}" height="57" width="57" alt="Reddit Logo" class="logo">
			<h1>Mobile Chat Fix</h1>
        </div>
        <div class="settings">
            ${settings.map(createSettingElement).join('')}
        </div>
        <div class="footer">
            Enhance your Reddit experience
        </div>
    `;

	settings.forEach((setting) => {
		const checkbox = document.querySelector<HTMLInputElement>(
			`#${setting.id}`,
		);
		if (checkbox) {
			// Load saved state
			chrome.storage.sync.get(setting.id, (result) => {
				checkbox.checked = result[setting.id] || false;
			});

			checkbox.addEventListener('change', (event) => {
				const target = event.target as HTMLInputElement;
				// Save state
				chrome.storage.sync.set({ [setting.id]: target.checked });
				console.log(
					`${setting.label} is now ${target.checked ? 'enabled' : 'disabled'}`,
				);
			});
		}
	});
}

initializePopup();

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
