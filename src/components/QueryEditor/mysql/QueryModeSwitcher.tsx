/**
 * https://github.com/grafana/grafana/blob/main/public/app/plugins/datasource/influxdb/components/QueryEditorModeSwitcher.tsx
 */
import React, { useEffect, useState } from 'react';
import { Button, ConfirmModal } from '@grafana/ui';

type Props = {
  isRawQuery: boolean;
  onIsRawChange: (newIsRaw: boolean) => void;
};

export const QueryEditorModeSwitcher = ({ isRawQuery, onIsRawChange }: Props): JSX.Element => {
  const [isModalOpen, setModalOpen] = useState(false);

  useEffect(() => {
    // if the isRaw changes, we hide the modal
    setModalOpen(false);
  }, [isRawQuery]);

  return (
    <>
      {isRawQuery ? (
        <>
          <Button
            aria-label="Switch to visual editor"
            icon="pen"
            variant="secondary"
            type="button"
            onClick={() => {
              // we show the are-you-sure modal
              setModalOpen(true);
            }}
          ></Button>
          <ConfirmModal
            isOpen={isModalOpen}
            title="Switch to visual editor mode"
            body="Are you sure to switch to visual editor mode? You will lose the changes done in raw query mode."
            confirmText="Yes, switch to editor mode"
            dismissText="No, stay in raw query mode"
            onConfirm={() => {
              onIsRawChange(false);
            }}
            onDismiss={() => {
              setModalOpen(false);
            }}
          />
        </>
      ) : (
        <Button
          aria-label="Switch to text editor"
          icon="pen"
          variant="secondary"
          type="button"
          onClick={() => {
            onIsRawChange(true);
          }}
        ></Button>
      )}
    </>
  );
};
