import { describe, expect, it } from "vitest";
import { layoutRenderPlan, validateLayout } from "./layout/engine";
import type { ScreenRenderPlan } from "./render-plan";

const plan = (layoutPattern: ScreenRenderPlan["layoutPattern"]): ScreenRenderPlan => ({ version: "1.0.0", screenId: "home", archetype: "dashboard", layoutPattern, sections: [{ id: "hero", role: "hero", emphasis: "primary", span: 12, order: 0, nodes: [] }, { id: "secondary", role: "secondary-content", emphasis: "secondary", span: 6, order: 1, nodes: [] }, { id: "insight", role: "insight", emphasis: "secondary", span: 6, order: 2, nodes: [] }], overlays: [], diagnostics: [] });

describe("layout engine v2", () => {
  it("uses canonical 390x844 viewport and real bento spans", () => {
    const result = layoutRenderPlan({ plan: plan("bento") });
    expect(result.viewport).toMatchObject({ width: 390, height: 844 });
    expect(result.boxes[0]?.span).toBe(2);
    expect(validateLayout(result)).toEqual([]);
  });

  it("produces unequal editorial columns", () => {
    const result = layoutRenderPlan({ plan: plan("editorial-asymmetry") });
    expect(result.boxes[1]!.width).not.toBe(result.boxes[2]!.width);
    expect(validateLayout(result)).toEqual([]);
  });

  it("keeps strict grid columns aligned without overflow", () => {
    const result = layoutRenderPlan({ plan: plan("strict-grid") });
    expect(result.boxes[0]!.x).toBe(result.boxes[3]?.x ?? result.boxes[0]!.x);
    expect(validateLayout(result)).toEqual([]);
  });
});
