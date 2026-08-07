import { mapServiceError, ServiceError } from "./serviceErrors";

const API_BASE_URL = import.meta.env.VITE_API_URL ?? "/api";
const DEFAULT_TIMEOUT_MS = 10_000;

export interface ApiClient {
  request<T>(path: string, init?: ApiRequestInit): Promise<T>;
}

export type ApiRequestInit = RequestInit & { timeoutMs?: number };

export function createApiClient(fetcher: typeof fetch = fetch): ApiClient {
  return {
    async request<T>(path: string, init: ApiRequestInit = {}) {
      const controller = new AbortController();
      const timeout = globalThis.setTimeout(() => controller.abort(), init.timeoutMs ?? DEFAULT_TIMEOUT_MS);
      const { timeoutMs: _timeoutMs, ...requestInit } = init;

      try {
        const response = await fetcher(`${API_BASE_URL}${path}`, {
          ...requestInit,
          headers: { Accept: "application/json", ...requestInit.headers },
          signal: controller.signal,
        });
        if (!response.ok) {
          const code = response.status === 401 ? "UNAUTHORIZED" : response.status === 403 ? "FORBIDDEN" : response.status === 404 ? "NOT_FOUND" : "UNKNOWN";
          throw new ServiceError(code, `API isteği başarısız oldu: ${response.status}`, response.status);
        }
        if (response.status === 204) return undefined as T;
        return await response.json() as T;
      } catch (error) {
        throw mapServiceError(error);
      } finally {
        globalThis.clearTimeout(timeout);
      }
    },
  };
}

export const apiClient = createApiClient();
