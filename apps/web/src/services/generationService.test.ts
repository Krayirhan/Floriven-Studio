import { describe, expect, it } from "vitest";
import { createGenerationService } from "./generationService";
import type { ApiClient, ApiRequestInit } from "./apiClient";

describe("generationService", () => {
  it("creates an idempotent generation job request", async () => {
    const calls: { path: string; init?: ApiRequestInit }[] = [];
    const request: ApiClient["request"] = async <T>(path: string, init: ApiRequestInit | undefined) => {
      calls.push(init ? { path, init } : { path });
      return { id: "job-1", projectId: "project-1", status: "queued", progress: 0 } as T;
    };
    const service = createGenerationService({ request });

    await service.create("project-1", { brief: "Bir finans uygulaması oluştur.", platform: "ios" });

    expect(calls[0]).toMatchObject({ path: "/v1/projects/project-1/generation-jobs", init: expect.objectContaining({
      method: "POST",
      headers: expect.objectContaining({ "Idempotency-Key": expect.any(String) }),
    }) });
  });
});
