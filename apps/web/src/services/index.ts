import { mockProjectService } from "./mockProjectService";
import type { ProjectService } from "./projectService";
export { apiClient, createApiClient } from "./apiClient";
export { createGenerationService, generationService } from "./generationService";
export { createGenerationServiceV3, generationServiceV3, toGenerationJob } from "./generationServiceV3";
export { ServiceError } from "./serviceErrors";
export type { GenerationJob, GenerationRequest, GenerationService, GenerationStatus } from "./generationService";
export type { GenerationV3Job, GenerationV3Request, GenerationServiceV3 as GenerationV3Service, GenerationV3Status } from "./generationServiceV3";

// Keep the UI independent from the current data source until the API adapter is ready.
export const projectService: ProjectService = mockProjectService;
export type { ProjectService, ProjectStatus, ProjectSummary } from "./projectService";
