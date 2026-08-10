import type { ScreenIntent } from "../screen-intent";
import type { PresentationSpecV2 } from "../presentation/contracts";
import type { DesignNode } from "../types";
import { composeScreen } from "./composeScreen";
import type { RenderSection, ScreenRenderPlan } from "../render-plan";

export function composeDashboard(input: { screen: { id: string; root: DesignNode }; intent: ScreenIntent; presentation: PresentationSpecV2 }): ScreenRenderPlan {
  const base = composeScreen(input);
  const metrics = input.screen.root.children?.filter((node) => node.type === "Metric") ?? [];
  const chart = input.screen.root.children?.filter((node) => ["Chart", "Progress"].includes(node.type)) ?? [];
  const actions = input.screen.root.children?.filter((node) => ["Button", "FloatingActionButton"].includes(node.type)) ?? [];
  const sections: RenderSection[] = [];
  if (metrics.length) sections.push({ id: `${input.screen.id}_hero`, role: "hero", emphasis: "primary", span: 12, order: 0, nodes: metrics.slice(0, 1), resolvedFamily: input.presentation.cards.types[0] ?? "metric" });
  if (metrics.length > 1) sections.push({ id: `${input.screen.id}_summary`, role: "summary", emphasis: "secondary", span: Math.max(3, Math.floor(12 / Math.min(metrics.length - 1, 4))), order: 1, nodes: metrics.slice(1), resolvedFamily: input.presentation.cards.types[1] ?? "metric" });
  if (chart.length) sections.push({ id: `${input.screen.id}_insight`, role: "insight", emphasis: "secondary", span: 12, order: sections.length, nodes: chart, resolvedFamily: input.presentation.charts.types[0] ?? "line" });
  if (actions.length) sections.push({ id: `${input.screen.id}_actions`, role: "actions", emphasis: "secondary", span: 12, order: sections.length, nodes: actions, resolvedFamily: "primary-action" });
  return { ...base, sections, diagnostics: metrics.length > 4 ? [...base.diagnostics, { code: "COMPOSITION_RULE_VIOLATION", detail: "Dashboard metrics must not become an equal-weight vertical stack." }] : base.diagnostics };
}
