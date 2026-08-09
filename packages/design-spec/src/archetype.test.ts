import { describe, expect, it } from "vitest";
import { validateArchetypeScreen } from "./archetype";

describe("archetype policies", () => {
  it("forbids marketing hero and FAB patterns in settings", () => {
    expect(validateArchetypeScreen({ screenId: "settings", archetype: "settings", navigationMode: "root", contentDensity: "medium" }, { hasHero: true, hasFab: true, hasBottomNavigation: true }))
      .toEqual(["HERO_FORBIDDEN", "FAB_FORBIDDEN"]);
  });

  it("forbids bottom navigation in a focused form flow", () => {
    expect(validateArchetypeScreen({ screenId: "invoice", archetype: "form", navigationMode: "focused", contentDensity: "medium" }, { hasBottomNavigation: true }))
      .toEqual(["BOTTOM_NAV_FORBIDDEN"]);
  });
});
