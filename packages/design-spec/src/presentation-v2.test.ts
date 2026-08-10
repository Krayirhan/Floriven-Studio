import { describe, expect, it } from "vitest";
import { DESIGN_TEMPLATES } from "./strategy";
import { adaptPresentationV1ToV2 } from "./presentation/compat";
import { validatePresentationSpecV2 } from "./presentation/validators";

describe("PresentationSpecV2", () => {
  it("adapts a v1 strategy/profile into a complete resolved contract", () => {
    const template = DESIGN_TEMPLATES[0];
    const spec = adaptPresentationV1ToV2({ strategy: { mode: "template", ...template.strategy, stylePresetId: template.id, rationale: [] }, profile: template.system });
    expect(spec.version).toBe("2.0.0");
    expect(validatePresentationSpecV2(spec)).toEqual([]);
    expect(JSON.parse(JSON.stringify(spec)).version).toBe("2.0.0");
  });

  it("rejects an invalid resolved variant", () => {
    const template = DESIGN_TEMPLATES[0];
    const spec = adaptPresentationV1ToV2({ strategy: { mode: "template", ...template.strategy, stylePresetId: template.id, rationale: [] }, profile: template.system });
    spec.navigation.active = "floating";
    expect(validatePresentationSpecV2(spec)).toContain("ACTIVE_NAVIGATION_NOT_ALLOWED");
  });
});
