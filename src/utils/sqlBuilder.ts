import type { WhereStatement } from 'components/QueryEditor/VisualQueryEditor/WhereSegment';
import type { DataSource } from 'datasource';
import type { GreptimeQuery } from 'types';

/**
 * Build the query from the variables selected visual query builder
 */

export function connectWhereConditions(
  whereConditions: WhereStatement[] | undefined,
  sparater: '\n' | ' ' = '\n'
): string {

  if (!whereConditions) {
    return ''
  };

  return whereConditions.map((condition, idx) =>
    idx === whereConditions.length - 1
      ? condition.slice(0, -1).join(' ')
      : condition.join(' ')
  ).join(sparater);
}

export function buildQuery(query: GreptimeQuery, datasource: DataSource) {
  if (query.isRawQuery) {
    return query.queryText;
  }
  const { fromTable, timeColumn, selectedColumns, whereConditions } = query;
  const columns = [...(selectedColumns || []), timeColumn].join(', ');

  const select = `SELECT ${columns} `;
  const from = `FROM ${fromTable} `;
  const where = whereConditions?.length
    ? `WHERE ${connectWhereConditions(whereConditions)}`
    : '';

  const queryText =
    `${select}
     ${from}
     ${where}`;
  return queryText;
}
