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
import { doRequst, parseResponseToDataFrame } from 'greptimedb/greptimeService';

export class DataSource extends DataSourceApi<MyQuery, MyDataSourceOptions> {
  constructor(instanceSettings: DataSourceInstanceSettings<MyDataSourceOptions>) {
    super(instanceSettings);
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

  async testDatasource() {
    // Implement a health check for your data source.
    return {
      status: 'success',
      message: 'Success',
    };
  }
}
