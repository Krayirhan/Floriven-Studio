import { createRuntimeBaselineEntry, type RenderedBounds, type RuntimeBaselineEntry, type RuntimeBaselineCaptureInput } from "@floriven/design-spec";

export interface RuntimeCapture { bounds: RenderedBounds[]; treeSignature: string; viewport: { width: 390; height: 844 }; }
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
  const nodes = [...root.querySelectorAll<HTMLElement>("[data-floriven-node-id]")];
  const bounds = nodes.map((node) => {
    const rect = node.getBoundingClientRect();
    return { nodeId: node.dataset.florivenNodeId ?? "", x: round(rect.left - rootRect.left), y: round(rect.top - rootRect.top), width: round(rect.width), height: round(rect.height), ...(node.dataset.fixed === "true" ? { fixed: true } : {}) };
  }).filter((entry) => entry.nodeId).sort((left, right) => left.nodeId.localeCompare(right.nodeId));
  const treeSignature = nodes.map((node) => `${node.dataset.florivenNodeId}:${node.tagName.toLowerCase()}`).sort().join("|");
  return { bounds, treeSignature, viewport: { width: 390, height: 844 } };
}

function round(value: number): number { return Math.round(value * 100) / 100; }
