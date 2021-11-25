
const esbuild = require('esbuild');

esbuild
	.build({
		entryPoints: ['src_example/index.ts'],
		bundle: true,
		plugins: [],
		loader: {
			'.png': 'base64',
		},
		target: ['es2020', 'chrome80', 'safari13', 'edge89', 'firefox70'],
		format: 'iife',
		outfile: 'public/script/script.js',
		sourcemap: false,
		minify: true,
	})
	.catch((e) => console.error(e.message));
