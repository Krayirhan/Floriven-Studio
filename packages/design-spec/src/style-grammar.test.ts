import { describe, expect, it } from "vitest";
import { DESIGN_TEMPLATE_IDS } from "./strategy";
import { resolveStyleGrammar, STYLE_GRAMMARS } from "./style-grammar";

describe("preset style grammar", () => {
  it("defines one visual grammar for every production preset", () => {
    expect(Object.keys(STYLE_GRAMMARS)).toEqual([...DESIGN_TEMPLATE_IDS]);
    for (const id of DESIGN_TEMPLATE_IDS) expect(resolveStyleGrammar(id).presetId).toBe(id);
  });

  it("keeps grammar visual-only", () => {
    for (const grammar of Object.values(STYLE_GRAMMARS)) {
      expect(JSON.stringify(grammar)).not.toMatch(/screen|route|form|settings|fab|hero|action/i);
    }
  });

  it("enforces restrained accent budgets for calm and editorial systems", () => {
    expect(resolveStyleGrammar("serene-health").accentBudget).toBe("restrained");
    expect(resolveStyleGrammar("editorial-culture").accentBudget).toBe("restrained");
  });
});
