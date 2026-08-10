import type { RenderSectionRole } from "./render-plan";
import type { PresentationSpecV2 } from "./presentation/contracts";
import type { DesignNode } from "./types";

export type CardFamily = "metric" | "hero" | "list" | "split" | "timeline" | "media" | "glass" | "editorial";
export type FieldVariant = "underline" | "filled" | "outlined" | "soft" | "compact" | "touch-large";
export type ControlVariant = "switch" | "checkbox" | "toggle" | "segmented" | "accordion" | "disclosure";
export type PillFamily = "status" | "filter" | "category" | "tag" | "notification";
export type ComponentState = "default" | "hover" | "pressed" | "focus" | "selected" | "disabled" | "loading" | "error";

export interface ResolvedComponentFamily { family: string; className: string; geometry: { radius: string; padding: string; minHeight: number }; fallback: boolean; fallbackReason?: string; }
export interface ResolvedControl { variant: ControlVariant; state: ComponentState; minTouchTarget: 44; ariaPressed?: boolean; }
export interface ResolvedField { variant: FieldVariant; state: Extract<ComponentState, "default" | "focus" | "disabled" | "error">; label: string; value?: string; placeholder?: string; helper?: string; error?: string; }

export function resolveCardFamily(node: DesignNode, presentation: PresentationSpecV2, sectionRole: RenderSectionRole): ResolvedComponentFamily {
  const requested = typeof node.props.family === "string" ? node.props.family : undefined;
  const allowed = new Set(presentation.cards.types);
  const preferred: CardFamily = sectionRole === "hero" ? "hero" : sectionRole === "insight" ? "split" : node.type === "Metric" ? "metric" : node.type === "ListItem" ? "list" : "media";
  const family = requested && isCardFamily(requested) && allowed.has(requested) ? requested : preferred;
  const fallback = !!requested && family !== requested;
  const geometry = familyGeometry(family, presentation);
  return { family, className: `floriven-card-${family}`, geometry, fallback, ...(fallback ? { fallbackReason: "REQUESTED_CARD_FAMILY_NOT_ALLOWED" } : {}) };
}

export function resolveFieldVariant(node: DesignNode, presentation: PresentationSpecV2, state: ResolvedField["state"] = "default"): ResolvedField {
  const requested = typeof node.props.variant === "string" ? node.props.variant : undefined;
  const available = presentation.fields.styles;
  const variant = requested && isFieldVariant(requested) && available.includes(requested) ? requested : available[0] ?? "outlined";
  const result: ResolvedField = { variant, state, label: stringProp(node, "label") ?? "Alan" };
  const value = stringProp(node, "value");
  const placeholder = stringProp(node, "placeholder");
  const helper = stringProp(node, "helper");
  const error = stringProp(node, "error");
  if (value) result.value = value;
  if (placeholder) result.placeholder = placeholder;
  if (helper) result.helper = helper;
  if (error) result.error = error;
  return result;
}

export function resolveControlVariant(node: DesignNode, presentation: PresentationSpecV2, state: ComponentState = "default"): ResolvedControl {
  const requested = typeof node.props.variant === "string" ? node.props.variant : undefined;
  const variant = requested && isControlVariant(requested) && presentation.controls.types.includes(requested) ? requested : presentation.controls.types[0] ?? "toggle";
  return { variant, state, minTouchTarget: 44, ...(state === "selected" ? { ariaPressed: true } : {}) };
}

function familyGeometry(family: CardFamily, presentation: PresentationSpecV2) { return { radius: family === "editorial" ? "0" : presentation.geometry.radius, padding: family === "hero" ? "24px" : presentation.geometry.padding, minHeight: family === "metric" ? 88 : family === "hero" ? 144 : 64 }; }
function isCardFamily(value: string): value is CardFamily { return ["metric", "hero", "list", "split", "timeline", "media", "glass", "editorial"].includes(value); }
function isFieldVariant(value: string): value is FieldVariant { return ["underline", "filled", "outlined", "soft", "compact", "touch-large"].includes(value); }
function isControlVariant(value: string): value is ControlVariant { return ["switch", "checkbox", "toggle", "segmented", "accordion", "disclosure"].includes(value); }
function stringProp(node: DesignNode, key: string): string | undefined { return typeof node.props[key] === "string" ? node.props[key] : undefined; }
