import { type CriticReport } from "./critic-gate";
import { validatePatch } from "./patch-validator";
import type { DesignSpec, DesignSpecPatch, PatchOperation } from "./types";

export type RepairIssue = { code: string; nodeId: string; value?: unknown };
export type RepairCycleResult = { patch: DesignSpecPatch; applied: boolean; issues: string[] };

/** Converts critic findings into node-scoped patches; it never regenerates a whole screen. */
export function createTargetedRepair(issue: RepairIssue, baseRevision: number): DesignSpecPatch {
  const operation: PatchOperation = issue.code === "OVERSIZED_HEADING"
    ? { op: "replaceProps", nodeId: issue.nodeId, value: { maxLines: 1, variant: "heading" } }
    : issue.code === "EXCESSIVE_SURFACE_DEPTH"
      ? { op: "replaceProps", nodeId: issue.nodeId, value: { surface: "flat" } }
      : { op: "replaceProps", nodeId: issue.nodeId, value: issue.value ?? { repair: issue.code } };
  return { baseRevision, operations: [operation] };
}

export function runTargetedRepair(
  spec: DesignSpec,
  issue: RepairIssue,
  baseRevision: number,
  apply: (patch: DesignSpecPatch) => DesignSpec,
): RepairCycleResult {
  const patch = createTargetedRepair(issue, baseRevision);
  const issues = validatePatch(spec, patch);
  if (issues.length > 0) return { patch, applied: false, issues };
  apply(patch);
  return { patch, applied: true, issues: [] };
}

export function repairBudget(maxRepairCycles = 2): number {
  return Math.max(0, Math.min(3, Math.floor(maxRepairCycles)));
}

export function criticIsReady(critic: CriticReport | undefined): boolean {
  return critic !== undefined && Number.isFinite(critic.overall);
}

