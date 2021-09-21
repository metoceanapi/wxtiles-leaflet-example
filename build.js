const esbuild = require('esbuild');

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
	})
	.catch((e) => console.error(e.message));
