import { expect, test } from "@playwright/test";
import { mkdir, writeFile } from "node:fs/promises";
import { resolve } from "node:path";
import { CANONICAL_VIEWPORT } from "@floriven/design-spec";

const presets = [
  ["obsidian-precision", "obsidian", "crisp", "compact", "glass"],
  ["serene-health", "serene", "soft", "comfortable", "floating"],
  ["terracotta-market", "terracotta", "layered", "comfortable", "solid"],
  ["electric-learning", "electric", "playful", "comfortable", "floating"],
  ["editorial-culture", "editorial", "minimal", "spacious", "minimal"],
] as const;
const archetypes = ["dashboard", "management_list", "detail", "form", "analytics", "settings"] as const;

function node(id: string, type: string, props: Record<string, unknown> = {}) {
  return { id, type, props, a11y: { role: "group", label: id } };
}

function deterministicScreen(archetype: typeof archetypes[number], index: number) {
  const [stylePresetId, palette, cardStyle, density, navigationStyle] = presets[index % presets.length]!;
  const common = [node(`title-${index}`, "Text", { text: `${archetype} deterministic`, variant: "title" })];
  const content = archetype === "dashboard" ? [node(`metric-${index}`, "Metric", { label: "Aktif", value: "42" }), node(`chart-${index}`, "Chart", { label: "Trend", values: [12, 30, 24], chartType: "line" }), node(`card-${index}`, "Card")]
    : archetype === "management_list" ? [node(`search-${index}`, "SearchField", { placeholder: "Ara" }), node(`row-${index}`, "ListItem", { title: "Kayıt", subtitle: "Deterministic" })]
      : archetype === "detail" ? [node(`avatar-${index}`, "Avatar", { initials: "DV" }), node(`badge-${index}`, "Badge", { label: "Aktif" }), node(`progress-${index}`, "Progress", { value: 68 })]
        : archetype === "form" ? [node(`field-${index}`, "TextField", { placeholder: "Değer" }), node(`button-${index}`, "Button", { label: "Kaydet" })]
          : archetype === "analytics" ? [node(`metric-${index}`, "Metric", { label: "Oran", value: "%68" }), node(`chart-${index}`, "Chart", { label: "Dağılım", values: [68, 32], chartType: "donut" })]
            : [node(`toggle-${index}`, "Switch", { label: "Bildirimler" }), node(`divider-${index}`, "Divider"), node(`image-${index}`, "Image", { alt: "Boş durum" }), node(`icon-${index}`, "Icon", { name: "settings" })];
  const rootNavigation = archetype === "dashboard" || archetype === "management_list" || archetype === "analytics" || archetype === "settings";
  return {
    id: `det-${archetype}`,
    name: archetype,
    route: `/${archetype}`,
    root: {
      id: `root-${index}`,
      type: "Screen",
      props: {
        deterministic: true,
        screenIntent: { archetype, navigationMode: rootNavigation ? "root" : "focused", contentDensity: density === "compact" ? "high" : density === "spacious" ? "low" : "medium" },
        strategy: { mode: "template", stylePresetId, palette, cardStyle, density, navigationStyle, visualDirection: "runtime certification", rationale: ["provider disabled"] },
      },
      children: [...common, ...content, ...(rootNavigation ? [node(`nav-${index}`, "BottomNavigation", { items: archetypes.slice(0, 4) })] : [])],
    },
  };
}

