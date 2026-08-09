import { describe, expect, it } from "vitest";
import type { DesignSpec, DesignSpecPatch } from "./types";

describe("DesignSpec contract", () => {
  it("represents a valid empty project document", () => {
    const document: DesignSpec = {
      schemaVersion: "1.0.0",
      projectId: "project-1",
      platform: "ios",
      locale: "tr-TR",
      deviceProfile: "iphone-15",
      tokens: {},
      assets: [],
      components: {},
      screens: [],
      flows: [],
      metadata: {},
    };

    expect(document.schemaVersion).toBe("1.0.0");
    expect(document.screens).toHaveLength(0);
  });

  it("supports identity-based patch revisions", () => {
    const patch: DesignSpecPatch = {
      baseRevision: 4,
      operations: [{ op: "replaceProps", nodeId: "node-1", value: { label: "Güncel" } }],
    };

    expect(patch.operations[0]?.nodeId).toBe("node-1");
  });
});
