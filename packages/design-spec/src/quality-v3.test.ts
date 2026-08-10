import { describe, expect, it } from "vitest";
import { evaluateQualityV3 } from "./quality-v3";

describe("Quality V3", () => {
  it("separates geometry and presentation gates", () => {
    const report = evaluateQualityV3({ bounds: [{ nodeId: "button", x: 0, y: 0, width: 40, height: 44 }], interactiveBounds: [{ nodeId: "button", x: 0, y: 0, width: 40, height: 44 }], requiredFontFamilies: ["Inter"], loadedFontFamilies: [] });
    expect(report.geometry.failures).toEqual(expect.arrayContaining(["TOUCH_TARGET_GATE"]));
    expect(report.presentation.failures).toContain("FONT_MISSING:Inter");
    expect(report.finalEligible).toBe(false);
  });

  it("does not make static quality final without visual evidence", () => {
    const report = evaluateQualityV3({ bounds: [{ nodeId: "root", x: 0, y: 0, width: 390, height: 844 }], requiredFontFamilies: [], loadedFontFamilies: [] });
    expect(report.visual.failures).toContain("VISUAL_EVIDENCE_PENDING");
    expect(report.finalEligible).toBe(false);
  });
});
