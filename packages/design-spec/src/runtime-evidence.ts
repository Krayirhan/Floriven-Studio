import type { GeometryReport } from "./geometry-validator";

export type TrustedNodeBounds = { nodeId: string; x: number; y: number; width: number; height: number };
export type TrustedRuntimeEvidence = {
  renderVersion: string;
  screenshotPath: string;
  viewport: { width: number; height: number };
  nodes: readonly TrustedNodeBounds[];
  geometry: GeometryReport;
  visualCritic: "pending" | "verified";
};

export function isTrustedRuntimeEvidence(value: unknown): value is TrustedRuntimeEvidence {
  if (!value || typeof value !== "object") return false;
  const evidence = value as Partial<TrustedRuntimeEvidence>;
  return typeof evidence.renderVersion === "string" && evidence.renderVersion.length > 0
    && typeof evidence.screenshotPath === "string" && evidence.screenshotPath.length > 0
    && !!evidence.viewport && Number.isFinite(evidence.viewport.width) && Number.isFinite(evidence.viewport.height)
    && Array.isArray(evidence.nodes) && evidence.nodes.every((node) => typeof node.nodeId === "string" && [node.x, node.y, node.width, node.height].every(Number.isFinite))
    && !!evidence.geometry && (evidence.visualCritic === "pending" || evidence.visualCritic === "verified");
}
