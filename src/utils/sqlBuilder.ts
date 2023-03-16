import type { SelectStatement } from 'components/QueryEditor/VisualQueryEditor/SelectSection';
import type { WhereStatement } from 'components/QueryEditor/VisualQueryEditor/WhereSection';
import type { DataSource } from 'datasource';
import type { GreptimeQuery } from 'types';
import { TIME_FILTER_MACRO } from './timeFilter';

/**
 * Build the query from the variables selected visual query builder
 */

export function processSelectStatements(selectStatements: SelectStatement[] | undefined): string {
  if (!selectStatements?.length) {
    return '';
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

/**
 * return original conditions if timeColumn is not provided
 * otherwise, return a new condition string with time filter macro inserted
 */
export function tryInsertTimeFilterMacro(conditions: string, timeColumn: string | undefined): string {
  if (!timeColumn) {
    return conditions;
  }

  if (conditions.length > 0) {
    return `${TIME_FILTER_MACRO} AND (${conditions})`;
  } else {
    return `${TIME_FILTER_MACRO}`;
  }
}

export function buildQuery(query: GreptimeQuery, datasource: DataSource) {
  if (query.isRawQuery) {
    return query.queryText;
  }
  const { fromTable, timeColumn, selectedColumns, whereConditions, groupByColumns } = query;

  let queryText = '';

  // SELECT
  const SELECT = `SELECT ${processSelectStatements(selectedColumns)}${timeColumn ? `${selectedColumns?.length ? ', ' : ''}${timeColumn}` : ''} `;
  queryText += `${SELECT}\n`

  // FROM
  const FROM = `FROM ${fromTable} `;
  queryText += `${FROM}\n`

  // WHERE
  let conditions = connectWhereConditions(whereConditions);
  // insert a time filter macro if time column is provided
  conditions = tryInsertTimeFilterMacro(conditions, timeColumn);

  const WHERE = conditions.length > 0
    ? `WHERE ${conditions}`
    : '';
  queryText += `${WHERE}\n`

  // GROUP BY
  const GROUP_BY = groupByColumns?.length
    ? `GROUP BY ${groupByColumns.join(', ')}`
    : '';
  queryText += `${GROUP_BY}\n`

  return queryText;
}
