import type { UXScreenSpec } from "./ux-spec";

export type ArchetypeNode = { type?: unknown; props?: Record<string, unknown>; children?: unknown };

export function validateArchetypeContent(screen: UXScreenSpec, root: ArchetypeNode): string[] {
  const nodes = flatten(root);
  const types = new Set(nodes.map((node) => String(node.type ?? "")));
  const issues: string[] = [];

  if (screen.archetype === "form") {
    for (const required of ["FormSection", "FormField", "Button"]) if (!types.has(required)) issues.push(`FORM_INCOMPLETE:${required}`);
    if (types.has("FloatingActionButton")) issues.push("FORM_FAB_FORBIDDEN");
    if (types.has("BottomNavigation") || types.has("TabBar")) issues.push("FORM_BOTTOM_NAV_FORBIDDEN");
  }
  if (screen.archetype === "settings") {
    if (!types.has("SettingsRow")) issues.push("SETTINGS_ROWS_REQUIRED");
    if (nodes.some((node) => node.type === "Card")) issues.push("SETTINGS_CARD_GROUPING_FORBIDDEN");
  }
  if (screen.archetype === "dashboard") {
    for (const chart of nodes.filter((node) => node.type === "Chart")) {
      if (typeof chart.props?.insight !== "string" || !chart.props.insight.trim()) issues.push("ANALYTICS_WITHOUT_INSIGHT");
    }
  }
  return [...new Set(issues)];
}

function flatten(root: ArchetypeNode): ArchetypeNode[] {
  const result: ArchetypeNode[] = [];
  const visit = (node: ArchetypeNode) => {
    result.push(node);
    if (Array.isArray(node.children)) for (const child of node.children) if (child && typeof child === "object" && !Array.isArray(child)) visit(child as ArchetypeNode);
  };
  visit(root);
  return result;
}

