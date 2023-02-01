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
}
export const WhereSegment = (props: Props) => {

  const { whereConditions, handleLoadAllColumns } = props;

  const handleClickAddButton = () => {
    //TODO
  }

  const handleChangeValue = (idx: number) => {
    //TODO
    return () => { }
  }

  const handleRemoveWhereCondition = (idx: number) => {
    //TODO
    return () => { }
  }

  return (
    <>
      {whereConditions.map((condition, idx) => {
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
                  onChange={() => { }}>
                </SegmentAsync>
                {/* operator */}
                <SegmentSelect
                  value={toSelectableValue(op)}
                  options={Object.values(OPERATORS).map(toSelectableValue)}
                  onClickOutside={() => { }}
                  onChange={() => { }}
                  width={50}  //TODO
                />
                {/* value */}
                <SegmentInput value={value.toString()} inputPlaceholder={''} onChange={handleChangeValue(idx)} />
                {/* connector */}
                <SegmentSelect
                  value={toSelectableValue(connector)}
                  options={['AND', 'OR'].map(toSelectableValue)}
                  onClickOutside={() => { }}
                  onChange={() => { }}
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
