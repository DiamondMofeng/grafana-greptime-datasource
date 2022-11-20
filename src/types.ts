import { DataQuery, DataSourceJsonData } from '@grafana/data';

export interface MyQuery extends DataQuery {
  queryText: string;
}

export const defaultQuery: Partial<MyQuery> = {
  queryText: 'SELECT * FROM numbers LIMIT 5',
};

/**
 * These are options configured for each DataSource instance
 */
export interface MyDataSourceOptions extends DataSourceJsonData {
  URL: string; // URL of the GreptimeDB server
  queryLanguage: string; // Query language to use
}

/**
 * Value that is used in the backend, but never sent over HTTP to the frontend
 */
export interface MySecureJsonData {
  apiKey?: string;
}
