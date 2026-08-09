import type { DesignNode, DesignSpec } from "./types";

type SemanticSnapshot = {
  screens: Array<{
    id: string;
    name: string;
    route?: string;
    root: unknown;
  }>;
  flows: DesignSpec["flows"];
};

/**
 * Returns a stable, renderer-independent representation of UX structure.
 * Presentation tokens and visual-only props are intentionally excluded.
 */
export function createSemanticSnapshot(spec: Pick<DesignSpec, "screens" | "flows">): SemanticSnapshot {
  return {
    screens: spec.screens.map((screen) => ({
      id: screen.id,
      name: screen.name,
      ...(screen.route ? { route: screen.route } : {}),
      root: snapshotNode(screen.root),
    })),
    flows: spec.flows.map((flow) => ({ ...flow })),
  };
}

/** A deterministic hash without a crypto/runtime dependency. */
export function createSemanticHash(spec: Pick<DesignSpec, "screens" | "flows">): string {
  return fnv1a(JSON.stringify(createSemanticSnapshot(spec)));
}

export function assertSemanticParity(
  before: Pick<DesignSpec, "screens" | "flows">,
  after: Pick<DesignSpec, "screens" | "flows">,
): void {
  const beforeHash = createSemanticHash(before);
  const afterHash = createSemanticHash(after);
  if (beforeHash !== afterHash) {
    throw new Error(`SEMANTIC_STRUCTURE_MUTATED: ${beforeHash} !== ${afterHash}`);
  }
}

function snapshotNode(node: DesignNode): unknown {
  return {
    id: node.id,
    type: node.type,
    role: stringValue(node.props.role) ?? stringValue(node.a11y?.role),
    patternId: stringValue(node.props.patternId) ?? stringValue(node.props.pattern),
    semanticContent: semanticContent(node.props),
    action: node.interactions?.map((interaction) => ({
      event: interaction.event,
      type: interaction.action.type,
      targetScreenId: interaction.action.targetScreenId,
    })),
    children: node.children?.map(snapshotNode),
  };
}

function semanticContent(props: Record<string, unknown>): Record<string, unknown> {
  const result: Record<string, unknown> = {};
  for (const key of ["label", "title", "text", "content", "placeholder", "value", "field", "name", "intent", "importance"]) {
    if (key in props) result[key] = props[key];
  }
  return result;
}

function stringValue(value: unknown): string | undefined {
  return typeof value === "string" ? value : undefined;
}

function fnv1a(value: string): string {
  let hash = 2166136261;
  for (let index = 0; index < value.length; index += 1) {
    hash ^= value.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }
  return (hash >>> 0).toString(16).padStart(8, "0");
}
