import type { LayoutInput, LayoutResult, LayoutBox } from "./types";
import { CANONICAL_VIEWPORT } from "./types";

export function layoutStrictGrid(input: LayoutInput): LayoutResult {
  const viewport = input.viewport ?? CANONICAL_VIEWPORT;
  const gap = input.sectionGap ?? 12;
  const inset = input.contentInset ?? 16;
  const width = viewport.width - inset * 2;
  const columns = 3;
  const unit = (width - gap * (columns - 1)) / columns;
  const boxes: LayoutBox[] = input.plan.sections.map((section, index) => {
    const row = Math.floor(index / columns);
    const column = index % columns;
    return { id: section.id, x: inset + column * (unit + gap), y: viewport.safeTop + inset + row * (72 + gap), width: unit, height: 72, span: 1, rowSpan: 1 };
  });
  const contentHeight = (boxes.at(-1)?.y ?? viewport.safeTop) + (boxes.at(-1)?.height ?? 0) + viewport.safeBottom;
  return { viewport, pattern: "strict-grid", boxes, contentHeight, overflow: boxes.some((box) => box.x + box.width > viewport.width || box.y + box.height > viewport.height) };
}
