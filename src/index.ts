import '@metoceanapi/wxtiles-leaflet/dist/es/wxtiles.css';
import { WxTilesLogging, WxTilesLibSetup, WxTilesWatermark, WxTilesLayer } from '@metoceanapi/wxtiles-leaflet';

import colorStyles from './styles/styles';
import colorSchemes from './styles/colorschemes';
import units from './styles/uconv';

import L from 'leaflet';

function start() {
	// Leaflet basic setup // set the main Leaflet's map object, compose and add base layers
	const map = L.map('map', { center: [-37.803113, 174.878166], zoom: 5, zoomControl: false });

	WxTilesLogging(true); // use wxtiles logging -> console.log
	WxTilesWatermark({ URI: 'res/wxtiles-logo.png', position: 'topleft' }).addTo(map); // set the correct URI
	// ESSENTIAL step to get lib ready.
	WxTilesLibSetup({ colorStyles, units, colorSchemes }); // load fonts and styles, units, colorschemas - empty => defaults

	// SCALAR field setup
	const layerS = WxTilesLayer({
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
