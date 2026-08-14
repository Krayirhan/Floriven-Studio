import { describe, expect, it } from "vitest";
import { deriveVisualConcept } from "./visual-concept";
import { resolveAutoPresentation } from "./style-resolver";

describe("auto style engine", () => {
  it("uses the safe neutral fallback for unknown briefs", () => {
    const concept = deriveVisualConcept("Genel amaçlı bir uygulama tasarla.");
    expect(concept.density).toBe("balanced");
    expect(concept.accentStrategy).toBe("restrained");
    expect(resolveAutoPresentation(concept).version).toBe("1.0.0");
  });

  it("derives visual direction from domain language only", () => {
    const concept = deriveVisualConcept("Freelancer finans ve fatura takibi");
    const presentation = resolveAutoPresentation(concept);
    expect(concept.density).toBe("compact");
    expect(concept.typographyCharacter).toBe("technical");
    expect(presentation.palette).toBe("obsidian");
  });

  it("does not expose UX structure or preset identity", () => {
    const concept = deriveVisualConcept("Ayarlar, form ve analitik ekranları olan uygulama");
    const presentation = resolveAutoPresentation(concept);
    expect(JSON.stringify(concept)).not.toMatch(/screen|card|fab|navigation/i);
    expect(JSON.stringify(presentation)).not.toMatch(/preset|screen|route|primaryAction/i);
  });
});
