import type { ScreenIntent } from "../screen-intent";
import type { PresentationSpecV2 } from "../presentation/contracts";
import type { DesignNode } from "../types";
import type { RenderEmphasis, RenderPlanDiagnostic, RenderSection, RenderSectionRole, ScreenRenderPlan } from "../render-plan";

const KNOWN_TYPES = new Set(["Screen", "ScrollView", "Stack", "Row", "Grid", "Group", "Section", "TopAppBar", "BottomNavigation", "TabBar", "Text", "Card", "Metric", "Chart", "ListItem", "SearchField", "SegmentedControl", "Button", "TextField", "Progress", "Badge", "Divider", "Switch", "Checkbox", "IconButton", "Image", "Avatar", "FloatingActionButton"]);
const ROLE_ORDER: Record<RenderSectionRole, number> = { hero: 0, summary: 1, toolbar: 2, "primary-content": 3, insight: 4, "secondary-content": 5, actions: 6 };

export function composeScreen(input: { screen: { id: string; root: DesignNode }; intent: ScreenIntent; presentation: PresentationSpecV2 }): ScreenRenderPlan {
  const children = input.screen.root.children ?? [];
  const diagnostics: RenderPlanDiagnostic[] = [];
  const grouped = new Map<RenderSectionRole, DesignNode[]>();
  children.forEach((node) => {
    collectDiagnostics(node, diagnostics);
    const role = classifyNode(node, input.intent);
    const current = grouped.get(role) ?? [];
    current.push(node);
    grouped.set(role, current);
  });
  const sections: RenderSection[] = [...grouped.entries()]
    .sort(([left], [right]) => ROLE_ORDER[left] - ROLE_ORDER[right])
    .map(([role, nodes], index) => ({ id: `${input.screen.id}_${role}`, role, emphasis: emphasisFor(role), span: role === "hero" || role === "primary-content" ? 12 : 6, order: index, nodes, resolvedFamily: familyFor(role, input.presentation) }));
  return { version: "1.0.0", screenId: input.screen.id, archetype: input.intent.archetype, layoutPattern: patternFor(input.intent, input.presentation), sections, overlays: [], ...(input.intent.bottomNavigationAllowed ? { navigation: { mode: input.presentation.navigation.active } } : {}), diagnostics };
}

export function validateRenderPlan(plan: ScreenRenderPlan): string[] {
  const issues: string[] = [];
  if (plan.version !== "1.0.0") issues.push("UNSUPPORTED_VERSION");
  if (!plan.screenId.trim()) issues.push("SCREEN_ID_REQUIRED");
  if (!plan.sections.length) issues.push("SECTIONS_REQUIRED");
  if (plan.sections.some((section, index) => section.order !== index)) issues.push("UNSTABLE_SECTION_ORDER");
  if (plan.sections.some((section) => section.span <= 0 || section.span > 12)) issues.push("INVALID_SECTION_SPAN");
  if (plan.diagnostics.some((diagnostic) => diagnostic.code === "UNKNOWN_NODE_TYPE")) issues.push("UNKNOWN_NODE_TYPE");
  if (plan.diagnostics.some((diagnostic) => diagnostic.code === "COMPOSITION_RULE_VIOLATION")) issues.push("COMPOSITION_RULE_VIOLATION");
  return issues;
}

function classifyNode(node: DesignNode, intent: ScreenIntent): RenderSectionRole {
  if (node.type === "TopAppBar" || node.type === "SearchField" || node.type === "SegmentedControl") return "toolbar";
  if (node.type === "Metric" && intent.heroAllowed) return "hero";
  if (["Chart", "Progress"].includes(node.type)) return "insight";
  if (["Button", "FloatingActionButton"].includes(node.type)) return "actions";
  if (["ListItem", "TextField", "Switch", "Checkbox"].includes(node.type)) return intent.archetype === "management_list" || intent.archetype === "settings" ? "primary-content" : "secondary-content";
  return "summary";
}

function emphasisFor(role: RenderSectionRole): RenderEmphasis { return role === "hero" || role === "primary-content" ? "primary" : role === "actions" || role === "insight" ? "secondary" : "tertiary"; }
function familyFor(role: RenderSectionRole, presentation: PresentationSpecV2): string { return role === "primary-content" ? presentation.cards.types[0] ?? "list" : role === "insight" ? presentation.charts.types[0] ?? "line" : role; }
function patternFor(intent: ScreenIntent, presentation: PresentationSpecV2): ScreenRenderPlan["layoutPattern"] { const key = intent.archetype === "management_list" ? "managementList" : intent.archetype; return presentation.composition.patterns[key as keyof typeof presentation.composition.patterns] ?? "stacked"; }
function collectDiagnostics(node: DesignNode, diagnostics: RenderPlanDiagnostic[]): void { if (!KNOWN_TYPES.has(node.type)) diagnostics.push({ code: "UNKNOWN_NODE_TYPE", nodeId: node.id, detail: `Unsupported semantic node type: ${node.type}` }); node.children?.forEach((child) => collectDiagnostics(child, diagnostics)); }
