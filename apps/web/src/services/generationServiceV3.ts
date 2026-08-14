import type { A11y, DesignNode, Screen } from "@floriven/design-spec";
import { createFunctionClient, SUPABASE_ANON_KEY, SUPABASE_URL, type CallOptions, type FunctionConfig } from "./generationService";
import type { GenerationJob, GenerationStatus } from "./generationService";

/**
 * Client-side mirror of supabase/functions/generation-v3's wire contracts
 * (http-contract.ts, accepted-design-spec.ts, design-spec-compiler.ts). Duplicated by design,
 * the same way GenerationJob/GenerationRequest already mirror the V2 `generate` function's JSON —
 * an edge function and its browser client are a network boundary, not a shared module.
 */

export type GenerationV3Status = "queued" | "processing" | "awaiting_render" | "render_verifying" | "completed" | "failed";

/** Must match supabase/functions/generation-v3/http-adapter.ts's CANONICAL_RENDERER_VERSION exactly — evidence submitted under any other value is rejected. */
export const V3_CANONICAL_RENDERER_VERSION = "phone-screen-v4";

export interface GenerationV3Request {
  brief: string;
  platform: "ios" | "android" | "web";
  locale?: string;
  deviceProfile?: string;
  requestedScreenCount?: number;
}

interface V3LeafNode {
  id: string;
  type: string;
  props: Record<string, unknown>;
  layout: { size: "hug" | "fill" | "fixed" };
  bindings: Array<{ dataPath: string }>;
  interactions: Array<{ event: "press"; action: { type: "setLocalState"; params: { interaction: string; actionId: string } } }>;
  a11y: { role: string; label: string; hint: string | null; state: string | null; order: number };
  visibility: true;
}
interface V3RegionContainerNode {
  id: string;
  type: "Stack";
  layout: { mode: "column" | "row" | "stack" | "grid" | "absolute" | "scroll"; gap: string };
  children: V3LeafNode[];
  a11y: V3LeafNode["a11y"];
  visibility: true;
}
interface V3ScreenRootNode {
  id: string;
  type: "Screen";
  layout: { mode: "column"; gap: string };
  children: V3RegionContainerNode[];
  a11y: V3LeafNode["a11y"];
  visibility: true;
}
export interface V3DesignSpecScreen {
  id: string;
  name: string;
  route: string;
  root: V3ScreenRootNode;
}

export interface V3AcceptedDesignSpec {
  schemaVersion: string;
  projectId: string;
  platform: "ios" | "android" | "web";
  locale: string;
  deviceProfile: string;
  screens: V3DesignSpecScreen[];
  flows: Array<{ id: string; fromScreenId: string; toScreenId: string }>;
  metadata: {
    acceptedAt: string;
    contentHash: string;
    screenJobIds: string[];
    repairedScreenJobIds: string[];
    renderEvidence: "NOT_VERIFIED" | "BLOCKED" | "VERIFIED";
    releaseEligible: boolean;
  };
}

export interface GenerationV3Job {
  jobId: string;
  projectId: string;
  correlationId: string;
  status: GenerationV3Status;
  stage: string;
  progress: number;
  errorCode?: string;
  errorMessage?: string;
  acceptedDesignSpec?: V3AcceptedDesignSpec;
}

/**
 * Converts a V3 leaf/container node into the canonical V2 DesignNode shape the Studio canvas
 * already renders. Never fabricates a field V3 doesn't have: bindings become presence flags
 * (V2's bindings are an untyped Record, V3's are a typed dataPath list — this is a lossless,
 * honest re-shaping, not invented data), a11y.state is dropped rather than guessed (V2 expects a
 * Record, V3 carries a plain string), and non-container leaf nodes carry no `layout` at all — V3
 * has no concept matching V2's container-only `mode`, so omitting it (Layout is optional on
 * DesignNode) is more honest than inventing an arrangement V3 never decided.
 */
