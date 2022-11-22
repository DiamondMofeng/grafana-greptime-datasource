import { FieldType, MutableDataFrame } from '@grafana/data';
import { GreptimeColumnSchema, GreptimeDataTypes, GreptimeDBResponse } from './types';

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
  [GreptimeDataTypes.Timestamp]: FieldType.time,

  [GreptimeDataTypes.List]: FieldType.other,
};

export function mapGreptimeTypeToGrafana(greptimeType: GreptimeDataTypes): FieldType {
  return greptimeTypeToGrafana[greptimeType];
}

export function extractColumnSchemas(response: GreptimeDBResponse): GreptimeColumnSchema[] {
  return response.output[0].records.schema.column_schemas;
}

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
