import type { LayoutInput, LayoutResult, LayoutBox } from "./types";
import { CANONICAL_VIEWPORT } from "./types";

export function layoutEditorialAsymmetry(input: LayoutInput): LayoutResult {
  const viewport = input.viewport ?? CANONICAL_VIEWPORT;
  const gap = input.sectionGap ?? 16;
  const inset = input.contentInset ?? 16;
  const width = viewport.width - inset * 2;
  const boxes: LayoutBox[] = [];
  let y = viewport.safeTop + inset;
  input.plan.sections.forEach((section, index) => {
    const anchor = index === 0 || section.role === "hero";
    const boxWidth = anchor ? width : Math.round(width * (index % 2 === 0 ? 0.62 : 0.38) - gap / 2);
    const x = anchor || index % 2 === 0 ? inset : inset + width - boxWidth;
    const height = anchor ? 152 : 104;
    boxes.push({ id: section.id, x, y, width: boxWidth, height, span: anchor ? 12 : section.span, rowSpan: 1 });
    y += height + gap;
  });
  return { viewport, pattern: "editorial-asymmetry", boxes, contentHeight: y + viewport.safeBottom, overflow: boxes.some((box) => box.x + box.width > viewport.width || box.y + box.height > viewport.height) };
}
