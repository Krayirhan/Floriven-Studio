import { describe, expect, it } from "vitest";
import { createEmptyRuntimeBaselineManifest, validateRuntimeBaselineManifest } from "./runtime-baseline";

describe("runtime baseline contract", () => {
  it("freezes canonical renderer and viewport metadata", () => {
    const manifest = createEmptyRuntimeBaselineManifest("2026-08-10T00:00:00.000Z");
    expect(manifest.viewport).toEqual({ width: 390, height: 844, safeTop: 24, safeBottom: 24 });
    expect(validateRuntimeBaselineManifest(manifest)).toEqual([]);
  });

  it("rejects duplicate or incomplete evidence entries", () => {
    const manifest = createEmptyRuntimeBaselineManifest("2026-08-10T00:00:00.000Z");
    manifest.entries = [
      { mode: "obsidian", archetype: "dashboard", screenId: "home", screenshotPath: "home.png", treeSignature: "tree", boundsPath: "home.json", candidateHash: "hash", rendererVersion: "phone-screen-v4", viewport: manifest.viewport },
      { mode: "obsidian", archetype: "dashboard", screenId: "home-2", screenshotPath: "", treeSignature: "", boundsPath: "", candidateHash: "", rendererVersion: "phone-screen-v4", viewport: manifest.viewport },
    ];
    expect(validateRuntimeBaselineManifest(manifest)).toEqual(expect.arrayContaining(["DUPLICATE_ENTRY:obsidian:dashboard", "INCOMPLETE_ENTRY:obsidian:dashboard"]));
  });
});
