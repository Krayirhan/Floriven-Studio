import { describe, expect, it } from "vitest";
import { validatePatch } from "./patch-validator";
import type { DesignSpec } from "./types";

const spec: DesignSpec = { schemaVersion: "1.0.0", projectId: "p", platform: "ios", locale: "tr-TR", deviceProfile: "phone", tokens: {}, assets: [], components: {}, flows: [], metadata: {}, screens: [{ id: "home", name: "Home", root: { id: "root", type: "Screen", props: {}, children: [{ id: "title", type: "Text", props: {} }] } }] };
describe("patch validator", () => {
  it("preserves identity by rejecting unknown and colliding targets", () => {
    expect(validatePatch(spec, { baseRevision: 1, operations: [{ op: "replaceProps", nodeId: "missing" }, { op: "addNode", value: { id: "title" } }] })).toEqual(expect.arrayContaining(["PATCH_TARGET_NOT_FOUND", "PATCH_NODE_ID_COLLISION"]));
  });
  it("accepts a local repair for an existing node", () => expect(validatePatch(spec, { baseRevision: 1, operations: [{ op: "replaceProps", nodeId: "title", value: { text: "Yeni" } }] })).toEqual([]));
});
