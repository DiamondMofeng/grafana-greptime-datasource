# Using GreptimeDb in Grafana

## Install GreptimeDB

Get GreptimeDB from [Greptime's release page here](https://github.com/GreptimeTeam/greptimedb/releases/)

For demostration, run it in standalone mode `./greptime standalone start`. In case of port conflicts, start with option `-c <config.toml>`.

## Install The Plugin

Download the plugin from [this repo's release page](https://github.com/DiamondMofeng/grafana-greptime/tags) or clone the repo then build your own one.  

Put the unzipped plugin folder into your grafana's plugin directory, which default at `/var/lib/grafana/plugins`

As this plugin is currently not signed by Grafana Ofiicial, you have to set your grafana to development mode to load this plugin. You can set environment variable `GF_DEFAULT_APP_MODE=development` or set `app_mode = development` in your grafana.ini

Restart your grafana, then the plugin loads!

## Add GreptimeDB data source in Grafana

Add a new data source in grafana, and select GreptimeDB.

![](https://blog.mofengfeng.com/wp-content/uploads/2022/11/UAX6FW6SG23X2ZX2QY.png)

As currently GreptimeDB has not implement any authentication yet, we just need to fill the URL input box.

Then click `Save & test`. It will query numbers from your GreptimeDB to check if the data source is available. If the test result shows Success, you have successfully added your GreptimeDB as Grafana data source! 

## Visualize your data

Create a new dashboard, then add a panel. 

In order to let grafana visualize your data, your data must have a time field. 

If you are a new to GreptimeDB, you may need some mock data for test.

Use mysql cli to connect to your GreptimeDB, then create a time series table

```sql
CREATE TABLE system_metrics (
    host STRING,
    idc STRING,
    cpu_util DOUBLE,
    memory_util DOUBLE,
    disk_util DOUBLE,
    ts TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY(host, idc),
    TIME INDEX(ts)
);
```

I have written a javascript for you to generate a mock sql. Just run it in your browser console, then type it in your mysql cli.

```js
(function mockSql() {
  let timestamp = new Date().getTime();
  const INTERVAL = 10000;
  let sql = 'INSERT INTO system_metrics VALUES ';
  for (let i = 0; i < 100; i++) {
    sql += `('host1', 'idc_b', ${Math.random() * 100}, ${Math.random() * 100}, ${Math.random() * 100}, ${
      timestamp - i * INTERVAL
    }),`;
  }
  return sql.slice(0, sql.length - 1) + ';';
})()
```

Return back to Grafana, type `SELECT * FROM system_metrics` in your panel's query area, then save your panel, and see the visualization happens!

![](https://blog.mofengfeng.com/wp-content/uploads/2022/11/1HC2YH1ZLC64NTPRQ2GSM.png)
















