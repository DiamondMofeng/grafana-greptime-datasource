/**
 * Build the query from the variables selected visual query builder
 */

import { DataSource } from 'datasource';
import { GreptimeQuery } from 'types';

export function buildQuery(query: GreptimeQuery, datasource: DataSource) {
  if (query.isRawQuery) {
    return query.queryText;
  }
  const { fromTable, timeColumn, selectedColumns, whereConditions } = query;
  const columns = [...(selectedColumns || []), timeColumn].join(', ');

  const select = `SELECT ${columns} `;
  const from = `FROM ${fromTable} `;
  const where = whereConditions?.length ? `WHERE ${whereConditions.join(' AND ')}` : ''; //TODO only AND for now
  const queryText = `${select} ${from} ${where}`;
  return queryText;
}
