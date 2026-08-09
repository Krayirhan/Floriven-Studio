import { describe, expect, it } from "vitest";
import { allowedPatternsForArchetype, validatePatternPlan, validatePatternUse } from "./pattern-registry";

describe("pattern registry", () => {
  it("accepts a transaction row only for a dense management list", () => {
    const screen = { screenId: "transactions", archetype: "management_list" as const, navigationMode: "root" as const, contentDensity: "high" as const };
    expect(validatePatternUse("TransactionRow", screen, { title: "Spotify", amount: -149.99 })).toEqual([]);
    expect(validatePatternUse("TransactionRow", { ...screen, archetype: "settings" }, { title: "Spotify" })).toEqual(["PATTERN_ARCHETYPE_MISMATCH", "PATTERN_DATA_REQUIRED:amount"]);
  });

  it("requires semantic form field data", () => {
    const screen = { screenId: "invoice", archetype: "form" as const, navigationMode: "focused" as const, contentDensity: "medium" as const };
    expect(validatePatternUse("FormField", screen, { label: "Vade", fieldType: "date" })).toEqual([]);
  });

  it("exposes a constrained pattern set for each archetype", () => {
    expect(allowedPatternsForArchetype("settings")).toEqual(["SettingsRow", "EmptyState"]);
    expect(validatePatternPlan({ screenId: "settings", archetype: "settings", navigationMode: "root", contentDensity: "medium" }, ["SettingsRow"])).toEqual([]);
  });

  it("rejects primitive-only or cross-archetype pattern plans", () => {
    const screen = { screenId: "settings", archetype: "settings" as const, navigationMode: "root" as const, contentDensity: "medium" as const };
    expect(validatePatternPlan(screen, [])).toContain("PATTERN_PLAN_EMPTY");
    expect(validatePatternPlan(screen, ["ChartSection", "FormField"])).toEqual([
      "PATTERN_NOT_ALLOWED:ChartSection",
      "PATTERN_NOT_ALLOWED:FormField",
    ]);
  });
});
