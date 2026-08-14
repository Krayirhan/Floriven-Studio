/**
 * Deterministic, renderer-independent measurements for a DesignSpec tree.
 *
 * These metrics deliberately describe only the submitted node structure. They
 * do not infer visual geometry; overflow and viewport checks belong to a
 * renderer-aware validation stage.
 */
export type StructuralMetrics = {
  nodeCount: number;
  maxTreeDepth: number;
  nestedCardCount: number;
  singleChildWrapperCount: number;
  cardCount: number;
  semanticBlockCount: number;
  cardRatio: number;
  surfaceCount: number;
  surfaceRatio: number;
};

export type DesignTreeNode = {
  type?: unknown;
  children?: unknown;
};

const WRAPPER_TYPES = new Set([
  "Screen",
  "SafeArea",
  "ScrollView",
  "Stack",
  "Row",
  "Grid",
  "Group",
  "Section",
]);

const SURFACE_TYPES = new Set(["Card", "Surface"]);

function isNode(value: unknown): value is DesignTreeNode {
  return !!value && typeof value === "object" && !Array.isArray(value);
}

function childNodes(node: DesignTreeNode): DesignTreeNode[] {
  return Array.isArray(node.children) ? node.children.filter(isNode) : [];
}

/** Calculates aggregate metrics for one or more screen roots. */
export function calculateStructuralMetrics(roots: readonly DesignTreeNode[]): StructuralMetrics {
  let nodeCount = 0;
  let maxTreeDepth = 0;
  let nestedCardCount = 0;
  let singleChildWrapperCount = 0;
  let cardCount = 0;
  let semanticBlockCount = 0;
  let surfaceCount = 0;

  const visit = (node: DesignTreeNode, depth: number, cardAncestorCount: number) => {
    nodeCount += 1;
    maxTreeDepth = Math.max(maxTreeDepth, depth);

    const type = typeof node.type === "string" ? node.type : "";
    const children = childNodes(node);
    const isWrapper = WRAPPER_TYPES.has(type);
    const isCard = type === "Card";
    const isSurface = SURFACE_TYPES.has(type);

    if (!isWrapper) semanticBlockCount += 1;
    if (isCard) {
      cardCount += 1;
      if (cardAncestorCount > 0) nestedCardCount += 1;
    }
    if (isSurface) surfaceCount += 1;
    if (isWrapper && children.length === 1) singleChildWrapperCount += 1;

    for (const child of children) visit(child, depth + 1, cardAncestorCount + Number(isCard));
  };

  for (const root of roots) visit(root, 1, 0);

  return {
    nodeCount,
    maxTreeDepth,
    nestedCardCount,
    singleChildWrapperCount,
    cardCount,
    semanticBlockCount,
    cardRatio: semanticBlockCount ? cardCount / semanticBlockCount : 0,
    surfaceCount,
    surfaceRatio: semanticBlockCount ? surfaceCount / semanticBlockCount : 0,
  };
}
