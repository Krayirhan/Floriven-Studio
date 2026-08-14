import type { DesignTreeNode } from "./metrics/structural";

export type SurfaceIssueCode = "NESTED_CARD" | "CARD_TOO_SPARSE" | "EXCESSIVE_CARDIZATION" | "CARD_USED_AS_SECTION" | "REDUNDANT_SURFACE" | "EXCESSIVE_SURFACE_DEPTH";
export type SurfaceIssue = { code: SurfaceIssueCode; nodeType: string };

export type SurfaceValidationOptions = {
  maxCardRatio?: number;
  maxElevatedSurfaceDepth?: number;
};

function children(node: DesignTreeNode): DesignTreeNode[] {
  return Array.isArray(node.children) ? node.children.filter((item): item is DesignTreeNode => !!item && typeof item === "object" && !Array.isArray(item)) : [];
}

/** Enforces that Card represents a self-contained semantic object, not layout plumbing. */
export function validateSurfaceSemantics(roots: readonly DesignTreeNode[], options: SurfaceValidationOptions = {}): SurfaceIssue[] {
  const issues: SurfaceIssue[] = [];
  const maxCardRatio = options.maxCardRatio ?? 0.7;
  const maxElevatedSurfaceDepth = options.maxElevatedSurfaceDepth ?? 1;
  let cardCount = 0;
  let semanticCount = 0;
  const visit = (node: DesignTreeNode, cardAncestor: boolean, surfaceDepth: number) => {
    const isCard = node.type === "Card";
    const isSurface = node.type === "Surface" || isCard;
    const childNodes = children(node);
    if (node.type !== "Screen" && node.type !== "Stack" && node.type !== "Row" && node.type !== "Group" && node.type !== "Section" && node.type !== "SafeArea" && node.type !== "ScrollView") semanticCount += 1;
    if (isCard) cardCount += 1;
    if (isCard && cardAncestor) issues.push({ code: "NESTED_CARD", nodeType: "Card" });
    if (isCard && childNodes.length < 2) issues.push({ code: "CARD_TOO_SPARSE", nodeType: "Card" });
    if (isCard && childNodes.some((child) => child.type === "Section" || child.type === "Group")) issues.push({ code: "CARD_USED_AS_SECTION", nodeType: "Card" });
    if (isSurface && surfaceDepth + 1 > maxElevatedSurfaceDepth) issues.push({ code: "EXCESSIVE_SURFACE_DEPTH", nodeType: String(node.type) });
    if (node.type === "Surface" && childNodes.some((child) => child.type === "Surface")) issues.push({ code: "REDUNDANT_SURFACE", nodeType: "Surface" });
    for (const child of childNodes) visit(child, cardAncestor || isCard, isSurface ? surfaceDepth + 1 : surfaceDepth);
  };
  for (const root of roots) visit(root, false, 0);
  if (semanticCount >= 3 && cardCount / semanticCount > maxCardRatio) issues.push({ code: "EXCESSIVE_CARDIZATION", nodeType: "Screen" });
  return issues;
}
