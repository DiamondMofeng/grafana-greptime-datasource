/*
 * SelectAddons is a component for rendering addons for columns in `SELECT` section,
 * not simply a select component.
 * 
 * Mention that `Alias` is also get managed here.
 */
import React from "react";
import type { GrafanaTheme2, SelectableValue } from "@grafana/data";
import type { SelectStatement } from "./SelectSection";
import { InlineLabel, SegmentAsync, SegmentInput, useStyles2 } from "@grafana/ui";
import { css } from "@emotion/css";
import { AddSegment } from "./AddSegment";
import { RemoveablePopover } from "./RemoveablePopover";
import produce from "immer";

export type Addon = FunctionAddon | OperatorAddon;

type BaseAddon = {
  type: string;
  name: string;
  param?: string;
}

const availableOperators = ['+', '-', '*', '/'] as const;

type Operator = typeof availableOperators[number];

type OperatorAddon = BaseAddon & {
  type: 'operator';
  name: Operator;
  param: string;
}

const aggregateFunctions = ['sum', 'avg', 'max', 'min', 'count'] as const;

const availableFunctions = [...aggregateFunctions, 'distinct'] as const;   //TODO maybe we should manage this in a better way.

type Fn = typeof availableFunctions[number]; //TODO give this a better name

type FunctionAddon = BaseAddon & {
  type: 'function';
  name: Fn;
}

const addonOptions: Array<
  SelectableValue<Array<SelectableValue<Addon | { type: 'alias' }>>>
> =
  [
    {
      label: 'Alias',
      options: [
        {
          label: 'alias',
          value: { type: 'alias' }
        }
      ]
    },
    {
      label: 'Functions',
      options: availableFunctions.map((fn) => ({
        label: fn,
        value: { type: 'function', name: fn }
      }))
    },
    {
      label: 'Math',
      options: availableOperators.map((op) => ({
        label: op,
        value: { type: 'operator', name: op, param: '100' }
      }))
    },
  ]

type Props = {
  selectStatement: SelectStatement
  onChangeAddons: (newAddons: Addon[]) => void;
  onChangeAlias: (newAlias: string | undefined) => void;
};

export const SelectAddons = (props: Props) => {
  const { selectStatement, onChangeAlias, onChangeAddons } = props;

  const addons = selectStatement.addons ?? []
  const alias = selectStatement.alias

  const styles = useStyles2(getStyles);

  // ======

  const handleAddAlias = () => {
    onChangeAlias('alias');
  }

  const handleRemoveAlias = () => {
    onChangeAlias(undefined);
  }

  const handleChangeAlias = (text: string | number) => {
    onChangeAlias(String(text));
  }

  // ======

  const handleAddAddon = (addon: Addon) => {
    onChangeAddons([...addons, addon])
  }

  const handleRemoveAddon = (addonIdx: number) => {
    return () => {
      const newAddons = addons.filter((_, i) => i !== addonIdx);
      onChangeAddons(newAddons);
    }
  }

  const handleReselectAddon = (addonIdx: number) => {
    return (select: SelectableValue<Addon>) => {
      const newAddons = produce(addons, (draft) => {
        draft[addonIdx] = select.value!;
      });
      onChangeAddons(newAddons);
    }
  }

  const handleChangeAddonParam = (addonIdx: number) => {
    return (text: string | number) => {
      const newAddons = produce(addons, (draft) => {
        draft[addonIdx].param = String(text);
      });
      onChangeAddons(newAddons);
    }
  }

  // ======

  const handleMassAdd = (select: SelectableValue<Addon | { type: 'alias' }>) => {
    const newAddon = select.value!;
    switch (newAddon.type) {
      case 'alias':
        handleAddAlias();
        break;
      default:
        handleAddAddon(newAddon);
        break;
    }
  }

  return (
    <>
      {/* render addons */}
      {addons.map((addon, idx) =>
        <React.Fragment key={addon.name + addon.param}>{
          addon.param === undefined ? (
            <>
              <RemoveablePopover onRemove={handleRemoveAddon(idx)}>
                <SegmentAsync
                  value={`addon.name${addon.type === 'function' ? '()' : ''}` as any}
                  loadOptions={() => Promise.resolve(addonOptions) as any}
                  onChange={handleReselectAddon(idx)}
                />
              </RemoveablePopover>
            </>
          ) : (
            <>
              <RemoveablePopover onRemove={handleRemoveAddon(idx)}>
                <SegmentAsync
                  value={addon.name as any}
                  loadOptions={() => Promise.resolve(addonOptions) as any}
                  onChange={handleReselectAddon(idx)}
                />
              </RemoveablePopover>
              <SegmentInput
                value={addon.param}
                onChange={handleChangeAddonParam(idx)}
              />
            </>
          )
        }
        </React.Fragment>
      )}
      {/* render alias */}
      {alias && (
        <>
          {/* TODO: should warp the input too? */}
          <RemoveablePopover onRemove={handleRemoveAlias}>
            <InlineLabel width={'auto'} className={styles.inlineLabel}>
              AS
            </InlineLabel>
          </RemoveablePopover>
          <SegmentInput
            value={alias}
            onChange={handleChangeAlias}
          />
        </>
      )}
      {/* render add button */}
      <AddSegment
        loadOptions={() => Promise.resolve(addonOptions)}
        onChange={handleMassAdd}
      />
    </>
  )

};


function getStyles(theme: GrafanaTheme2) {
  return {
    inlineLabel: css`
      color: ${theme.colors.primary.text};
      `,
  };
}
