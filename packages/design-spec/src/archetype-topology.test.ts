import { describe, expect, it } from "vitest";
import { compileVisualScreen } from "./visual-compiler";
import { findDesignTemplate } from "./strategy";
import type { Screen } from "./types";

const template = findDesignTemplate("obsidian-precision")!;
const strategy = { mode: "template" as const, ...template.strategy, stylePresetId: template.id, rationale: [] };
const node = (id: string, type: string, props: Record<string, unknown> = {}) => ({ id, type, props });
const compile = (archetype: string, children: ReturnType<typeof node>[]): ReturnType<typeof compileVisualScreen> => compileVisualScreen({
  screen: { id: archetype, name: archetype, root: { id: `${archetype}-root`, type: "Screen", props: { screenIntent: { archetype, navigationMode: archetype === "form" || archetype === "detail" ? "focused" : "root", contentDensity: "medium" } }, children } } as Screen,
  strategy,
  styleSystemProfile: template.system,
});

describe("archetype topology contracts", () => {
  it("uses the required dashboard topology and an asymmetric dominant region", () => {
    const result = compile("dashboard", [node("title", "Text"), node("main", "Metric"), node("income", "Metric"), node("expense", "Metric"), node("trend", "Chart"), node("action", "Button")]);
    expect(result.renderPlan.sections.map((section) => section.role)).toEqual(["primary-summary", "secondary-metrics", "trend-progress", "actionable-content"]);
    expect(result.renderPlan.sections[0]?.span).toBeGreaterThan(result.renderPlan.sections[1]?.span ?? 0);
  });

  it("rejects forbidden settings and analytics structures", () => {
    const settings = compile("settings", [node("metric", "Metric"), node("chart", "Chart"), node("row", "ListItem")]);
    const analytics = compile("analytics", [node("kpi", "Metric"), node("chart", "Chart")]);
    expect(settings.renderPlan.diagnostics.map((issue) => issue.detail).join(" ")).toMatch(/cannot contain/);
    expect(analytics.renderPlan.diagnostics.map((issue) => issue.detail).join(" ")).toMatch(/require/);
  });

  it("routes otherwise unassigned semantic nodes through an archetype fallback before actions", () => {
    const result = compile("form", [node("title", "Text"), node("field", "TextField"), node("unknown", "Card"), node("save", "Button")]);
    const fallback = result.renderPlan.sections.find((section) => section.resolvedFamily === "form-semantic-content");
    expect(fallback?.role).toBe("optional-summary");
    expect(result.renderPlan.diagnostics.some((issue) => issue.code === "UNASSIGNED_NODE_FALLBACK" && issue.nodeId === "unknown")).toBe(true);
    expect(result.renderPlan.sections.findIndex((section) => section.resolvedFamily === "form-semantic-content")).toBeLessThan(result.renderPlan.sections.findIndex((section) => section.role === "actions"));
  });
});
