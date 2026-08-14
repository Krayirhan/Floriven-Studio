import { describe, expect, it } from "vitest";
import { findDesignTemplate } from "./strategy";
import { resolveChartFamily, validateChartEngineSpec, type ChartV2Spec } from "./chart-engine";

const line: ChartV2Spec = { type: "line", series: [{ id: "revenue", label: "Gelir", values: [10, 14, 12] }], unit: "₺", timeWindow: "Son 3 ay", annotations: [{ label: "Hedef", value: 15, kind: "target" }] };

describe("Chart Engine V2", () => {
  it("maps radial to a circular renderer, not a polyline", () => {
    const chart: ChartSpec = { ...line, type: "radial" };
    const resolved = resolveChartFamily(chart, findDesignTemplate("serene-health")!.system.chartRules!);
    expect(resolved.geometry).toBe("circular");
    expect(resolved.rendererFamily).toBe("radial");
  });

  it("enforces preset chart allowlists with explicit fallback", () => {
    const resolved = resolveChartFamily({ ...line, type: "donut" }, findDesignTemplate("obsidian-precision")!.system.chartRules!);
    expect(resolved.fallback).toBe(true);
    expect(resolved.fallbackReason).toBe("CHART_TYPE_NOT_ALLOWED_BY_PRESET");
  });

  it("validates edge cases and preserves information metadata", () => {
    expect(validateChartEngineSpec(line)).toEqual([]);
    expect(resolveChartFamily(line, findDesignTemplate("obsidian-precision")!.system.chartRules!).accessibleLabel).toContain("Son 3 ay");
    expect(validateChartEngineSpec({ ...line, type: "donut", series: [{ id: "a", label: "A", values: [-1] }] })).toContain("CIRCULAR_CHART_REQUIRES_NON_NEGATIVE_VALUES");
  });
});
