import type { DesignTemplate } from "./strategy";
import type { PresentationSpec } from "./presentation-spec";
import { AUTO_SAFE_NEUTRAL, type VisualConcept } from "./visual-concept";

export function resolveAutoPresentation(concept: VisualConcept = AUTO_SAFE_NEUTRAL): PresentationSpec {
  return {
    version: "1.0.0",
    palette: concept.contrast === "strong" ? "obsidian" : concept.typographyCharacter === "editorial" ? "editorial" : concept.typographyCharacter === "human" ? "serene" : "serene",
    cardStyle: concept.surfacePhilosophy === "flat" ? "minimal" : concept.surfacePhilosophy === "layered" ? "layered" : concept.radiusCharacter === "soft" ? "soft" : "crisp",
    density: concept.density === "compact" ? "compact" : concept.density === "spacious" ? "spacious" : "comfortable",
    navigationStyle: concept.radiusCharacter === "soft" ? "floating" : concept.surfacePhilosophy === "flat" ? "minimal" : "solid",
    visualDirection: concept.personality.join(", "),
  };
}

export function resolveTemplatePresentation(template: DesignTemplate): PresentationSpec {
  return { version: "1.0.0", ...template.strategy };
}

