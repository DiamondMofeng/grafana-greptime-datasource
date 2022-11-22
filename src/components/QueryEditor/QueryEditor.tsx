import React from 'react';
import { QueryEditorProps } from '@grafana/data';
import { DataSource } from '../../datasource';
import { MyDataSourceOptions, MyQuery } from '../../types';
import { RawQueryEditor } from './RawQueryEditor';

//TODO consider refactor this component to functional component

type Props = QueryEditorProps<DataSource, MyQuery, MyDataSourceOptions>;

export const QueryEditor = (props: Props): JSX.Element => {
  // const { query, onChange, onRunQuery, datasource, range, data } = props;
  return (
    <>
      <RawQueryEditor {...props} />
    </>
  );
};
