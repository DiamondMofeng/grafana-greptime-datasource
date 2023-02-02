import type { WhereStatement } from "components/QueryEditor/VisualQueryEditor/WhereSegment"
import {
    // buildQuery,
    connectWhereConditions
} from "./sqlBuilder"


describe("sqlBuilder", () => {
    it('where statement should be connected correctly', () => {
        const conditions: WhereStatement[] = [
            ['a', '=', 'b', 'AND'],
            ['c', '=', 'd', 'AND'],
        ]
        const result = connectWhereConditions(conditions, ' ')
        
        expect(result).toBe(
            `a = b AND c = d`
        )
    })
})

