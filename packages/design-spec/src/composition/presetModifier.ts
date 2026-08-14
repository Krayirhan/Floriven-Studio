import type { PresentationSpecV2 } from "../presentation/contracts";
import type { ScreenIntent } from "../screen-intent";
import type { ScreenRenderPlan, RenderSectionRole } from "../render-plan";

type PresetPolicy = { pattern: PresentationSpecV2["composition"]["patterns"][keyof PresentationSpecV2["composition"]["patterns"]]; spans: Partial<Record<RenderSectionRole, number>>; emphasis: Partial<Record<RenderSectionRole, "primary" | "secondary" | "tertiary">>; families: Partial<Record<RenderSectionRole, string>> };

const policies: Record<string, PresetPolicy> = {
  "obsidian-precision": { pattern: "strict-grid", spans: { "primary-summary": 8, "secondary-metrics": 4, "trend-progress": 8, "actionable-content": 4, context: 12, toolbar: 8, "optional-summary": 4, "dense-list": 12, "scoped-action": 12, "dominant-chart": 8, breakdown: 4, "field-group": 6 }, emphasis: { "primary-summary": "primary", "dominant-chart": "primary" }, families: { "primary-summary": "precision-metric", "dense-list": "tabular-list", "dominant-chart": "line-grid" } },
  "serene-health": { pattern: "stacked", spans: { "primary-summary": 12, "secondary-metrics": 12, "trend-progress": 12, "actionable-content": 12, context: 12, toolbar: 12, "optional-summary": 12, "dense-list": 12, "scoped-action": 12, "dominant-chart": 12, breakdown: 12, "field-group": 12 }, emphasis: { "primary-summary": "primary", "dominant-chart": "primary" }, families: { "primary-summary": "calm-hero", "field-group": "touch-field", "dominant-chart": "radial-progress" } },
  "terracotta-market": { pattern: "editorial-asymmetry", spans: { "primary-summary": 5, "secondary-metrics": 7, "trend-progress": 7, "actionable-content": 5, context: 8, toolbar: 4, "optional-summary": 8, "dense-list": 11, "scoped-action": 12, identity: 8, "primary-state": 4, metadata: 8, "history-content": 12, actions: 12, "dominant-chart": 7, breakdown: 5, "field-group": 5 }, emphasis: { "primary-summary": "primary", context: "primary", "dominant-chart": "primary" }, families: { "primary-summary": "editorial-hero", context: "curated-context", "dominant-chart": "bar-editorial" } },
  "electric-learning": { pattern: "bento", spans: { "primary-summary": 7, "secondary-metrics": 5, "trend-progress": 4, "actionable-content": 8, context: 5, toolbar: 7, "optional-summary": 4, "dense-list": 8, "scoped-action": 4, identity: 5, "primary-state": 7, metadata: 4, "history-content": 8, actions: 12, "section-group": 5, "rows-controls": 7, divider: 12, "next-section-group": 5, "dominant-chart": 8, breakdown: 4, "field-group": 6 }, emphasis: { "primary-summary": "primary", "trend-progress": "primary", "dominant-chart": "primary" }, families: { "primary-summary": "pulse-hero", "trend-progress": "progress-stack", "dominant-chart": "radial-energy" } },
  "editorial-culture": { pattern: "editorial-asymmetry", spans: { "primary-summary": 10, "secondary-metrics": 2, "trend-progress": 12, "actionable-content": 12, context: 9, toolbar: 3, "optional-summary": 9, "dense-list": 12, "scoped-action": 12, identity: 9, "primary-state": 3, metadata: 9, "history-content": 12, actions: 12, "dominant-chart": 6, breakdown: 6, "field-group": 11 }, emphasis: { "primary-summary": "primary", context: "primary", "dominant-chart": "primary" }, families: { "primary-summary": "cover-summary", context: "editorial-context", "dominant-chart": "line-editorial" } },
};

export function applyPresetStructuralModifier(plan: ScreenRenderPlan, intent: ScreenIntent, presentation: PresentationSpecV2): ScreenRenderPlan {
  const policy = policies[presentation.identity.sourcePresetId ?? ""] ?? { pattern: plan.layoutPattern, spans: {}, emphasis: {}, families: {} };
  const pattern = policy.pattern;
  return { ...plan, layoutPattern: pattern, sections: plan.sections.map((section) => {
    const analyticsShape = presentation.identity.sourcePresetId === "serene-health" ? { "dominant-chart": 8, breakdown: 4, insight: 12 } : { "dominant-chart": 12, breakdown: 7, insight: 5 };
    const analyticsSpan = intent.archetype === "analytics" ? (analyticsShape as Partial<Record<RenderSectionRole, number>>)[section.role] : undefined;
    const settingsShape: Partial<Record<RenderSectionRole, number>> = presentation.identity.sourcePresetId === "electric-learning" ? { "section-group": 1, "rows-controls": 11, divider: 12, "next-section-group": 1 } : { "section-group": 3, "rows-controls": 9, divider: 12, "next-section-group": 3 };
    const settingsSpan = intent.archetype === "settings" ? settingsShape[section.role] : undefined;
    return { ...section, span: analyticsSpan ?? settingsSpan ?? policy.spans[section.role] ?? section.span, emphasis: policy.emphasis[section.role] ?? section.emphasis, resolvedFamily: policy.families[section.role] ?? `${presentation.composition.grouping}-${intent.archetype}-${section.role}` };
  }) };
}
