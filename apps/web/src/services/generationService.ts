import type { DesignTemplateId, GenerationDesignMode, ProductBlueprint, Screen } from "@floriven/design-spec";

export type GenerationStatus = "queued" | "processing" | "completed" | "failed";

export interface GenerationJob {
  id: string;
  projectId: string;
  status: GenerationStatus;
  progress: number;
  errorMessage?: string;
  resultScreens?: Screen[];
  productBlueprint?: ProductBlueprint;
  domainPackId?: "health-care" | "commerce" | "learning" | "publishing" | "operations";
  stylePresetId?: DesignTemplateId;
  qualityReport?: {
    score: number;
    passed: boolean;
    issues: string[];
    metrics: Record<string, number>;
  };
  runtimeQualityReport?: {
    gates: { geometry: boolean; visual: boolean; crossScreen: boolean };
    pendingGates: Array<"visual" | "crossScreen">;
    finalEligible: boolean;
    recordedAt?: string;
  };
}

/** A completed job can be previewed, but only this flag permits final delivery. */
export function isFinalEligibleGeneration(job: GenerationJob): boolean {
  return job.status === "completed" && job.runtimeQualityReport?.finalEligible === true;
}

export interface GenerationRequest {
  brief: string;
  platform: "ios" | "android" | "web";
  screenScope?: string;
  requestedScreenCount?: number;
  minScreenCount?: number;
  maxScreenCount?: number;
  designMode: GenerationDesignMode;
  stylePresetId?: DesignTemplateId;
  /** @deprecated Sent only by older clients; server maps it to stylePresetId. */
  templateId?: DesignTemplateId;
  /**
   * Screens the project already has. When present, `brief` is read as an edit
   * instruction against them instead of a from-scratch product description —
   * the server reconstructs the ProductBlueprint from these screens so the
   * product identity (names, routes, navigation) can't drift out from under it.
   */
  editScreens?: Screen[];
}

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL as string;
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY as string;

export interface GenerationService {
  create(projectId: string, request: GenerationRequest): Promise<GenerationJob>;
  get(jobId: string): Promise<GenerationJob>;
}

type FunctionConfig = { url: string; anonKey: string };
type CallOptions = { timeoutMs?: number; retries?: number };

const GENERATION_TIMEOUT_MS = 180_000;
const STATUS_TIMEOUT_MS = 15_000;
const MAX_STATUS_POLLS = 40;
const STATUS_POLL_INTERVAL_MS = 1_500;

function functionBaseUrl(url: string): string {
  try {
    const parsed = new URL(url);
    if (parsed.protocol !== "https:" && !(parsed.protocol === "http:" && parsed.hostname === "localhost")) {
      throw new Error("unsupported protocol");
    }
    return parsed.toString().replace(/\/$/, "");
  } catch {
    throw new Error("Üretim servisi adresi geçersiz. VITE_SUPABASE_URL için geçerli bir https://…supabase.co URL'si girin.");
  }
}

function createFunctionClient(fetcher: typeof fetch, config: FunctionConfig) {
  return async function callFunction<T>(path: string, init: RequestInit = {}, options: CallOptions = {}): Promise<T> {
    if (!config.url || !config.anonKey) {
      throw new Error("Üretim servisi yapılandırılmamış. VITE_SUPABASE_URL ve VITE_SUPABASE_ANON_KEY değerlerini kontrol edin.");
    }

    const baseUrl = functionBaseUrl(config.url);
    const retries = options.retries ?? 0;
    const timeoutMs = options.timeoutMs ?? STATUS_TIMEOUT_MS;

    for (let attempt = 0; attempt <= retries; attempt += 1) {
      const controller = new AbortController();
      const timer = setTimeout(() => controller.abort(), timeoutMs);
      try {
        const res = await fetcher(`${baseUrl}/functions/v1/${path}`, {
          ...init,
          signal: controller.signal,
          headers: {
            apikey: config.anonKey,
            Authorization: `Bearer ${config.anonKey}`,
            ...init.headers,
          },
        });
        if ([502, 503, 504].includes(res.status) && attempt < retries) continue;
        const data: unknown = await res.json().catch(() => ({}));
        if (!res.ok) throw new Error((data as { error?: string }).error ?? `HTTP ${res.status}`);
        return data as T;
      } catch (error) {
        const timedOut = controller.signal.aborted;
        if (attempt < retries && (timedOut || error instanceof TypeError)) continue;
        if (timedOut) {
          throw new Error("Üretim servisi zaman aşımına uğradı. İş güvenli biçimde sorgulanacak; tekrar denerseniz aynı işlem çoğaltılmaz.", { cause: error });
        }
        if (error instanceof TypeError) {
          throw new Error("Üretim servisine ulaşılamadı. Bağlantı otomatik olarak yeniden denendi; Supabase URL'sini ve internet bağlantısını kontrol edin.", { cause: error });
        }
        throw error;
      } finally {
        clearTimeout(timer);
      }
    }
    throw new Error("Üretim servisine ulaşılamadı.");
  };
}

export function createGenerationService(
  fetcher: typeof fetch = fetch,
  config: FunctionConfig = { url: SUPABASE_URL, anonKey: SUPABASE_ANON_KEY },
): GenerationService {
  const callFunction = createFunctionClient(fetcher, config);
  const jobTokens = new Map<string, string>();
  const tokenStorageKey = (jobId: string) => `floriven:generation-job-token:${jobId}`;
  const rememberJobToken = (jobId: string, token: string) => {
    jobTokens.set(jobId, token);
    if (typeof sessionStorage !== "undefined") sessionStorage.setItem(tokenStorageKey(jobId), token);
  };
  const readJobToken = (jobId: string) => {
    const token = jobTokens.get(jobId) ?? (typeof sessionStorage !== "undefined" ? sessionStorage.getItem(tokenStorageKey(jobId)) : null);
    if (!token) throw new Error("Bu üretim işine erişim anahtarı bulunamadı. Üretimi aynı tarayıcı sekmesinden yeniden başlatın.");
    return token;
  };

  const getJob = (jobId: string) => callFunction<GenerationJob>(
    `generate?id=${encodeURIComponent(jobId)}`,
    { headers: { "X-Job-Token": readJobToken(jobId) } },
    { timeoutMs: STATUS_TIMEOUT_MS, retries: 1 },
  );

  const waitForTerminalJob = async (job: GenerationJob): Promise<GenerationJob> => {
    let current = job;
    for (let attempt = 0; attempt < MAX_STATUS_POLLS && (current.status === "queued" || current.status === "processing"); attempt += 1) {
      await new Promise((resolve) => setTimeout(resolve, STATUS_POLL_INTERVAL_MS));
      current = await getJob(current.id);
    }
    return current;
  };

  return {
    async create(projectId, request) {
      const idempotencyKey = crypto.randomUUID();
      const jobToken = `${crypto.randomUUID()}${crypto.randomUUID()}`;
      const job = await callFunction<GenerationJob>("generate", {
        method: "POST",
        headers: { "Content-Type": "application/json", "Idempotency-Key": idempotencyKey, "X-Job-Token": jobToken },
        body: JSON.stringify({ projectId, ...request }),
      }, { timeoutMs: GENERATION_TIMEOUT_MS, retries: 1 });
      rememberJobToken(job.id, jobToken);
      return waitForTerminalJob(job);
    },
    get(jobId) {
      return getJob(jobId);
    },
  };
}

export const generationService = createGenerationService();
