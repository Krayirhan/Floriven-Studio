import { apiClient, type ApiClient } from "./apiClient";

export type GenerationStatus = "queued" | "processing" | "completed" | "failed";

export interface GenerationJob {
  id: string;
  projectId: string;
  status: GenerationStatus;
  progress: number;
  errorMessage?: string;
  correlationId?: string;
}

export interface GenerationRequest {
  brief: string;
  platform: "ios" | "android" | "web";
  screenScope?: string;
}

export interface GenerationService {
  create(projectId: string, request: GenerationRequest): Promise<GenerationJob>;
  get(jobId: string): Promise<GenerationJob>;
}

export function createGenerationService(client: ApiClient): GenerationService {
  return {
    create(projectId, request) {
      return client.request<GenerationJob>(`/v1/projects/${projectId}/generation-jobs`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Idempotency-Key": crypto.randomUUID(),
        },
        body: JSON.stringify(request),
      });
    },
    get(jobId) {
      return client.request<GenerationJob>(`/v1/generation-jobs/${jobId}`);
    },
  };
}

export const generationService = createGenerationService(apiClient);
