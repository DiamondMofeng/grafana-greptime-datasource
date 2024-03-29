import React from "react";

import { Segment, SegmentSection } from "@grafana/ui";
import type { GreptimeQuery } from "types";
import { toSelectableValue } from "utils";
import type { SelectableValue } from "@grafana/data";
import { AddSegment } from "./AddSegment";
import type { SelectStatement } from "./SelectSection";
import { RemoveablePopover } from "./RemoveablePopover";

type Props = {
  groupByColumns: string[];
  selectStatements: SelectStatement[];
  timeColumn: string | undefined;
  changeQueryByKey: <K extends keyof GreptimeQuery>(key: K, value: GreptimeQuery[K]) => void;
}

export const GroupBySection = (props: Props) => {
  const { groupByColumns, changeQueryByKey, selectStatements, timeColumn } = props;

  const handleLoadAddableColumns = () => {

    const selectedColumns = selectStatements
      .map((stmt) => stmt.column)

    //TODO so ugly
    return (
      timeColumn
        ? [...selectedColumns, timeColumn]
        : selectedColumns
    )
      .filter(col => !groupByColumns.includes(col))
      .map((col) => toSelectableValue(col));

  };

  const handleAddColumn = (select: SelectableValue<string>) => {
    const newSelectedColumns = [...groupByColumns, select.value!];
    changeQueryByKey('groupByColumns', newSelectedColumns);
  };

  const handleReselectColumn = (idx: number) => {
    return (select: SelectableValue<string>) => {
      const newSelectedColumns = groupByColumns.map((col, i) =>
        i === idx
          ? select.value!
          : col
      )
      changeQueryByKey('groupByColumns', newSelectedColumns);
    };
  }

  const handleRemoveColumn = (idx: number) => {
    return () => {
      const newSelectedColumns = groupByColumns.filter((_, i) => i !== idx);
      changeQueryByKey('groupByColumns', newSelectedColumns);
    }
  };

  const groupByColumnsWithPlaceholder = [...groupByColumns, ''];

  return (
    <SegmentSection label="GROUP BY" fill={true}>
      {groupByColumnsWithPlaceholder.map((col, idx) => (
        idx === groupByColumnsWithPlaceholder.length - 1 ? (
          <>
            <AddSegment
              key={idx}
              loadOptions={async () => handleLoadAddableColumns()}
              onChange={handleAddColumn}
            />
          </>
        ) : (
          <>
            <RemoveablePopover onRemove={handleRemoveColumn(idx)}>
              <Segment
                key={idx}
                value={toSelectableValue(col)}
                options={[...handleLoadAddableColumns(), toSelectableValue(col)]}
                onChange={handleReselectColumn(idx)}
              />
            </RemoveablePopover>
          </>
        )
      ))}
    </SegmentSection>
  );
};
