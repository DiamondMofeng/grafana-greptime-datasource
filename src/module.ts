import { DataSourcePlugin } from '@grafana/data';
import { DataSource } from './datasource';
import { ConfigEditor } from './components/ConfigEditor';
import QueryEditor from './components/QueryEditor';
import { GreptimeQuery, GreptimeSourceOptions } from './types';

export const plugin = new DataSourcePlugin<DataSource, GreptimeQuery, GreptimeSourceOptions>(DataSource)
  .setConfigEditor(ConfigEditor)
  .setQueryEditor(QueryEditor);
