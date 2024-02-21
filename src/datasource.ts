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
import type { QueryLanguages } from 'greptimedb/types';
export class DataSource extends DataSourceApi<GreptimeQuery, GreptimeSourceOptions> {
  client: GreptimeDBHttpSqlClient;
  queryLanguage: QueryLanguages;

  constructor(instanceSettings: DataSourceInstanceSettings<GreptimeSourceOptions>) {
    super(instanceSettings);
    this.client = new GreptimeDBHttpSqlClient(instanceSettings.url!, instanceSettings.jsonData.database);
    this.queryLanguage = instanceSettings.jsonData.queryLanguage
  }

  async query(options: DataQueryRequest<GreptimeQuery>): Promise<DataQueryResponse> {
    const promises = options.targets.map(async (target) => {
      if (!target.queryText) {
        return new MutableDataFrame();
      }

      // TODO combine this into sqlBuilder
      // do some transformation here
      let queryText = target.queryText;
      if (target.timeColumn) {
        queryText = replaceTimeFilterMacro(queryText, options.range, target.timeColumn);
      }

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

    // `/health` has been removed, and we can not access `/admin/health`

    // health check
    // const healthy = await this.client.healthCheck();
    // if (!healthy) {
    //   return {
    //     status: 'error',
    //     message: 'Failed to connect to GreptimeDB',
    //   };
    // }

    // query check
    try {
      const response = await this.client.querySql('SELECT 1');
      if (!response.code && response.output[0].records.rows.length === 1) {
        return {
          status: 'success',
          message: 'Success to connect to GreptimeDB',
        };
      } else {
        return {
          status: 'error',
          message: `Greptime error code ${response.code}. 
          See https://github.com/GreptimeTeam/greptimedb/blob/develop/src/common/error/src/status_code.rs for more details`,
        };
      }
    } catch (err) {

      // TODO find a better way to narrow this error
      if (err instanceof Object && 'data' in err) {
        if (err.data instanceof Object && 'message' in err.data) {
          if (err.data.message === 'Authentication to data source failed') {

            return {
              status: 'error',
              message: 'Authentication to data source failed. You may also need to check the name of the database.',
            }

          }
        }
      }

      return {
        status: 'error',
        message: 'Failed to connect to GreptimeDB',
      };
    }
  }
}
