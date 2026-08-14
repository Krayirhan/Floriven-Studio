import { CANONICAL_VIEWPORT, type LayoutBox, type LayoutInput, type LayoutResult } from "./types";

/** Dedicated analytics topology: context and period controls lead to one
 * dominant full-width chart, followed by an asymmetric breakdown/insight row. */
export function layoutComparisonGrid(input: LayoutInput): LayoutResult {
  const viewport = input.viewport ?? CANONICAL_VIEWPORT;
  const gap = input.sectionGap ?? 16;
  const inset = input.contentInset ?? 16;
  const width = viewport.width - inset * 2;
  const boxes: LayoutBox[] = [];
  let y = viewport.safeTop + inset;
  let pending: LayoutBox | undefined;
  for (const section of input.plan.sections) {
    const span = Math.max(1, Math.min(12, section.span));
    const height = section.role === "dominant-chart" ? 192 : section.role === "breakdown" || section.role === "insight" ? 120 : section.emphasis === "primary" ? 132 : 76;
    const boxWidth = span === 12 ? width : width * (span / 12) - gap / 2;
    const x = pending ? inset + pending.width + gap : inset;
    const box = { id: section.id, x, y, width: boxWidth, height, span, rowSpan: 1 };
    boxes.push(box);
    if (pending) { y += Math.max(pending.height, height) + gap; pending = undefined; }
    else if (span < 12) pending = box;
    else y += height + gap;
  }
  if (pending) y += pending.height + gap;
  return { viewport, pattern: "comparison-grid", boxes, contentHeight: y + viewport.safeBottom, overflow: boxes.some((box) => box.x + box.width > viewport.width || box.y + box.height > viewport.height) };
}
