import { describe, expect, it } from "vitest";
import { validateTypographyBudget } from "./typography-budget";

describe("typography and viewport budget", () => {
  it("rejects display hierarchy and raw spacing in operational screens", () => {
    const screen = { screenId: "settings", archetype: "settings" as const, navigationMode: "root" as const, contentDensity: "medium" as const };
    expect(validateTypographyBudget({ type: "Screen", layout: { gap: "17px" }, children: [{ type: "Text", props: { variant: "display", maxLines: 3 } }] }, screen)).toEqual(expect.arrayContaining(["DISPLAY_FORBIDDEN", "RAW_SPACING_FORBIDDEN"]));
  });

  it("rejects a block consuming over 40 percent of the viewport", () => {
    const screen = { screenId: "form", archetype: "form" as const, navigationMode: "focused" as const, contentDensity: "medium" as const };
    expect(validateTypographyBudget({ type: "Card", props: { height: 400 } }, screen, 844)).toEqual(["OVERSIZED_BLOCK"]);
  });

  it("limits operational headings to one line and detects duplicate headings", () => {
    const screen = { screenId: "settings", archetype: "settings" as const, navigationMode: "root" as const, contentDensity: "medium" as const };
    const root = { type: "Screen", children: [
      { type: "Text", props: { variant: "heading", text: "Ayarlar", maxLines: 2 } },
      { type: "Text", props: { variant: "heading", text: "Ayarlar", maxLines: 1 } },
      { type: "Button", props: { label: "Kaydet" } },
    ] };
    expect(validateTypographyBudget(root, screen)).toEqual(expect.arrayContaining(["OVERSIZED_HEADING", "DUPLICATE_PAGE_HEADING"]));
  });

  it("requires enough structure for high-density screens", () => {
    const screen = { screenId: "transactions", archetype: "management_list" as const, navigationMode: "root" as const, contentDensity: "high" as const };
    expect(validateTypographyBudget({ type: "Screen", children: [{ type: "Text", props: { variant: "heading", text: "İşlemler" } }] }, screen)).toEqual(expect.arrayContaining(["DENSITY_TOO_LOW", "ABOVE_FOLD_TASK_MISSING"]));
  });
});
