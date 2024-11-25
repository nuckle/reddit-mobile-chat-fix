import browser from 'webextension-polyfill';
import logo from '~/assets/logo.svg';
import './style.css';

const imageUrl = new URL(logo, import.meta.url).href;

interface StorageData {
	enabled: boolean;
}

document.querySelector('#app')!.innerHTML = `
  <img src="${imageUrl}" height="45" alt="" />
  <label>
    Enable Fix <input type="checkbox" id="toggleExtension" />
  </label>
`;

const toggleCheckbox = document.getElementById(
	'toggleExtension',
) as HTMLInputElement | null;

if (toggleCheckbox) {
	// Get the 'enabled' setting from storage
	browser.storage.sync
		.get('enabled')
		.then((data: Partial<StorageData>) => {
			toggleCheckbox.checked = data.enabled !== undefined ? data.enabled : false;
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
