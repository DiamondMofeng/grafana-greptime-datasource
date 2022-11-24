import React, { useMemo } from 'react';
import type { DataSource } from 'datasource';
import { FieldType, GrafanaTheme2, QueryEditorProps, SelectableValue } from '@grafana/data';
import { defaultQuery, GreptimeQuery, GreptimeSourceOptions } from 'types';
import { InlineLabel, SegmentAsync, SegmentSection, useStyles2 } from '@grafana/ui';
import { css } from '@emotion/css';
import { defaults } from 'lodash';
import { mapGreptimeTypeToGrafana } from 'greptimedb/utils';

type Props = QueryEditorProps<DataSource, GreptimeQuery, GreptimeSourceOptions>;

const toOption = (value: string) => ({ label: value, value });

export const VisualQueryEditor = (props: Props) => {
  // const { query, onChange, onRunQuery, datasource, range, data } = props;
  const { datasource, query: oriQuery, onChange } = props;
  const { client } = datasource;

  const query = defaults(oriQuery, defaultQuery);
  const { fromTable, timeColumn } = query;

  const styles = useStyles2(getStyles);

  const changeQueryByKey = (key: keyof GreptimeQuery, value: any) => {
    onChange({ ...query, [key]: value });
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
    return tables.map(toOption);
  };

  const getColumnSchema = useMemo(() => {
    return fromTable ? client.queryColumnSchemaOfTable(fromTable) : Promise.resolve([]);
  }, [client, fromTable]);

  // const handleLoadColumnNames = async () => {
  //   const columns = await getColumnSchema;
  //   return columns.map((schema) => toOption(schema.name));
  // };

  const getTimeColumns = useMemo(async () => {
    const columns = await getColumnSchema;
    return columns
      .filter((column) => mapGreptimeTypeToGrafana(column.data_type) === FieldType.time)
      .map((column) => toOption(column.name));
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
