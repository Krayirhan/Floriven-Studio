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
    const anchor = index === 0 || section.role === "hero" || section.role === "identity" || section.span >= 12;
    const ratio = section.span >= 8 || index % 2 === 1 ? .62 : .38;
    const boxWidth = anchor ? width : Math.round(width * ratio - gap / 2);
    const x = anchor || index % 2 === 0 ? inset : inset + width - boxWidth;
    const height = anchor ? 152 : section.emphasis === "primary" ? 128 : 104;
    boxes.push({ id: section.id, x, y, width: boxWidth, height, span: anchor ? 12 : section.span, rowSpan: 1 });
    y += height + gap;
  });
  return { viewport, pattern: "editorial-asymmetry", boxes, contentHeight: y + viewport.safeBottom, overflow: boxes.some((box) => box.x + box.width > viewport.width || box.y + box.height > viewport.height) };
}
