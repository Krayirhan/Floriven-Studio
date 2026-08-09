import { describe, expect, it } from "vitest";
import { validateActionSemantics, validateNavigationSemantics } from "./action-semantics";

describe("action semantics", () => {
  it("allows a create FAB only on a management list", () => {
    const screen = { screenId: "invoices", archetype: "management_list" as const, navigationMode: "root" as const, contentDensity: "high" as const };
    expect(validateActionSemantics(screen, [{ id: "create", intent: "create", importance: "primary", presentation: "fab" }])).toEqual([]);
  });

  it("rejects an edit FAB and duplicate primary actions on settings", () => {
    const screen = { screenId: "settings", archetype: "settings" as const, navigationMode: "root" as const, contentDensity: "medium" as const };
    expect(validateActionSemantics(screen, [
      { id: "edit", intent: "edit", importance: "primary", presentation: "fab" },
      { id: "save", intent: "save", importance: "primary", presentation: "topbar" },
    ])).toEqual(expect.arrayContaining(["INVALID_FAB_INTENT", "FAB_FORBIDDEN_FOR_ARCHETYPE", "DUPLICATE_PRIMARY_ACTION"]));
  });

  it("allows add and compose FAB intents but rejects primary sort", () => {
    const screen = { screenId: "items", archetype: "management_list" as const, navigationMode: "root" as const, contentDensity: "high" as const };
    expect(validateActionSemantics(screen, [{ id: "add", intent: "add", importance: "primary", presentation: "fab" }])).toEqual([]);
    expect(validateActionSemantics(screen, [{ id: "sort", intent: "sort", importance: "primary", presentation: "inline" }])).toContain("WRONG_ACTION_EMPHASIS");
  });

  it("enforces focused-flow navigation rules and active state", () => {
    expect(validateNavigationSemantics({ mode: "focused", activeScreenId: "edit", targetScreenIds: ["home", "edit"], bottomNavigationPresent: true })).toEqual(["FOCUSED_FLOW_BOTTOM_NAV"]);
    expect(validateNavigationSemantics({ mode: "root", activeScreenId: "missing", targetScreenIds: ["home", "home"], bottomNavigationPresent: true })).toEqual(["INVALID_NAV_ACTIVE_STATE", "DUPLICATE_NAV_TARGET"]);
  });
});
