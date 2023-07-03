import React from 'react';
import { QueryEditorProps } from '@grafana/data';
import { DataSource } from 'datasource';
import { GreptimeSourceOptions, GreptimeQuery } from 'types';
import { RawQueryEditor } from './RawQueryEditor';
import { VisualQueryEditor } from './VisualQueryEditor/';
import { QueryEditorModeSwitcher } from './QueryModeSwitcher';
import { css } from '@emotion/css';

type Props = QueryEditorProps<DataSource, GreptimeQuery, GreptimeSourceOptions>;

export const QueryEditor = (props: Props): JSX.Element => {
  // const { query, onChange, onRunQuery, datasource, range, data } = props;
  const { query, onChange, onRunQuery } = props;
  const { isRawQuery } = query;
  return (
    <>
      <div className={css({ display: 'flex' })}>
        <div className={css({ flexGrow: 1 })}>
          {isRawQuery ? <RawQueryEditor {...props} /> : <VisualQueryEditor {...props} />}
        </div>
        <QueryEditorModeSwitcher
          isRawQuery={isRawQuery ?? false}
          onIsRawChange={(newIsRawQuery) => {
            onChange({ ...query, isRawQuery: newIsRawQuery }); //TODO: should transform query built in visual editor to raw query
            onRunQuery();
          }}
        />
      </div>
    </>
  );
};
