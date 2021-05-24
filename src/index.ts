import { WxTileLogging, WxTileLibSetup, WxTileWatermark, WxTileLayer, WxGetColorStyles } from '@metservice/wxtiles-leaflet';
import '@metservice/wxtiles-leaflet/dist/es/bundle.css';

declare global {
	interface Window {
		L: any;
	}
}

const L = window.L;

// json loader helper
async function fetchJson(url: string) {
	return (await fetch(url)).json();
}

async function start() {
	// Leaflet basic setup // set the main Leaflet's map object, compose and add base layers
	const map = L.map('map', { center: [-37.803113, 174.878166], zoom: 5, zoomControl: false });

	WxTileLogging(true); // use wxtiles logging -> console.log
	WxTileWatermark({ URI: 'res/wxtiles-logo.png', position: 'topleft' }).addTo(map); // set the correct URI
	let colorStyles: any, units: any, colorSchemes: any;
	try {
		// these URIs are for the demo purpose. set the correct URI
		colorStyles = await fetchJson('styles/styles.json'); // set the correct URI
	} catch (e) {
		console.log(e);
	}
	try {
		units = await fetchJson('styles/uconv.json'); // set the correct URI
	} catch (e) {
		console.log(e);
	}
	try {
		colorSchemes = await fetchJson('styles/colorschemes.json'); // set the correct URI
	} catch (e) {
		console.log(e);
	}

	// ESSENTIAL step to get lib ready.
	WxTileLibSetup({ colorStyles, units, colorSchemes }); // load fonts and styles, units, colorschemas - empty => defaults

	// SCALAR field setup
	const layerS = WxTileLayer({
		dataSource: {
			serverURI: 'https://tiles.metoceanapi.com/data', // server to fetch data from
			ext: 'png', // png / webp (default) - wxtilesplitter output format
			dataset: 'ecwmf.global', // dataset of the dataset
			variables: ['wind.speed.eastward.at-10m', 'wind.speed.northward.at-10m'], // variabls to be used for the layer rendering
			name: 'wind speed at 10m', // attribute of the dataSource to be used externally
			styleName: 'base', // The name of the style (from styles.json) to apply for the layer
		},
		// Lazy setup
		// 'true': perform setup and data loading on 'addTo(map)'.
		// 'false': start loading immediately, but loading is not finished when layer is created.
		// the signal 'setupcomplete' is fired when loading is finished.
		// useful when a big bunch of layers is used, so layers are not wasting memory and bandwidth.
		lazy: true,
		options: {
			opacity: 0.99,
		},
	});
	layerS.addTo(map);
}

start();
