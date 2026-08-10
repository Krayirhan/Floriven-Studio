import { describe, expect, it } from "vitest";
import { DESIGN_TEMPLATES } from "./strategy";
import { createScreenIntent } from "./screen-intent";
import { adaptPresentationV1ToV2 } from "./presentation/compat";
import { composeScreen, validateRenderPlan } from "./composition/composeScreen";

const template = DESIGN_TEMPLATES[0];
const strategy = { mode: "template" as const, ...template.strategy, stylePresetId: template.id, rationale: [] };
const intent = createScreenIntent({ screenId: "home", archetype: "dashboard", navigationMode: "root", contentDensity: "medium" });
const presentation = adaptPresentationV1ToV2({ strategy, profile: template.system, screenIntent: intent });

describe("RenderPlan", () => {
  it("reorders semantic nodes into stable visual sections", () => {
    const plan = composeScreen({ screen: { id: "home", root: { id: "root", type: "Screen", props: {}, children: [{ id: "chart", type: "Chart", props: {} }, { id: "metric", type: "Metric", props: {} }, { id: "bar", type: "TopAppBar", props: {} }] } }, intent, presentation });
    expect(plan.sections.map((section) => section.role)).toEqual(["hero", "toolbar", "insight"]);
    expect(plan.sections.map((section) => section.order)).toEqual([0, 1, 2]);
    expect(validateRenderPlan(plan)).toEqual([]);
  });

  it("reports unknown nodes explicitly", () => {
    const plan = composeScreen({ screen: { id: "home", root: { id: "root", type: "Screen", props: {}, children: [{ id: "unknown", type: "MysteryNode", props: {} }] } }, intent, presentation });
    expect(plan.diagnostics[0]?.code).toBe("UNKNOWN_NODE_TYPE");
    expect(validateRenderPlan(plan)).toContain("UNKNOWN_NODE_TYPE");
  });

  it("is serializable and deterministic", () => {
    const input = { screen: { id: "home", root: { id: "root", type: "Screen", props: {}, children: [{ id: "metric", type: "Metric", props: {} }] } }, intent, presentation };
    expect(composeScreen(input)).toEqual(composeScreen(input));
    expect(JSON.parse(JSON.stringify(composeScreen(input))).screenId).toBe("home");
  });
});
