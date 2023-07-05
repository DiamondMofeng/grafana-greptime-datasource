import React from 'react';
import type { DataSource } from 'datasource';
import type { QueryEditorProps } from '@grafana/data';
import type { GreptimeQuery, GreptimeSourceOptions } from 'types';

type Props = QueryEditorProps<DataSource, GreptimeQuery, GreptimeSourceOptions>;

export const PromqlQueryEditor: React.FunctionComponent<Props> = (props) => {
  return <div>placeholder</div>;
};
