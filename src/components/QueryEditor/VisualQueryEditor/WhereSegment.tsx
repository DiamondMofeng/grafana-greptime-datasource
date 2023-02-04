import React from "react";
import { SegmentInput, SegmentSection, SegmentAsync, Segment } from "@grafana/ui";
import { RemoveablePopover } from "./RemoveablePopover";
import { toSelectableValue } from "utils";
import type { SelectableValue } from "@grafana/data";
import type { GreptimeQuery } from "types";
import { AddSegment } from "./AddSegment";

/*
 * The format of WHERE statements should be [column] [operator] [value] [AND|OR]
 * ? How to identify the type of the value? It could be a string, number or boolean
 */

const OPERATORS = ['=', '!=', '>', '<', '>=', '<='] as const;
type operatorType = typeof OPERATORS[number];

type valueType = string | number;

/** The last condition should not have connector */
const CONNECTORS = ['AND', 'OR'] as const;
type connectorType = 'AND' | 'OR' | undefined;

/**
 * In case someday we have to get rid of the readonly modifier,
 * We could use a function Tuple to narrowing the tuples in `handle...` functions
 */
export type WhereStatement = Readonly<[string, operatorType, valueType, connectorType]>;

const defaultStatement: WhereStatement = ["select column", OPERATORS[0], 'value', 'AND'];

type Props = {
  whereConditions: WhereStatement[];
  handleLoadAllColumns: () => Promise<Array<SelectableValue<string>>>;
  changeQueryByKey: <K extends keyof GreptimeQuery>(key: K, value: GreptimeQuery[K]) => void;
}
export const WhereSegment = (props: Props) => {

  const { whereConditions, handleLoadAllColumns, changeQueryByKey } = props;

  const handleAddCondition = (select: SelectableValue<string>) => {
    const newWhereConditions = [...whereConditions, [select.value!, defaultStatement[1], defaultStatement[2], defaultStatement[3]] as const];
    changeQueryByKey('whereConditions', newWhereConditions);
  }

  const handleChangeColumn = (idx: number) => {
    return (select: SelectableValue<string>) => {
      const newWhereConditions = whereConditions.map((condition, i) => {
        return i === idx
          ? [select.value!, condition[1], condition[2], condition[3]] as const
          : condition
      });

      changeQueryByKey('whereConditions', newWhereConditions);
    }
  }

  const handleChangeOperator = (idx: number) => {
    return (select: SelectableValue<operatorType>) => {
      const newWhereConditions = whereConditions.map((condition, i) =>
        i === idx
          ? [condition[0], select.value!, condition[2], condition[3]] as const
          : condition
      );
      changeQueryByKey('whereConditions', newWhereConditions);
    }
  }

  const handleChangeValue = (idx: number) => {
    return (newVal: string | number) => {
      const newWhereConditions = [...whereConditions].map((condition, i) =>
        i === idx
          ? [condition[0], condition[1], newVal!, condition[3]] as const
          : condition
      );
      changeQueryByKey('whereConditions', newWhereConditions);
    }
  }

  const handleChangeConnector = (idx: number) => {
    return (newVal: SelectableValue<connectorType>) => {
      const newWhereConditions = [...whereConditions].map((condition, i) =>
        i === idx
          ? [condition[0], condition[1], condition[2], newVal.value!] as const
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
                <AddSegment
                  onChange={handleAddCondition}
                  loadOptions={handleLoadAllColumns}
                />
              </>
            ) : (
              <>
                {/* column name */}
                <RemoveablePopover onRemove={handleRemoveWhereCondition(idx)}>
                  <SegmentAsync
                    value={toSelectableValue(column)}
                    loadOptions={handleLoadAllColumns}
                    onChange={handleChangeColumn(idx)}>
                  </SegmentAsync>
                </RemoveablePopover>
                {/* operator */}
                <Segment
                  value={toSelectableValue(op)}
                  options={OPERATORS.map(toSelectableValue)}
                  onChange={handleChangeOperator(idx)}
                  inputMinWidth={40}
                />
                {/* value */}
                <SegmentInput
                  value={value}
                  placeholder={'value'}
                  onChange={handleChangeValue(idx)}
                />
                {/* connector */}
                {
                  idx < whereConditionsWithPlaceholder.length - 2 && (
                    <Segment
                      value={toSelectableValue(connector)}
                      options={CONNECTORS.map(toSelectableValue)}
                      onChange={handleChangeConnector(idx)}
                    />
                  )
                }
              </>
            )}
          </SegmentSection>
        )
      })}
    </>
  )

}
