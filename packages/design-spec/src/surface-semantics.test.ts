import { describe, expect, it } from "vitest";
import { validateSurfaceSemantics } from "./surface-semantics";

describe("surface semantics", () => {
  it("rejects a Card nested inside another Card", () => {
    expect(validateSurfaceSemantics([{ type: "Screen", children: [{ type: "Card", children: [{ type: "Card", children: [{ type: "Text" }, { type: "Text" }] }, { type: "Text" }] }] }]))
      .toContainEqual({ code: "NESTED_CARD", nodeType: "Card" });
  });

  it("rejects a Card used as a single-child wrapper", () => {
    expect(validateSurfaceSemantics([{ type: "Card", children: [{ type: "Text" }] }]))
      .toEqual([{ code: "CARD_TOO_SPARSE", nodeType: "Card" }]);
  });

  it("rejects cards used as section grouping and excessive elevation", () => {
    const root = { type: "Screen", children: [{ type: "Card", children: [{ type: "Section", children: [{ type: "Text" }, { type: "Text" }] }, { type: "Text" }] }] };
    const issues = validateSurfaceSemantics([root]);
    expect(issues).toContainEqual({ code: "CARD_USED_AS_SECTION", nodeType: "Card" });
  });

  it("rejects excessive cardization deterministically", () => {
    const root = { type: "Screen", children: [
      { type: "Card", children: [{ type: "Text" }, { type: "Text" }] },
      { type: "Card", children: [{ type: "Text" }, { type: "Text" }] },
      { type: "Text" },
    ] };
    expect(validateSurfaceSemantics([root], { maxCardRatio: 0.2 })).toContainEqual({ code: "EXCESSIVE_CARDIZATION", nodeType: "Screen" });
  });

  it("rejects redundant nested surfaces", () => {
    const root = { type: "Screen", children: [{ type: "Surface", children: [{ type: "Surface", children: [{ type: "Text" }, { type: "Text" }] }, { type: "Text" }] }] };
    expect(validateSurfaceSemantics([root])).toEqual(expect.arrayContaining([
      { code: "REDUNDANT_SURFACE", nodeType: "Surface" },
      { code: "EXCESSIVE_SURFACE_DEPTH", nodeType: "Surface" },
    ]));
  });
});
