import { expect, test } from "@playwright/test";

test("five style presets keep neutral content and render distinct visual systems", async ({ page }) => {
  await page.goto("/app/sablonlar");
  const previews = page.locator("[data-preset]");
  await expect(previews).toHaveCount(5);
  await expect(previews).toContainText(["Kuzey Studio", "Kuzey Studio", "Kuzey Studio", "Kuzey Studio", "Kuzey Studio"]);

  const backgrounds = await previews.evaluateAll((elements) => elements.map((element) => getComputedStyle(element).getPropertyValue("--preset-bg").trim()));
  expect(new Set(backgrounds).size).toBe(5);

  await expect(page.locator("main")).toHaveScreenshot("style-preset-gallery.png", {
    animations: "disabled",
    maxDiffPixelRatio: 0.01,
  });
});
