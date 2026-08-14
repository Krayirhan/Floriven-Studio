import { CANONICAL_VIEWPORT, evaluateRuntimeVisualHierarchy, type RuntimeVisualHierarchyReport, type RuntimeVisualIdentityMetrics } from "@floriven/design-spec";
import { capturePhoneRuntime } from "../features/studio/canvas/runtimeCapture";

/**
 * Client-side mirror of supabase/functions/generation-v3/render-critics.ts's RuntimeCaptureMetrics —
 * the wire shape a trusted capture would eventually POST as acceptDesignSpec's render evidence.
 * Percentages (0-100), not fractions, matching that module's own field names.
 */
export interface V3RuntimeCaptureMetrics {
  screenJobId: string;
  viewport: { width: number; height: number };
  visibleNodeCount: number;
  sectionCount: number;
  sectionAreaCoveragePct: number;
  verticalOccupancyPct: number;
  nodeDensityPer100kPx: number;
  sectionHeightVariancePct: number;
}

function round2(value: number): number {
  return Math.round(value * 100) / 100;
}

/** Pure conversion — testable without a real DOM. The 0-1 fractions packages/design-spec measures become the 0-100 percentages the backend evaluator expects. */
export function toV3RuntimeCaptureMetrics(screenJobId: string, identity: RuntimeVisualIdentityMetrics): V3RuntimeCaptureMetrics {
  return {
    screenJobId,
    viewport: { width: CANONICAL_VIEWPORT.width, height: CANONICAL_VIEWPORT.height },
    visibleNodeCount: identity.visibleNodeCount,
    sectionCount: identity.sectionCount,
    sectionAreaCoveragePct: round2(identity.sectionAreaCoverage * 100),
    verticalOccupancyPct: round2(identity.verticalOccupancy * 100),
    nodeDensityPer100kPx: round2(identity.nodeDensityPer100k),
    sectionHeightVariancePct: round2(identity.sectionHeightVariation * 100),
  };
}

export interface V3RuntimeVerification {
  metrics: V3RuntimeCaptureMetrics;
  /**
   * Local, provisional read using the same canonical thresholds the server-side evaluator uses
   * (packages/design-spec's own evaluateRuntimeVisualHierarchy — the exact function V2's runtime
   * gate runs). Per DESIGN_SPEC.md this is never a final verdict on its own: "istemciden hazır
   * geçme/kalma kararı kabul edilmez" — the server re-measures from the same trusted DOM
   * geometry before anything can be marked VERIFIED. Surfacing it here just gives the Studio UI
   * immediate feedback instead of a silent black box.
   */
  provisionalReport: RuntimeVisualHierarchyReport;
}

/**
 * Captures real DOM geometry from an already-rendered V3 screen (a <PhoneScreen> whose root
 * element is passed in) and scores it against the canonical visualHierarchy thresholds. Reuses
 * capturePhoneRuntime and measureRuntimeVisualIdentity/evaluateRuntimeVisualHierarchy completely
 * unchanged — the same trusted recorder and scorer V2 already ships and tests, per ADR-0009's
 * "kanonik DesignSpec korunabilir" (this is the DesignSpec runtime evidence pipeline, not V2
 * domain logic). Throws NON_CANONICAL_LOGICAL_VIEWPORT/INVALID_PREVIEW_SCALE (from
 * capturePhoneRuntime) if the element wasn't actually rendered at the canonical 390x844 size.
 */
export function verifyV3Runtime(screenJobId: string, root: HTMLElement): V3RuntimeVerification {
  const runtime = capturePhoneRuntime(root);
  const metrics = toV3RuntimeCaptureMetrics(screenJobId, runtime.visualIdentity);
  const provisionalReport = evaluateRuntimeVisualHierarchy([runtime.visualIdentity]);
  return { metrics, provisionalReport };
}
