# wxtiles-leaflet lib demo

Demo for https://github.com/metoceanapi/wxtiles-leaflet

published to https://tiles.metoceanapi.com/

mainly used with scripts in `package.json`

copyFromLeafletProject - copy files from the side leaflet project
wxtile-publish-up - publish whole `./wxtile` folder to server and restart nginx
wxtile-nginx-down - shutdown nginx
remote-ssh-- - ssh to the remote server

in `package.json` server path to publish are defined in
```json
	"config": {
		"server": "metocean@tiles.metoceanapi.com",
		"path": "/data_local/wxtilesfront/wxtile-leaflet-demo/"
	},
```