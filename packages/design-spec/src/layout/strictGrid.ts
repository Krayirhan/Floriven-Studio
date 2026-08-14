import type { LayoutInput, LayoutResult, LayoutBox } from "./types";
import { CANONICAL_VIEWPORT } from "./types";

export function layoutStrictGrid(input: LayoutInput): LayoutResult {
  const viewport = input.viewport ?? CANONICAL_VIEWPORT;
  const gap = input.sectionGap ?? 12;
  const inset = input.contentInset ?? 16;
  const width = viewport.width - inset * 2;
  const columns = 12;
  const unit = (width - gap * (columns - 1)) / columns;
  const boxes: LayoutBox[] = [];
  let y = viewport.safeTop + inset; let column = 0; let rowHeight = 0;
  input.plan.sections.forEach((section) => {
    const span = Math.max(1, Math.min(columns, section.span));
    if (column + span > columns) { y += rowHeight + gap; column = 0; rowHeight = 0; }
    const height = section.emphasis === "primary" ? 136 : section.emphasis === "secondary" ? 104 : 72;
    boxes.push({ id: section.id, x: inset + column * (unit + gap), y, width: unit * span + gap * (span - 1), height, span, rowSpan: 1 });
    rowHeight = Math.max(rowHeight, height); column += span;
    if (column === columns) { y += rowHeight + gap; column = 0; rowHeight = 0; }
  });
  const contentHeight = Math.max(...boxes.map((box) => box.y + box.height), viewport.safeTop) + viewport.safeBottom;
  return { viewport, pattern: "strict-grid", boxes, contentHeight, overflow: boxes.some((box) => box.x + box.width > viewport.width || box.y + box.height > viewport.height) };
}
