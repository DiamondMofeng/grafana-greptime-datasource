import { MutableDataFrame } from '@grafana/data';
import { BackendSrvRequest, getBackendSrv } from '@grafana/runtime';
import { GreptimeColumnSchema, GreptimeResponse } from './types';
import { lastValueFrom } from 'rxjs';
import { extractColumnSchemas, extractDataRows, parseResponseToDataFrame } from './utils';

//feel free to give suggestions on how to name methods in this class

//We do not need to implement complex things like requests pool here, as `getBackendSrv()` provides all the necessary functionality.

export class GreptimeDBHttpSqlClient {
  private readonly baseUrl: string;
  private readonly SQL_URL: string;
  readonly database: string;

  constructor(baseUrl: string, database: string) {
    this.baseUrl = baseUrl;
    this.database = database;
    this.SQL_URL = `${this.baseUrl}/v1/sql`;
  }

  async healthCheck(): Promise<boolean> {
    const response = await getBackendSrv().get<{}>(`${this.baseUrl}/health`);
    return JSON.stringify(response) === JSON.stringify({});
  }

  private async fetch(options: BackendSrvRequest): Promise<GreptimeResponse> {
    const response = lastValueFrom(getBackendSrv().fetch<GreptimeResponse>(options));
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

  async querySql(sql: String): Promise<GreptimeResponse> {
    const response: GreptimeResponse = await this.fetch({
      url: this.SQL_URL,
      method: 'POST',
      params: {
        sql: sql,
        db: this.database,
      },
    });

    return response;
  }

  async querySqlToDataFrame(sql: String): Promise<MutableDataFrame> {
    const response = await this.querySql(sql);
    return parseResponseToDataFrame(response);
  }

  /**
   * Show tables in current database.
   */
  async showTables(): Promise<string[]> {
    const response: GreptimeResponse = await this.fetch({
      url: this.SQL_URL,
      method: 'POST',
      params: {
        sql: `SHOW TABLES`,
        db: this.database,
      },
    });

    return extractDataRows(response).map((row) => row[0]);
  }

  /**
   * Currently use sql `SELECT * FROM ${table} LIMIT 0` to get column schemas.
   * While there is `DESC TABLE ${table}` in GreptimeDB, I think the former is more convenient.
   */
  async queryColumnSchemaOfTable(table: String): Promise<GreptimeColumnSchema[]> {
    const response: GreptimeResponse = await this.fetch({
      url: this.SQL_URL,
      method: 'POST',
      params: {
        sql: `SELECT * FROM ${table} LIMIT 0`,
        db: this.database,
      },
    });

    return extractColumnSchemas(response);
  }

  async queryColumnNamesOfTable(table: String): Promise<string[]> {
    const schemas = await this.queryColumnSchemaOfTable(table);
    return schemas.map((schema) => schema.name);
  }
}
