import React from 'react';
import { QueryEditorProps } from '@grafana/data';
import { DataSource } from '../../datasource';
import { GreptimeSourceOptions, GreptimeQuery } from '../../types';
import { RawQueryEditor } from './RawQueryEditor';

//TODO consider refactor this component to functional component

type Props = QueryEditorProps<DataSource, GreptimeQuery, GreptimeSourceOptions>;

export const QueryEditor = (props: Props): JSX.Element => {
  // const { query, onChange, onRunQuery, datasource, range, data } = props;
  return (
    <>
      <RawQueryEditor {...props} />
    </>
  );
};