test("StyleSystemProfile and deterministic V2 traverse the production V4 renderer", async ({ page }) => {
  const screens = archetypes.map(deterministicScreen);
  await page.route("**/functions/v1/generate*", (route) => route.fulfill({
    status: 200,
    contentType: "application/json",
    body: JSON.stringify({ id: "det-v2-runtime", projectId: "det-v2-project", status: "completed", progress: 100, resultScreens: screens, provider: "deterministic", model: null, qualityReport: { score: 100, passed: true, issues: [], metrics: {} } }),
  }));
  await page.goto("/app");
  await page.getByRole("textbox", { name: /Nasıl bir mobil uygulama/ }).fill("Deterministic V2 runtime certification");
  await page.getByRole("button", { name: /Floriven ile Üret/ }).click();
  await expect(page).toHaveURL(/jobId=det-v2-runtime/);
  const phones = page.locator('[data-renderer-version="phone-screen-v4"]');
  await expect(phones).toHaveCount(6);
  await expect(page.locator('[data-renderer-version*="legacy"], [data-renderer-version="phone-screen-v2"]')).toHaveCount(0);

  const evidence = await phones.evaluateAll((elements) => elements.map((element) => {
    const style = getComputedStyle(element);
    return {
      screenId: element.getAttribute("data-floriven-screen-id"),
      archetype: element.getAttribute("data-screen-composition"),
      layout: element.getAttribute("data-layout-pattern"),
      availableLayouts: element.getAttribute("data-available-layouts"),
      grouping: element.getAttribute("data-grouping-style"),
      chartGrid: element.getAttribute("data-chart-grid"),
      controlFamily: element.getAttribute("data-control-family"),
      dataPresentation: element.getAttribute("data-data-presentation"),
      interaction: element.getAttribute("data-interaction-style"),
      cardPadding: style.getPropertyValue("--gen-card-padding").trim(),
      headingSize: style.getPropertyValue("--gen-heading-size").trim(),
      chartHeight: style.getPropertyValue("--gen-chart-height").trim(),
      fieldRadius: style.getPropertyValue("--gen-field-radius").trim(),
      logicalWidth: (element as HTMLElement).offsetWidth,
      logicalHeight: (element as HTMLElement).offsetHeight,
      layoutWidth: Number(element.getAttribute("data-layout-viewport-width")),
      layoutHeight: Number(element.getAttribute("data-layout-viewport-height")),
      horizontalOverflow: (element as HTMLElement).scrollWidth > (element as HTMLElement).clientWidth,
      previewScale: element.getBoundingClientRect().width / (element as HTMLElement).offsetWidth,
      navigationValid: !element.querySelector('[data-fixed-navigation="true"]') || (() => { const nav = element.querySelector('[data-fixed-navigation="true"]')!.getBoundingClientRect(); const root = element.getBoundingClientRect(); return nav.left >= root.left && nav.right <= root.right && nav.bottom <= root.bottom; })(),
      layoutSections: element.querySelectorAll("[data-layout-width][data-layout-height]").length,
    };
  }));
  expect(new Set(evidence.map((item) => item.archetype)).size).toBe(6);
  expect(new Set(evidence.map((item) => item.layout)).size).toBeGreaterThan(1);
  expect(new Set(evidence.map((item) => item.cardPadding)).size).toBeGreaterThan(2);
  expect(new Set(evidence.map((item) => item.headingSize)).size).toBeGreaterThan(2);
  expect(evidence.every((item) => item.layoutSections > 0)).toBe(true);
  expect(evidence.every((item) => item.logicalWidth === CANONICAL_VIEWPORT.width && item.logicalHeight === CANONICAL_VIEWPORT.height)).toBe(true);
  expect(evidence.every((item) => item.layoutWidth === CANONICAL_VIEWPORT.width && item.layoutHeight === CANONICAL_VIEWPORT.height)).toBe(true);
  expect(evidence.every((item) => !item.horizontalOverflow && item.navigationValid)).toBe(true);
  expect(evidence.every((item) => item.previewScale > 0 && item.previewScale < 1)).toBe(true);

  const target = resolve(process.cwd(), "../../audit-artifacts/runtime/deterministic-v2-runtime.json");
  await mkdir(resolve(target, ".."), { recursive: true });
  await writeFile(target, JSON.stringify({ passed: true, provider: "disabled", model: "disabled", candidate: "deterministic", pipeline: ["ScreenIntent", "PresentationSpecV2", "composeScreen", "RenderPlan", "LayoutEngine", "PhoneScreenV4"], screens: evidence }, null, 2));
});
