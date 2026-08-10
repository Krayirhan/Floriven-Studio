import type { ProductBlueprint } from "./product-blueprint";
import { findDesignTemplate, type DesignTemplateId, type LayoutPattern, type SurfaceStyle } from "./strategy";

export type AutoMood = "technical" | "calm" | "tactile" | "energetic" | "editorial";
export type ChartLanguage = "operational" | "trend" | "progress" | "editorial";
export type TypographyLanguage = "numeric" | "humanist" | "serif" | "dynamic";
export type InteractionLanguage = "precise" | "tactile" | "energetic" | "reduced";
export interface AutoDesignDecision { mood: AutoMood; informationDensity: "compact" | "balanced" | "spacious"; hierarchyStyle: "metric-led" | "content-led" | "progress-led" | "type-led"; surfaceLanguage: SurfaceStyle; chartLanguage: ChartLanguage; typographyLanguage: TypographyLanguage; interactionLanguage: InteractionLanguage; compositionLanguage: LayoutPattern[]; }
export interface AutoDesignResult { decision: AutoDesignDecision; presetId: DesignTemplateId; score: number; rationale: string[]; fallback: boolean; }

export function directAutoDesign(blueprint: ProductBlueprint): AutoDesignResult {
  const text = [blueprint.productDomain, blueprint.audience, ...blueprint.capabilities, ...blueprint.contentVocabulary].join(" ").toLocaleLowerCase("tr-TR");
  const decision = text.match(/finans|operasyon|rapor|tablo|yönetim/) ? technicalDecision() : text.match(/öğren|kurs|oyun|hedef|ilerleme/) ? energeticDecision() : text.match(/yayın|kitap|makale|kültür|arşiv/) ? editorialDecision() : text.match(/sağlık|bakım|huzur|meditasyon/) ? calmDecision() : tactileDecision();
  const presetId = ({ technical: "obsidian-precision", energetic: "electric-learning", editorial: "editorial-culture", calm: "serene-health", tactile: "terracotta-market" } as const)[decision.mood];
  const coherence = validateAutoDecision(decision);
  return { decision, presetId, score: coherence.length ? 55 : 92, rationale: coherence.length ? ["Auto kararında güvenli fallback uygulandı.", ...coherence] : ["Domain sinyalleriyle uyumlu görsel grammar seçildi.", "Ürün vocabulary'si görsel karardan bağımsız korundu."], fallback: coherence.length > 0 };
}

export function validateAutoDecision(decision: AutoDesignDecision): string[] {
  const issues: string[] = [];
  if (decision.typographyLanguage === "serif" && decision.surfaceLanguage === "neon") issues.push("FRANKENSTEIN_EDITORIAL_NEON");
  if (decision.chartLanguage === "operational" && decision.informationDensity === "spacious") issues.push("FRANKENSTEIN_DENSE_WELLNESS");
  if (decision.interactionLanguage === "energetic" && decision.compositionLanguage.includes("stacked") && decision.mood === "editorial") issues.push("FRANKENSTEIN_MINIMAL_ENERGETIC");
  if (!decision.compositionLanguage.length) issues.push("COMPOSITION_REQUIRED");
  return issues;
}

export function resolveAutoPreset(blueprint: ProductBlueprint) { const result = directAutoDesign(blueprint); return { ...result, template: findDesignTemplate(result.presetId) }; }
const technicalDecision = (): AutoDesignDecision => ({ mood: "technical", informationDensity: "compact", hierarchyStyle: "metric-led", surfaceLanguage: "glass", chartLanguage: "operational", typographyLanguage: "numeric", interactionLanguage: "precise", compositionLanguage: ["strict-grid", "bento"] });
const energeticDecision = (): AutoDesignDecision => ({ mood: "energetic", informationDensity: "balanced", hierarchyStyle: "progress-led", surfaceLanguage: "neon", chartLanguage: "progress", typographyLanguage: "dynamic", interactionLanguage: "energetic", compositionLanguage: ["bento", "editorial-asymmetry"] });
const editorialDecision = (): AutoDesignDecision => ({ mood: "editorial", informationDensity: "spacious", hierarchyStyle: "type-led", surfaceLanguage: "flat", chartLanguage: "editorial", typographyLanguage: "serif", interactionLanguage: "reduced", compositionLanguage: ["editorial-asymmetry", "strict-grid"] });
const calmDecision = (): AutoDesignDecision => ({ mood: "calm", informationDensity: "spacious", hierarchyStyle: "content-led", surfaceLanguage: "soft-shadow", chartLanguage: "trend", typographyLanguage: "humanist", interactionLanguage: "tactile", compositionLanguage: ["stacked", "grid"] });
const tactileDecision = (): AutoDesignDecision => ({ mood: "tactile", informationDensity: "balanced", hierarchyStyle: "content-led", surfaceLanguage: "paper", chartLanguage: "trend", typographyLanguage: "serif", interactionLanguage: "tactile", compositionLanguage: ["editorial-asymmetry", "grid"] });
