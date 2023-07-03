import React from 'react';
import type { DataSource } from 'datasource';
import type { QueryEditorProps } from '@grafana/data';
import type { GreptimeQuery, GreptimeSourceOptions } from 'types';
import { QueryLanguages } from 'greptimedb/types';
import { QueryEditor as MysqlQueryEditor } from './mysql';
import { PromqlQueryEditor } from './promql';

type Props = QueryEditorProps<DataSource, GreptimeQuery, GreptimeSourceOptions>;

export const QueryEditor: React.FunctionComponent<Props> = (props) => {
  return props.datasource.queryLanguage === QueryLanguages.Mysql ? (
    <MysqlQueryEditor {...props} />
  ) : (
    <PromqlQueryEditor {...props} />
  );
};
