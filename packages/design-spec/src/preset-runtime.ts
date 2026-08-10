import { findDesignTemplate, DESIGN_TEMPLATE_IDS, type DesignTemplateId } from "./strategy";
import { createScreenIntent, type ScreenIntent } from "./screen-intent";
import { resolvePresentation } from "./presentation/resolvePresentation";
import type { PresentationSpecV2 } from "./presentation/contracts";

export const CORE_ARCHETYPES = ["dashboard", "management_list", "detail", "form", "analytics", "settings"] as const;
export type CoreArchetype = (typeof CORE_ARCHETYPES)[number];
export interface PresetRuntimeFixture { presetId: DesignTemplateId; archetype: CoreArchetype; presentation: PresentationSpecV2; structuralSignature: string; }
export interface PresetRuntimeMatrix { fixtures: PresetRuntimeFixture[]; pairwiseDistance: Record<string, number>; }

export function createPresetRuntimeMatrix(): PresetRuntimeMatrix {
  const fixtures = DESIGN_TEMPLATE_IDS.flatMap((presetId) => CORE_ARCHETYPES.map((archetype) => {
    const template = findDesignTemplate(presetId)!;
    const intent = createScreenIntent({ screenId: `${presetId}-${archetype}`, archetype: archetype === "management_list" ? "management_list" : archetype === "dashboard" || archetype === "analytics" ? "dashboard" : archetype, navigationMode: ["form", "detail"].includes(archetype) ? "focused" : "root", contentDensity: template.strategy.density === "compact" ? "high" : template.strategy.density === "spacious" ? "low" : "medium" });
    const presentation = resolvePresentation({ strategy: { mode: "template", ...template.strategy, stylePresetId: presetId, rationale: [] }, styleSystemProfile: template.system, screenIntent: intent }).spec;
    return { presetId, archetype, presentation, structuralSignature: signature(presentation) };
  }));
  const pairwiseDistance: Record<string, number> = {};
  CORE_ARCHETYPES.forEach((archetype) => {
    const group = fixtures.filter((fixture) => fixture.archetype === archetype);
    for (let left = 0; left < group.length; left += 1) for (let right = left + 1; right < group.length; right += 1) pairwiseDistance[`${group[left]!.presetId}:${group[right]!.presetId}:${archetype}`] = distance(group[left]!.structuralSignature, group[right]!.structuralSignature);
  });
  return { fixtures, pairwiseDistance };
}

export function validatePresetRuntimeMatrix(matrix: PresetRuntimeMatrix, minimumDistance = 0.4): string[] {
  const issues: string[] = [];
  if (matrix.fixtures.length !== DESIGN_TEMPLATE_IDS.length * CORE_ARCHETYPES.length) issues.push("INCOMPLETE_PRESET_FIXTURES");
  for (const [key, value] of Object.entries(matrix.pairwiseDistance)) if (value < minimumDistance) issues.push(`PAIRWISE_DISTANCE_FAILED:${key}`);
  for (const fixture of matrix.fixtures) if (!fixture.presentation.typography.roles.metric.family || !fixture.presentation.cards.types.length || !fixture.presentation.charts.types.length) issues.push(`CONTRACT_INCOMPLETE:${fixture.presetId}:${fixture.archetype}`);
  return issues;
}

function signature(spec: PresentationSpecV2): string { return [spec.spacing.density, ...Object.values(spec.composition.patterns), ...spec.cards.types, ...spec.charts.types, ...spec.controls.types, ...spec.fields.styles, ...spec.navigation.modes, spec.composition.grouping, spec.typography.displayFamily, spec.motion.easing].join("|"); }
function distance(left: string, right: string): number { const a = new Set(left.split("|")); const b = new Set(right.split("|")); const union = new Set([...a, ...b]).size; return union ? 1 - [...a].filter((value) => b.has(value)).length / union : 0; }
