//? This component's name seems ugly. You may help to give it a better name.

import React from 'react';
import { InlineLabel } from '@grafana/ui';
import { css } from '@emotion/css';

type Props = {
  handelRemoveSegment: () => void;
};

export const RemoveSegmentButton: React.FC<Props> = ({ handelRemoveSegment }) => {
  return (
    <InlineLabel className={css({ cursor: 'pointer' })} width={'auto'} onClick={handelRemoveSegment}>
      x
    </InlineLabel>
  );
};
