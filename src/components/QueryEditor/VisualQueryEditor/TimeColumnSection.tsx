import React from "react";
import { FieldType, GrafanaTheme2, SelectableValue } from "@grafana/data";
import type { GreptimeQuery } from "types";
import { InlineLabel, SegmentAsync, useStyles2 } from "@grafana/ui";
import { css } from "@emotion/css";
import { GreptimeColumnSchema } from "greptimedb/types";
import { toSelectableValue } from "utils";
import { mapGreptimeTypeToGrafana } from "greptimedb/utils";

// import { mapGreptimeTypeToGrafana } from 'greptimedb/utils';



// This component is used for auto detect Time Column after user select a table.

type Props = {
    timeColumn: string | undefined;
    changeQueryByKey: <K extends keyof GreptimeQuery>(key: K, value: GreptimeQuery[K]) => void;

    onLoadColumnSchema: () => Promise<GreptimeColumnSchema[]>
}

export const InlineTimeColumnSection = (props: Props) => {

    const { timeColumn, changeQueryByKey, onLoadColumnSchema } = props;

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

    return <>
        <InlineLabel width={'auto'} className={styles.inlineLabel}>
            Time column
        </InlineLabel>
        <SegmentAsync
            value={timeColumn ?? 'select time column'} //TODO: auto detect time column
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
