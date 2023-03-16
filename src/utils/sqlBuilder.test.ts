import type { SelectStatement } from "components/QueryEditor/VisualQueryEditor/SelectSection"
import type { WhereStatement } from "components/QueryEditor/VisualQueryEditor/WhereSection"
import {
    // buildQuery,
    connectWhereConditions, processSelectStatements, tryInsertTimeFilterMacro
} from "./sqlBuilder"
import { TIME_FILTER_MACRO } from "./timeFilter"

describe("select statement", () => {

    it('should be processed correctly with alias', () => {
        const selectStatements: SelectStatement[] = [
            {
                column: 'a',
                alias: 'b'
            },
            {
                column: 'c',
                alias: 'd'
            }
        ]
        const result = processSelectStatements(selectStatements)

        expect(result).toBe(
            `a AS b, c AS d`
        )
    })

    it('should be processed correctly', () => {
        const selectStatements: SelectStatement[] = [
            {
                column: 'a',
                addons: [
                    {
                        type: 'function',
                        name: 'sum'
                    },
                    {
                        type: 'operator',
                        name: '+',
                        param: '1'
                    }
                ],
                alias: 'b'
            },
            {
                column: 'c',
                addons: [
                    {
                        type: 'function',
                        name: 'sum'
                    },
                    {
                        type: 'operator',
                        name: '+',
                        param: '1'
                    }
                ],
                alias: 'd'
            }
        ]
        const result = processSelectStatements(selectStatements)

        expect(result).toBe(
            `(sum(a) + 1) AS b, (sum(c) + 1) AS d`
        )
    })

    it('addons should be added in order', () => {
        const selectStatements: SelectStatement[] = [
            {
                column: 'a',
                addons: [
                    {
                        type: 'function',
                        name: 'distinct'
                    },
                    {
                        type: 'function',
                        name: 'sum'
                    },
                    {
                        type: 'operator',
                        name: '+',
                        param: '1'
                    },
                    {
                        type: 'operator',
                        name: '*',
                        param: '2'
                    }
                ],
                alias: 'b'
            },
            {
                column: 'c',
                addons: [
                    {
                        type: 'function',
                        name: 'distinct'
                    },
                    {
                        type: 'operator',
                        name: '*',
                        param: '3'
                    },
                    {
                        type: 'operator',
                        name: '+',
                        param: '1'
                    },
                    {
                        type: 'function',
                        name: 'sum'
                    }
                ],
                alias: 'd'
            }
        ]
        const result = processSelectStatements(selectStatements)

        expect(result).toBe(
            `((sum(distinct(a)) + 1) * 2) AS b, sum((distinct(c) * 3) + 1) AS d`
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

    describe('about time filter', () => {
        it('will insert a time filter if time column is provided', () => {
            const conditions: WhereStatement[] = [
                ['a', '=', 'b', 'AND'],
                ['c', '=', 'd', 'AND'],
            ]
            let result = connectWhereConditions(conditions, ' ')
            const timeColumn = 'time'

            result = tryInsertTimeFilterMacro(result, timeColumn)

            expect(result).toBe(
                `${TIME_FILTER_MACRO} AND (a = b AND c = d)`
            )
        })

        it('will NOT insert a time filter if time column is undefined', () => {
            const conditions: WhereStatement[] = [
                ['a', '=', 'b', 'AND'],
                ['c', '=', 'd', 'AND'],
            ]
            let result = connectWhereConditions(conditions, ' ')
            const timeColumn = undefined

            result = tryInsertTimeFilterMacro(result, timeColumn)

            expect(result).toBe(
                `a = b AND c = d`
            )
        })

        it('conditions string expected to have no length if no conditions and time filter are provided', () => {

            const conditions: WhereStatement[] = []
            const timeColumn = undefined
            let result = connectWhereConditions(conditions, ' ')
            result = tryInsertTimeFilterMacro(result, timeColumn)

            expect(result.length).toBe(0)
            expect(result).toBe(``)
        })

        it('expected to have time filter if only time column is provided', () => {
            const conditions: WhereStatement[] = []
            const timeColumn = 'time'
            let result = connectWhereConditions(conditions, ' ')
            result = tryInsertTimeFilterMacro(result, timeColumn)

            expect(result).toBe(
                `${TIME_FILTER_MACRO}`
            )
        })

    })

})
