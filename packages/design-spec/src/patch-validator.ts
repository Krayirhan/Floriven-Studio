import type { DesignNode, DesignSpec, DesignSpecPatch } from "./types";

function nodeIds(node: DesignNode): string[] { return [node.id, ...(node.children ?? []).flatMap(nodeIds)]; }

/** Validates repair patches before application; it never mutates the document. */
export function validatePatch(spec: DesignSpec, patch: DesignSpecPatch): string[] {
  const issues: string[] = [];
  const ids = new Set(spec.screens.flatMap((screen) => nodeIds(screen.root)));
  for (const operation of patch.operations) {
    if (["removeNode", "moveNode", "replaceProps", "replaceLayout"].includes(operation.op) && (!operation.nodeId || !ids.has(operation.nodeId))) issues.push("PATCH_TARGET_NOT_FOUND");
    if (operation.op === "addNode") {
      const value = operation.value as Partial<DesignNode> | undefined;
      if (!value?.id) issues.push("PATCH_NODE_ID_REQUIRED");
      else if (ids.has(value.id)) issues.push("PATCH_NODE_ID_COLLISION");
    }
    if (operation.op === "setToken" && (typeof operation.value !== "object" || operation.value === null)) issues.push("PATCH_TOKEN_VALUE_INVALID");
  }
  return [...new Set(issues)];
}
