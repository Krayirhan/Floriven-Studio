import { describe, expect, it } from "vitest";
import { isTrustedRuntimeEvidence } from "./runtime-evidence";

describe("trusted runtime evidence", () => {
  it("requires screenshot, bounds, and geometry output", () => {
    expect(isTrustedRuntimeEvidence({ renderVersion: "phone-screen-v2", screenshotPath: "home.png", viewport: { width: 390, height: 844 }, nodes: [{ nodeId: "root", x: 0, y: 0, width: 390, height: 700 }], geometry: { issues: [], overlapPairs: [] }, visualCritic: "pending" })).toBe(true);
    expect(isTrustedRuntimeEvidence({ nodes: [] })).toBe(false);
  });
});
