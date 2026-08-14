import type { ArchetypePolicy } from "./archetype";
import { ARCHETYPE_POLICIES } from "./archetype";
import type { UXScreenSpec } from "./ux-spec";

export type ScreenIntentArchetype = keyof typeof ARCHETYPE_POLICIES;

export interface ScreenIntent {
  version: "1.0.0";
  screenId: string;
  archetype: ScreenIntentArchetype;
  navigationMode: UXScreenSpec["navigationMode"];
  contentDensity: UXScreenSpec["contentDensity"];
  heroAllowed: boolean;
  fabAllowed: boolean;
  bottomNavigationAllowed: boolean;
  primaryAction?: UXScreenSpec["primaryAction"];
}

export function createScreenIntent(screen: UXScreenSpec): ScreenIntent {
  const policy: ArchetypePolicy = ARCHETYPE_POLICIES[screen.archetype];

  return {
    version: "1.0.0",
    screenId: screen.screenId,
    archetype: screen.archetype,
    navigationMode: screen.navigationMode,
    contentDensity: screen.contentDensity,
    heroAllowed: policy.heroAllowed,
    fabAllowed: policy.fabAllowed,
    bottomNavigationAllowed: policy.bottomNavigationAllowed,
    ...(screen.primaryAction ? { primaryAction: screen.primaryAction } : {}),
  };
}

export function validateScreenIntent(intent: ScreenIntent): string[] {
  const issues: string[] = [];
  const policy = ARCHETYPE_POLICIES[intent.archetype];

  if (intent.version !== "1.0.0") issues.push("UNSUPPORTED_VERSION");
  if (!intent.screenId.trim()) issues.push("SCREEN_ID_REQUIRED");
  if (intent.heroAllowed !== policy.heroAllowed) issues.push("HERO_POLICY_MISMATCH");
  if (intent.fabAllowed !== policy.fabAllowed) issues.push("FAB_POLICY_MISMATCH");
  if (intent.bottomNavigationAllowed !== policy.bottomNavigationAllowed) {
    issues.push("BOTTOM_NAV_POLICY_MISMATCH");
  }
  if (intent.navigationMode === "focused" && intent.bottomNavigationAllowed) {
    issues.push("FOCUSED_SCREEN_CANNOT_ALLOW_BOTTOM_NAV");
  }

  return issues;
}
