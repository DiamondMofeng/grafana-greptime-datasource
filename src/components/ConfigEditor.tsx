import React, { type ChangeEvent } from 'react';
import { Alert, LegacyForms, Select } from '@grafana/ui';
import type { DataSourcePluginOptionsEditorProps } from '@grafana/data';
import type { GreptimeSourceOptions, GreptimeSecureJsonData } from '../types';
import produce from 'immer';

const { SecretFormField, FormField } = LegacyForms;

interface Props extends DataSourcePluginOptionsEditorProps<GreptimeSourceOptions, GreptimeSecureJsonData> {
  //place holder
}

const queryLanguageOptions = [{ label: 'SQL', value: 'sql' }];

const DEFAULT_DATABASE = 'public';

export const ConfigEditor: React.FunctionComponent<Props> = (props: Props) => {
  const { options, onOptionsChange } = props;
  const { jsonData, secureJsonFields } = options;
  const secureJsonData = (options.secureJsonData ?? {});

  const changeJsonData = <K extends keyof GreptimeSourceOptions>(key: K, value: GreptimeSourceOptions[K]) => {
    onOptionsChange(produce(options, (opt) => {
      opt.jsonData[key] = value;
    }))
  };

  const changeSecureJsonData = <K extends keyof GreptimeSecureJsonData>(key: K, value: GreptimeSecureJsonData[K]) => {
    onOptionsChange(produce(options, (opt) => {
      opt.secureJsonData ??= {};
      opt.secureJsonData[key] = value;
    }))
  };

  const onChangeFactory = (key: keyof GreptimeSourceOptions) => (event: ChangeEvent<HTMLInputElement>) => {
    changeJsonData(key, event.target.value);
  };

  const onSecureChangeFactory = (key: keyof GreptimeSecureJsonData) => (event: ChangeEvent<HTMLInputElement>) => {
    changeSecureJsonData(key, event.target.value);
  };

  //TODO  will be replaced by a factory function
  const onResetAPIKey = () => {
    const { onOptionsChange, options } = props;
    onOptionsChange(produce(options, (opt) => {
      opt.secureJsonFields ??= {};
      opt.secureJsonFields.apiKey = false;
      
      opt.secureJsonData ??= {};
      opt.secureJsonData.apiKey = '';
    }));
  };

  return (
    <div>
      <h3 className="page-heading">Query Language</h3>
      <div className="gf-form-group">
        <Select
          width={20}
          value={jsonData.queryLanguage}
          defaultValue={queryLanguageOptions[0]}
          options={queryLanguageOptions}
          onChange={(opt) => changeJsonData('queryLanguage', opt.value!)}
        />
      </div>
      <h3 className="page-heading">HTTP</h3>
      <Alert severity="info" title="Database Access">
        <p>
          Setting the database for this datasource does not deny access to other databases.
          <br />
          Users can still query other databases using the query syntax like:
          <br />
          <code>SELECT * FROM &quot;other_db&quot;.&quot;tablename&quot;.&quot;field&quot;</code>
          <br />
          <br />
          To support data isolation and security, make sure appropriate permissions are configured in GreptimeDB.
        </p>
      </Alert>
      <div className="gf-form-group">
        <div className="gf-form-inline">
          <div className="gf-form">
            <FormField
              label="URL"
              labelWidth={6}
              inputWidth={20}
              onChange={onChangeFactory('URL')}
              value={jsonData.URL || ''}
              placeholder="http://greptime.example.com"
            />
          </div>
        </div>
        <div className="gf-form-inline">
          <div className="gf-form">
            <FormField
              label="database"
              labelWidth={6}
              inputWidth={20}
              onChange={onChangeFactory('database')}
              value={jsonData.database ?? DEFAULT_DATABASE}
            // placeholder={DEFAULT_DATABASE}
            />
          </div>
        </div>
      </div>
      <h3 className="page-heading">Auth</h3>
      <p>We have not implemented any authentication yet.</p>
      <div className="gf-form-group">
        <div className="gf-form-group">
          <div className="gf-form">
            <SecretFormField
              isConfigured={(secureJsonFields && secureJsonFields.apiKey) as boolean}
              value={secureJsonData.apiKey || ''}
              label="API Key"
              placeholder="Not used yet"
              tooltip="Not used yet"
              labelWidth={6}
              inputWidth={20}
              onReset={onResetAPIKey}
              onChange={onSecureChangeFactory('apiKey')}
            />
          </div>
        </div>
      </div>
    </div>
  );
};
