import type { DesignTreeNode } from "./metrics/structural";
import type { UXScreenSpec } from "./ux-spec";

type Node = DesignTreeNode & { props?: Record<string, unknown>; layout?: Record<string, unknown> };
const SPACING_TOKENS = new Set(["space.1", "space.2", "space.3", "space.4", "space.5", "space.6", "space.8"]);

export function validateTypographyBudget(root: Node, screen: UXScreenSpec, viewportHeight = 844): string[] {
  const issues: string[] = [];
  const headings = new Set<string>();
  let nodeCount = 0;
  let hasTaskContent = false;
  const visit = (node: Node) => {
    nodeCount += 1;
    const props = node.props ?? {};
    const layout = node.layout ?? {};
    if (node.type === "Text") {
      const variant = props.variant;
      if (variant === "display" && screen.archetype !== "dashboard") issues.push("DISPLAY_FORBIDDEN");
      if (variant === "title" || variant === "pageTitle" || variant === "heading") {
        const maxLines = Number(props.maxLines ?? 1);
        const limit = screen.archetype === "dashboard" ? 2 : 1;
        if (maxLines > limit) issues.push("OVERSIZED_HEADING");
        const text = typeof props.text === "string" ? props.text.trim().toLocaleLowerCase("tr-TR") : "";
        if (text && headings.has(text)) issues.push("DUPLICATE_PAGE_HEADING");
        if (text) headings.add(text);
      }
      if (["Button", "ListItem", "FormField", "SearchBar", "SearchField", "Metric"].includes(String(node.type))) hasTaskContent = true;
    }
    for (const value of [layout.gap, layout.padding]) if (typeof value === "string" && !SPACING_TOKENS.has(value)) issues.push("RAW_SPACING_FORBIDDEN");
    if (typeof props.height === "number" && props.height > viewportHeight * 0.4) issues.push("OVERSIZED_BLOCK");
    const children = Array.isArray(node.children) ? node.children.filter((child): child is Node => !!child && typeof child === "object" && !Array.isArray(child)) : [];
    for (const child of children) visit(child);
  };
  visit(root);
  if (screen.contentDensity === "high" && nodeCount < 6) issues.push("DENSITY_TOO_LOW");
  if (screen.archetype !== "dashboard" && nodeCount > 1 && !hasTaskContent) issues.push("ABOVE_FOLD_TASK_MISSING");
  return [...new Set(issues)];
}