function toV2Node(node: V3RegionContainerNode | V3LeafNode): DesignNode {
  const a11y: A11y = { role: node.a11y.role, label: node.a11y.label, order: node.a11y.order, ...(node.a11y.hint ? { hint: node.a11y.hint } : {}) };
  const isContainer = "children" in node;
  return {
    id: node.id,
    type: node.type,
    // Every container toV2Node ever sees is one of UXStructure's regions (the root itself is
    // built separately in toV2Screens) — so stamping it as a semantic section, using the
    // region's own already-computed a11y.role as the role label, is honest: it's real V3 data,
    // not a fabricated V2 topology role, and it's what capturePhoneRuntime/measureRuntimeVisualIdentity
    // (apps/web/src/features/studio/canvas/runtimeCapture.ts, packages/design-spec) require to
    // recognize a region as a section at all — without this a V3 screen measures zero sections.
    props: isContainer ? { semanticContainer: true, contractSectionRole: node.a11y.role } : (node.props as Record<string, unknown>),
    visibility: node.visibility,
    a11y,
    ...(isContainer ? { layout: { mode: node.layout.mode, gap: node.layout.gap }, children: node.children.map(toV2Node) } : {}),
    ...(!isContainer && node.bindings.length ? { bindings: Object.fromEntries(node.bindings.map((binding) => [binding.dataPath, true])) } : {}),
    ...(!isContainer && node.interactions.length ? { interactions: node.interactions } : {}),
  };
}

export function toV2Screens(screens: V3DesignSpecScreen[]): Screen[] {
  return screens.map((screen) => ({
    id: screen.id,
    name: screen.name,
    route: screen.route,
    root: {
      id: screen.root.id,
      type: screen.root.type,
      props: {},
      layout: { mode: screen.root.layout.mode, gap: screen.root.layout.gap },
      children: screen.root.children.map(toV2Node),
      visibility: screen.root.visibility,
    },
  }));
}

/** Maps a V3 job snapshot into the same GenerationJob shape the rest of Studio state already understands, so V2/V3 are interchangeable past this point. */
export function toGenerationJob(job: GenerationV3Job): GenerationJob {
  const legacyStatus: GenerationStatus =
    job.status === "awaiting_render" || job.status === "render_verifying" ? "processing" : job.status;
  return {
    id: job.jobId,
    projectId: job.projectId,
    status: legacyStatus,
    progress: job.progress,
    stage: job.stage,
    ...(job.errorCode ? { errorCode: job.errorCode } : {}),
    ...(job.errorMessage ? { errorMessage: job.errorMessage } : {}),
    ...(job.acceptedDesignSpec ? { resultScreens: toV2Screens(job.acceptedDesignSpec.screens) } : {}),
    // V3 has no deterministic-fallback path yet — a completed job is always the AI candidate.
    ...(job.status === "completed" ? { compositionMode: "ai_enhanced" as const } : {}),
    degraded: false,
  };
}

export interface V3ScreenRenderEvidence {
  screenJobId: string;
  screenId: string;
  rendererVersion: string;
  contentHash: string;
  viewport: { width: number; height: number };
  metrics: {
    screenJobId: string;
    viewport: { width: number; height: number };
    visibleNodeCount: number;
    sectionCount: number;
    sectionAreaCoveragePct: number;
    verticalOccupancyPct: number;
    nodeDensityPer100kPx: number;
    sectionHeightVariancePct: number;
  };
  screenshotHash?: string;
}

export interface GenerationServiceV3 {
  create(projectId: string, request: GenerationV3Request): Promise<GenerationV3Job>;
  get(jobId: string): Promise<GenerationV3Job>;
  submitRenderEvidence(jobId: string, evidence: V3ScreenRenderEvidence[]): Promise<GenerationV3Job>;
  /** The client sends the user's free-text instruction only — the server plans and validates the actual patch operations. */
  edit(jobId: string, screenId: string, instruction: string, expectedRevision: number): Promise<GenerationV3Job>;
  waitForTerminal(job: GenerationV3Job): Promise<GenerationV3Job>;
}

