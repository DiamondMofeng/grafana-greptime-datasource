import { GreptimeDBHttpSqlClient } from "./sqlClient";
import type { GreptimeColumnSchema, GreptimeResponseSuccess } from "./types";

/*
 * TODO: Organize this file better
 * 
 */

function makeGreptimeResponse<T extends any[] = any[]>(
  rows: T[],
  schema?: GreptimeColumnSchema[]
): GreptimeResponseSuccess<T> {
  return {
    code: 0,
    execution_time_ms: 1,
    //this is a single-element array
    output: [
      {
        records: {
          schema: {
            column_schemas: schema ?? [],
          },
          rows: rows,
        },
      }
    ],
  }
}

function makeMockedFetch<T extends any[] = any[]>(mockResponse: GreptimeResponseSuccess<T>) {
  return jest.fn().mockImplementation(() => {
    return Promise.resolve(mockResponse);
  })
}

let mockResponse = makeGreptimeResponse([['foo'], ['bar']]);

let client = new GreptimeDBHttpSqlClient('', '');

let mockedFetch = makeMockedFetch(mockResponse)
client['fetch'] = mockedFetch

describe('sqlClient', () => {

  it('placeholder', () => {
    expect(true).toBe(true);
  });

  // seems grafana's `backSrc` has done the encoding for us 

  // it('should encode query text before fetch', async () => {

  //   await client.querySql('SELECT * FROM foo');
  //   expect(mockedFetch.mock.calls[0][0].params.sql).toBe('SELECT%20*%20FROM%20foo');

  //   await client.querySql('SELECT 1+1');
  //   expect(mockedFetch.mock.calls[1][0].params.sql).toBe('SELECT%201%2B1');

  // });

});

