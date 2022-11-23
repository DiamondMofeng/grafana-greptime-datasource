import React from 'react';
import type { DataSource } from 'datasource';
import type { QueryEditorProps } from '@grafana/data';
import type { GreptimeQuery, GreptimeSourceOptions } from 'types';

type Props = QueryEditorProps<DataSource, GreptimeQuery, GreptimeSourceOptions>;

export const VisualQueryEditor = (props: Props) => {
  // const { query, onChange, onRunQuery, datasource, range, data } = props;

  return (
    <>
      <div>VisualQueryEditor</div>
    </>
  );
};
