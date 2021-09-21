const esbuild = require('esbuild');
const express = require('express');
const { externalGlobalPlugin } = require('esbuild-plugin-external-global');

esbuild
	.build({
		entryPoints: ['src/index.ts'],
		bundle: true,
		plugins: [
			externalGlobalPlugin({
				leaflet: 'window.L',
			}),
		],
		loader: {},
		target: ['es2020', 'chrome80', 'safari13', 'edge89', 'firefox70'],
		format: 'iife',
		outfile: 'public/script/script.js',
		sourcemap: false,
		minify: true,
		watch: {
			onRebuild(error, result) {
				if (error) {
					console.error('watch build failed:', error);
				} else {
					console.log('rebuilded', new Date());
				}
			},
		},
	})
	.then((result) => {
		const app = express();
		app.use(express.static('public'));

		const PORT = 3002;

		const url = `http://localhost:${PORT}`;
		app.listen(PORT, () => {
			console.log(`Dev is running at ${url}`);
		});
	})
	.catch((e) => console.error(e.message));
