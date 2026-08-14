import { describe, expect, it } from "vitest";
import { DESIGN_TEMPLATE_IDS, DESIGN_TEMPLATES, findDesignTemplate } from "./strategy";

describe("design template catalog", () => {
  it("contains exactly five unique, versioned production strategies", () => {
    expect(DESIGN_TEMPLATES).toHaveLength(5);
    expect(new Set(DESIGN_TEMPLATES.map((template) => template.id)).size).toBe(5);
    expect(DESIGN_TEMPLATES.map((template) => template.id)).toEqual(DESIGN_TEMPLATE_IDS);
    expect(DESIGN_TEMPLATES.every((template) => template.version === "2.0.0")).toBe(true);
    expect(DESIGN_TEMPLATES.every((template) => template.system.compositionPatterns.length === 4)).toBe(true);
    expect(DESIGN_TEMPLATES.every((template) => template.system.avoid.length >= 3)).toBe(true);
  });

  it("resolves allowlisted templates and rejects unknown ids", () => {
    expect(findDesignTemplate("serene-health")?.strategy.palette).toBe("serene");
    expect(findDesignTemplate("mock-template")).toBeUndefined();
  });

  it("keeps style metadata free from product-domain instructions", () => {
    const forbiddenDomainLanguage = /sağlık|ilaç|tedavi|bakım|hasta|alışveriş|sepet|ürün|sipariş|ders|öğren|eğitim|yayın|makale|haber|kültür/i;

    for (const preset of DESIGN_TEMPLATES) {
      const visualContract = [
        preset.name,
        preset.category,
        preset.description,
        preset.strategy.visualDirection,
        preset.system.typography,
        preset.system.colorIntent,
        preset.system.layoutRhythm,
        ...preset.system.signatureComponents,
        ...preset.system.avoid,
        ...preset.system.compositionPatterns,
      ].join(" ");

      expect(visualContract, `${preset.id} contains product-domain language`).not.toMatch(forbiddenDomainLanguage);
    }
  });
});
