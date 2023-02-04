import type { SelectStatement } from 'components/QueryEditor/VisualQueryEditor/SelectSegment';
import type { WhereStatement } from 'components/QueryEditor/VisualQueryEditor/WhereSegment';
import type { DataSource } from 'datasource';
import type { GreptimeQuery } from 'types';

/**
 * Build the query from the variables selected visual query builder
 */

// TODO should return '*' if no select statements?
export function processSelectStatements(selectStatements: SelectStatement[] | undefined): string {
  if (!selectStatements) {
    return '*';
  }

  return selectStatements.map((stmt) => {
    let res = `${stmt.column}`

    if (stmt.addons?.length) {
      res = stmt.addons.reduce((expr, addon, idx, addons) => {
        switch (addon.type) {
          case 'function':
            return `${addon.name}(${expr})`;
          case 'operator':
            // we do not need to wrap the expression in parentheses if the next addon is a function
            return addons[idx + 1]?.type === 'function'
              ? `${expr} ${addon.name} ${addon.param}`
              : `(${expr} ${addon.name} ${addon.param})`;
          default:
            console.log('Received unexpected addon type:', addon)
            return expr;
        }
      }, res)
    }

    if (stmt.alias) {
      res += ` AS ${stmt.alias}`
    }

    return res;

  }).join(', ');
}

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
  const { fromTable, timeColumn, selectedColumns, whereConditions, groupByColumns } = query;

  const select = `SELECT ${processSelectStatements(selectedColumns)}, ${timeColumn} `;
  const from = `FROM ${fromTable} `;
  const where = whereConditions?.length
    ? `WHERE ${connectWhereConditions(whereConditions)}`
    : '';
  const groupBy = groupByColumns?.length
    ? `GROUP BY ${groupByColumns.join(', ')}`
    : '';

  const queryText =
    `${select}
     ${from}
     ${where}
     ${groupBy}
     `;
  return queryText;
}
