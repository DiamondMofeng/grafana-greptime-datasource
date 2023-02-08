import React from "react";
import type { GreptimeQuery } from "types";
import type { GreptimeColumnSchemaDetailed } from "greptimedb/types";
import type { SelectableValue } from "@grafana/data";
import { toSelectableValue } from "utils";
import { SegmentAsync, SegmentSection } from "@grafana/ui";
import { AddSegment } from "./AddSegment";
import { RemoveablePopover } from "./RemoveablePopover";
import { type Addon, SelectAddons } from "./SelectAddons";
import produce from "immer"

export type SelectStatement = {
  column: string;

  /** 
   * Assuming that these addons are applied to the column name in order.
   * @example [{sum}, {+ 1} , {/ 2}] => (sum(column) + 1) / 2
   */
  addons?: Addon[]
  alias?: string;
};

// ===================== component =====================

type Props = {
  selectedColumns: SelectStatement[];
  timeColumn: string | undefined;
  changeQueryByKey: <K extends keyof GreptimeQuery>(key: K, value: GreptimeQuery[K]) => void;

  onLoadColumnSchema: () => Promise<GreptimeColumnSchemaDetailed[]>;
}

export const SelectSection = (props: Props) => {

  const { selectedColumns: selectStatements, timeColumn, changeQueryByKey, onLoadColumnSchema } = props;

  // ===================== column name handlers =====================

  /**
   * It would cause error if the there are same column names in the output
   */
  const handleLoadUnselectedColumns = async () => {

    //TODO Consider allowing add all columns and add an tip when users try to add repeated columns.
    //TODO Aggregation function is ignored while it counts.
    const selectedColumns = selectStatements.map((stmt) => stmt.alias ?? stmt.column)

    return (await onLoadColumnSchema())
      .map((schema) => schema.name)
      .filter((column) => ![timeColumn, ...selectedColumns].includes(column))
      .map((column) => toSelectableValue(column));
  };

  const handleAddColumn = (select: SelectableValue<string>) => {
    const newSelectStatements = [...selectStatements, { column: select.value! }];
    changeQueryByKey('selectedColumns', newSelectStatements);
  };

  /**
   * Should return self value concat other unselected values.
   */
  const handleLoadReselectColumns = (selfVal: string) => {
    return async () => {
      return [toSelectableValue(selfVal), ... await handleLoadUnselectedColumns()];
    };
  };

  /**
   * Reselect a selected column.
   */
  const handleReselectColumn = (idx: number) => {
    return (select: SelectableValue<string>) => {
      const newSelectStatements = selectStatements.map((stmt, i) =>
        i === idx
          ? { ...stmt, column: select.value! }
          : stmt
      );
      changeQueryByKey('selectedColumns', newSelectStatements);
    };
  };

  const handleRemoveSelectedColumn = (idx: number) => {
    return () => {
      const newSelectStatements = selectStatements.filter((_, i) => i !== idx);
      changeQueryByKey('selectedColumns', newSelectStatements);
    };
  };

  // ============= addon and alais handlers =============

  const handleOnChangeAddons = (stmtIdx: number) => {
    return (newAddons: Addon[]) => {
      changeQueryByKey('selectedColumns', produce(selectStatements, (draft) => {
        draft[stmtIdx].addons = newAddons;
      }))
    }
  }

  const handleOnChangeAlias = (stmtIdx: number) => {
    return (newAlias: string | undefined) => {
      changeQueryByKey('selectedColumns', produce(selectStatements, (draft) => {
        draft[stmtIdx].alias = newAlias;
      }))
    }
  }

  // ============= render =============

  const defaultStmt = { column: '' };

  const selectStatementsWithPlaceholder = [...selectStatements, defaultStmt]; //last one is for add button

  return (
    <>
      {selectStatementsWithPlaceholder.map((stmt, idx) => (
        <SegmentSection label={idx === 0 ? 'SELECT' : ''} fill={true} key={stmt.column}>
          {idx === selectStatementsWithPlaceholder.length - 1 ? (
            <>
              <AddSegment
                loadOptions={handleLoadUnselectedColumns}
                onChange={handleAddColumn}
              />
            </>
          ) : (
            <>
              {/* column */}
              <RemoveablePopover onRemove={handleRemoveSelectedColumn(idx)}>
                <SegmentAsync
                  value={stmt.column}
                  onChange={handleReselectColumn(idx)}
                  loadOptions={handleLoadReselectColumns(stmt.column)}
                />
              </RemoveablePopover>
              {/* addons */}
              <SelectAddons
                selectStatement={stmt}
                onChangeAddons={handleOnChangeAddons(idx)}
                onChangeAlias={handleOnChangeAlias(idx)}
              />
            </>
          )}
        </SegmentSection>
      ))}
    </>
  )
}
