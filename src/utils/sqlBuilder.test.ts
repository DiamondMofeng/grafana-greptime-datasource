import type { SelectStatement } from "components/QueryEditor/VisualQueryEditor/SelectSegment"
import type { WhereStatement } from "components/QueryEditor/VisualQueryEditor/WhereSegment"
import {
    // buildQuery,
    connectWhereConditions, processSelectStatements
} from "./sqlBuilder"

describe("select statement", () => {
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

    it('with single agregation', () => {
        const conditions: SelectStatement[] = [
            { column: 'a', aggregations: ['sum'] },
            { column: 'b', aggregations: ['count'] },
            { column: 'd', aggregations: ['avg'] },
            { column: 'c', aggregations: ['max'] },
        ]
        const result = processSelectStatements(conditions)

        expect(result).toBe(
            `sum(a), count(b), avg(d), max(c)`
        )
    })

    it('with single agregation and alias', () => {
        const conditions: SelectStatement[] = [
            { column: 'a', aggregations: ['sum'], alias: 'a' },
            { column: 'b', aggregations: ['count'], alias: 'b' },
            { column: 'd', aggregations: ['avg'], alias: 'd' },
            { column: 'c', aggregations: ['max'], alias: 'c' },
        ]
        const result = processSelectStatements(conditions)

        expect(result).toBe(
            `sum(a) AS a, count(b) AS b, avg(d) AS d, max(c) AS c`
        )
    })

    it('with multiple agregation', () => {
        const conditions: SelectStatement[] = [
            { column: 'a', aggregations: ['sum', 'count'] },
            { column: 'b', aggregations: ['count', 'avg'] },
            { column: 'd', aggregations: ['avg', 'max'] },
            { column: 'c', aggregations: ['max', 'sum'] },
        ]
        const result = processSelectStatements(conditions)

        expect(result).toBe(
            `count(sum(a)), avg(count(b)), max(avg(d)), sum(max(c))`
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

