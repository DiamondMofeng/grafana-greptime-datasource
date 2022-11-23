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
export class DataSource extends DataSourceApi<GreptimeQuery, GreptimeSourceOptions> {
  client: GreptimeDBHttpSqlClient;

  constructor(instanceSettings: DataSourceInstanceSettings<GreptimeSourceOptions>) {
    super(instanceSettings);
    this.client = new GreptimeDBHttpSqlClient(instanceSettings.url!, 'public');
  }

  async query(options: DataQueryRequest<GreptimeQuery>): Promise<DataQueryResponse> {
    const promises = options.targets.map(async (target) => {
      if (!target.queryText) {
        return new MutableDataFrame();
      }
      return await this.client.querySqlToDataFrame(target.queryText);
    });

    return Promise.all(promises).then((data) => ({ data }));
  }

  // health check for the data source.
  async testDatasource() {
    try {
      const response = await this.client.querySql('SELECT * FROM numbers LIMIT 5');
      if (response.code === 0 && response.output[0].records.rows.length === 5) {
        return {
          status: 'success',
          message: 'Success to connect to GreptimeDB',
        };
      } else {
        return {
          status: 'error',
          message: `Error code ${response.code} 
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
