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

  /**
   * Date representing the elapsed time since UNIX epoch (1970-01-01) in days (32 bits).
   */
  Date = 'Date',
  /**
   * Datetime representing the elapsed time since UNIX epoch (1970-01-01) in
   * seconds/milliseconds/microseconds/nanoseconds, determined by precision.
   */
  DateTime = 'DateTime',

  TimestampSecond = 'TimestampSecond',
  TimestampMillisecond = 'TimestampMillisecond',
  TimestampMicrosecond = 'TimestampMicrosecond',
  TimestampNanosecond = 'TimestampNanosecond',

  List = 'List',
}

/**
 * T is usually a tuple
 */
export interface GreptimeResponse<T extends any[] = any[]> {
  code: number;
  execution_time_ms: number;
  //this is a single-element array
  output: [
    {
      records: {
        schema: {
          column_schemas: GreptimeColumnSchema[];
        };
        rows: T[];
      };
    }
  ];
}

export interface GreptimeColumnSchema {
  name: string;
  data_type: GreptimeDataTypes;
  nullable: boolean;
  default: string;    //TODO maybe this is not a string
  semantic_type: string;
}
