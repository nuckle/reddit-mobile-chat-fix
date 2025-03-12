import logo from '~/assets/logo.svg';
import {
	isEnabled,
	isUserAgentSpooferEnabled,
	setEnabled,
	setUserAgentSpooferEnabled,
} from '../lib/browser/utils';
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
            <label class="toggle" for="${setting.id}">
                <input type="checkbox" id="${setting.id}">
                <span class="slider"></span>
            </label>
        </div>
    `;
}

function initializeApp() {
	const app = document.querySelector<HTMLDivElement>('#app')!;
	const imageUrl = new URL(logo, import.meta.url).href;

	app.innerHTML = `
        <div class="header">
            <img src="${imageUrl}" height="57" width="57" alt="Reddit Mobile Chat Fix" class="logo">
            <h1>Reddit Mobile Chat Fix</h1>
        </div>
        <div class="settings">
            ${settings.map(createSettingElement).join('')}
        </div>
        <div class="footer">
            Enhance your Reddit Chat experience with Reddit Mobile Chat Fix
        </div>
    `;

	settings.forEach((setting) => {
		const checkbox = document.querySelector<HTMLInputElement>(
			`#${setting.id}`,
		);
		if (checkbox) {
			checkbox.addEventListener('change', (event) => {
				const target = event.target as HTMLInputElement;
				console.log(
					`${setting.label} is now ${target.checked ? 'enabled' : 'disabled'}`,
				);
				// Here you can add logic to save the setting
			});
		}
	});
}

initializeApp();

const toggleExtensionCheckbox = document.getElementById(
	'toggleExtension',
) as HTMLInputElement | null;

if (toggleExtensionCheckbox) {
	isEnabled()
		.then((enabled) => {
			toggleExtensionCheckbox.checked =
				enabled !== null ? enabled : false;
		})
		.catch((error) => {
			console.error('Error loading the setting:', error);
		});

	toggleExtensionCheckbox.addEventListener('change', () => {
		if (toggleExtensionCheckbox) {
			setEnabled(toggleExtensionCheckbox.checked).catch((error) => {
				console.error('Error setting the value:', error);
			});
		}
	});
}

const toggleUserAgentCheckbox = document.getElementById(
	'toggleUserAgent',
) as HTMLInputElement | null;

if (toggleUserAgentCheckbox) {
	isUserAgentSpooferEnabled()
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
			setUserAgentSpooferEnabled(toggleUserAgentCheckbox.checked).catch(
				(error) => {
					console.error('Error setting the value:', error);
				},
			);
		}
	});
}
