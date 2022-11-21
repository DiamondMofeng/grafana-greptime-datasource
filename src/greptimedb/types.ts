export enum GreptimeDataTypes {
  Null = 'Null',

  // Numeric types:
  Boolean = 'Boolean',
  UInt8 = 'UInt8',
  UInt16 = 'UInt16',
  UInt32 = 'UInt32',
  UInt64 = 'UInt64',
  Int8 = 'Int8',
  Int16 = 'Int16',
  Int32 = 'Int32',
  Int64 = 'Int64',
  Float32 = 'Float32',
  Float64 = 'Float64',

  // String types:
  String = 'String',
  Binary = 'Binary',

  // Date & Time types:
  Date = 'Date',
  DateTime = 'DateTime',
  Timestamp = 'Timestamp',

  List = 'List',
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
