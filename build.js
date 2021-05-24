const esbuild = require('esbuild');

// build for web
esbuild
	.build({
		entryPoints: ['src/index.ts'],
		bundle: true,
		plugins: [],
		loader: {},
		target: 'es6',
		format: 'iife',
		outfile: 'dist/web/script.js',
		globalName: 'script',
		sourcemap: false,
		minify: true,
	})
	.catch((e) => console.error(e.message));
