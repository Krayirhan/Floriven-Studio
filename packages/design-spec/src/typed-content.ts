export type CurrencyValue = { type: "CurrencyValue"; value: number; currency: string };
export type DateValue = { type: "DateValue"; value: string };
export type PercentageValue = { type: "PercentageValue"; value: number };
export type FormFieldSpec = { type: "FormField"; label: string; fieldType: "text" | "date" | "number" | "currency"; required?: boolean };
export type ChartSpec = { type: "Chart"; chartType: "line" | "bar" | "area"; xDimension: string; yMeasure: string; unit: string; insight: string };

export function formatTypedValue(value: CurrencyValue | DateValue | PercentageValue, locale: string): string {
  if (value.type === "CurrencyValue") return new Intl.NumberFormat(locale, { style: "currency", currency: value.currency }).format(value.value);
  if (value.type === "DateValue") return new Intl.DateTimeFormat(locale, { dateStyle: "medium", timeZone: "UTC" }).format(new Date(`${value.value}T00:00:00Z`));
  return new Intl.NumberFormat(locale, { style: "percent", maximumFractionDigits: 1 }).format(value.value);
}

export function validateChartSpec(chart: ChartSpec): string[] {
  const issues: string[] = [];
  if (!chart.xDimension) issues.push("CHART_DIMENSION_REQUIRED");
  if (!chart.yMeasure) issues.push("CHART_MEASURE_REQUIRED");
  if (!chart.unit) issues.push("CHART_UNIT_REQUIRED");
  if (!chart.insight) issues.push("CHART_INSIGHT_REQUIRED");
  return issues;
}
