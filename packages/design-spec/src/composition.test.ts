import { describe, expect, it } from "vitest";
import { DESIGN_TEMPLATES } from "./strategy";
import { createScreenIntent } from "./screen-intent";
import { adaptPresentationV1ToV2 } from "./presentation/compat";
import { composeDashboard } from "./composition/dashboard";
import { composeManagementList } from "./composition/managementList";
import { validateRenderPlan } from "./composition/composeScreen";

const template = DESIGN_TEMPLATES[0];
const strategy = { mode: "template" as const, ...template.strategy, stylePresetId: template.id, rationale: [] };
const presentation = adaptPresentationV1ToV2({ strategy, profile: template.system });

describe("archetype composers", () => {
  it("gives dashboard one dominant metric, trend and actions", () => {
    const intent = createScreenIntent({ screenId: "dashboard", archetype: "dashboard", navigationMode: "root", contentDensity: "medium" });
    const plan = composeDashboard({ intent, presentation, screen: { id: "dashboard", root: { id: "root", type: "Screen", props: {}, children: [{ id: "m1", type: "Metric", props: {} }, { id: "m2", type: "Metric", props: {} }, { id: "chart", type: "Chart", props: {} }, { id: "action", type: "Button", props: {} }] } } });
    expect(plan.sections.map((section) => section.role)).toEqual(["primary-summary", "secondary-metrics", "trend-progress", "actionable-content"]);
    expect(plan.sections[0]?.emphasis).toBe("primary");
    expect(validateRenderPlan(plan)).toEqual([]);
  });

  it("keeps list hierarchy as toolbar, summary, dense rows, action", () => {
    const intent = createScreenIntent({ screenId: "list", archetype: "management_list", navigationMode: "root", contentDensity: "high" });
    const plan = composeManagementList({ intent, presentation, screen: { id: "list", root: { id: "root", type: "Screen", props: {}, children: [{ id: "search", type: "SearchField", props: {} }, { id: "filter", type: "SegmentedControl", props: {} }, { id: "metric", type: "Metric", props: {} }, { id: "row", type: "ListItem", props: {} }, { id: "button", type: "Button", props: {} }] } } });
    expect(plan.sections.map((section) => section.role)).toEqual(["toolbar", "optional-summary", "dense-list", "scoped-action"]);
    expect(plan.sections[2]?.emphasis).toBe("primary");
  });

  it("splits a metric stack into one dominant summary and secondary metrics", () => {
    const intent = createScreenIntent({ screenId: "dashboard", archetype: "dashboard", navigationMode: "root", contentDensity: "medium" });
    const children = Array.from({ length: 5 }, (_, index) => ({ id: `m${index}`, type: "Metric", props: {} }));
    const plan = composeDashboard({ intent, presentation, screen: { id: "dashboard", root: { id: "root", type: "Screen", props: {}, children } } });
    expect(validateRenderPlan(plan)).toEqual([]);
    expect(plan.sections.find((section) => section.role === "primary-summary")?.nodes).toHaveLength(1);
    expect(plan.sections.find((section) => section.role === "secondary-metrics")?.nodes).toHaveLength(4);
    expect(plan.sections.find((section) => section.role === "primary-summary")?.span).toBeGreaterThan(plan.sections.find((section) => section.role === "secondary-metrics")?.span ?? 0);
  });
});
