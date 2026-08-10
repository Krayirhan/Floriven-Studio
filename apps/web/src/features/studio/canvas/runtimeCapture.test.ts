import { describe, expect, it } from "vitest";
import { capturePhoneBaseline, capturePhoneRuntime } from "./runtimeCapture";

function fakeNode(id: string, tagName: string, rect: { left: number; top: number; width: number; height: number }): HTMLElement {
  return { dataset: { florivenNodeId: id }, tagName, getBoundingClientRect: () => ({ ...rect }), } as unknown as HTMLElement;
}

describe("phone runtime capture", () => {
  it("normalizes DOM bounds to the canonical phone root", () => {
    const root = { getBoundingClientRect: () => ({ left: 100, top: 50 }), querySelectorAll: () => [fakeNode("b", "BUTTON", { left: 110, top: 80, width: 120.123, height: 44 }), fakeNode("a", "SECTION", { left: 105, top: 60, width: 200, height: 80 })] } as unknown as HTMLElement;
    expect(capturePhoneRuntime(root)).toEqual({ viewport: { width: 390, height: 844 }, bounds: [{ nodeId: "a", x: 5, y: 10, width: 200, height: 80 }, { nodeId: "b", x: 10, y: 30, width: 120.12, height: 44 }], treeSignature: "a:section|b:button" });
  });

  it("combines screenshot output and runtime evidence into a baseline entry", async () => {
    const root = { getBoundingClientRect: () => ({ left: 0, top: 0 }), querySelectorAll: () => [fakeNode("screen", "MAIN", { left: 0, top: 0, width: 390, height: 844 })] } as unknown as HTMLElement;
    const result = await capturePhoneBaseline({ mode: "deterministic", archetype: "dashboard", screenId: "screen", screenshotPath: "screen.png", boundsPath: "screen.json", root, renderScreenshot: async () => "data:image/png;base64,AA==" });
    expect(result.entry.screenId).toBe("screen");
    expect(result.screenshotDataUrl).toContain("data:image/png");
    expect(result.entry.treeSignature).toBe("screen:main");
  });

  it("rejects non-image screenshot output", async () => {
    const root = { getBoundingClientRect: () => ({ left: 0, top: 0 }), querySelectorAll: () => [] } as unknown as HTMLElement;
    await expect(capturePhoneBaseline({ mode: "auto", archetype: "settings", screenId: "settings", screenshotPath: "settings.png", boundsPath: "settings.json", root, renderScreenshot: async () => "not-an-image" })).rejects.toThrow("INVALID_BASELINE_SCREENSHOT");
  });
});
