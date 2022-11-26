/**
 * Modified from https://github.com/grafana/grafana/blob/main/packages/grafana-ui/src/components/Segment/SegmentInput.tsx
 * Maybe I should simply insert a `clear state` function instead of managing the state from outside.
 */
import { cx, css } from '@emotion/css';
import { GrafanaTheme, GrafanaTheme2 } from '@grafana/data';
import { InlineLabel, useStyles2 } from '@grafana/ui';
import { SegmentProps } from '@grafana/ui/components/Segment';
import React, { HTMLProps, ReactElement, useRef, useState } from 'react';
import useClickAway from 'react-use/lib/useClickAway';

interface LabelProps {
  Component: ReactElement;
  onClick?: () => void;
  disabled?: boolean;
}

const useExpandableLabel = (
  initialExpanded: boolean,
  onExpandedChange?: (expanded: boolean) => void
): [React.ComponentType<LabelProps>, number, boolean, (expanded: boolean) => void] => {
  const ref = useRef<HTMLDivElement>(null);
  const [expanded, setExpanded] = useState<boolean>(initialExpanded);
  const [width, setWidth] = useState(0);

  const setExpandedWrapper = (expanded: boolean) => {
    setExpanded(expanded);
    if (onExpandedChange) {
      onExpandedChange(expanded);
    }
  };

  const Label: React.FC<LabelProps> = ({ Component, onClick, disabled }) => (
    <div
      ref={ref}
      onClick={
        disabled
          ? undefined
          : () => {
              setExpandedWrapper(true);
              if (ref && ref.current) {
                setWidth(ref.current.clientWidth * 1.25);
              }
              if (onClick) {
                onClick();
              }
            }
      }
    >
      {Component}
    </div>
  );

  return [Label, width, expanded, setExpandedWrapper];
};

const measureText = (text: string, fontSize: number) => {
  return { width: text.length * fontSize };
};

export interface NonStateSegmentInputProps<T>
  extends Omit<SegmentProps<T>, 'allowCustomValue' | 'allowEmptyValue'>,
    Omit<HTMLProps<HTMLInputElement>, 'value' | 'onChange'> {
  value: string | number;
  onChange: (text: string | number) => void;
  onInputChange: (text: string) => void;
}

const FONT_SIZE = 14;

export function NonStateSegmentInput<T>({
  value,
  onChange,
  onInputChange,
  Component,
  className,
  placeholder,
  inputPlaceholder,
  disabled,
  autofocus = false,
  onExpandedChange,
  ...rest
}: React.PropsWithChildren<NonStateSegmentInputProps<T>>) {
  const ref = useRef<HTMLInputElement>(null);
  // const [value, setValue] = useState<number | string>(initialValue);
  const [inputWidth, setInputWidth] = useState<number>(measureText((value || '').toString(), FONT_SIZE).width);
  const [Label, , expanded, setExpanded] = useExpandableLabel(autofocus, onExpandedChange);
  const styles = useStyles2(getSegmentStyles);

  useClickAway(ref, () => {
    setExpanded(false);
    onChange(value);
  });

  if (!expanded) {
    return (
      <Label
        disabled={disabled}
        Component={
          Component || (
            <InlineLabel
              className={cx(
                styles.segment,
                {
                  [styles.queryPlaceholder]: placeholder !== undefined && !value,
                  [styles.disabled]: disabled,
                },
                className
              )}
            >
              {value || placeholder}
            </InlineLabel>
          )
        }
      />
    );
  }

  const inputWidthStyle = css`
    width: ${Math.max(inputWidth + 20, 32)}px;
  `;

  return (
    <input
      {...rest}
      ref={ref}
      // this needs to autofocus, but it's ok as it's only rendered by choice
      autoFocus
      className={cx(`gf-form gf-form-input`, inputWidthStyle)}
      value={value}
      placeholder={inputPlaceholder}
      onChange={(item) => {
        const { width } = measureText(item.target.value, FONT_SIZE);
        setInputWidth(width);
        onInputChange(item.target.value);
      }}
      onBlur={() => {
        setExpanded(false);
        onChange(value);
      }}
      onKeyDown={(e) => {
        if ([13, 27].includes(e.keyCode)) {
          setExpanded(false);
          onChange(value);
        }
      }}
    />
  );
}

function getSegmentStyles(theme: GrafanaTheme | GrafanaTheme2) {
  return {
    segment: css`
      cursor: pointer;
      width: auto;
    `,

    queryPlaceholder: css`
      color: rgb(204, 204, 220);
    `,

    disabled: css`
      cursor: not-allowed;
      opacity: 0.65;
      box-shadow: none;
    `,
  };
}
