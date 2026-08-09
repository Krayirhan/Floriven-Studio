import { describe, expect, it } from "vitest";
import { formatTypedValue, validateChartSpec } from "./typed-content";

describe("typed content", () => {
  it("formats locale-aware values outside model output", () => {
    expect(formatTypedValue({ type: "CurrencyValue", value: 4130, currency: "TRY" }, "tr-TR")).toContain("₺");
    expect(formatTypedValue({ type: "PercentageValue", value: 0.18 }, "tr-TR")).toContain("18");
  });

  it("requires every analytics chart to declare its semantic chain", () => {
    expect(validateChartSpec({ type: "Chart", chartType: "line", xDimension: "month", yMeasure: "income", unit: "TRY", insight: "Gelir arttı." })).toEqual([]);
    expect(validateChartSpec({ type: "Chart", chartType: "line", xDimension: "", yMeasure: "", unit: "", insight: "" })).toHaveLength(4);
  });
});
