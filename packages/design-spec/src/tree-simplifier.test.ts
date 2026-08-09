import { describe, expect, it } from "vitest";
import { lintTreeStructure, simplifyTree } from "./tree-simplifier";

describe("tree simplifier", () => {
  it("collapses duplicate structural wrappers", () => {
    const result = simplifyTree({ type: "Stack", children: [{ type: "Stack", children: [{ type: "Text" }] }] });
    expect(result.type).toBe("Text");
  });

  it("collapses a single-child wrapper even when the child type differs", () => {
    const result = simplifyTree({ type: "Stack", children: [{ type: "Text" }] });
    expect(result.type).toBe("Text");
  });

  it("reports single-child wrappers before simplification", () => {
    expect(lintTreeStructure([{ type: "Group", children: [{ type: "Text" }] }])).toContain("SINGLE_CHILD_WRAPPER");
  });

  it("flags excessive wrapper depth and deep trees", () => {
    const root = { type: "Stack", children: [{ type: "Stack", children: [{ type: "Stack", children: [{ type: "Stack", children: [{ type: "Stack", children: [{ type: "Stack", children: [{ type: "Stack", children: [{ type: "Stack", children: [{ type: "Text" }] }] }] }] }] }] }] }] };
    expect(lintTreeStructure([root])).toEqual(expect.arrayContaining(["MAX_TREE_DEPTH", "EXCESSIVE_WRAPPER_DEPTH"]));
  });
});
