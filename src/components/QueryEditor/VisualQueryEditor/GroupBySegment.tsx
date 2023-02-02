import React from "react";

import { Segment, SegmentSection } from "@grafana/ui";
import { GreptimeQuery } from "types";
import { toSelectableValue } from "utils";
import { SelectableValue } from "@grafana/data";
import { AddSegment } from "./AddSegment";
import { RemoveSegmentButton } from "./RemoveSegment";
import { SelectStatement } from "./SelectSegment";

type Props = {
  groupByColumns: string[];
  selectedColumns: SelectStatement[];
  changeQueryByKey: (key: keyof GreptimeQuery, value: any) => void;
}

export const GroupBySegment = (props: Props) => {
  const { groupByColumns, changeQueryByKey, selectedColumns } = props;

  const handleLoadAddableColumns = () => {
    return selectedColumns
      .filter(stmt => !groupByColumns.includes(stmt.column))
      .map((stmt) => toSelectableValue(stmt.column));
  };

  const handleAddColumn = (select: SelectableValue<string>) => {
    const newSelectedColumns = [...groupByColumns, select.value!];
    changeQueryByKey('groupByColumns', newSelectedColumns);
  };

  const handleReselectColumn = (idx: number) => {
    return (select: SelectableValue<string>) => {
      const newSelectedColumns = groupByColumns.map((col, i) =>
        i === idx
          ? select.value
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
            <Segment
              key={idx}
              value={toSelectableValue(col)}
              options={[...handleLoadAddableColumns(), toSelectableValue(col)]}
              onChange={handleReselectColumn(idx)}
            />
            <RemoveSegmentButton
              handelRemoveSegment={handleRemoveColumn(idx)}
            />
          </>
        )
      ))}
    </SegmentSection>
  );
};
