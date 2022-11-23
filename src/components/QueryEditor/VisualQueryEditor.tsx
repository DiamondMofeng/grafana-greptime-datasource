import React from 'react';
import type { DataSource } from 'datasource';
import type { GrafanaTheme2, QueryEditorProps, SelectableValue } from '@grafana/data';
import type { GreptimeQuery, GreptimeSourceOptions } from 'types';
import { InlineLabel, SegmentAsync, SegmentSection, useStyles2 } from '@grafana/ui';
import { css } from '@emotion/css';

type Props = QueryEditorProps<DataSource, GreptimeQuery, GreptimeSourceOptions>;

const toOption = (value: string) => ({ label: value, value });

export const VisualQueryEditor = (props: Props) => {
  // const { query, onChange, onRunQuery, datasource, range, data } = props;
  const { datasource } = props;
  const { client } = datasource;
  const styles = useStyles2(getStyles);

  const [fromTable, setFromTable] = React.useState<string | undefined>(undefined);
  const onFromTableChange = (select: SelectableValue<string>) => {
    setFromTable(select.value);
  };

  const [timeColumn, setTimeColumn] = React.useState<string | undefined>(undefined);
  const onTimeColumnChange = (select: SelectableValue<string>) => {
    setTimeColumn(select.value);
  };

  return (
    <>
      <div>
        <SegmentSection label="FROM" fill={true}>
          <SegmentAsync
            value={fromTable}
            onChange={onFromTableChange}
            loadOptions={async () => {
              const result = await client.showTables();
              return result.map(toOption);
            }}
          />
          <InlineLabel width={'auto'} className={styles.inlineLabel}>
            Time column
          </InlineLabel>
          <SegmentAsync
            value={timeColumn}
            onChange={onTimeColumnChange}
            loadOptions={async () => {
              if (!fromTable) {
                return [];
              }
              const result = await client.queryColumnNamesOfTable(fromTable);
              return result.map(toOption);
            }}
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
