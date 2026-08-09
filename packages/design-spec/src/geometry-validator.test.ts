import { describe, expect, it } from "vitest";
import { createGeometryReport, validateGeometry } from "./geometry-validator";

describe("geometry validator", () => {
  it("detects overflow, overlap, and fixed safe-area collisions", () => {
    expect(validateGeometry([
      { nodeId: "a", x: 0, y: 0, width: 200, height: 100 },
      { nodeId: "b", x: 150, y: 50, width: 250, height: 100 },
      { nodeId: "nav", x: 0, y: 790, width: 390, height: 70, fixed: true },
    ], { width: 390, height: 844, safeBottom: 34 })).toEqual(expect.arrayContaining(["HORIZONTAL_OVERFLOW", "VERTICAL_OVERFLOW", "COMPONENT_OVERLAP", "SAFE_AREA_COLLISION"]));
  });

  it("retains node-level geometry evidence for targeted repair", () => {
    const report = createGeometryReport([
      { nodeId: "title", x: -2, y: 10, width: 100, height: 30 },
      { nodeId: "button", x: 10, y: 20, width: 100, height: 30 },
    ], { width: 390, height: 844 });
    expect(report.nodeIssues.title).toEqual(expect.arrayContaining(["HORIZONTAL_OVERFLOW", "COMPONENT_OVERLAP"]));
    expect(report.nodeIssues.button).toContain("COMPONENT_OVERLAP");
    expect(report.overlapPairs).toEqual([["title", "button"]]);
    expect(validateGeometry([{ nodeId: "bad", x: Number.NaN, y: 0, width: 10, height: 10 }], { width: 390, height: 844 })).toContain("INVALID_DIMENSION");
  });
});
