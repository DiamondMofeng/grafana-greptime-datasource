import { FieldType, MutableDataFrame } from '@grafana/data';
import { GreptimeColumnSchemaBrife, GreptimeDataTypes, GreptimeResponseSuccess } from './types';

const greptimeTypeToGrafana: Record<GreptimeDataTypes, FieldType> = {
  [GreptimeDataTypes.Null]: FieldType.other,

  // Numeric types:
  [GreptimeDataTypes.Boolean]: FieldType.boolean,
  [GreptimeDataTypes.UInt8]: FieldType.number,
  [GreptimeDataTypes.UInt16]: FieldType.number,
  [GreptimeDataTypes.UInt32]: FieldType.number,
  [GreptimeDataTypes.UInt64]: FieldType.number,
  [GreptimeDataTypes.Int8]: FieldType.number,
  [GreptimeDataTypes.Int16]: FieldType.number,
  [GreptimeDataTypes.Int32]: FieldType.number,
  [GreptimeDataTypes.Int64]: FieldType.number,
  [GreptimeDataTypes.Float32]: FieldType.number,
  [GreptimeDataTypes.Float64]: FieldType.number,

  // String types:
  [GreptimeDataTypes.String]: FieldType.string,
  [GreptimeDataTypes.Binary]: FieldType.string,

  // Date & Time types:
  [GreptimeDataTypes.Date]: FieldType.time,
  [GreptimeDataTypes.DateTime]: FieldType.time,

  [GreptimeDataTypes.TimestampSecond]: FieldType.time,
  [GreptimeDataTypes.TimestampMillisecond]: FieldType.time,
  [GreptimeDataTypes.TimestampMicrosecond]: FieldType.time,
  [GreptimeDataTypes.TimestampNanosecond]: FieldType.time,

  [GreptimeDataTypes.List]: FieldType.other,
};

export function mapGreptimeTypeToGrafana(greptimeType: GreptimeDataTypes): FieldType {
  return greptimeTypeToGrafana[greptimeType];
}

export function extractDataRows<T extends any[] = any[]>(response: GreptimeResponseSuccess<T>): T[] {
  return response.output[0].records.rows;
}

export function extractBrifeColumnSchemas(response: GreptimeResponseSuccess): GreptimeColumnSchemaBrife[] {
  return response.output[0].records.schema.column_schemas;
}

export function parseResponseToDataFrame(response: GreptimeResponseSuccess): MutableDataFrame {
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
