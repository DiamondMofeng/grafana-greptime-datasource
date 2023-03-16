import { TimeRange } from "@grafana/data";

export const TIME_FILTER_MACRO = "$__timeFilter";

function generateTimeFilter(range: TimeRange): string {
  const { from, to } = range;
  return `WHERE time >= ${from.toISOString()} AND time < ${to.toISOString()}`;
}

export function replaceTimeFilterMacro(query: string, range: TimeRange): string {
  return query.replace(TIME_FILTER_MACRO, generateTimeFilter(range));
}
