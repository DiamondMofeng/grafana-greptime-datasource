import type { SelectStatement } from "components/QueryEditor/VisualQueryEditor/SelectSegment"
import type { WhereStatement } from "components/QueryEditor/VisualQueryEditor/WhereSegment"
import {
    // buildQuery,
    connectWhereConditions, processSelectStatements
} from "./sqlBuilder"

describe("select", () => {
    it('without agregation and alias', () => {
        const conditions: SelectStatement[] = [
            { column: 'a', },
            { column: 'b', },
            { column: 'd', },
            { column: 'c', },
        ]
        const result = processSelectStatements(conditions)

        expect(result).toBe(
            `a, b, d, c`
        )
    })

    it('with agregation', () => {
        const conditions: SelectStatement[] = [
            { column: 'a', aggregation: 'SUM' },
            { column: 'b', aggregation: 'COUNT' },
            { column: 'd', aggregation: 'AVG' },
            { column: 'c', aggregation: 'MAX' },
        ]
        const result = processSelectStatements(conditions)

        expect(result).toBe(
            `SUM(a), COUNT(b), AVG(d), MAX(c)`
        )
    })

    it('with agregation and alias', () => {
        const conditions: SelectStatement[] = [
            { column: 'a', aggregation: 'SUM', alias: 'a' },
            { column: 'b', aggregation: 'COUNT', alias: 'b' },
            { column: 'd', aggregation: 'AVG', alias: 'd' },
            { column: 'c', aggregation: 'MAX', alias: 'c' },
        ]
        const result = processSelectStatements(conditions)

        expect(result).toBe(
            `SUM(a) AS a, COUNT(b) AS b, AVG(d) AS d, MAX(c) AS c`
        )
    })

})

describe("where", () => {
    it('should be connected correctly', () => {
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

