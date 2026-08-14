import { describe, expect, it } from "vitest";
import { createRuntimeBaselineEntry, validateRuntimeBaselineManifest, createEmptyRuntimeBaselineManifest } from "./runtime-baseline";

describe("runtime baseline entry", () => {
  it("creates a canonical, hash-backed entry from runtime capture", () => {
    const entry = createRuntimeBaselineEntry({ mode: "deterministic", archetype: "dashboard", screenId: "overview", screenshotPath: "baselines/overview.png", boundsPath: "baselines/overview.json", treeSignature: "overview:main", bounds: [{ nodeId: "overview", x: 0, y: 0, width: 390, height: 844 }] });
    const manifest = createEmptyRuntimeBaselineManifest("2026-08-10T00:00:00.000Z");
    manifest.entries.push(entry);
    expect(entry.candidateHash).toMatch(/^[a-f0-9]{8}$/);
    expect(validateRuntimeBaselineManifest(manifest)).toEqual([]);
  });
});
