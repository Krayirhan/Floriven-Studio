import type { PresentationSpecV2, TypeRole } from "./presentation/contracts";
import type { ComponentState } from "./component-families";
import type { DesignNode } from "./types";

export type TypographyRole = keyof PresentationSpecV2["typography"]["roles"];
export interface ResolvedIcon { name: string; token: string; style: PresentationSpecV2["icons"]["style"]; accessibleLabel: string; fallback: boolean; }
export interface ResolvedMedia { source: "asset" | "generated-asset" | "gradient-placeholder" | "editorial-crop" | "masked" | "full-bleed"; src?: string; alt: string; className: string; fallback: boolean; }
export interface InteractionState { state: ComponentState; ariaDisabled: boolean; ariaBusy: boolean; focusVisible: boolean; minTouchTarget: 44; }

const ICON_TOKENS: Record<string, string> = { add: "action.create", create: "action.create", edit: "action.edit", search: "action.search", filter: "action.filter", check: "status.success", close: "action.close", arrowRight: "navigation.next" };

export function resolveTypographyRole(role: TypographyRole, presentation: PresentationSpecV2): TypeRole { return presentation.typography.roles[role]; }
export function validateTypographyScale(presentation: PresentationSpecV2): string[] { const issues: string[] = []; for (const [name, role] of Object.entries(presentation.typography.roles)) { if (!role.family || !role.size || role.weight < 300 || role.weight > 900) issues.push(`INVALID_TYPE_ROLE:${name}`); if (name === "caption" && Number.parseFloat(role.size) < 11) issues.push("CAPTION_TOO_SMALL"); } return issues; }

export function resolveSemanticIcon(node: DesignNode, presentation: PresentationSpecV2): ResolvedIcon {
  const requested = typeof node.props.icon === "string" ? node.props.icon : "check";
  const token = ICON_TOKENS[requested] ?? "icon.generic";
  return { name: requested, token, style: presentation.icons.style, accessibleLabel: typeof node.props["aria-label"] === "string" ? node.props["aria-label"] : requested, fallback: !(requested in ICON_TOKENS) };
}

export function resolveMedia(node: DesignNode, presentation: PresentationSpecV2): ResolvedMedia {
  const src = typeof node.props.src === "string" ? node.props.src : undefined;
  const alt = typeof node.props.alt === "string" && node.props.alt.trim() ? node.props.alt : "Görsel";
  const requested = typeof node.props.treatment === "string" ? node.props.treatment : presentation.media.treatment;
  const source = src ? "asset" : requested === "none" ? "gradient-placeholder" : requested;
  return { source: source as ResolvedMedia["source"], ...(src ? { src } : {}), alt, className: `floriven-media-${source}`, fallback: !src };
}

export function resolveInteractionState(state: ComponentState = "default"): InteractionState { return { state, ariaDisabled: state === "disabled", ariaBusy: state === "loading", focusVisible: state === "focus", minTouchTarget: 44 }; }
