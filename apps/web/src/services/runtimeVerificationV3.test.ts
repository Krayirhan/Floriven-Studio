import { describe, expect, it } from "vitest";
import type { RuntimeVisualIdentityMetrics } from "@floriven/design-spec";
import { toV3RuntimeCaptureMetrics } from "./runtimeVerificationV3";

describe("toV3RuntimeCaptureMetrics", () => {
  it("converts packages/design-spec's 0-1 fractions into the backend evaluator's 0-100 percentages", () => {
    const identity: RuntimeVisualIdentityMetrics = {
      visibleNodeCount: 18,
      sectionCount: 2,
      sectionAreaCoverage: 0.6,
      verticalOccupancy: 0.7,
      nodeDensityPer100k: 6,
      sectionHeightVariation: 0.2,
      sectionRoleSequence: ["birincil etkileşim alanı", "destekleyici bilgi alanı"],
      identityVector: [2, 0.6, 0.7, 6, 0.2],
    };
    const metrics = toV3RuntimeCaptureMetrics("weekly-schedule", identity);
    expect(metrics).toEqual({
      screenJobId: "weekly-schedule",
      viewport: { width: 390, height: 844 },
      visibleNodeCount: 18,
      sectionCount: 2,
      sectionAreaCoveragePct: 60,
      verticalOccupancyPct: 70,
      nodeDensityPer100kPx: 6,
      sectionHeightVariancePct: 20,
    });
  });

  it("passes nodeDensityPer100k through unscaled — it is already the same unit the backend expects, not a fraction", () => {
    const identity: RuntimeVisualIdentityMetrics = {
      visibleNodeCount: 5, sectionCount: 1, sectionAreaCoverage: 0.1, verticalOccupancy: 0.2,
      nodeDensityPer100k: 3.5, sectionHeightVariation: 0, sectionRoleSequence: [], identityVector: [],
    };
    expect(toV3RuntimeCaptureMetrics("job", identity).nodeDensityPer100kPx).toBe(3.5);
  });

  /**
   * Cross-checks this repo's two independent threshold expressions against each other:
   * packages/design-spec's canonical RUNTIME_VISUAL_HIERARCHY_PROFILES.default (used by V2's
   * runtime gate, imported here) and supabase/functions/generation-v3/render-critics.ts's
   * evaluateRenderCritics (a Deno-side module that can't import this npm package, so its
   * thresholds are independently written — read from the same DESIGN_SPEC.md prose). If someone
   * edits one without the other, this test is where that drift would first become visible.
   */
  it("keeps the converted metric shape numerically aligned with the canonical default profile's thresholds", () => {
    // A realistic passing capture: two sections, comfortably inside every canonical bound.
    const identity: RuntimeVisualIdentityMetrics = {
      visibleNodeCount: 12, sectionCount: 2, sectionAreaCoverage: 0.6, verticalOccupancy: 0.7,
      nodeDensityPer100k: 6, sectionHeightVariation: 0.2, sectionRoleSequence: ["a", "b"], identityVector: [],
    };
    const metrics = toV3RuntimeCaptureMetrics("job", identity);
    // supabase/functions/generation-v3/render-critics.ts's default-profile-equivalent bounds:
    expect(metrics.sectionCount).toBeGreaterThanOrEqual(2);
    expect(metrics.sectionAreaCoveragePct).toBeGreaterThanOrEqual(25);
    expect(metrics.sectionAreaCoveragePct).toBeLessThanOrEqual(95);
    expect(metrics.verticalOccupancyPct).toBeGreaterThanOrEqual(45);
    expect(metrics.nodeDensityPer100kPx).toBeGreaterThanOrEqual(1);
    expect(metrics.nodeDensityPer100kPx).toBeLessThanOrEqual(15);
    expect(metrics.sectionHeightVariancePct).toBeGreaterThanOrEqual(5);
  });
});
