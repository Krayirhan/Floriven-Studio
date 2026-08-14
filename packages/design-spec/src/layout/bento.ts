import type { LayoutBox, LayoutInput, LayoutResult } from "./types";
import { CANONICAL_VIEWPORT } from "./types";

export function layoutBento(input: LayoutInput): LayoutResult {
  const viewport = input.viewport ?? CANONICAL_VIEWPORT;
  const gap = input.sectionGap ?? 16;
  const inset = input.contentInset ?? 16;
  const width = viewport.width - inset * 2;
  const columns = 2;
  const unit = (width - gap) / columns;
  const boxes: LayoutBox[] = [];
  let y = viewport.safeTop + inset;
  input.plan.sections.forEach((section, index) => {
    const span = section.span >= 12 ? 2 : 1;
    const boxWidth = span === 2 ? width : unit;
    const x = span === 2 || index % 2 === 0 ? inset : inset + unit + gap;
    if (index > 0 && span === 2) y += 0;
    const height = span === 2 ? 128 : 112;
    boxes.push({ id: section.id, x, y, width: boxWidth, height, span, rowSpan: 1 });
    if (span === 2 || index % 2 === 1) y += height + gap;
  });
  const contentHeight = y + viewport.safeBottom;
  return { viewport, pattern: "bento", boxes, contentHeight, overflow: boxes.some((box) => box.x + box.width > viewport.width || box.y + box.height > viewport.height) };
}
