export type VisualConcept = {
  personality: readonly string[];
  surfacePhilosophy: "flat" | "mostly-flat" | "layered" | "elevated";
  density: "compact" | "balanced" | "spacious";
  typographyCharacter: "neutral" | "technical" | "editorial" | "human" | "playful";
  accentStrategy: "restrained" | "functional" | "expressive";
  contrast: "soft" | "balanced" | "strong";
  radiusCharacter: "sharp" | "restrained" | "soft" | "expressive";
};

export const AUTO_SAFE_NEUTRAL: VisualConcept = {
  personality: ["clear", "calm", "functional"],
  surfacePhilosophy: "mostly-flat",
  density: "balanced",
  typographyCharacter: "neutral",
  accentStrategy: "restrained",
  contrast: "balanced",
  radiusCharacter: "restrained",
};

/** Deterministic fallback art direction; it never creates or changes UX nodes. */
export function deriveVisualConcept(brief: string): VisualConcept {
  const text = brief.toLocaleLowerCase("tr-TR");
  if (/(finance|finans|fatura|invoice|operasyon|stok|sipari[sş]|proje|g[oö]rev)/i.test(text)) {
    return { ...AUTO_SAFE_NEUTRAL, personality: ["precise", "data-first"], surfacePhilosophy: "mostly-flat", density: "compact", typographyCharacter: "technical", contrast: "strong" };
  }
  if (/(fitness|wellness|health|sa[gğ]l[iı]k|antrenman|hedef)/i.test(text)) {
    return { ...AUTO_SAFE_NEUTRAL, personality: ["calm", "human", "encouraging"], surfacePhilosophy: "elevated", density: "balanced", typographyCharacter: "human", contrast: "soft", radiusCharacter: "soft" };
  }
  if (/(creative|culture|editorial|k[uü]lt[uü]r|dergi|hik[aâ]ye)/i.test(text)) {
    return { ...AUTO_SAFE_NEUTRAL, personality: ["curated", "expressive"], surfacePhilosophy: "flat", density: "spacious", typographyCharacter: "editorial", accentStrategy: "functional", radiusCharacter: "sharp" };
  }
  return AUTO_SAFE_NEUTRAL;
}
