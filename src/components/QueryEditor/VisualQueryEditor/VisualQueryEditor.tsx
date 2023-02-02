import React, { useMemo, } from 'react';
import type { DataSource } from 'datasource';
import { FieldType, GrafanaTheme2, QueryEditorProps, SelectableValue } from '@grafana/data';
import { defaultQuery, GreptimeQuery, GreptimeSourceOptions } from 'types';
import { InlineLabel, SegmentAsync, SegmentSection, useStyles2 } from '@grafana/ui';
import { css } from '@emotion/css';
import { mapGreptimeTypeToGrafana } from 'greptimedb/utils';
import { buildQuery } from 'utils/sqlBuilder';
import { toSelectableValue } from 'utils';
import { SelectSegment } from './SelectSegment';
import { WhereSegment } from './WhereSegment';
import { GroupBySegment } from './GroupBySegment';

type Props = QueryEditorProps<DataSource, GreptimeQuery, GreptimeSourceOptions>;

export const VisualQueryEditor = (props: Props) => {
  // const { query, onChange, onRunQuery, datasource, range, data } = props;
  const { datasource, query: oriQuery, onChange, onRunQuery } = props;
  const { client } = datasource;

  const query = {
    ...defaultQuery,
    ...oriQuery,
  }
  const { fromTable, timeColumn, selectedColumns, whereConditions, groupByColumns } = query;

  const styles = useStyles2(getStyles);

  //TODO!: Below logic makes the component render more than once, which affects the performance.
  /**
   * When the query object changes, we build a new sql and query it.
   */
  //? Is there a time when we don't want to query?
  //? Anyway, I find that Grafana's official plugins also throws uncaught errors when the query is not valid.
  const onUpdateQuery = (newQuery: GreptimeQuery) => {
    const newSql = buildQuery(newQuery, datasource);
    onChange({ ...newQuery, queryText: newSql });
    onRunQuery();
  };

  const changeQueryByKey = <T extends keyof GreptimeQuery>(key: T, value: GreptimeQuery[T]) => {
    const newQuery = { ...query, [key]: value };
    onChange(newQuery);
    onUpdateQuery(newQuery);
  };

  const handleFromTableChange = (select: SelectableValue<string>) => {
    changeQueryByKey('fromTable', select.value);
  };

  const handleTimeColumnChange = (select: SelectableValue<string>) => {
    changeQueryByKey('timeColumn', select.value);
  };

  /**
   * What will happen here:
   * A promise requesting tables will be created and cached.
   * Finally this variable would be a fulfilled promise.
   * Everytime we `await` this variable, it will return a same fulfilled promise. This means the result of the promise will be cached.
   * It is safe to access the inner value using `await`, both for waiting the promise to be fulfilled and for getting the inner value.
   * As long as the given variables in dependency array are not changed, the promise will not be recreated.
   */
  const getAllTables = useMemo(() => {
    return client.showTables();
  }, [client]);

  const handleLoadFromTables = async () => {
    const tables = await getAllTables;
    return tables.map(toSelectableValue);
  };

  const getColumnSchema = useMemo(() => {
    return fromTable ? client.queryColumnSchemaOfTable(fromTable) : Promise.resolve([]);
  }, [client, fromTable]);

  const handleLoadColumnSchema = async () => {
    return await getColumnSchema;
  };

  const getColumnNames = useMemo(async () => {
    const columns = await getColumnSchema;
    return columns.map((column) => column.name);
  }, [getColumnSchema]);

  const getTimeColumns = useMemo(async () => {
    const columns = await getColumnSchema;
    return columns
      .filter((column) => mapGreptimeTypeToGrafana(column.data_type) === FieldType.time)
      .map((column) => toSelectableValue(column.name));
  }, [getColumnSchema]);

  return (
    <>
      <div>
        <SegmentSection label="FROM" fill={true}>
          <SegmentAsync
            value={fromTable ?? 'select table'}
            onChange={handleFromTableChange}
            loadOptions={handleLoadFromTables}
          />
          <InlineLabel width={'auto'} className={styles.inlineLabel}>
            Time column
          </InlineLabel>
          <SegmentAsync
            value={timeColumn ?? 'select time column'} //TODO: auto detect time column
            onChange={handleTimeColumnChange}
            loadOptions={async () => await getTimeColumns}
          />
        </SegmentSection>
        {/* SELECT */}
        <SelectSegment
          selectedColumns={selectedColumns}
          timeColumn={timeColumn}
          changeQueryByKey={changeQueryByKey}
          onLoadColumnSchema={handleLoadColumnSchema}
        />
        {/* WHERE */}
        <WhereSegment
          whereConditions={whereConditions}
          handleLoadAllColumns={async () => (await getColumnNames).map(toSelectableValue)}
          changeQueryByKey={changeQueryByKey}
        />
        {/* GROUP BY */}
        <GroupBySegment
          groupByColumns={groupByColumns}
          selectedColumns={selectedColumns}
          changeQueryByKey={changeQueryByKey}
        />
      </div>
    </>
  );
};

function getStyles(theme: GrafanaTheme2) {
  return {
    inlineLabel: css`
      color: ${theme.colors.primary.text};
    `,
  };
}
