import type { SelectStatement } from "components/QueryEditor/VisualQueryEditor/SelectSegment"
import type { WhereStatement } from "components/QueryEditor/VisualQueryEditor/WhereSegment"
import {
    // buildQuery,
    connectWhereConditions, processSelectStatements
} from "./sqlBuilder"

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
                        function: 'sum'
                    },
                    {
                        type: 'operator',
                        operator: '+',
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
                        function: 'sum'
                    },
                    {
                        type: 'operator',
                        operator: '+',
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
                        function: 'distinct'
                    },
                    {
                        type: 'function',
                        function: 'sum'
                    },
                    {
                        type: 'operator',
                        operator: '+',
                        param: '1'
                    },
                    {
                        type: 'operator',
                        operator: '*',
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
                        function: 'distinct'
                    },
                    {
                        type: 'operator',
                        operator: '*',
                        param: '3'
                    },
                    {
                        type: 'operator',
                        operator: '+',
                        param: '1'
                    },
                    {
                        type: 'function',
                        function: 'sum'
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
})

