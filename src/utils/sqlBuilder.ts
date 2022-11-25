/**
 * Build the query from the variables selected visual query builder
 */

import { DataSource } from 'datasource';
import { GreptimeQuery } from 'types';

export function buildQuery(query: GreptimeQuery, datasource: DataSource) {
  if (query.isRawQuery) {
    return query.queryText;
  }
  const { client } = datasource;
  const { fromTable, timeColumn, selectedColumns } = query;
  const columns = [...(selectedColumns || []), timeColumn].join(', ');
  const queryText = `SELECT ${columns} FROM ${client.database}.${fromTable}`;
  return queryText;
}
