# wxtiles-leaflet lib demo

Demo for https://github.com/metoceanapi/wxtiles-leaflet

published to https://tiles.metoceanapi.com/

mainly used with scripts in `package.json`

`copyFromLeafletProject` - copy files from the side leaflet project
`wxtile-publish-up` - publish whole `./wxtile` folder to server and restart nginx
`wxtile-nginx-down` - shutdown nginx
`remote-ssh--` - ssh to the remote server

in `package.json` server path to publish are defined in
```json
	"config": {
		"server": "metocean@tiles.metoceanapi.com",
		"path": "/data_local/wxtilesfront/wxtile-leaflet-demo/"
	},
```

## Script to build, copy and publish the Wx Demo

This script can help you to build, copy and publish the Wx Demo.
```bash
# clone wxtiles-leaflet and build the demo and docs
git clone git@github.com:metoceanapi/wxtiles-leaflet.git
cd wxtiles-leaflet
npm run npm_i
npm run build_DEMO_Docs
cd ..
# clone this repo and copy the demo and docs from wxtiles-leaflet
git clone git@github.com:metoceanapi/wxtiles-leaflet-example.git
cd wxtiles-leaflet-example
npm run copyFromLeafletProject
# publish
# before this last step, make sure you have the right server and path in package.json
npm run wxtile-publish-up
```