export type ProjectStatus = "draft" | "generated" | "shared";

export interface ProjectSummary {
  id: string;
  name: string;
  description: string;
  screens: number;
  updatedAt: string;
  status: ProjectStatus;
  accent: string;
}

export interface ProjectService {
  list(): ProjectSummary[];
  find(id: string): ProjectSummary | undefined;
  create(name: string, description: string): ProjectSummary;
}
