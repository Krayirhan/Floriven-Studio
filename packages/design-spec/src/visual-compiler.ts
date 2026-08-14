import { ARCHETYPE_POLICIES } from "./archetype";
import { composeAnalytics, composeDetail, composeForm, composeSettings } from "./composition/coreComposers";
import { composeDashboard } from "./composition/dashboard";
import { composeManagementList } from "./composition/managementList";
import { applyPresetStructuralModifier } from "./composition/presetModifier";
import { layoutRenderPlan } from "./layout/engine";
import type { LayoutResult } from "./layout/types";
import { resolvePresentation } from "./presentation/resolvePresentation";
import type { PresentationSpecV2 } from "./presentation/contracts";
import type { ScreenIntent, ScreenIntentArchetype } from "./screen-intent";
import type { ScreenRenderPlan } from "./render-plan";
import type { DesignStrategy, StyleSystemProfile } from "./strategy";
import type { DesignNode, Screen } from "./types";

export interface CompiledVisualScreen {
  screenId: string;
  intent: ScreenIntent;
  presentation: PresentationSpecV2;
  renderPlan: ScreenRenderPlan;
  layout: LayoutResult;
}

export function compileVisualScreen(input: {
  screen: Screen;
  strategy: DesignStrategy;
  styleSystemProfile: StyleSystemProfile;
}): CompiledVisualScreen {
  const intent = readScreenIntent(input.screen);
  const presentation = resolvePresentation({
    strategy: input.strategy,
    styleSystemProfile: input.styleSystemProfile,
    screenIntent: intent,
    platform: "ios",
  }).spec;
  const root = withoutOverlays(input.screen.root);
  const composerInput = { screen: { id: input.screen.id, root }, intent, presentation };
  const composedPlan = intent.archetype === "dashboard"
    ? composeDashboard(composerInput)
    : intent.archetype === "analytics"
      ? composeAnalytics(composerInput)
      : intent.archetype === "management_list"
        ? composeManagementList(composerInput)
        : intent.archetype === "form"
          ? composeForm(composerInput)
          : intent.archetype === "detail"
            ? composeDetail(composerInput)
            : composeSettings(composerInput);
  const renderPlan = routeUnassignedNodes(applyPresetStructuralModifier(composedPlan, intent, presentation), root, intent);
  const layout = layoutRenderPlan({
    plan: renderPlan,
    sectionGap: presentation.composition.sectionGap,
    contentInset: presentation.composition.contentInset,
  });
  return { screenId: input.screen.id, intent, presentation, renderPlan, layout };
}

function routeUnassignedNodes(plan: ScreenRenderPlan, root: DesignNode, intent: ScreenIntent): ScreenRenderPlan {
  const assigned = new Set(plan.sections.flatMap((section) => section.nodes.map((node) => node.id)));
  const unassigned = (root.children ?? []).filter((node) => !assigned.has(node.id));
  if (!unassigned.length) return plan;
  const fallback = fallbackFor(intent.archetype);
  const actionIndex = plan.sections.findIndex((section) => section.role === "actions" || section.role === "scoped-action" || section.role === "actionable-content");
  const insertionIndex = actionIndex < 0 ? plan.sections.length : actionIndex;
  return {
    ...plan,
    sections: [
      ...plan.sections.slice(0, insertionIndex),
      {
        id: `${plan.screenId}_${fallback.role}_fallback`,
        role: fallback.role,
        emphasis: fallback.emphasis,
        span: fallback.span,
        order: insertionIndex,
        nodes: unassigned,
        resolvedFamily: fallback.family,
      },
      ...plan.sections.slice(insertionIndex),
    ].map((section, order) => ({ ...section, order })),
    diagnostics: [
      ...plan.diagnostics,
      ...unassigned.map((node) => ({ code: "UNASSIGNED_NODE_FALLBACK" as const, nodeId: node.id, detail: `Node assigned to deterministic ${intent.archetype} fallback section.` })),
    ],
  };
}

function fallbackFor(archetype: ScreenIntent["archetype"]): { role: ScreenRenderPlan["sections"][number]["role"]; emphasis: ScreenRenderPlan["sections"][number]["emphasis"]; span: number; family: string } {
  if (archetype === "dashboard") return { role: "actionable-content", emphasis: "secondary", span: 12, family: "dashboard-semantic-content" };
  if (archetype === "management_list") return { role: "dense-list", emphasis: "primary", span: 12, family: "list-semantic-content" };
  if (archetype === "detail") return { role: "history-content", emphasis: "secondary", span: 12, family: "detail-semantic-content" };
  if (archetype === "form") return { role: "optional-summary", emphasis: "secondary", span: 12, family: "form-semantic-content" };
  if (archetype === "analytics") return { role: "insight", emphasis: "secondary", span: 6, family: "analytics-semantic-insight" };
  return { role: "next-section-group", emphasis: "secondary", span: 12, family: "settings-semantic-content" };
}

export function readScreenIntent(screen: Screen): ScreenIntent {
  const raw = asRecord(screen.root.props.screenIntent);
  const archetype = isArchetype(raw.archetype) ? raw.archetype : "dashboard";
  const policy = ARCHETYPE_POLICIES[archetype];
  const navigationMode = raw.navigationMode === "focused" || raw.navigationMode === "modal" || raw.navigationMode === "wizard" ? raw.navigationMode : "root";
  const contentDensity = raw.contentDensity === "high" || raw.contentDensity === "low" ? raw.contentDensity : "medium";
  return {
    version: "1.0.0",
    screenId: screen.id,
    archetype,
    navigationMode,
    contentDensity,
    heroAllowed: policy.heroAllowed,
    fabAllowed: policy.fabAllowed,
    bottomNavigationAllowed: policy.bottomNavigationAllowed && navigationMode === "root",
  };
}

function withoutOverlays(root: DesignNode): DesignNode {
  const children = root.children?.filter((node) => node.type !== "BottomNavigation" && node.type !== "TabBar" && node.type !== "FloatingActionButton");
  return {
    ...root,
    ...(children ? { children } : {}),
  };
}

function isArchetype(value: unknown): value is ScreenIntentArchetype {
  return typeof value === "string" && value in ARCHETYPE_POLICIES;
}

function asRecord(value: unknown): Record<string, unknown> {
  return value && typeof value === "object" && !Array.isArray(value) ? value as Record<string, unknown> : {};
}
