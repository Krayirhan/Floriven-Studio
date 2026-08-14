import { expect, test } from "@playwright/test";

const fallbackScreen = {
  id: "fallback-overview",
  name: "Genel Bakış",
  route: "/genel-bakis",
  root: {
    id: "fallback-root",
    type: "Screen",
    props: {
      theme: "ocean",
      screenIntent: { archetype: "dashboard", navigationMode: "root", contentDensity: "medium" },
      strategy: { mode: "auto", palette: "obsidian", cardStyle: "crisp", density: "compact", navigationStyle: "glass", visualDirection: "Güvenli taslak", rationale: [] },
    },
    children: [
      { id: "fallback-bar", type: "TopAppBar", props: { title: "Genel Bakış" }, a11y: { role: "banner", label: "Üst çubuk" } },
      { id: "fallback-title", type: "Text", props: { text: "Otomatik taslak", variant: "title" }, a11y: { role: "heading", label: "Otomatik taslak" } },
    ],
    a11y: { role: "main", label: "Genel Bakış" },
  },
};

test("deterministic fallback is disclosed instead of being labelled as AI output", async ({ page }) => {
  await page.route("**/functions/v1/generate*", (route) => route.fulfill({
    status: route.request().method() === "POST" ? 202 : 200,
    contentType: "application/json",
    body: JSON.stringify({
      id: "fallback-provenance",
      projectId: "fallback-project",
      status: "completed",
      progress: 100,
      compositionMode: "deterministic_fallback",
      degraded: true,
      fallbackReason: "PROVIDER_TIMEOUT",
      resultScreens: [fallbackScreen],
      qualityReport: { score: 80, passed: true, issues: [], metrics: {} },
    }),
  }));

  await page.goto("/app");
  await page.getByRole("textbox", { name: /Nasıl bir mobil uygulama/ }).fill("Fallback provenance testi");
  await page.getByRole("button", { name: /Floriven ile Üret/ }).click();
  await expect(page).toHaveURL(/jobId=fallback-provenance/);
  await expect(page.getByRole("status")).toContainText("Güvenli otomatik taslak gösteriliyor");
  await expect(page.getByRole("status")).toContainText("Prompt ayrıntıları sınırlı uygulanmış olabilir");
  await expect(page.getByRole("status")).not.toContainText("AI tarafından özelleştirilmiş");
});
