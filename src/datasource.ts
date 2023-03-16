// import defaults from 'lodash/defaults';

import {
  DataQueryRequest,
  DataQueryResponse,
  DataSourceApi,
  DataSourceInstanceSettings,
  MutableDataFrame,
  // FieldType,
} from '@grafana/data';

import { GreptimeQuery, GreptimeSourceOptions } from './types';
import { GreptimeDBHttpSqlClient } from 'greptimedb/sqlClient';
import { replaceTimeFilterMacro } from 'utils/timeFilter';
export class DataSource extends DataSourceApi<GreptimeQuery, GreptimeSourceOptions> {
  client: GreptimeDBHttpSqlClient;

  constructor(instanceSettings: DataSourceInstanceSettings<GreptimeSourceOptions>) {
    super(instanceSettings);
    this.client = new GreptimeDBHttpSqlClient(instanceSettings.url!, instanceSettings.jsonData.database);
  }

  async query(options: DataQueryRequest<GreptimeQuery>): Promise<DataQueryResponse> {
    const promises = options.targets.map(async (target) => {
      if (!target.queryText) {
        return new MutableDataFrame();
      }

      // TODO combine this into sqlBuilder
      // do some transformation here
      let queryText = target.queryText;
      queryText = replaceTimeFilterMacro(queryText, options.range);

      return await this.client.querySqlToDataFrame(queryText);
    });

    return Promise.all(promises).then((data) => ({ data }));
  }

  // TODO add test for any possible error
  // health check for the data source.
  async testDatasource() {
    // To provide more detailed information about the test result,
    // Firstly, we use `/health` endpoint to check if the server is alive
    // Then we query `SELECT 1` to check if grafana has the permission to query certain database

    // health check
    const healthy = await this.client.healthCheck();
    if (!healthy) {
      return {
        status: 'error',
        message: 'Failed to connect to GreptimeDB',
      };
    }

    // query check
    try {
      const response = await this.client.querySql('SELECT 1');
      if (response.code === 0 && response.output[0].records.rows.length === 1) {
        return {
          status: 'success',
          message: 'Success to connect to GreptimeDB',
        };
      } else {
        return {
          status: 'error',
          message: `Error code ${response.code}. 
          See https://docs.greptime.com/user-guide/supported-protocols/http-api#result-codes-table for more details`,
        };
      }
    } catch (err) {
      return {
        status: 'error',
        message: 'Failed to connect to GreptimeDB',
      };
    }
  }
}
