import { describe, expect, it } from "vitest";
import { validateArchetypeContent } from "./archetype-hardening";

describe("archetype hardening", () => {
  it("requires task-oriented form structure", () => {
    const screen = { screenId: "invoice", archetype: "form" as const, navigationMode: "focused" as const, contentDensity: "medium" as const };
    expect(validateArchetypeContent(screen, { type: "Screen", children: [{ type: "Text" }, { type: "FloatingActionButton" }] })).toEqual(expect.arrayContaining(["FORM_INCOMPLETE:FormSection", "FORM_INCOMPLETE:FormField", "FORM_INCOMPLETE:Button", "FORM_FAB_FORBIDDEN"]));
  });

  it("requires grouped settings rows and rejects card grouping", () => {
    const screen = { screenId: "settings", archetype: "settings" as const, navigationMode: "root" as const, contentDensity: "medium" as const };
    expect(validateArchetypeContent(screen, { type: "Screen", children: [{ type: "Card", children: [{ type: "Text" }, { type: "Text" }] }] })).toEqual(["SETTINGS_ROWS_REQUIRED", "SETTINGS_CARD_GROUPING_FORBIDDEN"]);
  });

  it("requires insight metadata for dashboard charts", () => {
    const screen = { screenId: "analytics", archetype: "dashboard" as const, navigationMode: "root" as const, contentDensity: "medium" as const };
    expect(validateArchetypeContent(screen, { type: "Screen", children: [{ type: "Chart", props: { measure: "income" } }] })).toEqual(["ANALYTICS_WITHOUT_INSIGHT"]);
    expect(validateArchetypeContent(screen, { type: "Screen", children: [{ type: "Chart", props: { measure: "income", insight: "Gelir yükseldi" } }] })).toEqual([]);
  });
});
