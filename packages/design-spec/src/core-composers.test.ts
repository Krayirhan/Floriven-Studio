import { describe, expect, it } from "vitest";
import { DESIGN_TEMPLATES } from "./strategy";
import { createScreenIntent } from "./screen-intent";
import { adaptPresentationV1ToV2 } from "./presentation/compat";
import { composeAnalytics, composeDetail, composeForm, composeSettings } from "./composition/coreComposers";
import { validateRenderPlan } from "./composition/composeScreen";

const template = DESIGN_TEMPLATES[0];
const strategy = { mode: "template" as const, ...template.strategy, stylePresetId: template.id, rationale: [] };
const presentation = adaptPresentationV1ToV2({ strategy, profile: template.system });
const screen = (id: string, children: Array<{ id: string; type: string }>) => ({ id, root: { id: `${id}_root`, type: "Screen", props: {}, children: children.map((node) => ({ ...node, props: {} })) } });

describe("core archetype composers", () => {
  it("forms use fields and exactly one completion action without nav", () => {
    const intent = createScreenIntent({ screenId: "form", archetype: "form", navigationMode: "focused", contentDensity: "medium" });
    const plan = composeForm({ intent, presentation, screen: screen("form", [{ id: "field", type: "TextField" }, { id: "save", type: "Button" }]) });
    expect(plan.sections.map((item) => item.role)).toEqual(["field-group", "actions"]);
    expect(validateRenderPlan(plan)).toEqual([]);
  });

  it("detail separates identity, state and timeline", () => {
    const intent = createScreenIntent({ screenId: "detail", archetype: "detail", navigationMode: "focused", contentDensity: "medium" });
    const plan = composeDetail({ intent, presentation, screen: screen("detail", [{ id: "title", type: "Text" }, { id: "state", type: "Progress" }, { id: "event", type: "ListItem" }]) });
    expect(plan.sections.map((item) => item.role)).toEqual(["identity", "primary-state", "metadata"]);
  });

  it("analytics requires and emphasizes a chart", () => {
    const intent = createScreenIntent({ screenId: "analytics", archetype: "analytics", navigationMode: "root", contentDensity: "medium" });
    const plan = composeAnalytics({ intent, presentation, screen: screen("analytics", [{ id: "kpi", type: "Metric" }, { id: "period", type: "SegmentedControl" }, { id: "chart", type: "Chart" }, { id: "breakdown", type: "Chart" }, { id: "insight", type: "ListItem" }]) });
    expect(plan.sections.find((item) => item.role === "dominant-chart")?.emphasis).toBe("primary");
  });

  it("settings rejects global dashboard context", () => {
    const intent = createScreenIntent({ screenId: "settings", archetype: "settings", navigationMode: "root", contentDensity: "medium" });
    const plan = composeSettings({ intent, presentation, screen: screen("settings", [{ id: "metric", type: "Metric" }, { id: "switch", type: "Switch" }]) });
    expect(validateRenderPlan(plan)).toContain("COMPOSITION_RULE_VIOLATION");
  });
});
