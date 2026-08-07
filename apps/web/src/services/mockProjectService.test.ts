import { describe, expect, it } from "vitest";
import { projectService } from "./index";

describe("mockProjectService", () => {
  it("lists the seeded projects", () => {
    expect(projectService.list()).toHaveLength(3);
  });

  it("creates a draft project summary", () => {
    const project = projectService.create("Test Projesi", "Kısa brief");

    expect(project.name).toBe("Test Projesi");
    expect(project.status).toBe("draft");
    expect(project.screens).toBe(0);
  });
});
