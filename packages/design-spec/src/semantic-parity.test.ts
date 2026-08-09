import { describe, expect, it } from "vitest";
import { createSemanticHash } from "./semantic-hash";
import { createPresentationSpec } from "./presentation-spec";
import { DESIGN_TEMPLATES } from "./strategy";
import type { DesignSpec } from "./types";

const fixture: Pick<DesignSpec, "screens" | "flows"> = {
  screens: [{ id: "home", name: "Home", route: "/", root: {
    id: "root", type: "Screen", props: { title: "Overview", palette: "visual-only" },
    children: [{ id: "summary", type: "MetricCard", props: { label: "Revenue", value: "₺100" }, interactions: [{ event: "tap", action: { type: "navigate", targetScreenId: "details" } }] }],
  } }, { id: "details", name: "Details", route: "/details", root: { id: "details-root", type: "Screen", props: {}, children: [] } }],
  flows: [{ from: "home", to: "details", trigger: "tap" }],
};

describe("zero-model semantic parity", () => {
  it("keeps one semantic fixture hash across auto and every catalog preset", () => {
    const baseline = createSemanticHash(fixture);
    const modes = ["auto", ...DESIGN_TEMPLATES.map((template) => template.id)];
    expect(modes.length).toBeGreaterThanOrEqual(6);
    for (const mode of modes) {
      const presentation = mode === "auto" ? undefined : createPresentationSpec(DESIGN_TEMPLATES.find((template) => template.id === mode)!);
      expect(createSemanticHash({ screens: fixture.screens, flows: fixture.flows })).toBe(baseline);
      expect(presentation?.version ?? "auto").toMatch(/^(auto|1\.0\.0)$/);
    }
  });

  it("ignores visual-only token changes but detects semantic mutations", () => {
    const visualVariant = structuredClone(fixture);
    visualVariant.screens[0]!.root.props.palette = "editorial";
    visualVariant.screens[0]!.root.props.cardStyle = "crisp";
    expect(createSemanticHash(visualVariant)).toBe(createSemanticHash(fixture));

    const semanticVariant = structuredClone(fixture);
    semanticVariant.screens[0]!.root.children![0]!.interactions![0]!.action.targetScreenId = "home";
    expect(createSemanticHash(semanticVariant)).not.toBe(createSemanticHash(fixture));
  });
});
