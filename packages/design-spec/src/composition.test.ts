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
    expect(plan.sections.map((section) => section.role)).toEqual(["hero", "summary", "insight", "actions"]);
    expect(plan.sections[0]?.emphasis).toBe("primary");
    expect(validateRenderPlan(plan)).toEqual([]);
  });

  it("keeps list hierarchy as toolbar, summary, dense rows, action", () => {
    const intent = createScreenIntent({ screenId: "list", archetype: "management_list", navigationMode: "root", contentDensity: "high" });
    const plan = composeManagementList({ intent, presentation, screen: { id: "list", root: { id: "root", type: "Screen", props: {}, children: [{ id: "search", type: "SearchField", props: {} }, { id: "filter", type: "SegmentedControl", props: {} }, { id: "metric", type: "Metric", props: {} }, { id: "row", type: "ListItem", props: {} }, { id: "button", type: "Button", props: {} }] } } });
    expect(plan.sections.map((section) => section.role)).toEqual(["toolbar", "summary", "primary-content", "actions"]);
    expect(plan.sections[2]?.emphasis).toBe("primary");
  });

  it("rejects an equal-weight dashboard metric stack", () => {
    const intent = createScreenIntent({ screenId: "dashboard", archetype: "dashboard", navigationMode: "root", contentDensity: "medium" });
    const children = Array.from({ length: 5 }, (_, index) => ({ id: `m${index}`, type: "Metric", props: {} }));
    const plan = composeDashboard({ intent, presentation, screen: { id: "dashboard", root: { id: "root", type: "Screen", props: {}, children } } });
    expect(validateRenderPlan(plan)).toContain("COMPOSITION_RULE_VIOLATION");
  });
});
