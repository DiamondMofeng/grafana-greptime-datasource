import defaults from 'lodash/defaults';

import React, { ChangeEvent, PureComponent } from 'react';
import { CodeEditor, monacoTypes } from '@grafana/ui';
import { QueryEditorProps } from '@grafana/data';
import { DataSource } from '../datasource';
import { defaultQuery, MyDataSourceOptions, MyQuery } from '../types';

type Props = QueryEditorProps<DataSource, MyQuery, MyDataSourceOptions>;

export class QueryEditor extends PureComponent<Props> {
  getEditorValue: any | undefined;
  editor: monacoTypes.editor.IStandaloneCodeEditor | undefined;

  changeQuery = (key: keyof MyQuery, value: any) => {
    const { query, onChange } = this.props;
    onChange({ ...query, [key]: value });
  };

  onChangeFactory = (key: keyof MyQuery) => (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    this.changeQuery(key, event.target.value);
  };

  onEditorDidMount = (editor: monacoTypes.editor.IStandaloneCodeEditor) => {
    this.editor = editor;
  };

  onRawQueryChange = () => {
    if (!this.editor) {
      return;
    }
    this.changeQuery('queryText', this.editor.getValue());
  };

  render() {
    const query = defaults(this.props.query, defaultQuery);

    return (
      <div>
        <CodeEditor
          height={'200px'}
          language="sql"
          value={query.queryText}
          onEditorDidMount={this.onEditorDidMount}
          onBlur={this.onRawQueryChange}
        />
      </div>
    );
  }
}
