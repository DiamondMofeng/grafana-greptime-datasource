import React, { ChangeEvent, PureComponent } from 'react';
import { LegacyForms, Select } from '@grafana/ui';
import { DataSourcePluginOptionsEditorProps } from '@grafana/data';
import type { GreptimeSourceOptions, GreptimeSecureJsonData } from '../types';

const { SecretFormField, FormField } = LegacyForms;

interface Props extends DataSourcePluginOptionsEditorProps<GreptimeSourceOptions> {}

interface State {}

const queryLanguageOptions = [{ label: 'SQL', value: 'sql' }];

export class ConfigEditor extends PureComponent<Props, State> {
  changeJsonData = (key: string, value: any) => {
    const { options, onOptionsChange } = this.props;
    onOptionsChange({
      ...options,
      jsonData: {
        ...options.jsonData,
        [key]: value,
      },
    });
  };

  changeSecureJsonData = (key: string, value: any) => {
    const { options, onOptionsChange } = this.props;
    onOptionsChange({
      ...options,
      secureJsonData: {
        ...options.secureJsonData,
        [key]: value,
      },
    });
  };

  onChangeFactory = (key: keyof GreptimeSourceOptions) => (event: ChangeEvent<HTMLInputElement>) => {
    this.changeJsonData(key, event.target.value);
  };

  onSecureChangeFactory = (key: keyof GreptimeSecureJsonData) => (event: ChangeEvent<HTMLInputElement>) => {
    this.changeSecureJsonData(key, event.target.value);
  };

  //TODO  will be replaced by a factory function
  onResetAPIKey = () => {
    const { onOptionsChange, options } = this.props;
    onOptionsChange({
      ...options,
      secureJsonFields: {
        ...options.secureJsonFields,
        apiKey: false,
      },
      secureJsonData: {
        ...options.secureJsonData,
        apiKey: '',
      },
    });
  };

  render() {
    const { options } = this.props;
    const { jsonData, secureJsonFields } = options;
    const secureJsonData = (options.secureJsonData || {}) as GreptimeSecureJsonData;

    return (
      <div>
        <h3 className="page-heading">Query Language</h3>
        <div className="gf-form-group">
          <Select
            width={20}
            value={jsonData.queryLanguage}
            options={queryLanguageOptions}
            onChange={(opt) => this.changeJsonData('queryLanguage', opt.value)}
          />
        </div>
        <h3 className="page-heading">HTTP</h3>
        <div className="gf-form-group">
          <div className="gf-form">
            <FormField
              label="URL"
              labelWidth={6}
              inputWidth={20}
              onChange={this.onChangeFactory('URL')}
              value={jsonData.URL || ''}
              placeholder="http://greptime.example.com"
            />
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
                onReset={this.onResetAPIKey}
                onChange={this.onSecureChangeFactory('apiKey')}
              />
            </div>
          </div>
        </div>
      </div>
    );
  }
}
