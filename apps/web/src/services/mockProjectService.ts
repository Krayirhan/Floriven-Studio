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

const projects: ProjectSummary[] = [
  {
    id: "prj_finance_01",
    name: "Kişisel Finans",
    description: "Genç profesyoneller için para yönetimi deneyimi",
    screens: 3,
    updatedAt: "Şimdi",
    status: "generated",
    accent: "var(--color-primary)",
  },
  {
    id: "prj_wellness_02",
    name: "Melo Wellness",
    description: "Günlük iyi oluş ve alışkanlık takip uygulaması",
    screens: 6,
    updatedAt: "Dün",
    status: "shared",
    accent: "var(--color-success)",
  },
  {
    id: "prj_shop_03",
    name: "Nora Market",
    description: "Sade ve hızlı market alışveriş deneyimi",
    screens: 4,
    updatedAt: "3 gün önce",
    status: "draft",
    accent: "#E2B04A",
  },
];

export const mockProjectService = {
  list(): ProjectSummary[] {
    return projects;
  },
  find(id: string): ProjectSummary | undefined {
    return projects.find((project) => project.id === id);
  },
  create(name: string, description: string): ProjectSummary {
    return {
      id: `prj_${Date.now()}`,
      name,
      description,
      screens: 0,
      updatedAt: "Şimdi",
      status: "draft",
      accent: "var(--color-primary)",
    };
  },
};