const GENERATION_TIMEOUT_MS = 15_000;
const STATUS_TIMEOUT_MS = 15_000;
const MAX_STATUS_POLLS = 120;
const STATUS_POLL_INTERVAL_MS = 1_500;

export function createGenerationServiceV3(
  fetcher: typeof fetch = fetch,
  config: FunctionConfig = { url: SUPABASE_URL, anonKey: SUPABASE_ANON_KEY },
): GenerationServiceV3 {
  const callFunction = createFunctionClient(fetcher, config);
  const jobTokens = new Map<string, string>();
  const tokenStorageKey = (jobId: string) => `floriven:generation-v3-job-token:${jobId}`;
  const rememberJobToken = (jobId: string, token: string) => {
    jobTokens.set(jobId, token);
    if (typeof sessionStorage !== "undefined") sessionStorage.setItem(tokenStorageKey(jobId), token);
  };
  const readJobToken = (jobId: string) => {
    const token = jobTokens.get(jobId) ?? (typeof sessionStorage !== "undefined" ? sessionStorage.getItem(tokenStorageKey(jobId)) : null);
    if (!token) throw new Error("Bu üretim işine erişim anahtarı bulunamadı. Üretimi aynı tarayıcı sekmesinden yeniden başlatın.");
    return token;
  };

  const getJob = async (jobId: string) => callFunction<GenerationV3Job>(
    `generation-v3?id=${encodeURIComponent(jobId)}`,
    { headers: { "X-Job-Token": readJobToken(jobId) } },
    { timeoutMs: STATUS_TIMEOUT_MS, retries: 1 } satisfies CallOptions,
  );

  const submitRenderEvidence = async (jobId: string, evidence: V3ScreenRenderEvidence[]) => callFunction<GenerationV3Job>(
    `generation-v3/${encodeURIComponent(jobId)}/render-evidence`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json", "X-Job-Token": readJobToken(jobId) },
      body: JSON.stringify({ jobId, evidence }),
    },
    { timeoutMs: STATUS_TIMEOUT_MS, retries: 1 } satisfies CallOptions,
  );

  const edit = async (jobId: string, screenId: string, instruction: string, expectedRevision: number) => callFunction<GenerationV3Job>(
    `generation-v3/${encodeURIComponent(jobId)}/edit`,
    {
      method: "PATCH",
      headers: { "Content-Type": "application/json", "X-Job-Token": readJobToken(jobId) },
      body: JSON.stringify({ jobId, screenId, instruction, expectedRevision }),
    },
    { timeoutMs: STATUS_TIMEOUT_MS, retries: 1 } satisfies CallOptions,
  );

  const waitForTerminal = async (job: GenerationV3Job): Promise<GenerationV3Job> => {
    let current = job;
    for (let attempt = 0; attempt < MAX_STATUS_POLLS && (current.status === "queued" || current.status === "processing" || current.status === "render_verifying"); attempt += 1) {
      await new Promise((resolve) => setTimeout(resolve, STATUS_POLL_INTERVAL_MS));
      current = await getJob(current.jobId);
    }
    return current;
  };

  return {
    async create(projectId, request) {
      const idempotencyKey = crypto.randomUUID();
      const jobToken = `${crypto.randomUUID()}${crypto.randomUUID()}`;
      const job = await callFunction<GenerationV3Job>("generation-v3", {
        method: "POST",
        headers: { "Content-Type": "application/json", "Idempotency-Key": idempotencyKey, "X-Job-Token": jobToken },
        body: JSON.stringify({ projectId, ...request }),
      }, { timeoutMs: GENERATION_TIMEOUT_MS, retries: 1 });
      rememberJobToken(job.jobId, jobToken);
      return job;
    },
    get: getJob,
    submitRenderEvidence,
    edit,
    waitForTerminal,
  };
}

export const generationServiceV3 = createGenerationServiceV3();
