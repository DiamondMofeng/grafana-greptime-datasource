// import defaults from 'lodash/defaults';

import {
  DataQueryRequest,
  DataQueryResponse,
  DataSourceApi,
  DataSourceInstanceSettings,
  MutableDataFrame,
  // FieldType,
} from '@grafana/data';

// import { MyQuery, MyDataSourceOptions, defaultQuery } from './types';
import { MyQuery, MyDataSourceOptions } from './types';
import { doRequst, parseResponseToDataFrame, setUrl } from 'greptimedb/greptimeService';

export class DataSource extends DataSourceApi<MyQuery, MyDataSourceOptions> {
  URL: string;

  constructor(instanceSettings: DataSourceInstanceSettings<MyDataSourceOptions>) {
    super(instanceSettings);
    this.URL = instanceSettings.url!;
    setUrl(this.URL);
  }

  async query(options: DataQueryRequest<MyQuery>): Promise<DataQueryResponse> {
    const promises = options.targets.map(async (target) => {
      if (!target.queryText) {
        return new MutableDataFrame();
      }
      const response = await doRequst(target.queryText!);
      return parseResponseToDataFrame(response);
    });

    return Promise.all(promises).then((data) => ({ data }));
  }

  // health check for the data source.
  async testDatasource() {
    try {
      const response = await doRequst('SELECT * FROM numbers LIMIT 5');
      if (response.code === 0 && response.output[0].records.rows.length === 5) {
        return {
          status: 'success',
          message: 'Success',
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
