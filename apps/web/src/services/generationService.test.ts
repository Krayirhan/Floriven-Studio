import { describe, expect, it } from "vitest";
import { createGenerationService, generationProvenanceMessage, isFinalEligibleGeneration } from "./generationService";

describe("generationService", () => {
  it("does not treat a completed job as final without trusted runtime evidence", () => {
    expect(isFinalEligibleGeneration({ id: "job", projectId: "project", status: "completed", progress: 100 })).toBe(false);
    expect(isFinalEligibleGeneration({
      id: "job", projectId: "project", status: "completed", progress: 100,
      runtimeQualityReport: {
        gates: { geometry: true, visual: true, crossScreen: true },
        pendingGates: [], finalEligible: true,
      },
    })).toBe(true);
  });

  it("labels deterministic fallback without exposing provider internals", () => {
    const message = generationProvenanceMessage({
      id: "job", projectId: "project", status: "completed", progress: 100,
      compositionMode: "deterministic_fallback", degraded: true, fallbackReason: "PROVIDER_TIMEOUT",
    });
    expect(message).toContain("Güvenli otomatik taslak");
    expect(message).not.toContain("PROVIDER_TIMEOUT");
  });

  it("distinguishes accepted AI output from degraded fallback", () => {
    expect(generationProvenanceMessage({
      id: "job", projectId: "project", status: "completed", progress: 100,
      compositionMode: "ai_enhanced", degraded: false,
    })).toContain("AI tarafından özelleştirilmiş");
  });

  it("keeps a controlled quality rejection terminal and non-final", async () => {
    const fetcher: typeof fetch = async () => new Response(JSON.stringify({
      id: "quality-job", projectId: "project-1", status: "queued", stage: "queued", progress: 0,
    }), { status: 202 });
    const service = createGenerationService(fetcher, { url: "https://example.supabase.co", anonKey: "test-key" });
    const job = await service.create("project-1", { brief: "Bir finans uygulaması oluştur.", platform: "ios", designMode: "auto" });
    expect(job.status).toBe("queued");
    expect(isFinalEligibleGeneration(job)).toBe(false);
  });

  it("creates an idempotent generation job request", async () => {
    const requests: Request[] = [];
    const fetcher: typeof fetch = async (input, init) => {
      requests.push(new Request(input, init));
      return new Response(JSON.stringify({ id: "job-1", projectId: "project-1", status: "queued", stage: "queued", progress: 0 }), { status: 202 });
    };
    const service = createGenerationService(fetcher, { url: "https://example.supabase.co", anonKey: "test-key" });

    await service.create("project-1", { brief: "Bir finans uygulaması oluştur.", platform: "ios", designMode: "template", stylePresetId: "obsidian-precision" });

    expect(requests[0]?.url).toBe("https://example.supabase.co/functions/v1/generate");
    expect(requests[0]?.method).toBe("POST");
    expect(requests[0]?.headers.get("Idempotency-Key")).toEqual(expect.any(String));
    expect(requests[0]?.headers.get("X-Job-Token")?.length).toBeGreaterThanOrEqual(64);
    await expect(requests[0]?.json()).resolves.toMatchObject({ designMode: "template", stylePresetId: "obsidian-precision" });
  });

  it("reports an unreachable function with an actionable error", async () => {
    const fetcher: typeof fetch = async () => { throw new TypeError("Failed to fetch"); };
    const service = createGenerationService(fetcher, { url: "https://example.supabase.co", anonKey: "test-key" });

    await expect(service.create("project-1", { brief: "Bir uygulama oluştur.", platform: "ios", designMode: "auto" }))
      .rejects.toThrow("Üretim servisine ulaşılamadı");
  });

  it("retries a network failure once with the same idempotency key", async () => {
    const requests: Request[] = [];
    let attempt = 0;
    const fetcher: typeof fetch = async (input, init) => {
      requests.push(new Request(input, init));
      attempt += 1;
      if (attempt === 1) throw new TypeError("NetworkError when attempting to fetch resource");
      return new Response(JSON.stringify({ id: "job-retry", projectId: "project-1", status: "queued", stage: "queued", progress: 0 }), { status: 202 });
    };
    const service = createGenerationService(fetcher, { url: "https://example.supabase.co", anonKey: "test-key" });

    const job = await service.create("project-1", { brief: "Bir finans uygulaması oluştur.", platform: "ios", designMode: "auto" });

    expect(job.id).toBe("job-retry");
    expect(requests).toHaveLength(2);
    expect(requests[0]?.headers.get("Idempotency-Key")).toBe(requests[1]?.headers.get("Idempotency-Key"));
    expect(requests[0]?.headers.get("X-Job-Token")).toBe(requests[1]?.headers.get("X-Job-Token"));
  });
});
