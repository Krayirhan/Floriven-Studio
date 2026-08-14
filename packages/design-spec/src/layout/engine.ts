import type { LayoutPattern } from "../strategy";
import { layoutBento } from "./bento";
import { layoutEditorialAsymmetry } from "./editorialAsymmetry";
import { layoutStrictGrid } from "./strictGrid";
import { layoutComparisonGrid } from "./comparisonGrid";
import { CANONICAL_VIEWPORT, type LayoutInput, type LayoutResult } from "./types";

export function layoutRenderPlan(input: LayoutInput): LayoutResult {
  const pattern = input.plan.layoutPattern as LayoutPattern;
  if (pattern === "bento") return layoutBento(input);
  if (pattern === "editorial-asymmetry") return layoutEditorialAsymmetry(input);
  if (pattern === "strict-grid") return layoutStrictGrid(input);
  if (pattern === "comparison-grid") return layoutComparisonGrid(input);
  return layoutStrictGrid({ ...input, sectionGap: input.sectionGap ?? 16 });
}

export function validateLayout(result: LayoutResult): string[] {
  const issues: string[] = [];
  if (result.viewport.width !== CANONICAL_VIEWPORT.width || result.viewport.height !== CANONICAL_VIEWPORT.height) issues.push("NON_CANONICAL_VIEWPORT");
  if (result.overflow) issues.push("LAYOUT_OVERFLOW");
  for (let left = 0; left < result.boxes.length; left += 1) for (let right = left + 1; right < result.boxes.length; right += 1) if (overlap(result.boxes[left]!, result.boxes[right]!)) issues.push("SECTION_OVERLAP");
  return [...new Set(issues)];
}

function overlap(a: { x: number; y: number; width: number; height: number }, b: { x: number; y: number; width: number; height: number }): boolean { return a.x < b.x + b.width && a.x + a.width > b.x && a.y < b.y + b.height && a.y + a.height > b.y; }
