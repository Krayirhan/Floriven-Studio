import type { DesignTemplateId, DesignStrategy } from "./strategy";
import type { PresentationSpecV2 } from "./presentation/contracts";

export type LegacyTemplateDocument = { templateId?: DesignTemplateId; strategy?: Partial<DesignStrategy>; presentation?: PresentationSpecV2 };
export type MigrationResult = { templateId?: DesignTemplateId; source: "v2" | "legacy-template" | "default"; migrated: boolean };
export type StudioFeatureFlags = { v2Renderer: boolean; runtimeEvidence: boolean; deterministicFallback: boolean };
export type PerformanceBudget = { screenCount: 6; maxRenderMs: number; maxTotalMs: number };

export function resolveLegacyTemplateId(document: LegacyTemplateDocument, fallback: DesignTemplateId): MigrationResult {
  if (document.presentation?.version === "2.0.0") return { ...(document.strategy?.stylePresetId ? { templateId: document.strategy.stylePresetId } : {}), source: "v2", migrated: false };
  if (document.templateId) return { templateId: document.templateId, source: "legacy-template", migrated: true };
  return { templateId: fallback, source: "default", migrated: true };
}

export function inspectResolvedSystem(presentation: PresentationSpecV2): Record<string, unknown> {
  return { version: presentation.version, preset: presentation.identity.sourcePresetId ?? "auto", palette: presentation.palette.name, typography: presentation.typography.family, density: presentation.spacing.density, cards: [...presentation.cards.types], charts: [...presentation.charts.types], layout: { ...presentation.composition.patterns }, navigation: presentation.navigation.active };
}

export function createStudioFeatureFlags(overrides: Partial<StudioFeatureFlags> = {}): StudioFeatureFlags { return { v2Renderer: true, runtimeEvidence: true, deterministicFallback: true, ...overrides }; }
export function rollbackStudioFlags(): StudioFeatureFlags { return { v2Renderer: false, runtimeEvidence: false, deterministicFallback: false }; }

export function evaluateRenderPerformance(samples: readonly number[], budget: PerformanceBudget): { passed: boolean; failures: string[]; totalMs: number; maxMs: number } {
  const values = [...samples];
  const failures: string[] = [];
  const totalMs = values.reduce((sum, value) => sum + value, 0);
  const maxMs = Math.max(...values, 0);
  if (values.length !== budget.screenCount) failures.push("SCREEN_COUNT_MISMATCH");
  if (maxMs > budget.maxRenderMs) failures.push("PER_SCREEN_RENDER_BUDGET");
  if (totalMs > budget.maxTotalMs) failures.push("TOTAL_RENDER_BUDGET");
  return { passed: failures.length === 0, failures, totalMs, maxMs };
}
