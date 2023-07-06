# GreptimeDB data source

GreptimeDB datasource for grafana

This plugin is currently campatiable with GreptimeDB 0.3.1 and GreptimeCloud.

This plugin currently only supports querying through SQL.

Learn more about GreptimeDB [Github](https://github.com/GreptimeTeam/greptimedb) | [Website](https://greptime.com)

# Using GreptimeDB in Grafana

## Install GreptimeDB

### GreptimeCloud

Visit https://greptime.com/product/cloud for more details.

### Manually

Get GreptimeDB from [Greptime's release page here](https://github.com/GreptimeTeam/greptimedb/releases/).

This plugin is currently campatiable with GreptimeDB 0.3.1.

For demostration, run it in standalone mode `./greptime standalone start`. In case of port conflicts, start with option `-c <config.toml>`. The format of `config.toml` [can be found here](https://docs.greptime.com/user-guide/operations/configuration)

### Docker

There are also some docker images available on [Docker Hub](https://hub.docker.com/r/greptime/greptimedb).

You can start a GreptimeDB instance with docker like this:

```bash
docker run  -p 4000-4004:4000-4004 \
            -p 4242:4242 \
            -v "greptime-vol:/tmp/greptimedb" \
            --name greptime \
            greptime/greptimedb:0.3.1 standalone start
```

## Add GreptimeDB data source in Grafana

Add a new data source in grafana, and select GreptimeDB.

![](https://blog.mofengfeng.com/wp-content/uploads/2022/11/UAX6FW6SG23X2ZX2QY.png)

Make sure you have provided a correct database name. If you use greptimecloud, also remember to enable basic auth in the Auth section, then enter your username and password.

Then click `Save & test`. It will query numbers from your GreptimeDB to check if the data source is available. If the test result shows Success, you have successfully added your GreptimeDB as Grafana data source! 

## Visualize your data

If you are a new to GreptimeDB, you may need some dummy data for testing.

First, let's create a time-series table in GreptimeDB. GreptimeDB supports execute sql from HTTP API. You can use `curl` to execute sql.

```bash
curl http://localhost:4000/v1/sql -d "sql=
    CREATE TABLE system_metrics (               
    host STRING,                                      
    idc STRING,                                       
    cpu_util DOUBLE,                                  
    memory_util DOUBLE,                               
    disk_util DOUBLE,                                 
    ts TIMESTAMP DEFAULT CURRENT_TIMESTAMP,           
    PRIMARY KEY(host, idc),                           
    TIME INDEX(ts))"
```

I have written a bash script for you to insert some dummy data.

```bash
sql="INSERT INTO system_metrics VALUES"

for i in {1..20}; do
    host="host$(echo $i%3 | bc)"
    idc="idc$(echo $i%3 | bc)"
    cpu_util=$(echo "scale=2; $RANDOM/327.67" | bc)
    memory_util=$(echo "scale=2; $RANDOM/327.67" | bc)
    disk_util=$(echo "scale=2; $RANDOM/327.67" | bc)
    ts=$(echo "$(date -d "-$i minute" +%s) * 1000" | bc)
    sql="$sql ('$host', '$idc', $cpu_util, $memory_util, $disk_util, $ts)"
    if [ $i -lt 20 ]; then
        sql="$sql,"
    fi
done

curl http://localhost:4000/v1/sql -d "sql=$sql"
```

Go back to Grafana, create a new panel, select your metrics in the query area of your panel and watch the visualization happen!

![](https://blog.mofengfeng.com/wp-content/uploads/2023/03/TS5@V5GDLMTJG9@Q1SJM.png)


