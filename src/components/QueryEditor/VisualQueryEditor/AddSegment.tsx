//? This component's name seems ugly. You may help to give it a better name.

import { SelectableValue } from '@grafana/data';
import { SegmentAsync } from '@grafana/ui';
import React from 'react';

/**
 * Grafana has some issue on type `SelectableValue`.  
 * We have to mark the type of param in `onChange` manually if it is different from the value in options.
 */

type Props<T, U> = {
  loadOptions: (query?: string) => Promise<Array<SelectableValue<T>>>;
  onChange: (item: SelectableValue<U>) => void;
};

export const AddSegment = <T, U = T>(props: Props<T, U>) => {
  const { loadOptions, onChange } = props;

  return (
    <SegmentAsync
      placeholder='+'
      loadOptions={loadOptions as any}
      onChange={onChange}
    />
  );
};
