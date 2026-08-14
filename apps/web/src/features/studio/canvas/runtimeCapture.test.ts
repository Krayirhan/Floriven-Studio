import { describe, expect, it } from "vitest";
import { capturePhoneBaseline, capturePhoneRuntime } from "./runtimeCapture";

function fakeNode(id: string, tagName: string, rect: { left: number; top: number; width: number; height: number }, dataset: Record<string, string> = {}): HTMLElement {
  return { dataset: { florivenNodeId: id, ...dataset }, tagName, getBoundingClientRect: () => ({ ...rect }), } as unknown as HTMLElement;
}

describe("phone runtime capture", () => {
  it("normalizes DOM bounds to the canonical phone root", () => {
    const root = { offsetWidth: 390, offsetHeight: 844, getBoundingClientRect: () => ({ left: 100, top: 50, width: 195, height: 422 }), querySelectorAll: () => [fakeNode("b", "BUTTON", { left: 105, top: 65, width: 60, height: 22 }), fakeNode("a", "SECTION", { left: 102.5, top: 55, width: 100, height: 40 })] } as unknown as HTMLElement;
    expect(capturePhoneRuntime(root)).toEqual({ viewport: { width: 390, height: 844 }, preview: { transformedWidth: 195, transformedHeight: 422, scaleX: 0.5, scaleY: 0.5 }, bounds: [{ nodeId: "a", x: 5, y: 10, width: 200, height: 80 }, { nodeId: "b", x: 10, y: 30, width: 120, height: 44 }], treeSignature: "a:section|b:button", visualIdentity: { visibleNodeCount: 2, sectionCount: 0, sectionAreaCoverage: 0, verticalOccupancy: 0.095, nodeDensityPer100k: 0.608, sectionHeightVariation: 0, sectionRoleSequence: [], identityVector: [0, 0, 0.095, 0.608, 0] } });
  });

  it("combines screenshot output and runtime evidence into a baseline entry", async () => {
    const root = { offsetWidth: 390, offsetHeight: 844, getBoundingClientRect: () => ({ left: 0, top: 0, width: 390, height: 844 }), querySelectorAll: () => [fakeNode("screen", "MAIN", { left: 0, top: 0, width: 390, height: 844 })] } as unknown as HTMLElement;
    const result = await capturePhoneBaseline({ mode: "deterministic", archetype: "dashboard", screenId: "screen", screenshotPath: "screen.png", boundsPath: "screen.json", root, renderScreenshot: async () => "data:image/png;base64,AA==" });
    expect(result.entry.screenId).toBe("screen");
    expect(result.screenshotDataUrl).toContain("data:image/png");
    expect(result.entry.treeSignature).toBe("screen:main");
  });

  it("rejects non-image screenshot output", async () => {
    const root = { offsetWidth: 390, offsetHeight: 844, getBoundingClientRect: () => ({ left: 0, top: 0, width: 390, height: 844 }), querySelectorAll: () => [] } as unknown as HTMLElement;
    await expect(capturePhoneBaseline({ mode: "auto", archetype: "settings", screenId: "settings", screenshotPath: "settings.png", boundsPath: "settings.json", root, renderScreenshot: async () => "not-an-image" })).rejects.toThrow("INVALID_BASELINE_SCREENSHOT");
  });

  it("captures semantic section geometry as runtime visual identity", () => {
    const root = { offsetWidth: 390, offsetHeight: 844, getBoundingClientRect: () => ({ left: 0, top: 0, width: 390, height: 844 }), querySelectorAll: () => [
      fakeNode("summary", "DIV", { left: 15, top: 80, width: 360, height: 140 }, { semanticContainer: "true", sectionRole: "summary" }),
      fakeNode("list", "DIV", { left: 15, top: 240, width: 360, height: 420 }, { semanticContainer: "true", sectionRole: "entity-list" }),
    ] } as unknown as HTMLElement;

    expect(capturePhoneRuntime(root).visualIdentity).toMatchObject({ sectionCount: 2, sectionRoleSequence: ["summary", "entity-list"] });
  });
});
