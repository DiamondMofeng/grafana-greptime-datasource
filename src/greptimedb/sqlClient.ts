import type { MutableDataFrame } from '@grafana/data';
import { BackendSrvRequest, getBackendSrv } from '@grafana/runtime';
import { GreptimeColumnSchemaDetailed, GreptimeDataTypes, GreptimeResponse, GreptimeResponseSuccess } from './types';
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

  private async fetch<T extends any[] = any[]>(options: BackendSrvRequest): Promise<GreptimeResponseSuccess<T>> {
    /**
     * When fetching, there are three possible outcomes:
     * 1. The request is successful, and the response is a GreptimeResponseSuccess object.
     * 2. The request is successful, but the response is a GreptimeResponseError object.
     * 3. The request is failed, and the response is a FetchError object.
     */
    const response = lastValueFrom(getBackendSrv().fetch<GreptimeResponse<T>>(options));
    const data = (await response).data;

    if ('error' in data) {
      throw new Error(`Error code ${data.code}.
      ${data.error}`);
    }

    return data;
  }

  // async post(url: string, data?: any): Promise<GreptimeDBResponse> {
  //   const response = await getBackendSrv().post(url, data);
  //   return response;
  // }

  // async get(url: string): Promise<GreptimeDBResponse> {
  //   const response = await getBackendSrv().get(url);
  //   return response;
  // }

  async querySql<T extends any[] = any[]>(sql: string): Promise<GreptimeResponseSuccess<T>> {
    const response: GreptimeResponseSuccess<T> = await this.fetch({
      url: this.SQL_URL,
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      params: {
        sql: sql,
        db: this.database === '' ? undefined : this.database,
      },
    });

    return response;
  }

  async querySqlToDataFrame(sql: string): Promise<MutableDataFrame> {
    const response = await this.querySql(sql);
    return parseResponseToDataFrame(response);
  }

  /**
   * Show tables in current database.
   */
  async showTables(): Promise<string[]> {
    const response: GreptimeResponseSuccess<string[]> = await this.querySql(`SHOW TABLES`);

    return extractDataRows(response).map((row) => row[0]);
  }

  /**
   * Use `DESC TABLE ${table}` to get column schemas.
   */
  async queryColumnSchemaOfTable(table: string): Promise<GreptimeColumnSchemaDetailed[]> {
    /** [Field, Type, Null, Default, Semantic Type] */
    type DescribeTableRow = [string, GreptimeDataTypes, string, string, string];

    const response: GreptimeResponseSuccess<DescribeTableRow> = await this.querySql(`DESC TABLE ${table}`);

    return response.output[0].records.rows.map((row) => ({
      name: row[0],
      data_type: row[1],
      nullable: row[2] === 'YES',
      default: row[3],
      semantic_type: row[4],
    }));
  }

  async queryColumnNamesOfTable(table: string): Promise<string[]> {
    const schemas = await this.queryColumnSchemaOfTable(table);
    return schemas.map((schema) => schema.name);
  }
}
