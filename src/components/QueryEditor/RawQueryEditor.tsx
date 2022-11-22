import defaults from 'lodash/defaults';

import React, { ChangeEvent, PureComponent } from 'react';
import { CodeEditor, monacoTypes } from '@grafana/ui';
import { QueryEditorProps } from '@grafana/data';
import { DataSource } from '../../datasource';
import { defaultQuery, MyDataSourceOptions, MyQuery } from '../../types';

//TODO consider refactor this component to functional component

type Props = QueryEditorProps<DataSource, MyQuery, MyDataSourceOptions>;
export class RawQueryEditor extends PureComponent<Props> {
  editor: monacoTypes.editor.IStandaloneCodeEditor | undefined;

  changeQuery = (key: keyof MyQuery, value: any) => {
    const { query, onChange } = this.props;
    onChange({ ...query, [key]: value });
  };

  /**
   * A Factory creating a change handler for a given query key.
   */
  onChangeFactory = (key: keyof MyQuery) => (event: ChangeEvent<HTMLInputElement>) => {
    this.changeQuery(key, event.target.value);
  };

  onEditorDidMount = (editor: monacoTypes.editor.IStandaloneCodeEditor) => {
    this.editor = editor;
  };

  /**
   * Save and run query with current text in the editor.
   */
  onEditorTextChange = () => {
    if (!this.editor) {
      return;
    }
    this.changeQuery('queryText', this.editor.getValue());
    this.props.onRunQuery();
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
          onBlur={this.onEditorTextChange}
          onSave={this.onEditorTextChange}
        />
      </div>
    );
  }
}
