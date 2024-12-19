import { defineConfig, loadEnv } from 'vite';
import webExtension from '@samrum/vite-plugin-web-extension';
import path from 'path';
import { getManifest } from './src/manifest';

// https://vitejs.dev/config/
export default defineConfig(({ command, mode }) => {
	const env = loadEnv(mode, process.cwd(), '');

	return {
		plugins: [
			webExtension({
				manifest: getManifest(Number(env.MANIFEST_VERSION) || 3),
				additionalInputs: {
					scripts: ['src/entries/injectChat.js'],
				},
			}),
		],
		resolve: {
			alias: {
				'~': path.resolve(__dirname, './src'),
			},
		},
	};
});
