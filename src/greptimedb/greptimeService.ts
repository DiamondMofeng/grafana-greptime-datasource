import { FieldType, MutableDataFrame } from '@grafana/data';
import { getBackendSrv } from '@grafana/runtime';

const URL = 'http://greptime.example.com';
const SQL_URL = `${URL}/v1/sql`;

export async function _doRequest(sql: String) {
  const result = await getBackendSrv().post(`${SQL_URL}?sql=${sql}`);
  console.log(result);
  return result;
}

enum GreptimeDataTypes {
  String = 'String',
  Float64 = 'Float64',
  Timestamp = 'Timestamp',
}
export interface GreptimeDBResponse {
  code: number;
  execution_time_ms: number;
  //this is a single-element array
  output: [
    {
      records: {
        schema: {
          column_schemas: Array<{
            name: string;
            data_type: GreptimeDataTypes;
          }>;
        };
        rows: any[]; //TODO: I don't know how to type this and it seems unnecessary to type this.
      };
    }
  ];
}

const greptimeTypeToGrafana: Record<GreptimeDataTypes, FieldType> = {
  String: FieldType.string,
  Float64: FieldType.number,
  Timestamp: FieldType.time,
};

export function parseResponseToDataFrame(response: GreptimeDBResponse): MutableDataFrame {
  const columnSchemas = response.output[0].records.schema.column_schemas;
  const dataRows = response.output[0].records.rows;
  const frame = new MutableDataFrame({
    fields: columnSchemas.map((columnSchema, idx) => {
      return {
        name: columnSchema.name,
        type: greptimeTypeToGrafana[columnSchema.data_type],
        values: dataRows.map((row) => row[idx]),
      };
    }),
  });
  return frame;
}

export async function doRequst(sql: String): Promise<GreptimeDBResponse> {
  const URL = 'http://greptime.mofengfeng.com';
  const SQL_URL = `${URL}/v1/sql`;

  const response: GreptimeDBResponse = await getBackendSrv().post(`${SQL_URL}?sql=${sql}`);
  return response;
}

export async function doRequestAndParse(sql: String): Promise<MutableDataFrame> {
  const response: GreptimeDBResponse = await doRequst(sql);

  return parseResponseToDataFrame(response);
}
