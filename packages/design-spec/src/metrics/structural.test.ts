import { describe, expect, it } from "vitest";
import { calculateStructuralMetrics } from "./structural";

describe("calculateStructuralMetrics", () => {
  it("measures nested cards, wrappers, and depth across screen roots", () => {
    const metrics = calculateStructuralMetrics([
      {
        type: "Screen",
        children: [{
          type: "Stack",
          children: [{
            type: "Card",
            children: [{ type: "Card", children: [{ type: "Text" }] }],
          }],
        }],
      },
      { type: "Screen", children: [{ type: "Text" }, { type: "Button" }] },
    ]);

    expect(metrics).toMatchObject({
      nodeCount: 8,
      maxTreeDepth: 5,
      nestedCardCount: 1,
      singleChildWrapperCount: 2,
      cardCount: 2,
      semanticBlockCount: 5,
      surfaceCount: 2,
    });
    expect(metrics.cardRatio).toBe(0.4);
    expect(metrics.surfaceRatio).toBe(0.4);
  });

  it("returns zero ratios when a tree contains only structural wrappers", () => {
    const metrics = calculateStructuralMetrics([{ type: "Screen", children: [{ type: "Stack" }] }]);

    expect(metrics.cardRatio).toBe(0);
    expect(metrics.surfaceRatio).toBe(0);
  });
});
