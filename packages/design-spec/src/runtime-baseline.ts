import { CANONICAL_VIEWPORT } from "./layout/types";
import type { RenderedBounds } from "./geometry-validator";
import { createSemanticHash } from "./semantic-hash";

export const RUNTIME_RENDERER_VERSION = "phone-screen-v2" as const;
export const CANONICAL_ARCHETYPES = ["dashboard", "management_list", "form", "detail", "analytics", "settings"] as const;
export const CANONICAL_VISUAL_MODES = ["obsidian", "serene", "terracotta", "electric", "editorial", "auto", "deterministic"] as const;

export interface RuntimeBaselineEntry { mode: (typeof CANONICAL_VISUAL_MODES)[number]; archetype: (typeof CANONICAL_ARCHETYPES)[number]; screenId: string; screenshotPath: string; treeSignature: string; boundsPath: string; candidateHash: string; rendererVersion: typeof RUNTIME_RENDERER_VERSION; viewport: typeof CANONICAL_VIEWPORT; }
export interface RuntimeBaselineManifest { version: "1.0.0"; generatedAt: string; viewport: typeof CANONICAL_VIEWPORT; rendererVersion: typeof RUNTIME_RENDERER_VERSION; entries: RuntimeBaselineEntry[]; knownFailures: string[]; }

export interface RuntimeBaselineCaptureInput {
  mode: RuntimeBaselineEntry["mode"];
  archetype: RuntimeBaselineEntry["archetype"];
  screenId: string;
  screenshotPath: string;
  boundsPath: string;
  treeSignature: string;
  bounds: readonly RenderedBounds[];
  candidateHash?: string;
}

export function createEmptyRuntimeBaselineManifest(generatedAt: string): RuntimeBaselineManifest { return { version: "1.0.0", generatedAt, viewport: CANONICAL_VIEWPORT, rendererVersion: RUNTIME_RENDERER_VERSION, entries: [], knownFailures: [] }; }
export function createRuntimeBaselineEntry(input: RuntimeBaselineCaptureInput): RuntimeBaselineEntry {
  const candidateHash = input.candidateHash ?? createSemanticHash({ screens: [{ id: input.screenId, name: input.screenId, root: { id: input.screenId, type: "Screen", props: { treeSignature: input.treeSignature, bounds: input.bounds } } }], flows: [] });
  return { mode: input.mode, archetype: input.archetype, screenId: input.screenId, screenshotPath: input.screenshotPath, treeSignature: input.treeSignature, boundsPath: input.boundsPath, candidateHash, rendererVersion: RUNTIME_RENDERER_VERSION, viewport: CANONICAL_VIEWPORT };
}
export function validateRuntimeBaselineManifest(manifest: RuntimeBaselineManifest): string[] { const issues: string[] = []; if (manifest.version !== "1.0.0") issues.push("UNSUPPORTED_MANIFEST_VERSION"); if (manifest.viewport.width !== 390 || manifest.viewport.height !== 844) issues.push("NON_CANONICAL_VIEWPORT"); if (manifest.rendererVersion !== RUNTIME_RENDERER_VERSION) issues.push("RENDERER_VERSION_MISMATCH"); const keys = new Set<string>(); for (const entry of manifest.entries) { const key = `${entry.mode}:${entry.archetype}`; if (keys.has(key)) issues.push(`DUPLICATE_ENTRY:${key}`); keys.add(key); if (entry.viewport.width !== 390 || entry.viewport.height !== 844) issues.push(`ENTRY_VIEWPORT_MISMATCH:${key}`); if (!entry.screenshotPath || !entry.boundsPath || !entry.treeSignature || !entry.candidateHash) issues.push(`INCOMPLETE_ENTRY:${key}`); } return issues; }
