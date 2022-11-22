import { MutableDataFrame } from '@grafana/data';
import { BackendSrvRequest, getBackendSrv } from '@grafana/runtime';
import { GreptimeColumnSchema, GreptimeDBResponse } from './types';
import { lastValueFrom } from 'rxjs';
import { extractColumnSchemas, parseResponseToDataFrame } from './utils';

/**
 * We do not need to implement complex things like requests pool here, as `getBackendSrv()` provides all the necessary functionality.
 */
export class GreptimeDBHttpSqlClient {
  private readonly baseUrl: string;
  // private readonly database: string;  //not used yet

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
    // this.database = database;
  }

  private async fetch(options: BackendSrvRequest): Promise<GreptimeDBResponse> {
    const response = lastValueFrom(getBackendSrv().fetch<GreptimeDBResponse>(options));
    return (await response).data;
  }

  // async post(url: string, data?: any): Promise<GreptimeDBResponse> {
  //   const response = await getBackendSrv().post(url, data);
  //   return response;
  // }

  // async get(url: string): Promise<GreptimeDBResponse> {
  //   const response = await getBackendSrv().get(url);
  //   return response;
  // }

  async querySql(sql: String): Promise<GreptimeDBResponse> {
    const SQL_URL = `${this.baseUrl}/v1/sql`;
    const response: GreptimeDBResponse = await this.fetch({
      url: SQL_URL,
      method: 'POST',
      params: {
        sql: sql,
      },
    });

    return response;
  }

  async querySqlToDataFrame(sql: String): Promise<MutableDataFrame> {
    const response = await this.querySql(sql);
    return parseResponseToDataFrame(response);
  }

  async queryFieldsOfTable(table: String): Promise<GreptimeColumnSchema[]> {
    const SQL_URL = `${this.baseUrl}/v1/sql`;
    const response: GreptimeDBResponse = await this.fetch({
      url: SQL_URL,
      method: 'POST',
      params: {
        sql: `SELECT * FROM ${table} LIMIT 0`,
      },
    });

    return extractColumnSchemas(response);
  }
}
