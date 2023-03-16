import type { SelectableValue } from "@grafana/data";

export function toSelectableValue<T>(value: T): SelectableValue<T> {
  return {
    label: String(value),
    value,
  };
}
