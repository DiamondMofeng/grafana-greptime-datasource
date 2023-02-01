import React from "react";
import { SegmentInput, SegmentSection, SegmentAsync, Segment, InlineLabel } from "@grafana/ui";
import { RemoveSegmentButton } from "./RemoveSegment";
import { toSelectableValue } from "utils";
import type { SelectableValue } from "@grafana/data";
import type { GreptimeQuery } from "types";
import { css } from "@emotion/css";
// import { AddSegment } from "./AddSegment";

/*
 * The format of WHERE statements should be [column] [operator] [value] [AND|OR]
 * ? How to identify the type of the value? It could be a string, number or boolean
 */

const OPERATORS = ['=', '!=', '>', '<', '>=', '<='] as const;
type operatorType = typeof OPERATORS[number];

type valueType = string | number | boolean;

/** The last condition should not have connector */
const CONNECTORS = ['AND', 'OR'] as const;
type connectorType = 'AND' | 'OR' | undefined;

export type WhereStatement = [string, operatorType, valueType, connectorType];

const defaultStatement: WhereStatement = ["select column", OPERATORS[0], 'value', 'AND'];

const AddWhereConditionButton = (props: {
  onClick: () => void;
}) => (
  <InlineLabel className={css({ cursor: 'pointer' })} width={'auto'} onClick={props.onClick}>
    +
  </InlineLabel>
)

/*
 * The first line 
 */

type Props = {
  whereConditions: WhereStatement[];
  handleLoadAllColumns: () => Promise<Array<SelectableValue<string>>>;
  changeQueryByKey: (key: keyof GreptimeQuery, value: any) => void;
}
export const WhereSegment = (props: Props) => {

  const { whereConditions, handleLoadAllColumns, changeQueryByKey } = props;


  const handleClickAddButton = () => {
    const newWhereConditions = [...whereConditions, defaultStatement];
    changeQueryByKey('whereConditions', newWhereConditions);
  }

  const handleChangeColumn = (idx: number) => {
    return (newVal: SelectableValue<string>) => {
      const newWhereConditions = [...whereConditions].map((condition, i) =>
        i === idx
          ? [newVal.value, condition[1], condition[2], condition[3]]
          : condition
      );
      changeQueryByKey('whereConditions', newWhereConditions);
    }
  }

  const handleChangeOperator = (idx: number) => {
    return (newVal: SelectableValue<operatorType>) => {
      const newWhereConditions = [...whereConditions].map((condition, i) =>
        i === idx
          ? [condition[0], newVal.value, condition[2], condition[3]]
          : condition
      );
      changeQueryByKey('whereConditions', newWhereConditions);
    }
  }

  const handleChangeValue = (idx: number) => {
    return (newVal: string | number) => {
      const newWhereConditions = [...whereConditions].map((condition, i) =>
        i === idx
          ? [condition[0], condition[1], newVal, condition[3]]
          : condition
      );
      changeQueryByKey('whereConditions', newWhereConditions);
    }
  }

  const handleChangeConnector = (idx: number) => {
    return (newVal: SelectableValue<connectorType>) => {
      const newWhereConditions = [...whereConditions].map((condition, i) =>
        i === idx
          ? [condition[0], condition[1], condition[2], newVal.value]
          : condition
      );
      changeQueryByKey('whereConditions', newWhereConditions);
    }
  }

  const handleRemoveWhereCondition = (idx: number) => {
    return () => {
      const newWhereConditions = [...whereConditions].filter((_, i) => i !== idx);
      changeQueryByKey('whereConditions', newWhereConditions);
    }
  }

  // console.log("whereConditions:", whereConditions);
  const whereConditionsWithPlaceholder: WhereStatement[] = [...whereConditions, defaultStatement]
  // console.log("with placeholder:", whereConditionsWithPlaceholder)

  return (
    <>
      {whereConditionsWithPlaceholder.map((condition, idx) => {
        const [column, op, value, connector] = condition;
        return (
          <SegmentSection label={idx === 0 ? 'WHERE' : ''} fill={true} key={condition.toString() + idx} >
            {idx === whereConditionsWithPlaceholder.length - 1 ? (
              <>
                <AddWhereConditionButton onClick={handleClickAddButton} />
              </>
            ) : (
              <>
                {/* column name */}
                <SegmentAsync
                  value={toSelectableValue(column)}
                  loadOptions={handleLoadAllColumns}
                  onChange={handleChangeColumn(idx)}>
                </SegmentAsync>
                {/* operator */}
                <Segment
                  value={toSelectableValue(op)}
                  options={OPERATORS.map(toSelectableValue)}
                  onChange={handleChangeOperator(idx)}
                />
                {/* value */}
                <SegmentInput value={value.toString()} inputPlaceholder={''} onChange={handleChangeValue(idx)} />
                {/* connector */}
                <Segment
                  value={toSelectableValue(connector)}
                  options={CONNECTORS.map(toSelectableValue)}
                  onChange={handleChangeConnector(idx)}
                />
                {/* remove */}
                <RemoveSegmentButton handelRemoveSegment={handleRemoveWhereCondition(idx)} />
              </>
            )}
          </SegmentSection>
        )
      })}
    </>
  )

}
