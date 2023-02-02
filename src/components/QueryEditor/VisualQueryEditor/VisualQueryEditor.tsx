import React, { useMemo, } from 'react';
import type { DataSource } from 'datasource';
import { FieldType, GrafanaTheme2, QueryEditorProps, SelectableValue } from '@grafana/data';
import { defaultQuery, GreptimeQuery, GreptimeSourceOptions } from 'types';
import { InlineLabel, SegmentAsync, SegmentSection, useStyles2 } from '@grafana/ui';
import { css } from '@emotion/css';
import { mapGreptimeTypeToGrafana } from 'greptimedb/utils';
import { AddSegment } from './AddSegment';
import { RemoveSegmentButton } from './RemoveSegment';
import { buildQuery } from 'utils/sqlBuilder';
import { toSelectableValue } from 'utils';
import { WhereSegment } from './WhereSegment';

type Props = QueryEditorProps<DataSource, GreptimeQuery, GreptimeSourceOptions>;

export const VisualQueryEditor = (props: Props) => {
  // const { query, onChange, onRunQuery, datasource, range, data } = props;
  const { datasource, query: oriQuery, onChange, onRunQuery } = props;
  const { client } = datasource;

  const query = {
    ...defaultQuery,
    ...oriQuery,
  }
  const { fromTable, timeColumn, selectedColumns, whereConditions } = query;

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

  const changeQueryByKey = (key: keyof GreptimeQuery, value: any) => {
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

  //* For Select Segment

  const selectedColumnsWithPlaceholder = [...selectedColumns, 'PLACEHOLDER']; //last one is for add button

  /**
   * GreptimeDB's sql syntax do not allow select same column twice.
   */
  const unselectedColumnsSchemas = useMemo(async () => {
    const columns = await getColumnSchema;
    return columns.filter((column) => ![...selectedColumns, timeColumn].includes(column.name));
  }, [getColumnSchema, selectedColumns, timeColumn]);

  const handleLoadUnselectedColumns = async () => {
    return (await unselectedColumnsSchemas).map((column) => toSelectableValue(column.name));
  };

  const handleAddColumn = (select: SelectableValue<string>) => {
    const newSelectedColumns = [...selectedColumns, select.value!];
    changeQueryByKey('selectedColumns', newSelectedColumns);
  };

  /**
   * Should return self value concat other unselected values.
   */
  const handleLoadReselectColumns = (selfVal: string) => {
    return async () => {
      return [toSelectableValue(selfVal), ... await handleLoadUnselectedColumns()];
    };
  };

  /**
   * Reselect a selected column.
   */
  const handleSelectedColumnChange = (columnName: string) => {
    return (select: SelectableValue<string>) => {
      const newSelectedColumns = selectedColumns.map((name) => (name === columnName ? select.value! : name));
      changeQueryByKey('selectedColumns', newSelectedColumns);
    };
  };

  const handleRemoveSelectedColumn = (columnName: string) => {
    return () => {
      const newSelectedColumns = selectedColumns.filter((name) => name !== columnName);
      changeQueryByKey('selectedColumns', newSelectedColumns);
    };
  };

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
        {selectedColumnsWithPlaceholder.map((colName, idx) => (
          <SegmentSection label={idx === 0 ? 'SELECT' : ''} fill={true} key={colName}>
            {idx === selectedColumnsWithPlaceholder.length - 1 ? (
              <AddSegment loadOptions={handleLoadUnselectedColumns} onChange={handleAddColumn} />
            ) : (
              <>
                <SegmentAsync
                  value={colName}
                  onChange={handleSelectedColumnChange(colName)}
                  loadOptions={handleLoadReselectColumns(colName)}
                />
                <RemoveSegmentButton handelRemoveSegment={handleRemoveSelectedColumn(colName)} />
              </>
            )}
          </SegmentSection>
        ))}
        {/* WHERE */}
        <WhereSegment
          whereConditions={whereConditions}
          handleLoadAllColumns={async () => (await getColumnNames).map(toSelectableValue)}
          changeQueryByKey={changeQueryByKey}
        />
        {/* GROUP BY */}
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
