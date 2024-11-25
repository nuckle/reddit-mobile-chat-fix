import logo from '~/assets/logo.svg';
import './style.css';
import browser from 'webextension-polyfill';

interface StorageData {
	enabled: boolean;
}

const imageUrl = new URL(logo, import.meta.url).href;

document.querySelector('#app')!.innerHTML = `
  <img src="${imageUrl}" height="45" alt="" />
  <label>
    Enable Fix <input type="checkbox" id="toggleExtensionOption" /> 
  </label>
`;

const toggleCheckbox = document.getElementById(
	'toggleExtensionOption',
) as HTMLInputElement | null;

if (toggleCheckbox) {
	// Get the 'enabled' setting from storage
	browser.storage.sync
		.get('enabled')
		.then((data: Partial<StorageData>) => {
			const enabled = data.enabled;
			toggleCheckbox.checked = enabled !== undefined ? enabled : false;
		})
		.catch((error) => {
			console.error('Error loading the setting:', error);
		});

	toggleCheckbox.addEventListener('change', () => {
		if (toggleCheckbox) {
			browser.storage.sync.set({ enabled: toggleCheckbox.checked });
		}
	});
}
