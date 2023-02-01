import React from "react";
import { SegmentInput, SegmentSection, SegmentAsync, SegmentSelect } from "@grafana/ui";
import { RemoveSegmentButton } from "./RemoveSegment";
import { toSelectableValue } from "utils";
import { SelectableValue } from "@grafana/data";
// import { AddSegment } from "./AddSegment";


/*
 * The format of WHERE statements should be [column] [operator] [value] [AND|OR]
 * ? How to identify the type of the value? It could be a string, number or boolean
 */
enum OPERATORS {
  '=',
  '!=',
  '>',
  '<',
  '>=',
  '<=',
  // 'LIKE',
}
type valueType = string | number | boolean;
/** The last condition should not have connector */
type connectorType = 'AND' | 'OR' | undefined;

export type WhereStatement = [string, OPERATORS, valueType, connectorType];

const AddWhereConditionButton = (props: {
  onClick: () => void;
}) => (
  <i className="fa fa-plus " onClick={props.onClick} />
)

/*
 * The first line 
 */

type Props = {
  whereConditions: WhereStatement[];
  handleLoadAllColumns: () => Promise<Array<SelectableValue<string>>>;
  changeQueryByKey: (key: string, value: any) => void;
}
export const WhereSegment = (props: Props) => {

  const { whereConditions, handleLoadAllColumns, changeQueryByKey } = props;

  const handleClickAddButton = () => {
    const newWhereConditions = [...whereConditions, ['', OPERATORS['='], '', undefined]];
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
    return (newVal: SelectableValue<OPERATORS>) => {
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

  return (
    <>
      {(whereConditions.concat([])).map((condition, idx) => {
        const [column, op, value, connector] = condition;
        return (
          <SegmentSection label={idx === 0 ? 'WHERE' : ''} fill={true} key={condition.toString()} >
            {idx === whereConditions.length - 1 ? (
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
                <SegmentSelect
                  value={toSelectableValue(op)}
                  options={(Object.values(OPERATORS) as OPERATORS[]).map(toSelectableValue)}
                  onClickOutside={() => { }}
                  onChange={handleChangeOperator(idx)}
                  width={50}  //TODO
                />
                {/* value */}
                <SegmentInput value={value.toString()} inputPlaceholder={''} onChange={handleChangeValue(idx)} />
                {/* connector */}
                <SegmentSelect
                  value={toSelectableValue(connector)}
                  options={(['AND', 'OR'] as const).map(toSelectableValue)}
                  onClickOutside={() => { }}
                  onChange={handleChangeConnector(idx)}
                  width={50}
                />
                {/* remove */}
                <RemoveSegmentButton handelRemoveSegment={handleRemoveWhereCondition(idx)} />
              </>
            )
            }
          </SegmentSection>
        )
      })}
    </>
  )

}
