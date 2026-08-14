import type { UXScreenSpec } from "./ux-spec";

export const ARCHETYPE_POLICIES = {
  dashboard: { heroAllowed: true, fabAllowed: false, bottomNavigationAllowed: true },
  analytics: { heroAllowed: false, fabAllowed: false, bottomNavigationAllowed: true },
  management_list: { heroAllowed: false, fabAllowed: true, bottomNavigationAllowed: true },
  settings: { heroAllowed: false, fabAllowed: false, bottomNavigationAllowed: true },
  form: { heroAllowed: false, fabAllowed: false, bottomNavigationAllowed: false },
  detail: { heroAllowed: false, fabAllowed: false, bottomNavigationAllowed: false },
  profile: { heroAllowed: false, fabAllowed: false, bottomNavigationAllowed: true },
} as const;

export type ArchetypePolicy = (typeof ARCHETYPE_POLICIES)[keyof typeof ARCHETYPE_POLICIES];

export function validateArchetypeScreen(screen: UXScreenSpec, options: { hasHero?: boolean; hasFab?: boolean; hasBottomNavigation?: boolean } = {}): string[] {
  const policy = ARCHETYPE_POLICIES[screen.archetype];
  const issues: string[] = [];
  if (options.hasHero && !policy.heroAllowed) issues.push("HERO_FORBIDDEN");
  if (options.hasFab && !policy.fabAllowed) issues.push("FAB_FORBIDDEN");
  if (options.hasBottomNavigation && (!policy.bottomNavigationAllowed || screen.navigationMode !== "root")) issues.push("BOTTOM_NAV_FORBIDDEN");
  return issues;
}
