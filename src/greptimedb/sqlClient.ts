import type { MutableDataFrame } from '@grafana/data';
import { BackendSrvRequest, getBackendSrv } from '@grafana/runtime';
import type { GreptimeColumnSchema, GreptimeDataTypes, GreptimeResponse } from './types';
import { lastValueFrom } from 'rxjs';
import { extractDataRows, parseResponseToDataFrame } from './utils';

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

  private async fetch<T extends any[] = any[]>(options: BackendSrvRequest): Promise<GreptimeResponse<T>> {
    const response = lastValueFrom(getBackendSrv().fetch<GreptimeResponse<T>>(options));
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

  async querySql<T extends any[] = any[]>(sql: String): Promise<GreptimeResponse<T>> {
    const response: GreptimeResponse<T> = await this.fetch({
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
    const response: GreptimeResponse<string[]> = await this.querySql(`SHOW TABLES`);

    return extractDataRows(response).map((row) => row[0]);
  }

  /**
   * Use `DESC TABLE ${table}` to get column schemas.
   * TODO Currently `DESC` do not support `db` parameter, so we have to use `DESC TABLE ${db}.${table}`
   */
  async queryColumnSchemaOfTable(table: String): Promise<GreptimeColumnSchema[]> {
    /** [Field, Type, Null, Default, Semantic Type] */
    type DescribeTableRow = [string, GreptimeDataTypes, string, string, string];

    const response: GreptimeResponse<DescribeTableRow> = await this.querySql(`DESC TABLE ${this.database}.${table}`);

    return response.output[0].records.rows.map((row) => ({
      name: row[0],
      data_type: row[1],
    }));
  }

  async queryColumnNamesOfTable(table: String): Promise<string[]> {
    const schemas = await this.queryColumnSchemaOfTable(table);
    return schemas.map((schema) => schema.name);
  }
}
