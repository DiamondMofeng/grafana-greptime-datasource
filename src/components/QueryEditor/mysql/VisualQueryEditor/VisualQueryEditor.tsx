import React, { useMemo, } from 'react';
import type { DataSource } from 'datasource';
import { QueryEditorProps, SelectableValue } from '@grafana/data';
import { defaultQuery, GreptimeQuery, GreptimeSourceOptions } from 'types';
import { SegmentAsync, SegmentSection } from '@grafana/ui';
import { buildQuery } from 'utils/sqlBuilder';
import { toSelectableValue } from 'utils';
import { SelectSection } from './SelectSection';
import { WhereSection } from './WhereSection';
import { GroupBySection } from './GroupBySection';
import { InlineTimeColumnSection } from './TimeColumnSection';

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

  return (
    <>
      <div>
        <SegmentSection label="FROM" fill={true}>
          <SegmentAsync
            value={fromTable ?? 'select table'}
            onChange={handleFromTableChange}
            loadOptions={handleLoadFromTables}
          />
          <InlineTimeColumnSection
            fromTable={fromTable}
            timeColumn={timeColumn}
            changeQueryByKey={changeQueryByKey}
            onLoadColumnSchema={handleLoadColumnSchema}
          />
        </SegmentSection>
        {/* SELECT */}
        <SelectSection
          selectedColumns={selectedColumns}
          timeColumn={timeColumn}
          changeQueryByKey={changeQueryByKey}
          onLoadColumnSchema={handleLoadColumnSchema}
        />
        {/* WHERE */}
        <WhereSection
          whereConditions={whereConditions}
          handleLoadAllColumns={async () => (await getColumnNames).map(toSelectableValue)}
          changeQueryByKey={changeQueryByKey}
        />
        {/* GROUP BY */}
        <GroupBySection
          groupByColumns={groupByColumns}
          selectStatements={selectedColumns}
          timeColumn={timeColumn}
          changeQueryByKey={changeQueryByKey}
        />
      </div>
    </>
  );
};

