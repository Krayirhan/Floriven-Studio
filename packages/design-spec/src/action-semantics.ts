import type { UXScreenSpec } from "./ux-spec";

export type SemanticAction = { id: string; intent: "create" | "add" | "compose" | "edit" | "delete" | "save" | "cancel" | "search" | "filter" | "sort" | "select" | "navigate" | "share" | "confirm"; importance: "primary" | "secondary" | "tertiary"; presentation: "fab" | "topbar" | "inline" | "bottom-bar" };

export type NavigationSemantics = { mode: "root" | "focused" | "modal" | "wizard"; activeScreenId?: string; targetScreenIds: readonly string[]; bottomNavigationPresent: boolean };

export function validateActionSemantics(screen: UXScreenSpec, actions: readonly SemanticAction[]): string[] {
  const issues: string[] = [];
  const primary = actions.filter((action) => action.importance === "primary");
  if (primary.length > 1) issues.push("DUPLICATE_PRIMARY_ACTION");
  for (const action of actions) {
    if (action.presentation === "fab" && !["create", "add", "compose"].includes(action.intent)) issues.push("INVALID_FAB_INTENT");
    if (action.presentation === "fab" && screen.archetype !== "management_list") issues.push("FAB_FORBIDDEN_FOR_ARCHETYPE");
    if (action.presentation === "bottom-bar" && screen.navigationMode === "root") issues.push("BOTTOM_BAR_OUTSIDE_FOCUSED_FLOW");
    if (action.intent === "sort" && action.importance === "primary") issues.push("WRONG_ACTION_EMPHASIS");
  }
  return [...new Set(issues)];
}

export function validateNavigationSemantics(navigation: NavigationSemantics): string[] {
  const issues: string[] = [];
  if (navigation.mode !== "root" && navigation.bottomNavigationPresent) issues.push("FOCUSED_FLOW_BOTTOM_NAV");
  if (navigation.activeScreenId && !navigation.targetScreenIds.includes(navigation.activeScreenId)) issues.push("INVALID_NAV_ACTIVE_STATE");
  if (new Set(navigation.targetScreenIds).size !== navigation.targetScreenIds.length) issues.push("DUPLICATE_NAV_TARGET");
  return issues;
}
