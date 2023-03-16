import { TimeRange } from "@grafana/data";

export const TIME_FILTER_MACRO = "$__timeFilter";

function generateTimeFilter(range: TimeRange, timeColumn: string): string {
  const { from, to } = range;
  // timestamp is in milliseconds in GreptimeDB
  return `${timeColumn} >= ${from.unix() * 1000} AND ${timeColumn} <= ${to.unix() * 1000}`;
}

export function replaceTimeFilterMacro(queryText: string, range: TimeRange, timeColumn: string): string {
  return queryText.replace(TIME_FILTER_MACRO, generateTimeFilter(range, timeColumn));
}
