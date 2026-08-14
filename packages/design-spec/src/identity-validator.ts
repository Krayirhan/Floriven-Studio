import type { DesignNode, DesignSpec } from "./types";

export type IdentityIssueCode = "DUPLICATE_NODE_ID" | "DUPLICATE_SCREEN_ID" | "INVALID_ACTION_TARGET";
export type IdentityIssue = { code: IdentityIssueCode; message: string; id: string };

export function validateDesignSpecIdentity(spec: Pick<DesignSpec, "screens">): IdentityIssue[] {
  const issues: IdentityIssue[] = [];
  const screenIds = new Set<string>();
  const nodeIds = new Set<string>();
  const walk = (node: DesignNode) => {
    if (nodeIds.has(node.id)) issues.push({ code: "DUPLICATE_NODE_ID", message: `Duplicate node id: ${node.id}`, id: node.id });
    nodeIds.add(node.id);
    for (const interaction of node.interactions ?? []) {
      const target = interaction.action.targetScreenId;
      if (target && !screenIds.has(target) && !spec.screens.some((screen) => screen.id === target)) {
        issues.push({ code: "INVALID_ACTION_TARGET", message: `Unknown action target: ${target}`, id: target });
      }
    }
    node.children?.forEach(walk);
  };
  for (const screen of spec.screens) {
    if (screenIds.has(screen.id)) issues.push({ code: "DUPLICATE_SCREEN_ID", message: `Duplicate screen id: ${screen.id}`, id: screen.id });
    screenIds.add(screen.id);
  }
  spec.screens.forEach((screen) => walk(screen.root));
  return issues;
}
