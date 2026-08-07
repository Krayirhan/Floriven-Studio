import { describe, expect, it, vi } from "vitest";
import { createApiClient } from "./apiClient";
import { ServiceError } from "./serviceErrors";

describe("apiClient", () => {
  it("maps successful JSON responses", async () => {
    const fetcher = vi.fn<typeof fetch>().mockResolvedValue(new Response(JSON.stringify({ ok: true }), { status: 200 }));
    const result = await createApiClient(fetcher).request<{ ok: boolean }>("/health");
    expect(result.ok).toBe(true);
    expect(fetcher).toHaveBeenCalledWith("/api/health", expect.objectContaining({ headers: { Accept: "application/json" }, signal: expect.any(AbortSignal) }));
  });

  it("maps unauthorized responses to a typed service error", async () => {
    const fetcher = vi.fn<typeof fetch>().mockResolvedValue(new Response(null, { status: 401 }));
    await expect(createApiClient(fetcher).request("/private")).rejects.toMatchObject({ code: "UNAUTHORIZED" } satisfies Partial<ServiceError>);
  });
});
