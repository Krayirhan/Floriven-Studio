import type { ScreenIntent } from "../screen-intent";
import type { PresentationSpecV2 } from "../presentation/contracts";
import type { DesignNode } from "../types";
import { composeScreen } from "./composeScreen";
import type { RenderSection, ScreenRenderPlan } from "../render-plan";

export function composeDashboard(input: { screen: { id: string; root: DesignNode }; intent: ScreenIntent; presentation: PresentationSpecV2 }): ScreenRenderPlan {
  const base = composeScreen(input);
  const nodes = input.screen.root.children ?? [];
  const title = nodes.filter((node) => ["Text", "TopAppBar"].includes(node.type));
  const metrics = nodes.filter((node) => node.type === "Metric");
  const chart = nodes.filter((node) => ["Chart", "Progress"].includes(node.type));
  const actions = nodes.filter((node) => ["Button", "FloatingActionButton", "ListItem"].includes(node.type));
  const sections: RenderSection[] = [];
  if (title.length || metrics.length) sections.push({ id: `${input.screen.id}_primary_summary`, role: "primary-summary", emphasis: "primary", span: 8, order: 0, nodes: [...title, ...metrics.slice(0, 1)], resolvedFamily: input.presentation.cards.types[0] ?? "metric" });
  if (metrics.length > 1) sections.push({ id: `${input.screen.id}_secondary_metrics`, role: "secondary-metrics", emphasis: "secondary", span: 4, order: 1, nodes: metrics.slice(1), resolvedFamily: input.presentation.cards.types[1] ?? "metric" });
  if (chart.length) sections.push({ id: `${input.screen.id}_trend_progress`, role: "trend-progress", emphasis: "secondary", span: 12, order: sections.length, nodes: chart, resolvedFamily: input.presentation.charts.types[0] ?? "line" });
  if (actions.length) sections.push({ id: `${input.screen.id}_actionable`, role: "actionable-content", emphasis: "secondary", span: 12, order: sections.length, nodes: actions, resolvedFamily: "actionable-content" });
  const diagnostics = [
    ...(metrics.length >= 4 && sections.filter((section) => section.role === "secondary-metrics").length === 0 ? [{ code: "COMPOSITION_RULE_VIOLATION" as const, detail: "Dashboard metrics must not become an equal-weight vertical stack." }] : []),
    ...(!metrics.length ? [{ code: "COMPOSITION_RULE_VIOLATION" as const, detail: "Dashboard requires a primary summary." }] : []),
  ];
  return { ...base, sections: sections.map((section, order) => ({ ...section, order })), diagnostics: [...base.diagnostics, ...diagnostics] };
}
