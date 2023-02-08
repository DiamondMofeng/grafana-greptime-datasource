import type { DataQuery, DataSourceJsonData } from '@grafana/data';
import { HealthCheckResultDetails } from '@grafana/runtime';
import type { SelectStatement } from 'components/QueryEditor/VisualQueryEditor/SelectSection';
import type { WhereStatement } from 'components/QueryEditor/VisualQueryEditor/WhereSection';

export interface GreptimeQuery extends DataQuery {
  isRawQuery?: boolean;
  /** Table to query from */
  fromTable?: string;
  timeColumn?: string;
  /** Selected [column, aggregate, alias] */
  selectedColumns?: SelectStatement[];
  /** Where */
  whereConditions?: WhereStatement[];
  /** Group by */
  groupByColumns?: string[];

  queryText: string;
}

/**
 * We should not type this to Partial<GreptimeQuery>, which makes {...defaultQuery} failed to fullfill those optional fields
 */
export const defaultQuery = {
  // fromTable: '',
  // timeColumn: '',
  queryText: 'SELECT * FROM numbers LIMIT 5',
  selectedColumns: [],
  whereConditions: [],
  groupByColumns: [],
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

export interface TestingStatus {
  message?: string | null;
  status?: string | null;
  details?: HealthCheckResultDetails;
}
