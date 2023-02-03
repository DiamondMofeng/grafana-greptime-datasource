import React from "react";
import type { GreptimeQuery } from "types";
import type { GreptimeColumnSchema } from "greptimedb/types";
import type { SelectableValue } from "@grafana/data";
import { toSelectableValue } from "utils";
import { SegmentAsync, SegmentSection } from "@grafana/ui";
import { AddSegment } from "./AddSegment";
import { RemoveSegmentButton } from "./RemoveSegment";

export type SelectStatement = {
  column: string;
  aggregation?: string;
  alias?: string;
};

type Props = {
  selectedColumns: SelectStatement[];
  timeColumn: string | undefined;
  changeQueryByKey: <K extends keyof GreptimeQuery>(key: K, value: GreptimeQuery[K]) => void;

  onLoadColumnSchema: () => Promise<GreptimeColumnSchema[]>;
}

export const SelectSegment = (props: Props) => {

  const { selectedColumns: selectStatements, timeColumn, changeQueryByKey, onLoadColumnSchema } = props;

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

  const defaultStmt = { column: '', aggregation: '', alias: '' };

  const selectStatementsWithPlaceholder = [...selectStatements, defaultStmt]; //last one is for add button

  return (
    <>
      {selectStatementsWithPlaceholder.map((stmt, idx) => (
        <SegmentSection label={idx === 0 ? 'SELECT' : ''} fill={true} key={stmt.column}>
          {idx === selectStatementsWithPlaceholder.length - 1 ? (
            <AddSegment
              loadOptions={handleLoadUnselectedColumns}
              onChange={handleAddColumn}
            />
          ) : (
            <>
              <SegmentAsync
                value={stmt.column}
                onChange={handleReselectColumn(idx)}
                loadOptions={handleLoadReselectColumns(stmt.column)}
              />
              <RemoveSegmentButton handelRemoveSegment={handleRemoveSelectedColumn(idx)} />
            </>
          )}
        </SegmentSection>
      ))}
    </>
  )
}
