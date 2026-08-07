import { mockProjectService } from "./mockProjectService";
import type { ProjectService } from "./projectService";
export { apiClient, createApiClient } from "./apiClient";
export { createGenerationService, generationService } from "./generationService";
export { ServiceError } from "./serviceErrors";
export type { GenerationJob, GenerationRequest, GenerationService, GenerationStatus } from "./generationService";

// Keep the UI independent from the current data source until the API adapter is ready.
export const projectService: ProjectService = mockProjectService;
export type { ProjectService, ProjectStatus, ProjectSummary } from "./projectService";
