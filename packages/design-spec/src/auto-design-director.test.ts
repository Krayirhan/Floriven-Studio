import { describe, expect, it } from "vitest";
import { directAutoDesign, resolveAutoPreset, validateAutoDecision } from "./auto-design-director";
import type { ProductBlueprint } from "./product-blueprint";

const blueprint = (domain: string, vocabulary: string[]): ProductBlueprint => ({ productDomain: domain, audience: "ekip", entities: vocabulary, capabilities: vocabulary, contentVocabulary: vocabulary, screens: [], navigation: { primaryScreenIds: [], utilityScreenIds: [] }, screenPolicy: { minCount: 1, maxCount: 6, rationale: "fixture" } });

describe("Auto Design Director", () => {
  it("selects a coherent grammar from domain/context signals", () => {
    const result = directAutoDesign(blueprint("finans operasyon", ["rapor", "fatura"]));
    expect(result.presetId).toBe("obsidian-precision");
    expect(result.score).toBeGreaterThanOrEqual(90);
    expect(result.fallback).toBe(false);
  });

  it("rejects Frankenstein combinations", () => {
    const issues = validateAutoDecision({ mood: "editorial", informationDensity: "spacious", hierarchyStyle: "type-led", surfaceLanguage: "neon", chartLanguage: "editorial", typographyLanguage: "serif", interactionLanguage: "reduced", compositionLanguage: ["editorial-asymmetry"] });
    expect(issues).toContain("FRANKENSTEIN_EDITORIAL_NEON");
  });

  it("is deterministic and does not rewrite product vocabulary", () => {
    const input = blueprint("yayın", ["kitap", "yazar"]);
    expect(directAutoDesign(input)).toEqual(directAutoDesign(input));
    expect(resolveAutoPreset(input).template?.id).toBe("editorial-culture");
    expect(input.contentVocabulary).toEqual(["kitap", "yazar"]);
  });
});
