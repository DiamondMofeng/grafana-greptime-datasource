//? This component's name seems ugly. You may help to give it a better name.

import { SelectableValue } from '@grafana/data';
import { SegmentAsync } from '@grafana/ui';
import React from 'react';

type Props<T> = {
  loadOptions: (query?: string) => Promise<Array<SelectableValue<T>>>;
  onChange: (item: SelectableValue<T>) => void;
};

export const AddSegment = <T,>(props: Props<T>) => {
  return <SegmentAsync placeholder='+' {...props} />;
};
