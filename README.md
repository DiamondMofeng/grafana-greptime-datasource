# GreptimeDB Datasource Plugin for Grafana

![Grafana x GreptimeDB](https://blog.mofengfeng.com/wp-content/uploads/2022/11/plugin_transparent.png)

<!-- Shields -->
[![CI](https://github.com/DiamondMofeng/grafana-greptime-datasource/actions/workflows/ci.yml/badge.svg)](https://github.com/DiamondMofeng/grafana-greptime-datasource/actions/workflows/ci.yml)
[![downloads](https://img.shields.io/badge/dynamic/json?logo=grafana&color=F47A20&label=marketplace&prefix=v&query=%24.items%5B%3F%28%40.slug%20%3D%3D%20%22mofengfeng-greptimedb-datasource%22%29%5D.version&url=https%3A%2F%2Fgrafana.com%2Fapi%2Fplugins)](https://grafana.com/grafana/plugins/mofengfeng-greptimedb-datasource/)
[![downloads](https://img.shields.io/badge/dynamic/json?logo=grafana&color=F47A20&label=downloads&query=%24.items%5B%3F%28%40.slug%20%3D%3D%20%22mofengfeng-greptimedb-datasource%22%29%5D.downloads&url=https%3A%2F%2Fgrafana.com%2Fapi%2Fplugins)](https://grafana.com/grafana/plugins/mofengfeng-greptimedb-datasource/)

## Features

Write sql or use the visual query editor in Grafana to query data from GreptimeDB, then visualization happens!
![Plugin Example](https://blog.mofengfeng.com/wp-content/uploads/2022/11/pluginExample.png)

## About GreptimeDB

Greptime provides cloud-scale, fast and efficient Time Series Data Infrastructure

[Visit Greptime's Official Website here](https://www.greptime.com/)

## Install 

As this plugin has not been signed by Grafana yet, you may need to manually drag the built plugin folder into your grafana plugin directory, which default at `/var/lib/grafana/plugins`

To get the built plugin, please download it from the release page, or clone the repo then `npm run build`

In order to load any unsigned Grafana plugin, you have to set you Grafana to Development mode. You can set environment variable `GF_DEFAULT_APP_MODE=development` or set `app_mode = development` in your `grafana.ini`

## Using GreptimeDB in Grafana

For detailed instructions, see https://github.com/DiamondMofeng/grafana-greptime/blob/main/docs/Using%20GreptimeDB%20in%20Grafana.md

## TODO List

- [ ] Add support for more query protocols. Only Sql is supported now.
- [ ] Add more test cases

## Commands

1. Install dependencies

   ```bash
   yarn install
   ```

2. Build plugin in development mode or run in watch mode

   ```bash
   yarn dev

   # or

   yarn watch
   ```

3. Build plugin in production mode

   ```bash
   yarn build
   ```

4. Run the tests (using Jest)

   ```bash
   # Runs the tests and watches for changes
   yarn test
   
   # Exists after running all the tests
   yarn lint:ci
   ```

5. Spin up a Grafana instance and run the plugin inside it (using Docker)

   ```bash
   yarn server
   ```

6. Run the linter

   ```bash
   yarn lint
   
   # or

   yarn lint:fix
   ```

