/*
 * SelectAddons is a component for rendering addons for columns in `SELECT` section,
 * not simply a select component.
 * 
 * Mention that `Alias` is also get managed here.
 */
import React from "react";
import type { GrafanaTheme2, SelectableValue } from "@grafana/data";
import type { SelectStatement } from "./SelectSegment";
import { InlineLabel, SegmentInput, useStyles2 } from "@grafana/ui";
import { css } from "@emotion/css";
import { AddSegment } from "./AddSegment";
import { RemoveablePopover } from "./RemoveablePopover";

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

const availableFunctions = ['sum', 'avg', 'max', 'min', 'count', 'distinct'] as const;   //TODO maybe we should manage this in a better way.

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
        value: { type: 'function', function: fn }
      }))
    },
    {
      label: 'Math',
      options: availableOperators.map((op) => ({
        label: op,
        value: { type: 'operator', operator: op, param: '100' }
      }))
    },
  ]

type Props = {
  selectStatement: SelectStatement
  onChangeAddons: (newAddons: Addon[]) => void;
  onChangeAlias: (newAlias: string | undefined) => void;
};

export const SelectAddons = (props: Props) => {
  const { selectStatement, onChangeAlias } = props;

  // const addons = selectStatement.addons ?? []
  const alias = selectStatement.alias

  const styles = useStyles2(getStyles);

  const handleAddAlias = () => {
    onChangeAlias('alias');
  }

  const handleRemoveAlias = () => {
    onChangeAlias(undefined);
  }

  const handleChangeAlias = (text: string | number) => {
    onChangeAlias(String(text));
  }

  const handleMassAdd = (select: SelectableValue<Addon | { type: 'alias' }>) => {
    const newAddon = select.value!;
    switch (newAddon.type) {
      case 'alias':
        handleAddAlias();
        break;

    }
  }


  // const handleAddAddon = (select: SelectableValue<Addon>) => {
  //   const addon = select.value!;
  //   onChangeAddons([...addons, addon])
  // }

  // const handleRemoveAddon = (addonIdx: number) => {
  //   return () => {
  //     const newAddons = addons.filter((_, i) => i !== addonIdx);
  //     onChangeAddons(newAddons);
  //   }
  // }

  // const handleChangeAddon = (addonIdx: number) => {
  //   return (select: SelectableValue<Addon>) => {
  //     const newAddons = addons.map((addon, i) => i === addonIdx ? select.value! : addon);
  //     onChangeAddons(newAddons);
  //   }
  // }



  return (
    <>


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
