import React, { useEffect, useRef } from "react";
import { FieldType, type GrafanaTheme2, type SelectableValue } from "@grafana/data";
import { InlineLabel, SegmentAsync, useStyles2 } from "@grafana/ui";
import { css } from "@emotion/css";
import type { GreptimeColumnSchemaDetailed } from "greptimedb/types";
import type { GreptimeQuery } from "types";
import { mapGreptimeTypeToGrafana } from "greptimedb/utils";
import { toSelectableValue } from "utils";

// This component is used for auto detect Time Column after user select a table.

type Props = {
  fromTable: string | undefined;
  timeColumn: string | undefined;
  onLoadColumnSchema: () => Promise<GreptimeColumnSchemaDetailed[]>
  changeQueryByKey: <K extends keyof GreptimeQuery>(key: K, value: GreptimeQuery[K]) => void;
}

export const InlineTimeColumnSection = (props: Props) => {

  const { fromTable, timeColumn, changeQueryByKey, onLoadColumnSchema } = props;

  const styles = useStyles2(getStyles);

  const handleChangeTimeColumn = (select: SelectableValue<string>) => {
    changeQueryByKey('timeColumn', select.value);
  };

  const handleLoadTimeColumns = async () => {
    const columnSchemas = await onLoadColumnSchema();
    const timeColumns = columnSchemas
      .filter((col) => mapGreptimeTypeToGrafana(col.data_type) === FieldType.time)
      .map((col) => col.name);
    return timeColumns.map(toSelectableValue);
  };

  // auto detect time column when table changed.

  const lastTableRef = useRef<string | undefined>();

  useEffect(() => {

    if (lastTableRef.current !== fromTable) {

      lastTableRef.current = fromTable;

      onLoadColumnSchema().then((columnSchemas) => {
        const timeIndexColumn = columnSchemas
          .find((col) => col.semantic_type === 'TIME INDEX')

        // intended to set to undefined if no time indexed column was found.
        changeQueryByKey('timeColumn', timeIndexColumn?.name);

      });
    }

  }, [changeQueryByKey, fromTable, timeColumn, onLoadColumnSchema]);

  return <>
    <InlineLabel width={'auto'} className={styles.inlineLabel}>
      Time column
    </InlineLabel>
    <SegmentAsync
      value={timeColumn ?? 'select time column'}
      onChange={handleChangeTimeColumn}
      loadOptions={handleLoadTimeColumns}
    />
  </>;
};

function getStyles(theme: GrafanaTheme2) {
  return {
    inlineLabel: css`
        color: ${theme.colors.primary.text};
      `,
  };
}
