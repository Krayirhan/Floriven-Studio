import type { ChartType, PresetChartRules } from "./strategy";

export interface AxisSpec { label: string; unit?: string; domain?: string; }
export interface ChartAnnotation { label: string; value: number; kind: "target" | "event" | "threshold"; }
export interface ChartComparison { label: string; delta: number; direction: "up" | "down" | "flat"; }
export interface ChartSeries { id: string; label: string; values: number[]; }
export interface ChartV2Spec { type: ChartType; series: ChartSeries[]; xAxis?: AxisSpec; yAxis?: AxisSpec; target?: number; targetRange?: [number, number]; annotations?: ChartAnnotation[]; comparison?: ChartComparison; unit?: string; timeWindow?: string; reducedMotion?: boolean; highContrast?: boolean; }
export interface ResolvedChart { type: ChartType; rendererFamily: "line" | "area" | "bars" | "donut" | "radial" | "sparkline" | "heatmap" | "segmented"; className: string; geometry: "cartesian" | "circular" | "matrix" | "segmented"; accessibleLabel: string; fallback: boolean; fallbackReason?: string; }

export function resolveChartFamily(chart: ChartV2Spec, rules: PresetChartRules): ResolvedChart {
  const allowed = rules.types;
  const fallback = !allowed.includes(chart.type);
  const type = fallback ? allowed[0] ?? "line" : chart.type;
  const rendererFamily = type === "bar" ? "bars" : type;
  return { type, rendererFamily, className: `floriven-chart-${type}`, geometry: ["donut", "radial"].includes(type) ? "circular" : type === "heatmap" ? "matrix" : type === "segmented" ? "segmented" : "cartesian", accessibleLabel: chartLabel(chart, type), fallback, ...(fallback ? { fallbackReason: "CHART_TYPE_NOT_ALLOWED_BY_PRESET" } : {}) };
}

export function validateChartEngineSpec(chart: ChartV2Spec): string[] {
  const issues: string[] = [];
  if (!chart.series.length) issues.push("SERIES_REQUIRED");
  if (chart.series.some((series) => !series.id || !series.label || !series.values.length)) issues.push("INVALID_SERIES");
  if (chart.series.some((series) => series.values.some((value) => !Number.isFinite(value)))) issues.push("NON_FINITE_VALUE");
  if (chart.targetRange && chart.targetRange[0] > chart.targetRange[1]) issues.push("INVALID_TARGET_RANGE");
  if (chart.type === "donut" || chart.type === "radial") {
    if (chart.series.length !== 1) issues.push("CIRCULAR_CHART_REQUIRES_ONE_SERIES");
    if (chart.series[0]?.values.some((value) => value < 0)) issues.push("CIRCULAR_CHART_REQUIRES_NON_NEGATIVE_VALUES");
  }
  return issues;
}

function chartLabel(chart: ChartV2Spec, type: ChartType): string { return [chart.series.map((series) => series.label).join(", "), chart.timeWindow, chart.unit, `${type} chart`].filter(Boolean).join(" · "); }
