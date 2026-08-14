import type { ScreenIntent } from "../screen-intent";
import type { PresentationSpecV2 } from "../presentation/contracts";
import type { DesignNode } from "../types";
import { composeScreen } from "./composeScreen";
import type { RenderSection, ScreenRenderPlan } from "../render-plan";

type Input = { screen: { id: string; root: DesignNode }; intent: ScreenIntent; presentation: PresentationSpecV2 };
const section = (id: string, role: RenderSection["role"], emphasis: RenderSection["emphasis"], nodes: DesignNode[], family: string, span = 12, order = 0): RenderSection => ({ id, role, emphasis, nodes, resolvedFamily: family, span, order });
const rule = (detail: string) => ({ code: "COMPOSITION_RULE_VIOLATION" as const, detail });

export function composeForm(input: Input): ScreenRenderPlan {
  const base = composeScreen(input);
  const nodes = input.screen.root.children ?? [];
  const fields = nodes.filter((node) => ["TextField", "SearchField", "Checkbox", "Switch"].includes(node.type));
  const summaries = nodes.filter((node) => ["Metric", "Progress", "Text"].includes(node.type));
  const actions = nodes.filter((node) => node.type === "Button");
  const violations = [
    ...(nodes.some((node) => node.type === "FloatingActionButton") ? [rule("Form screens cannot contain a floating action button.")] : []),
    ...(input.intent.bottomNavigationAllowed ? [rule("Focused form screens cannot contain persistent navigation.")] : []),
    ...(actions.length !== 1 ? [rule("Form screens require exactly one dominant completion action.")] : []),
  ];
  const sections: RenderSection[] = [];
  if (summaries.length) sections.push(section(`${input.screen.id}_context`, "summary", "tertiary", summaries, "form-context", 12, 0));
  if (fields.length) sections.push(section(`${input.screen.id}_fields`, "primary-content", "primary", fields, input.presentation.fields.styles[0] ?? "outlined", 12, sections.length));
  if (actions.length) sections.push(section(`${input.screen.id}_actions`, "actions", "secondary", actions, "completion-action", 12, sections.length));
  return { ...base, sections, diagnostics: [...base.diagnostics, ...violations] };
}

export function composeDetail(input: Input): ScreenRenderPlan {
  const base = composeScreen(input);
  const nodes = input.screen.root.children ?? [];
  const identity = nodes.filter((node) => ["Text", "Avatar", "Image"].includes(node.type)).slice(0, 2);
  const state = nodes.filter((node) => ["Metric", "Progress", "Badge"].includes(node.type));
  const timeline = nodes.filter((node) => ["ListItem", "Divider"].includes(node.type));
  const actions = nodes.filter((node) => ["Button", "IconButton"].includes(node.type));
  const sections: RenderSection[] = [];
  if (identity.length) sections.push(section(`${input.screen.id}_identity`, "hero", "primary", identity, "entity-identity", 12, 0));
  if (state.length) sections.push(section(`${input.screen.id}_state`, "summary", "primary", state, input.presentation.cards.types[0] ?? "metric", 12, sections.length));
  if (timeline.length) sections.push(section(`${input.screen.id}_timeline`, "primary-content", "secondary", timeline, "timeline", 12, sections.length));
  if (actions.length) sections.push(section(`${input.screen.id}_actions`, "actions", "tertiary", actions, "secondary-action", 12, sections.length));
  return { ...base, sections };
}

export function composeAnalytics(input: Input): ScreenRenderPlan {
  const base = composeScreen(input);
  const nodes = input.screen.root.children ?? [];
  const kpis = nodes.filter((node) => node.type === "Metric");
  const controls = nodes.filter((node) => ["SegmentedControl", "Button"].includes(node.type));
  const charts = nodes.filter((node) => node.type === "Chart");
  const insight = nodes.filter((node) => ["Text", "ListItem", "Badge"].includes(node.type));
  const sections: RenderSection[] = [];
  if (kpis.length) sections.push(section(`${input.screen.id}_kpi`, "summary", "primary", kpis, "kpi", 12, 0));
  if (controls.length) sections.push(section(`${input.screen.id}_controls`, "toolbar", "secondary", controls, "comparison-control", 12, sections.length));
  if (charts.length) sections.push(section(`${input.screen.id}_chart`, "primary-content", "primary", charts, input.presentation.charts.types[0] ?? "line", 12, sections.length));
  if (insight.length) sections.push(section(`${input.screen.id}_insight`, "insight", "secondary", insight, "decision-insight", 12, sections.length));
  const diagnostics = charts.length ? base.diagnostics : [...base.diagnostics, rule("Analytics screens require a dominant chart region.")];
  return { ...base, sections, diagnostics };
}

export function composeSettings(input: Input): ScreenRenderPlan {
  const base = composeScreen(input);
  const nodes = input.screen.root.children ?? [];
  const rows = nodes.filter((node) => ["ListItem", "Switch", "Checkbox", "Divider"].includes(node.type));
  const actions = nodes.filter((node) => ["Button", "IconButton"].includes(node.type));
  const forbiddenHero = nodes.some((node) => ["Metric", "Image"].includes(node.type));
  const sections = rows.length ? [section(`${input.screen.id}_groups`, "primary-content", "primary", rows, input.presentation.composition.grouping, 12, 0)] : [];
  return { ...base, sections, diagnostics: [...base.diagnostics, ...(forbiddenHero ? [rule("Settings screens cannot contain a global dashboard hero or product summary.")] : []), ...(actions.length && !input.intent.primaryAction ? [rule("Settings actions require an explicit settings intent.")] : [])] };
}
