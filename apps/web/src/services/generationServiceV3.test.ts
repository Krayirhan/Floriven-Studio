import { describe, expect, it } from "vitest";
import { createGenerationServiceV3, toGenerationJob, toV2Screens, type GenerationV3Job, type V3DesignSpecScreen } from "./generationServiceV3";

const sampleV3Screen: V3DesignSpecScreen = {
  id: "scr_weekly-schedule",
  name: "Haftalık Takvim",
  route: "/weekly-schedule",
  root: {
    id: "node_weekly-schedule_root",
    type: "Screen",
    layout: { mode: "column", gap: "space.4" },
    a11y: { role: "main", label: "Haftalık Takvim", hint: null, state: null, order: 0 },
    visibility: true,
    children: [
      {
        id: "node_weekly-schedule_region-calendar",
        type: "Stack",
        layout: { mode: "column", gap: "space.4" },
        a11y: { role: "birincil etkileşim alanı", label: "Haftalık takvim bölgesi odaklandı", hint: null, state: null, order: 1 },
        visibility: true,
        children: [
          {
            id: "node_weekly-schedule_node-calendar",
            type: "Calendar",
            props: { title: "Salı 14:00 Ahşap Villa saha ziyareti" },
            layout: { size: "fill" },
            bindings: [{ dataPath: "ziyaret zamanı" }],
            interactions: [{ event: "press", action: { type: "setLocalState", params: { interaction: "inspect", actionId: "action-inspect" } } }],
            a11y: { role: "content", label: "Salı 14:00 Ahşap Villa saha ziyareti", hint: null, state: null, order: 1 },
            visibility: true,
          },
        ],
      },
    ],
  },
};

describe("toV2Screens", () => {
  it("carries id, name, route and node type/props through unchanged", () => {
    const [screen] = toV2Screens([sampleV3Screen]);
    expect(screen).toBeDefined();
    expect(screen?.id).toBe("scr_weekly-schedule");
    expect(screen?.name).toBe("Haftalık Takvim");
    expect(screen?.route).toBe("/weekly-schedule");
    expect(screen?.root.type).toBe("Screen");
    expect(screen?.root.children?.[0]?.type).toBe("Stack");
    const leaf = screen?.root.children?.[0]?.children?.[0];
    expect(leaf?.type).toBe("Calendar");
    expect(leaf?.props.title).toBe("Salı 14:00 Ahşap Villa saha ziyareti");
  });

  it("converts the typed dataPath binding list into a presence-flag record without inventing values", () => {
    const [screen] = toV2Screens([sampleV3Screen]);
    const leaf = screen?.root.children?.[0]?.children?.[0];
    expect(leaf?.bindings).toEqual({ "ziyaret zamanı": true });
  });

  it("carries interactions through unchanged", () => {
    const [screen] = toV2Screens([sampleV3Screen]);
    const leaf = screen?.root.children?.[0]?.children?.[0];
    expect(leaf?.interactions).toEqual([{ event: "press", action: { type: "setLocalState", params: { interaction: "inspect", actionId: "action-inspect" } } }]);
  });

  it("omits layout on leaf nodes instead of fabricating a container mode they never had", () => {
    const [screen] = toV2Screens([sampleV3Screen]);
    const leaf = screen?.root.children?.[0]?.children?.[0];
    expect(leaf?.layout).toBeUndefined();
  });

  it("carries container layout mode/gap through unchanged", () => {
    const [screen] = toV2Screens([sampleV3Screen]);
    expect(screen?.root.children?.[0]?.layout).toEqual({ mode: "column", gap: "space.4" });
  });
});

