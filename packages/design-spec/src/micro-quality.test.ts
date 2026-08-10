import { describe, expect, it } from "vitest";
import { findDesignTemplate } from "./strategy";
import { adaptPresentationV1ToV2 } from "./presentation/compat";
import { resolveInteractionState, resolveMedia, resolveSemanticIcon, resolveTypographyRole, validateTypographyScale } from "./micro-quality";

const template = findDesignTemplate("editorial-culture")!;
const presentation = adaptPresentationV1ToV2({ strategy: { mode: "template", ...template.strategy, stylePresetId: template.id, rationale: [] }, profile: template.system });

describe("micro quality", () => {
  it("resolves readable numeric typography roles", () => {
    expect(resolveTypographyRole("metric", presentation).size).toBe("24px");
    expect(validateTypographyScale(presentation)).toEqual([]);
  });

  it("maps semantic icons to tokens and has a safe fallback", () => {
    expect(resolveSemanticIcon({ id: "save", type: "Icon", props: { icon: "check" } }, presentation).token).toBe("status.success");
    expect(resolveSemanticIcon({ id: "x", type: "Icon", props: { icon: "unknown" } }, presentation).fallback).toBe(true);
  });

  it("resolves image treatment with real alt text or fallback source", () => {
    const media = resolveMedia({ id: "cover", type: "Image", props: { alt: "Kapak görseli", treatment: "editorial-crop" } }, presentation);
    expect(media.source).toBe("editorial-crop");
    expect(media.alt).toBe("Kapak görseli");
    expect(media.fallback).toBe(true);
  });

  it("exposes accessible interaction states", () => {
    expect(resolveInteractionState("disabled")).toMatchObject({ ariaDisabled: true, minTouchTarget: 44 });
    expect(resolveInteractionState("loading")).toMatchObject({ ariaBusy: true });
  });
});
