import { describe, expect, it } from "vitest";
import { createPresetRuntimeMatrix, validatePresetRuntimeMatrix } from "./preset-runtime";

describe("five preset runtime matrix", () => {
  it("creates 5x6 deterministic runtime fixtures", () => {
    const matrix = createPresetRuntimeMatrix();
    expect(matrix.fixtures).toHaveLength(30);
    expect(createPresetRuntimeMatrix()).toEqual(matrix);
  });

  it("keeps presets structurally distinct without relying on color", () => {
    const matrix = createPresetRuntimeMatrix();
    expect(validatePresetRuntimeMatrix(matrix)).toEqual([]);
    expect(Object.values(matrix.pairwiseDistance).every((value) => value >= 0.4)).toBe(true);
  });
});
