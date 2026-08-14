import type { ScreenIntent } from "../screen-intent";
import type { PresentationSpecV2 } from "../presentation/contracts";
import type { DesignNode } from "../types";
import { composeScreen } from "./composeScreen";
import type { RenderEmphasis, RenderPlanDiagnostic, RenderSection, RenderSectionRole, ScreenRenderPlan } from "../render-plan";

type Input = { screen: { id: string; root: DesignNode }; intent: ScreenIntent; presentation: PresentationSpecV2 };
const types = (nodes: DesignNode[], allowed: readonly string[]) => nodes.filter((node) => allowed.includes(node.type));
const section = (input: Input, role: RenderSectionRole, emphasis: RenderEmphasis, nodes: DesignNode[], family: string, span: number, order: number): RenderSection => ({ id: `${input.screen.id}_${role}_${order}`, role, emphasis, nodes, resolvedFamily: family, span, order });
const violation = (detail: string): RenderPlanDiagnostic => ({ code: "COMPOSITION_RULE_VIOLATION", detail });
const finish = (base: ScreenRenderPlan, sections: RenderSection[], diagnostics: RenderPlanDiagnostic[] = []): ScreenRenderPlan => ({ ...base, sections: sections.filter((item) => item.nodes.length).map((item, index) => ({ ...item, order: index })), diagnostics: [...base.diagnostics, ...diagnostics] });

export function composeForm(input: Input): ScreenRenderPlan {
  const base = composeScreen(input); const nodes = input.screen.root.children ?? [];
  const context = types(nodes, ["Text", "TopAppBar"]); const fields = types(nodes, ["TextField", "SearchField", "Checkbox", "Switch"]); const controls = types(nodes, ["SegmentedControl"]); const summaries = types(nodes, ["Metric", "Progress", "Badge"]); const actions = types(nodes, ["Button"]);
  const firstGroup = fields.slice(0, Math.ceil(fields.length / 2)); const secondGroup = [...fields.slice(Math.ceil(fields.length / 2)), ...controls];
  const diagnostics = [
    ...(nodes.some((node) => node.type === "FloatingActionButton") ? [violation("Form screens cannot contain a floating action button.")] : []),
    ...(input.intent.bottomNavigationAllowed ? [violation("Focused form screens cannot contain persistent navigation.")] : []),
    ...(actions.length !== 1 ? [violation("Form screens require exactly one dominant completion action.")] : []),
    ...(summaries.length > 1 ? [violation("Form screens cannot use a dashboard summary block.")] : []),
  ];
  return finish(base, [section(input, "context", "tertiary", context, "form-context", 12, 0), section(input, "field-group", "primary", firstGroup, input.presentation.fields.styles[0] ?? "outlined", 12, 1), section(input, "field-group", "primary", secondGroup, input.presentation.fields.styles[1] ?? input.presentation.fields.styles[0] ?? "outlined", 12, 2), section(input, "optional-summary", "secondary", summaries, "form-summary", 12, 3), section(input, "actions", "primary", actions, "single-primary-action", 12, 4)], diagnostics);
}

export function composeDetail(input: Input): ScreenRenderPlan {
  const base = composeScreen(input); const nodes = input.screen.root.children ?? [];
  const identity = types(nodes, ["Text", "Avatar", "Image"]); const state = types(nodes, ["Metric", "Progress", "Badge"]); const metadata = types(nodes, ["ListItem"]); const history = types(nodes, ["Divider", "Chart"]); const actions = types(nodes, ["Button", "IconButton"]);
  return finish(base, [section(input, "identity", "primary", identity, "entity-identity", 12, 0), section(input, "primary-state", "primary", state, input.presentation.cards.types[0] ?? "metric", 8, 1), section(input, "metadata", "secondary", metadata, "technical-metadata", 4, 2), section(input, "history-content", "secondary", history, "timeline", 12, 3), section(input, "actions", "tertiary", actions, "detail-actions", 12, 4)]);
}

export function composeAnalytics(input: Input): ScreenRenderPlan {
  const base = composeScreen(input); const nodes = input.screen.root.children ?? [];
  const context = types(nodes, ["Text", "Metric"]); const controls = types(nodes, ["SegmentedControl", "SearchField"]); const charts = types(nodes, ["Chart"]); const insight = types(nodes, ["ListItem", "Badge", "Progress"]);
  const diagnostics = [
    ...(charts.length < 2 ? [violation("Analytics screens require a dominant chart and a supporting breakdown.")] : []),
    ...(controls.length === 0 ? [violation("Analytics screens require period or comparison context.")] : []),
    ...(insight.length === 0 ? [violation("Analytics screens require a decision insight; chart-only bodies are forbidden.")] : []),
  ];
  // Analytics is always an asymmetric comparison canvas: it must never collapse into the
  // dashboard's summary/trend/action topology, even when a profile defaults
  // to stacked composition.
  return { ...finish(base, [section(input, "context", "secondary", context, "kpi-context", 12, 0), section(input, "period-comparison", "tertiary", controls, "period-comparison", 12, 1), section(input, "dominant-chart", "primary", charts.slice(0, 1), String(charts[0]?.props.chartType ?? input.presentation.charts.types[0] ?? "line"), 12, 2), section(input, "breakdown", "secondary", charts.slice(1), String(charts[1]?.props.chartType ?? input.presentation.charts.types[1] ?? "bar"), 7, 3), section(input, "insight", "secondary", insight, "decision-insight", 5, 4)], diagnostics), layoutPattern: "comparison-grid" };
}

export function composeSettings(input: Input): ScreenRenderPlan {
  const base = composeScreen(input); const nodes = input.screen.root.children ?? [];
  const labels = types(nodes, ["Text", "TopAppBar"]); const dividerIndex = nodes.findIndex((node) => node.type === "Divider"); const beforeDivider = (dividerIndex < 0 ? nodes : nodes.slice(0, dividerIndex)).filter((node) => ["ListItem", "Switch", "Checkbox"].includes(node.type)); const afterDivider = (dividerIndex < 0 ? [] : nodes.slice(dividerIndex + 1)).filter((node) => ["ListItem", "Switch", "Checkbox"].includes(node.type)); const divider = types(nodes, ["Divider"]);
  const diagnostics = [
    ...(nodes.some((node) => ["Metric", "Image"].includes(node.type)) ? [violation("Settings screens cannot contain a global dashboard hero or product summary.")] : []),
    ...(nodes.some((node) => node.type === "Chart") ? [violation("Settings screens cannot contain analytics charts.")] : []),
  ];
  return finish(base, [section(input, "section-group", "tertiary", labels, "settings-label", 12, 0), section(input, "rows-controls", "primary", beforeDivider, input.presentation.composition.grouping, 12, 1), section(input, "divider", "tertiary", divider, "section-divider", 12, 2), section(input, "next-section-group", "secondary", afterDivider, input.presentation.composition.grouping, 12, 3)], diagnostics);
}
