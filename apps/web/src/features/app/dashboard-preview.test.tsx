import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { DESIGN_TEMPLATE_IDS } from "@floriven/design-spec";
import { StylePresetPreview } from "./dashboard-preview";

describe("StylePresetPreview", () => {
  it("renders the same neutral product vocabulary for every visual system", () => {
    const renders = DESIGN_TEMPLATE_IDS.map((presetId) => renderToStaticMarkup(<StylePresetPreview presetId={presetId} />));
    for (const html of renders) {
      expect(html).toContain("Kuzey Studio");
      expect(html).toContain("Atlas Coffee");
      expect(html).toContain("₺38.500");
      expect(html).not.toMatch(/ilaç|tansiyon|ders|sepet/i);
    }
  });

  it("binds a distinct token set and preset identity to all five previews", () => {
    const renders = DESIGN_TEMPLATE_IDS.map((presetId) => renderToStaticMarkup(<StylePresetPreview presetId={presetId} />));
    expect(new Set(renders).size).toBe(5);
    DESIGN_TEMPLATE_IDS.forEach((presetId, index) => expect(renders[index]).toContain(`data-preset="${presetId}"`));
  });
});