describe("toGenerationJob", () => {
  it("maps a completed V3 job into the shared GenerationJob shape with adapted screens", () => {
    const v3Job: GenerationV3Job = {
      jobId: "job_1", projectId: "prj_1", correlationId: "corr_1", status: "completed", stage: "completed", progress: 100,
      acceptedDesignSpec: {
        schemaVersion: "1.0.0", projectId: "prj_1", platform: "ios", locale: "tr-TR", deviceProfile: "phone-default",
        screens: [sampleV3Screen], flows: [],
        metadata: { acceptedAt: "2026-01-01T00:00:00.000Z", contentHash: "abc123", screenJobIds: ["weekly-schedule"], repairedScreenJobIds: [], renderEvidence: "NOT_VERIFIED", releaseEligible: false },
      },
    };
    const job = toGenerationJob(v3Job);
    expect(job.id).toBe("job_1");
    expect(job.status).toBe("completed");
    expect(job.resultScreens).toHaveLength(1);
    expect(job.compositionMode).toBe("ai_enhanced");
    expect(job.degraded).toBe(false);
  });

  it("maps a failed V3 job with its error code/message and no result screens", () => {
    const v3Job: GenerationV3Job = { jobId: "job_2", projectId: "prj_1", correlationId: "corr_2", status: "failed", stage: "failed", progress: 100, errorCode: "V3_PRODUCT_MODEL_FAILED", errorMessage: "response: strict JSON parsing failed" };
    const job = toGenerationJob(v3Job);
    expect(job.status).toBe("failed");
    expect(job.errorCode).toBe("V3_PRODUCT_MODEL_FAILED");
    expect(job.resultScreens).toBeUndefined();
    expect(job.compositionMode).toBeUndefined();
  });
});

describe("createGenerationServiceV3", () => {
  it("creates a job against the generation-v3 function with idempotency and job-token headers", async () => {
    const requests: Request[] = [];
    const fetcher: typeof fetch = async (input, init) => {
      requests.push(new Request(input, init));
      return new Response(JSON.stringify({ jobId: "job-1", projectId: "project-1", correlationId: "corr-1", status: "queued", stage: "queued", progress: 0 }), { status: 202 });
    };
    const service = createGenerationServiceV3(fetcher, { url: "https://example.supabase.co", anonKey: "test-key" });

    const job = await service.create("project-1", { brief: "Mimarlar için proje ve saha takvimi", platform: "ios" });

    expect(job.status).toBe("queued");
    expect(requests[0]?.url).toBe("https://example.supabase.co/functions/v1/generation-v3");
    expect(requests[0]?.method).toBe("POST");
    expect(requests[0]?.headers.get("Idempotency-Key")).toEqual(expect.any(String));
    expect(requests[0]?.headers.get("X-Job-Token")?.length).toBeGreaterThanOrEqual(64);
    await expect(requests[0]?.json()).resolves.toMatchObject({ projectId: "project-1", brief: "Mimarlar için proje ve saha takvimi", platform: "ios" });
  });

  it("polls with the remembered job token until the job reaches a terminal state", async () => {
    let calls = 0;
    const fetcher: typeof fetch = async (input) => {
      const url = String(input);
      if (url.includes("?id=")) {
        calls += 1;
        const status = calls < 2 ? "processing" : "completed";
        return new Response(JSON.stringify({ jobId: "job-1", projectId: "project-1", correlationId: "corr-1", status, stage: status, progress: calls < 2 ? 50 : 100 }), { status: 200 });
      }
      return new Response(JSON.stringify({ jobId: "job-1", projectId: "project-1", correlationId: "corr-1", status: "queued", stage: "queued", progress: 0 }), { status: 202 });
    };
    const service = createGenerationServiceV3(fetcher, { url: "https://example.supabase.co", anonKey: "test-key" });
    const created = await service.create("project-1", { brief: "Mimarlar için proje ve saha takvimi", platform: "ios" });
    const finished = await service.waitForTerminal(created);
    expect(finished.status).toBe("completed");
    expect(calls).toBeGreaterThanOrEqual(2);
  });

  it("refuses to poll a job whose token was never remembered in this session", async () => {
    const fetcher: typeof fetch = async () => new Response(JSON.stringify({}), { status: 200 });
    const service = createGenerationServiceV3(fetcher, { url: "https://example.supabase.co", anonKey: "test-key" });
    await expect(service.get("unknown-job-id")).rejects.toThrow(/erişim anahtarı bulunamadı/);
  });
});
