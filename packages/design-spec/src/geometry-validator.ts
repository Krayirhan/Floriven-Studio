export type RenderedBounds = { nodeId: string; x: number; y: number; width: number; height: number; fixed?: boolean };
export type GeometryIssue = "INVALID_DIMENSION" | "HORIZONTAL_OVERFLOW" | "VERTICAL_OVERFLOW" | "COMPONENT_OVERLAP" | "SAFE_AREA_COLLISION";
export type GeometryReport = {
  issues: GeometryIssue[];
  nodeIssues: Record<string, GeometryIssue[]>;
  overlapPairs: Array<[string, string]>;
};

export function validateGeometry(bounds: readonly RenderedBounds[], viewport: { width: number; height: number; safeTop?: number; safeBottom?: number }): GeometryIssue[] {
  return createGeometryReport(bounds, viewport).issues;
}

/** Keeps node-level evidence so repairs can target the offending node. */
export function createGeometryReport(bounds: readonly RenderedBounds[], viewport: { width: number; height: number; safeTop?: number; safeBottom?: number }): GeometryReport {
  const issues = new Set<GeometryIssue>();
  const nodeIssues: Record<string, GeometryIssue[]> = {};
  const overlapPairs: Array<[string, string]> = [];
  const add = (nodeId: string, issue: GeometryIssue) => {
    issues.add(issue);
    nodeIssues[nodeId] = [...new Set([...(nodeIssues[nodeId] ?? []), issue])];
  };
  for (const box of bounds) {
    if (![box.x, box.y, box.width, box.height].every(Number.isFinite) || box.width <= 0 || box.height <= 0) add(box.nodeId, "INVALID_DIMENSION");
    if (box.x < 0 || box.x + box.width > viewport.width) add(box.nodeId, "HORIZONTAL_OVERFLOW");
    if (box.y < 0 || box.y + box.height > viewport.height) add(box.nodeId, "VERTICAL_OVERFLOW");
    if (box.fixed && (box.y < (viewport.safeTop ?? 0) || box.y + box.height > viewport.height - (viewport.safeBottom ?? 0))) add(box.nodeId, "SAFE_AREA_COLLISION");
  }
  for (let left = 0; left < bounds.length; left += 1) for (let right = left + 1; right < bounds.length; right += 1) {
    const a = bounds[left]; const b = bounds[right];
    if (a && b && a.x < b.x + b.width && a.x + a.width > b.x && a.y < b.y + b.height && a.y + a.height > b.y) {
      add(a.nodeId, "COMPONENT_OVERLAP");
      add(b.nodeId, "COMPONENT_OVERLAP");
      overlapPairs.push([a.nodeId, b.nodeId]);
    }
  }
  return { issues: [...issues], nodeIssues, overlapPairs };
}
