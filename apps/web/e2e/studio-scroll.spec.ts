import { expect, test } from "@playwright/test";
import { mkdir, writeFile } from "node:fs/promises";
import { resolve } from "node:path";
import { createGeometryReport } from "@floriven/design-spec";

const screenNames = ["Özet", "Projeler", "Faturalar", "Müşteriler"];

function screen(name: string, index: number) {
  const slug = name.toLocaleLowerCase("tr-TR").replaceAll("ı", "i").replace(/[^a-z0-9]+/g, "-");
  return {
    id: `screen-${index}`,
    name,
    route: `/${slug}`,
    root: {
      id: `root-${index}`,
      type: "Screen",
      props: { theme: "mint", strategy: { mode: "template", stylePresetId: "serene-health", palette: "serene", cardStyle: "soft", density: "comfortable", navigationStyle: "floating", visualDirection: "Sakin ritim", rationale: ["Okunabilirlik", "Dokunma alanları"] } },
      a11y: { role: "main", label: name },
      children: [
        { id: `bar-${index}`, type: "TopAppBar", props: { title: name, action: "Profil" }, a11y: { role: "banner", label: `${name} üst çubuğu` } },
        { id: `title-${index}`, type: "Text", props: { text: `${name} için güncel durum ve öncelikler`, variant: "title" }, a11y: { role: "heading", label: `${name} başlığı` } },
        ...Array.from({ length: 12 }, (_, row) => ({
          id: `row-${index}-${row}`,
          type: "ListItem",
          props: { title: `Kuzey Studio ${row + 1}`, subtitle: `Teslim ${18 + row} Ağustos · müşteri projesi`, trailing: `%${42 + row}` },
          a11y: { role: "listitem", label: `Kuzey Studio ${row + 1}` },
        })),
        { id: `nav-${index}`, type: "BottomNavigation", props: { items: screenNames }, a11y: { role: "navigation", label: "Alt gezinme" } },
      ],
    },
  };
}

const completedJob = {
  id: "e2e-job",
  projectId: "e2e-project",
  status: "completed",
  progress: 100,
  resultScreens: screenNames.map(screen),
  qualityReport: { score: 100, passed: true, issues: [], metrics: {} },
};

test("phone content scrolls while bottom navigation stays fixed", async ({ page }) => {
  await page.route("**/functions/v1/generate*", async (route) => {
    await route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify(completedJob) });
  });

  await page.goto("/app");
  await page.getByRole("textbox", { name: "Nasıl bir mobil uygulama tasarlamak istiyorsun?" }).fill("Freelance proje ve gelir yönetimi");
  await page.getByRole("button", { name: "Floriven ile Üret ✦" }).click();
  await expect(page).toHaveURL(/\/app\/projeler\/.*\/studio\?jobId=e2e-job/);
  await page.getByRole("button", { name: "Inspector'ı kapat" }).click();

  const viewport = page.locator('[data-scroll-viewport="true"]').nth(1);
  const navigation = page.locator('[data-fixed-navigation="true"]').nth(1);
  await expect(viewport).toBeVisible();
  await expect(navigation).toBeVisible();

  const dimensions = await viewport.evaluate((element) => ({ clientHeight: element.clientHeight, scrollHeight: element.scrollHeight }));
  expect(dimensions.scrollHeight).toBeGreaterThan(dimensions.clientHeight);

  await viewport.hover();
  await page.waitForTimeout(300);
  const navigationBefore = await navigation.boundingBox();
  await page.mouse.wheel(0, 520);
  await expect.poll(() => viewport.evaluate((element) => element.scrollTop)).toBeGreaterThan(0);
  const navigationAfter = await navigation.boundingBox();

  expect(navigationBefore).not.toBeNull();
  expect(navigationAfter).not.toBeNull();
  expect(Math.abs((navigationAfter?.y ?? 0) - (navigationBefore?.y ?? 0))).toBeLessThan(0.5);
  const evidenceRoot = resolve(process.cwd(), "../../docs/certification/evidence/RC1");
  await mkdir(resolve(evidenceRoot, "runtime"), { recursive: true });
  await mkdir(resolve(evidenceRoot, "screenshots"), { recursive: true });
  const viewportBox = await viewport.boundingBox();
  const bounds = await page.locator("[data-node-id]").evaluateAll((elements) => elements.map((element) => {
    const box = element.getBoundingClientRect();
    return { nodeId: element.getAttribute("data-node-id") ?? "unknown", x: box.x, y: box.y, width: box.width, height: box.height };
  }));
  const geometry = createGeometryReport(bounds, { width: viewportBox?.width ?? 390, height: viewportBox?.height ?? 844 });
  await page.locator('[class*="phone"]').nth(1).screenshot({ path: resolve(evidenceRoot, "screenshots/phone-scroll-runtime.png"), animations: "disabled" });
  await writeFile(resolve(evidenceRoot, "runtime/phone-scroll-evidence.json"), JSON.stringify({ renderVersion: "phone-screen-v2", screenshotPath: "screenshots/phone-scroll-runtime.png", viewport: viewportBox, nodes: bounds, geometry, visualCritic: "pending" }, null, 2));
  await expect(page.locator('[class*="phone"]').nth(1)).toHaveScreenshot("phone-scroll-navbar.png", { animations: "disabled" });
});
