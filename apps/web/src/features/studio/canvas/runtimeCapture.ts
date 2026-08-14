import { CANONICAL_VIEWPORT, createRuntimeBaselineEntry, measureRuntimeVisualIdentity, type RenderedBounds, type RuntimeBaselineEntry, type RuntimeBaselineCaptureInput, type RuntimeVisualIdentityMetrics } from "@floriven/design-spec";

export interface RuntimeCapture {
  bounds: RenderedBounds[];
  treeSignature: string;
  viewport: { width: 390; height: 844 };
  preview: { transformedWidth: number; transformedHeight: number; scaleX: number; scaleY: number };
  visualIdentity: RuntimeVisualIdentityMetrics;
}
export interface PhoneBaselineCapture extends RuntimeCapture { screenshotDataUrl: string; entry: RuntimeBaselineEntry; }

export async function capturePhoneBaseline(input: Omit<RuntimeBaselineCaptureInput, "bounds" | "treeSignature"> & { root: HTMLElement; renderScreenshot: (root: HTMLElement) => Promise<string>; }): Promise<PhoneBaselineCapture> {
  const runtime = capturePhoneRuntime(input.root);
  const screenshotDataUrl = await input.renderScreenshot(input.root);
  if (!screenshotDataUrl.startsWith("data:image/")) throw new Error("INVALID_BASELINE_SCREENSHOT");
  return { ...runtime, screenshotDataUrl, entry: createRuntimeBaselineEntry({ ...input, bounds: runtime.bounds, treeSignature: runtime.treeSignature }) };
}

/** Collects renderer-owned geometry in canonical phone coordinates. */
export function capturePhoneRuntime(root: HTMLElement): RuntimeCapture {
  const rootRect = root.getBoundingClientRect();
  const logicalWidth = root.offsetWidth || CANONICAL_VIEWPORT.width;
  const logicalHeight = root.offsetHeight || CANONICAL_VIEWPORT.height;
  if (logicalWidth !== CANONICAL_VIEWPORT.width || logicalHeight !== CANONICAL_VIEWPORT.height) throw new Error("NON_CANONICAL_LOGICAL_VIEWPORT");
  const scaleX = rootRect.width / logicalWidth;
  const scaleY = rootRect.height / logicalHeight;
  if (!Number.isFinite(scaleX) || !Number.isFinite(scaleY) || scaleX <= 0 || scaleY <= 0) throw new Error("INVALID_PREVIEW_SCALE");
  const nodes = [...root.querySelectorAll<HTMLElement>("[data-floriven-node-id]")];
  const measuredNodes = nodes.map((node) => {
    const rect = node.getBoundingClientRect();
    return { nodeId: node.dataset.florivenNodeId ?? "", x: round((rect.left - rootRect.left) / scaleX), y: round((rect.top - rootRect.top) / scaleY), width: round(rect.width / scaleX), height: round(rect.height / scaleY), ...(node.dataset.fixed === "true" ? { fixed: true } : {}), ...(node.dataset.semanticContainer === "true" ? { semanticContainer: true } : {}), ...(node.dataset.sectionRole ? { sectionRole: node.dataset.sectionRole } : {}) };
  }).filter((entry) => entry.nodeId).sort((left, right) => left.nodeId.localeCompare(right.nodeId));
  const bounds: RenderedBounds[] = measuredNodes.map(({ nodeId, x, y, width, height, fixed }) => ({ nodeId, x, y, width, height, ...(fixed ? { fixed } : {}) }));
  const treeSignature = nodes.map((node) => `${node.dataset.florivenNodeId}:${node.tagName.toLowerCase()}`).sort().join("|");
  return { bounds, treeSignature, visualIdentity: measureRuntimeVisualIdentity(measuredNodes, CANONICAL_VIEWPORT), viewport: { width: CANONICAL_VIEWPORT.width, height: CANONICAL_VIEWPORT.height }, preview: { transformedWidth: round(rootRect.width), transformedHeight: round(rootRect.height), scaleX: round(scaleX), scaleY: round(scaleY) } };
}

function round(value: number): number { return Math.round(value * 100) / 100; }
