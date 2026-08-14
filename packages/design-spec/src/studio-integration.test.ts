import { describe, expect, it } from "vitest";
import { createStudioFeatureFlags, evaluateRenderPerformance, inspectResolvedSystem, resolveLegacyTemplateId, rollbackStudioFlags } from "./studio-integration";

describe("Studio migration and performance", () => {
  it("reads legacy templateId without mutating the document", () => {
    expect(resolveLegacyTemplateId({ templateId: "serene-health" }, "obsidian-precision")).toEqual({ templateId: "serene-health", source: "legacy-template", migrated: true });
  });
  it("supports resolved inspection and reversible flags", () => {
    const presentation = { version: "2.0.0", identity: { mode: "template", sourcePresetId: "obsidian-precision" }, palette: { name: "obsidian" }, typography: { family: "Inter" }, spacing: { density: "compact" }, cards: { types: ["metric"] }, charts: { types: ["line"] }, composition: { patterns: {} }, navigation: { active: "minimal" } } as never;
    expect(inspectResolvedSystem(presentation)).toMatchObject({ version: "2.0.0", preset: "obsidian-precision" });
    expect(createStudioFeatureFlags().v2Renderer).toBe(true);
    expect(rollbackStudioFlags().v2Renderer).toBe(false);
  });
  it("enforces the six-screen render budget", () => {
    expect(evaluateRenderPerformance([10, 12, 9, 11, 10, 8], { screenCount: 6, maxRenderMs: 16, maxTotalMs: 80 }).passed).toBe(true);
    expect(evaluateRenderPerformance([10], { screenCount: 6, maxRenderMs: 16, maxTotalMs: 80 }).failures).toContain("SCREEN_COUNT_MISMATCH");
  });
});
