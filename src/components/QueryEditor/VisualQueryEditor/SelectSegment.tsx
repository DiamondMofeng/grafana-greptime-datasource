import React from "react";
import type { GreptimeQuery } from "types";
import type { GreptimeColumnSchema } from "greptimedb/types";
import type { SelectableValue } from "@grafana/data";
import { toSelectableValue } from "utils";
import { SegmentAsync, SegmentSection } from "@grafana/ui";
import { AddSegment } from "./AddSegment";
import { RemoveSegmentButton } from "./RemoveSegment";

type Props = {
  selectedColumns: string[];
  timeColumn: string | undefined;
  changeQueryByKey: (key: keyof GreptimeQuery, value: any) => void;

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
    const newSelectedColumns = [...selectedColumns, select.value!];
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
  const handleSelectedColumnChange = (columnName: string) => {
    return (select: SelectableValue<string>) => {
      const newSelectedColumns = selectedColumns.map((name) => (name === columnName ? select.value! : name));
      changeQueryByKey('selectedColumns', newSelectedColumns);
    };
  };

  const handleRemoveSelectedColumn = (columnName: string) => {
    return () => {
      const newSelectedColumns = selectedColumns.filter((name) => name !== columnName);
      changeQueryByKey('selectedColumns', newSelectedColumns);
    };
  };

  const selectedColumnsWithPlaceholder = [...selectedColumns, 'PLACEHOLDER']; //last one is for add button

  return (
    <>
      {selectedColumnsWithPlaceholder.map((colName, idx) => (
        <SegmentSection label={idx === 0 ? 'SELECT' : ''} fill={true} key={colName}>
          {idx === selectedColumnsWithPlaceholder.length - 1 ? (
            <AddSegment loadOptions={handleLoadUnselectedColumns} onChange={handleAddColumn} />
          ) : (
            <>
              <SegmentAsync
                value={colName}
                onChange={handleSelectedColumnChange(colName)}
                loadOptions={handleLoadReselectColumns(colName)}
              />
              <RemoveSegmentButton handelRemoveSegment={handleRemoveSelectedColumn(colName)} />
            </>
          )}
        </SegmentSection>
      ))}
    </>
  )
}
