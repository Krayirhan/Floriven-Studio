import type { LayoutBox, LayoutInput, LayoutResult } from "./types";
import { CANONICAL_VIEWPORT } from "./types";

export function layoutBento(input: LayoutInput): LayoutResult {
  const viewport = input.viewport ?? CANONICAL_VIEWPORT;
  const gap = input.sectionGap ?? 16;
  const inset = input.contentInset ?? 16;
  const width = viewport.width - inset * 2;
  const columns = 12;
  const boxes: LayoutBox[] = [];
  let y = viewport.safeTop + inset;
  let column = 0; let rowHeight = 0;
  input.plan.sections.forEach((section) => {
    const span = Math.max(1, Math.min(columns, section.span));
    if (column + span > columns) { y += rowHeight + gap; column = 0; rowHeight = 0; }
    const boxWidth = span === columns ? width : (width - gap * (columns - 1)) / columns * span + gap * (span - 1);
    const x = inset + column * ((width - gap * (columns - 1)) / columns + gap);
    const height = section.emphasis === "primary" ? 148 : section.emphasis === "secondary" ? 112 : 82;
    boxes.push({ id: section.id, x, y, width: boxWidth, height, span, rowSpan: 1 });
    column += span; rowHeight = Math.max(rowHeight, height);
    if (column === columns) { y += rowHeight + gap; column = 0; rowHeight = 0; }
  });
  const contentHeight = y + rowHeight + viewport.safeBottom;
  return { viewport, pattern: "bento", boxes, contentHeight, overflow: boxes.some((box) => box.x + box.width > viewport.width || box.y + box.height > viewport.height) };
}
