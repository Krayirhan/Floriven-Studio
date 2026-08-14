import type { LayoutPattern } from "../strategy";
import type { ScreenRenderPlan } from "../render-plan";

export interface DeviceViewport { width: 390; height: 844; safeTop: number; safeBottom: number; }
export interface LayoutBox { id: string; x: number; y: number; width: number; height: number; span: number; rowSpan: number; }
export interface LayoutResult { viewport: DeviceViewport; pattern: LayoutPattern; boxes: LayoutBox[]; contentHeight: number; overflow: boolean; }
export const CANONICAL_VIEWPORT: Readonly<DeviceViewport> = Object.freeze({ width: 390, height: 844, safeTop: 24, safeBottom: 24 });
export type LayoutInput = { plan: ScreenRenderPlan; viewport?: DeviceViewport; sectionGap?: number; contentInset?: number };
