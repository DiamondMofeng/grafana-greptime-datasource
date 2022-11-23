import { DataQuery, DataSourceJsonData } from '@grafana/data';

export interface GreptimeQuery extends DataQuery {
  queryText: string;
}

export const defaultQuery: Partial<GreptimeQuery> = {
  queryText: 'SELECT * FROM numbers LIMIT 5',
};

/**
 * These are options configured for each DataSource instance
 */
export interface GreptimeSourceOptions extends DataSourceJsonData {
  URL: string; // URL of the GreptimeDB server
  database: string; // Database to use
  queryLanguage: string; // Query language to use
}

/**
 * Value that is used in the backend, but never sent over HTTP to the frontend
 */
export interface GreptimeSecureJsonData {
  apiKey?: string;
}
