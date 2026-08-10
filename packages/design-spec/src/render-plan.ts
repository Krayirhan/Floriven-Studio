import type { ScreenIntent } from "./screen-intent";
import type { DesignNode } from "./types";
import type { PresentationSpecV2 } from "./presentation/contracts";

export type RenderSectionRole = "hero" | "summary" | "toolbar" | "primary-content" | "secondary-content" | "insight" | "actions";
export type RenderEmphasis = "primary" | "secondary" | "tertiary";
export interface RenderSection { id: string; role: RenderSectionRole; emphasis: RenderEmphasis; span: number; order: number; nodes: DesignNode[]; resolvedFamily?: string; }
export interface RenderPlanDiagnostic { code: "UNKNOWN_NODE_TYPE" | "INVALID_SECTION" | "COMPOSITION_RULE_VIOLATION"; nodeId?: string; detail: string; }
export interface ScreenRenderPlan { version: "1.0.0"; screenId: string; archetype: ScreenIntent["archetype"]; layoutPattern: PresentationSpecV2["composition"]["patterns"][keyof PresentationSpecV2["composition"]["patterns"]]; sections: RenderSection[]; overlays: never[]; navigation?: { mode: PresentationSpecV2["navigation"]["active"] }; diagnostics: RenderPlanDiagnostic[]; }
