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

  const { selectedColumns, timeColumn, changeQueryByKey, onLoadColumnSchema } = props;

  /**
   * GreptimeDB's sql syntax do not allow select same column twice.
   */
  const handleLoadUnselectedColumns = async () => {
    return (await onLoadColumnSchema())
      .filter((column) => ![timeColumn, ...selectedColumns].includes(column.name))
      .map((column) => toSelectableValue(column.name));
  };

  const handleAddColumn = (select: SelectableValue<string>) => {
    const newSelectedColumns = [...selectedColumns, { column: select.value! }];
    changeQueryByKey('selectedColumns', newSelectedColumns);
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
      const newSelectedColumns = selectedColumns.map((stmt, i) =>
        i === idx
          ? { ...stmt, column: select.value! }
          : stmt
      );
      changeQueryByKey('selectedColumns', newSelectedColumns);
    };
  };

  const handleRemoveSelectedColumn = (idx: number) => {
    return () => {
      const newSelectedColumns = selectedColumns.filter((_, i) => i !== idx);
      changeQueryByKey('selectedColumns', newSelectedColumns);
    };
  };

  const defaultStmt = { column: '', aggregation: '', alias: '' };

  const selectedColumnsWithPlaceholder = [...selectedColumns, defaultStmt]; //last one is for add button

  return (
    <>
      {selectedColumnsWithPlaceholder.map((stmt, idx) => (
        <SegmentSection label={idx === 0 ? 'SELECT' : ''} fill={true} key={stmt.column}>
          {idx === selectedColumnsWithPlaceholder.length - 1 ? (
            <AddSegment
              loadOptions={handleLoadUnselectedColumns}
              onChange={handleAddColumn} />
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
