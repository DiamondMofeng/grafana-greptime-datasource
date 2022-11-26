//? This component's name seems ugly. You may help to give it a better name.

import { SelectableValue } from '@grafana/data';
import { SegmentAsync } from '@grafana/ui';
import React from 'react';

type Props = {
  loadOptions: (query?: string) => Promise<Array<SelectableValue<string>>>;
  onChange: (item: SelectableValue<string>) => void;
};

export const AddSegment: React.FC<Props> = (props) => {
  return <SegmentAsync value={'+'} {...props} />;
};
