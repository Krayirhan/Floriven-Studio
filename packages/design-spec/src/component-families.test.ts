import { describe, expect, it } from "vitest";
import { DESIGN_TEMPLATES } from "./strategy";
import { adaptPresentationV1ToV2 } from "./presentation/compat";
import { resolveCardFamily, resolveControlVariant, resolveFieldVariant } from "./component-families";

const template = DESIGN_TEMPLATES[0];
const strategy = { mode: "template" as const, ...template.strategy, stylePresetId: template.id, rationale: [] };
const presentation = adaptPresentationV1ToV2({ strategy, profile: template.system });

describe("component families", () => {
  it("maps semantic roles to distinct card geometry and classes", () => {
    const hero = resolveCardFamily({ id: "hero", type: "Metric", props: {} }, presentation, "hero");
    const metric = resolveCardFamily({ id: "metric", type: "Metric", props: {} }, presentation, "summary");
    expect(hero.className).not.toBe(metric.className);
    expect(hero.geometry.minHeight).toBeGreaterThan(metric.geometry.minHeight);
  });

  it("uses explicit fallback for unsupported card family", () => {
    const result = resolveCardFamily({ id: "card", type: "Card", props: { family: "unknown" } }, presentation, "summary");
    expect(result.fallback).toBe(true);
    expect(result.fallbackReason).toBe("REQUESTED_CARD_FAMILY_NOT_ALLOWED");
  });

  it("resolves touch-safe controls and field states", () => {
    const control = resolveControlVariant({ id: "switch", type: "Switch", props: { variant: "switch" } }, presentation, "selected");
    const field = resolveFieldVariant({ id: "name", type: "TextField", props: { label: "Ad", error: "Zorunlu" } }, presentation, "error");
    expect(control.minTouchTarget).toBe(44);
    expect(control.ariaPressed).toBe(true);
    expect(field.state).toBe("error");
    expect(field.label).toBe("Ad");
  });
});
