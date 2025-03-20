import * as dotenv from 'dotenv';
import pkg from '../package.json';
import { getAppDomain } from './entries/lib/utils';

dotenv.config();

const domain = getAppDomain();

const isFirefox = process.env?.FIREFOX_BUILD === '1' ? true : false;

const sharedManifest: Partial<chrome.runtime.ManifestBase> = {
	content_scripts: [
		{
			js: ['src/entries/contentScript/primary/main.ts'],
			matches: [domain],
			all_frames: true,
			run_at: 'document_idle',
		},
	],
	icons: {
		16: 'icons/16.png',
		19: 'icons/19.png',
		32: 'icons/32.png',
		38: 'icons/38.png',
		48: 'icons/48.png',
		64: 'icons/64.png',
		96: 'icons/96.png',
		128: 'icons/128.png',
		256: 'icons/256.png',
		512: 'icons/512.png',
	},
	options_ui: {
		page: 'src/entries/options/index.html',
		open_in_tab: true,
	},
	permissions: ['storage'],
	...(isFirefox && {
		browser_specific_settings: {
			gecko: {
				id: 'addon@example.com',
				strict_min_version: '89',
			},
		},
	}),
};

const browserAction = {
	default_icon: {
		32: 'icons/32.png',
		48: 'icons/48.png',
		128: 'icons/128.png',
		256: 'icons/256.png',
		512: 'icons/512.png',
	},
	default_popup: 'src/entries/popup/index.html',
};

const ManifestV2 = {
	...sharedManifest,
	background: {
		scripts: ['src/entries/background/script.ts'],
		persistent: true,
	},
	browser_action: browserAction,
	options_ui: {
		...sharedManifest.options_ui,
		chrome_style: false,
	},
	permissions: [
		...sharedManifest.permissions,
		'webRequest',
		'webRequestBlocking',
		domain,
	],
};

const ManifestV3 = {
	...sharedManifest,
	action: browserAction,
	background: {
		service_worker: 'src/entries/background/serviceWorker.ts',
	},
	host_permissions: [domain],
	permissions: [...sharedManifest.permissions, 'declarativeNetRequest'],
};

export function getManifest(
	manifestVersion: number,
): chrome.runtime.ManifestV2 | chrome.runtime.ManifestV3 {
	const manifest = {
		author: pkg.author,
		description: pkg.description,
		name: pkg.displayName ?? pkg.name,
		version: pkg.version,
	};

	if (manifestVersion === 2) {
		return {
			...manifest,
			...ManifestV2,
			manifest_version: manifestVersion,
		};
	}

	if (manifestVersion === 3) {
		return {
			...manifest,
			...ManifestV3,
			manifest_version: manifestVersion,
		};
	}

	throw new Error(
		`Missing manifest definition for manifestVersion ${manifestVersion}`,
	);
}
