import { describe, expect, it } from "vitest";
import { createTargetedRepair, repairBudget, runTargetedRepair } from "./repair-loop";
import type { DesignSpec } from "./types";

const spec: DesignSpec = { schemaVersion: "1.0.0", projectId: "p", platform: "ios", locale: "tr-TR", deviceProfile: "phone", tokens: {}, assets: [], components: {}, flows: [], metadata: {}, screens: [{ id: "home", name: "Home", root: { id: "root", type: "Screen", props: {}, children: [{ id: "title", type: "Text", props: { variant: "title" } }] } }] };

describe("targeted repair loop", () => {
  it("creates a node-level patch instead of full regeneration", () => {
    expect(createTargetedRepair({ code: "OVERSIZED_HEADING", nodeId: "title" }, 3)).toEqual({ baseRevision: 3, operations: [{ op: "replaceProps", nodeId: "title", value: { maxLines: 1, variant: "heading" } }] });
  });

  it("validates and applies only valid targeted patches", () => {
    const result = runTargetedRepair(spec, { code: "OVERSIZED_HEADING", nodeId: "title" }, 1, (patch) => ({ ...spec, metadata: { patchCount: patch.operations.length } }));
    expect(result.applied).toBe(true);
    expect(runTargetedRepair(spec, { code: "OVERSIZED_HEADING", nodeId: "missing" }, 1, () => spec).applied).toBe(false);
  });

  it("caps repair cycles to the documented budget", () => {
    expect(repairBudget(99)).toBe(3);
    expect(repairBudget(-1)).toBe(0);
  });
});
