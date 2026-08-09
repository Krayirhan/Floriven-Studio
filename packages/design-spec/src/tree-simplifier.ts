import type { DesignTreeNode } from "./metrics/structural";

type MutableNode = DesignTreeNode & Record<string, unknown>;
const COLLAPSIBLE = new Set(["Stack", "Row", "Group", "Surface", "Column"]);

function children(node: MutableNode): MutableNode[] {
  return Array.isArray(node.children) ? node.children.filter((item): item is MutableNode => !!item && typeof item === "object" && !Array.isArray(item)) : [];
}

/** Removes same-type and single-child layout wrappers without touching semantic nodes. */
export function simplifyTree(node: MutableNode): MutableNode {
  const simplifiedChildren = children(node).map(simplifyTree);
  const current: MutableNode = { ...node, ...(simplifiedChildren.length ? { children: simplifiedChildren } : {}) };
  const type = String(current.type ?? "");
  if (COLLAPSIBLE.has(type) && simplifiedChildren.length === 1 && simplifiedChildren[0]) return simplifiedChildren[0];
  return current;
}

export function lintTreeStructure(roots: readonly DesignTreeNode[], maxDepth = 8): string[] {
  const issues: string[] = [];
  const visit = (node: DesignTreeNode, depth: number, wrapperDepth: number) => {
    const type = String(node.type ?? "");
    const nextWrapperDepth = COLLAPSIBLE.has(type) ? wrapperDepth + 1 : 0;
    if (depth > maxDepth) issues.push("MAX_TREE_DEPTH");
    if (nextWrapperDepth > 2) issues.push("EXCESSIVE_WRAPPER_DEPTH");
    if (COLLAPSIBLE.has(type) && nodeChildren(node).length === 1) issues.push("SINGLE_CHILD_WRAPPER");
    const childNodes = nodeChildren(node);
    for (const child of childNodes) visit(child, depth + 1, nextWrapperDepth);
  };
  for (const root of roots) visit(root, 1, 0);
  return [...new Set(issues)];
}

function nodeChildren(node: DesignTreeNode): DesignTreeNode[] {
  return Array.isArray(node.children) ? node.children.filter((item): item is DesignTreeNode => !!item && typeof item === "object" && !Array.isArray(item)) : [];
}
