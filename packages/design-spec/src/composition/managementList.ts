import type { ScreenIntent } from "../screen-intent";
import type { PresentationSpecV2 } from "../presentation/contracts";
import type { DesignNode } from "../types";
import { composeScreen } from "./composeScreen";
import type { RenderSection, ScreenRenderPlan } from "../render-plan";

export function composeManagementList(input: { screen: { id: string; root: DesignNode }; intent: ScreenIntent; presentation: PresentationSpecV2 }): ScreenRenderPlan {
  const base = composeScreen(input);
  const nodes = input.screen.root.children ?? [];
  const toolbar = nodes.filter((node) => ["SearchField", "SegmentedControl", "TopAppBar"].includes(node.type));
  const summary = nodes.filter((node) => node.type === "Metric");
  const rows = nodes.filter((node) => ["ListItem", "Divider"].includes(node.type));
  const actions = nodes.filter((node) => ["Button", "FloatingActionButton"].includes(node.type));
  const sections: RenderSection[] = [];
  if (toolbar.length) sections.push({ id: `${input.screen.id}_toolbar`, role: "toolbar", emphasis: "secondary", span: 12, order: 0, nodes: toolbar, resolvedFamily: "list-toolbar" });
  if (summary.length) sections.push({ id: `${input.screen.id}_summary`, role: "summary", emphasis: "tertiary", span: 12, order: sections.length, nodes: summary, resolvedFamily: input.presentation.cards.types[0] ?? "metric" });
  if (rows.length) sections.push({ id: `${input.screen.id}_rows`, role: "primary-content", emphasis: "primary", span: 12, order: sections.length, nodes: rows, resolvedFamily: input.presentation.composition.grouping ?? "flat-list" });
  if (actions.length) sections.push({ id: `${input.screen.id}_actions`, role: "actions", emphasis: "secondary", span: 12, order: sections.length, nodes: actions, resolvedFamily: "scoped-action" });
  return { ...base, sections };
}
