import type { DesignNode } from "@floriven/design-spec";

export function propString(
  node: DesignNode,
  key: string,
  fallback: string,
): string {
  const value = node.props[key];
  return typeof value === "string" ? value : fallback;
}

export function propNumber(
  node: DesignNode,
  key: string,
  fallback: number,
): number {
  const value = node.props[key];
  return typeof value === "number" ? value : fallback;
}

export function findNode(node: DesignNode, id: string): DesignNode | undefined {
  if (node.id === id) return node;
  for (const child of node.children ?? []) {
    const found = findNode(child, id);
    if (found) return found;
  }
  return undefined;
}

export function updateNode(
  node: DesignNode,
  id: string,
  patch: Record<string, unknown>,
): DesignNode {
  if (node.id === id) return { ...node, props: { ...node.props, ...patch } };
  if (!node.children) return node;
  return {
    ...node,
    children: node.children.map((child) => updateNode(child, id, patch)),
  };
}

/** Regenerates every node id under a fresh screen slug so a duplicated screen never
 * shares an id with the one it was copied from. */
export function remapNodeIds(node: DesignNode, slug: string, seen: { current: number }): DesignNode {
  const id = `${slug}_n${seen.current++}`;
  return {
    ...node,
    id,
    ...(node.children ? { children: node.children.map((child) => remapNodeIds(child, slug, seen)) } : {}),
  };
}

export function typeIcon(type: string): string {
  const icons: Record<string, string> = {
    Screen: "▦",
    Text: "T",
    Greeting: "T",
    PageTitle: "T",
    SectionTitle: "—",
    BalanceCard: "◈",
    BudgetCard: "◈",
    TransactionList: "☰",
    QuickActions: "⊞",
    SearchBar: "⌕",
    SegmentedControl: "≡",
    BudgetCategories: "◫",
    AIInsight: "✦",
  };
  return icons[type] ?? "○";
}
