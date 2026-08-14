import { expect, test } from "@playwright/test";
import { mkdir, writeFile } from "node:fs/promises";
import { resolve } from "node:path";
import { CANONICAL_VIEWPORT } from "@floriven/design-spec";

const modes = [
  { id: "obsidian", mode: "template", preset: "obsidian-precision", palette: "obsidian", card: "crisp", density: "compact", nav: "glass" },
  { id: "serene", mode: "template", preset: "serene-health", palette: "serene", card: "soft", density: "comfortable", nav: "floating" },
  { id: "terracotta", mode: "template", preset: "terracotta-market", palette: "terracotta", card: "layered", density: "comfortable", nav: "solid" },
  { id: "electric", mode: "template", preset: "electric-learning", palette: "electric", card: "playful", density: "comfortable", nav: "floating" },
  { id: "editorial", mode: "template", preset: "editorial-culture", palette: "editorial", card: "minimal", density: "spacious", nav: "minimal" },
  { id: "auto", mode: "auto", palette: "obsidian", card: "crisp", density: "compact", nav: "glass" },
  { id: "deterministic", mode: "auto", palette: "obsidian", card: "crisp", density: "compact", nav: "glass", deterministic: true },
] as const;
const archetypes = ["dashboard", "management-list", "detail", "form", "analytics", "settings"] as const;
const navItems = ["Özet", "İşlemler", "Faturalar", "Analiz"];

function n(id: string, type: string, props: Record<string, unknown> = {}) { return { id, type, props, a11y: { role: type === "Button" ? "button" : "group", label: id } }; }
function content(archetype: typeof archetypes[number], prefix: string) {
  if (archetype === "dashboard") return [n(`${prefix}-title`, "Text", { text: "Finansal genel bakış", variant: "title" }), n(`${prefix}-balance`, "Metric", { label: "Toplam bakiye", value: "₺124.500", caption: "Güncel" }), n(`${prefix}-income`, "Metric", { label: "Bu ay gelir", value: "₺48.200" }), n(`${prefix}-expense`, "Metric", { label: "Bu ay gider", value: "₺19.860" }), n(`${prefix}-trend`, "Chart", { label: "Gelir ve gider trendi", values: [31, 42, 38, 52, 48, 61], chartType: "area" }), n(`${prefix}-cta`, "Button", { label: "Yeni işlem" })];
  if (archetype === "management-list") return [n(`${prefix}-title`, "Text", { text: "İşlemler", variant: "title" }), n(`${prefix}-search`, "SearchField", { placeholder: "İşlem ara" }), n(`${prefix}-filter`, "SegmentedControl", { items: ["Tümü", "Gelir", "Gider"] }), ...[["Nova Tasarım", "+₺18.500"], ["Ofis kirası", "-₺12.000"], ["Cloud servisleri", "-₺3.860"], ["Atlas Yazılım", "+₺24.000"], ["Vergi ödemesi", "-₺4.000"]].map(([title, trailing], i) => n(`${prefix}-row-${i}`, "ListItem", { title, subtitle: "Ağustos 2026", trailing }))];
  if (archetype === "detail") return [n(`${prefix}-title`, "Text", { text: "INV-2026-041", variant: "title" }), n(`${prefix}-avatar`, "Avatar", { initials: "NT" }), n(`${prefix}-status`, "Badge", { label: "Ödendi" }), n(`${prefix}-amount`, "Metric", { label: "Fatura toplamı", value: "₺18.500", caption: "Nova Tasarım" }), n(`${prefix}-progress`, "Progress", { label: "Tahsilat tamamlandı", value: 100 }), n(`${prefix}-meta`, "ListItem", { title: "Vade tarihi", subtitle: "18 Ağustos 2026", trailing: "Tamamlandı" }), n(`${prefix}-cta`, "Button", { label: "Faturayı görüntüle" })];
  if (archetype === "form") return [n(`${prefix}-title`, "Text", { text: "Yeni fatura", variant: "title" }), n(`${prefix}-customer`, "TextField", { placeholder: "Müşteri seçin" }), n(`${prefix}-number`, "TextField", { placeholder: "Fatura numarası" }), n(`${prefix}-amount`, "TextField", { placeholder: "Tutar" }), n(`${prefix}-date`, "TextField", { placeholder: "Vade tarihi" }), n(`${prefix}-tax`, "SegmentedControl", { items: ["%0", "%10", "%20"] }), n(`${prefix}-cta`, "Button", { label: "Faturayı kaydet" })];
  if (archetype === "analytics") return [n(`${prefix}-title`, "Text", { text: "Finans analizi", variant: "title" }), n(`${prefix}-rate`, "Metric", { label: "Tahsilat oranı", value: "%91" }), n(`${prefix}-reserve`, "Metric", { label: "Vergi rezervi", value: "₺8.740" }), n(`${prefix}-period`, "SegmentedControl", { items: ["Ay", "Çeyrek", "Yıl"] }), n(`${prefix}-revenue`, "Chart", { label: "Aylık gelir", values: [32, 38, 41, 44, 48, 52], chartType: "line" }), n(`${prefix}-expense`, "Chart", { label: "Aylık gider", values: [22, 18, 24, 20, 19, 21], chartType: "bar" }), n(`${prefix}-collection`, "Chart", { label: "Tahsilat karşılaştırması", values: [91, 9], chartType: "donut" })];
  return [n(`${prefix}-title`, "Text", { text: "Ayarlar", variant: "title" }), n(`${prefix}-profile`, "ListItem", { title: "Şirket profili", subtitle: "Finans bilgileri" }), n(`${prefix}-currency`, "ListItem", { title: "Para birimi", subtitle: "Türk lirası (₺)" }), n(`${prefix}-notify`, "Switch", { label: "Vade bildirimleri" }), n(`${prefix}-weekly`, "Switch", { label: "Haftalık finans özeti" }), n(`${prefix}-divider`, "Divider"), n(`${prefix}-security`, "ListItem", { title: "Güvenlik", subtitle: "Erişim ve oturumlar" })];
}

function screen(mode: typeof modes[number], archetype: typeof archetypes[number], index: number) {
  const focused = archetype === "form" || archetype === "detail";
  const prefix = `${mode.id}-${archetype}`;
  return { id: prefix, name: `${mode.id} ${archetype}`, route: `/${prefix}`, root: { id: `${prefix}-root`, type: "Screen", props: { deterministic: "deterministic" in mode && mode.deterministic === true, screenIntent: { archetype: archetype === "management-list" ? "management_list" : archetype, navigationMode: focused ? "focused" : "root", contentDensity: mode.density === "compact" ? "high" : mode.density === "spacious" ? "low" : "medium" }, strategy: { mode: mode.mode, ...(mode.mode === "template" ? { stylePresetId: mode.preset } : {}), palette: mode.palette, cardStyle: mode.card, density: mode.density, navigationStyle: mode.nav, visualDirection: `${mode.id} championship`, rationale: ["canonical finance fixture"] } }, children: [...content(archetype, prefix), ...(!focused ? [n(`${prefix}-nav`, "BottomNavigation", { items: navItems })] : [])] } };
}

test("captures 42 canonical production runtime screens", async ({ page }) => {
  test.setTimeout(180_000);
  const screens = modes.flatMap((mode) => archetypes.map((archetype, index) => screen(mode, archetype, index)));
  await page.route("**/functions/v1/generate*", (route) => route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify({ id: "visual-championship", projectId: "visual-championship", status: "completed", progress: 100, resultScreens: screens, qualityReport: { score: 100, passed: true, issues: [], metrics: {} } }) }));
  await page.goto("/app");
  await page.getByRole("textbox", { name: /Nasıl bir mobil uygulama/ }).fill("Canonical finance visual championship");
  await page.getByRole("button", { name: /Floriven ile Üret/ }).click();
  await expect(page).toHaveURL(/jobId=visual-championship/);
  const phones = page.locator('[data-renderer-version="phone-screen-v4"]');
  await expect(phones).toHaveCount(42);
  const root = resolve(process.cwd(), "../../audit-artifacts/visual-championship");
  const manifest: Array<Record<string, unknown>> = [];
  const topologyEvidence: Array<{ mode: string; archetype: string; sequence: string; spans: string; dominantCount: number; familyHistogram: string }> = [];
  for (let index = 0; index < 42; index += 1) {
    const mode = modes[Math.floor(index / 6)]!;
    const archetype = archetypes[index % 6]!;
    const phone = phones.nth(index);
    const geometry = await phone.evaluate((element) => {
      const rootBox = element.getBoundingClientRect(); const scaleX = rootBox.width / (element as HTMLElement).offsetWidth; const scaleY = rootBox.height / (element as HTMLElement).offsetHeight;
      const sections = [...element.querySelectorAll<HTMLElement>("[data-render-section-role]")].map((section) => { const box = section.getBoundingClientRect(); return { role: section.dataset.renderSectionRole, order: Number(section.dataset.renderOrder), span: Number(section.dataset.renderSpan), emphasis: section.dataset.renderEmphasis, family: section.dataset.renderFamily, x: (box.left - rootBox.left) / scaleX, y: (box.top - rootBox.top) / scaleY, width: box.width / scaleX, height: box.height / scaleY }; });
      const nodes = [...element.querySelectorAll<HTMLElement>("[data-floriven-node-id]")].map((node) => { const box = node.getBoundingClientRect(); const style = getComputedStyle(node); return { nodeId: node.dataset.florivenNodeId, component: node.tagName.toLowerCase(), role: node.getAttribute("role"), sectionRole: node.closest("[data-render-section-role]")?.getAttribute("data-render-section-role"), x: (box.left - rootBox.left) / scaleX, y: (box.top - rootBox.top) / scaleY, width: box.width / scaleX, height: box.height / scaleY, fontSize: style.fontSize, lineHeight: style.lineHeight, overflow: style.overflow, visibility: style.visibility }; });
      const interactive = [...element.querySelectorAll<HTMLElement>("button,input,[role=button]")].map((node) => { const box = node.getBoundingClientRect(); return { width: box.width / scaleX, height: box.height / scaleY }; });
      const nav = element.querySelector<HTMLElement>('[data-fixed-navigation="true"]'); const navBox = nav?.getBoundingClientRect();
      return { logicalViewport: { width: (element as HTMLElement).offsetWidth, height: (element as HTMLElement).offsetHeight }, layoutViewport: { width: Number(element.getAttribute("data-layout-viewport-width")), height: Number(element.getAttribute("data-layout-viewport-height")) }, transformedPreview: { width: rootBox.width, height: rootBox.height, scaleX, scaleY }, layoutPattern: element.getAttribute("data-layout-pattern"), horizontalOverflow: (element as HTMLElement).scrollWidth > (element as HTMLElement).clientWidth, navigationInside: !navBox || (navBox.left >= rootBox.left && navBox.right <= rootBox.right && navBox.bottom <= rootBox.bottom), minimumTouchTarget: interactive.length ? Math.min(...interactive.map((item) => Math.min(item.width, item.height))) : null, sections, nodes };
    });
    expect(geometry.logicalViewport).toEqual({ width: CANONICAL_VIEWPORT.width, height: CANONICAL_VIEWPORT.height });
    expect(geometry.layoutViewport).toEqual({ width: CANONICAL_VIEWPORT.width, height: CANONICAL_VIEWPORT.height });
    expect(geometry.horizontalOverflow).toBe(false); expect(geometry.navigationInside).toBe(true);
    topologyEvidence.push({ mode: mode.id, archetype, sequence: geometry.sections.map((section) => section.role).join(">"), spans: geometry.sections.map((section) => section.span).join(","), dominantCount: geometry.sections.filter((section) => section.emphasis === "primary").length, familyHistogram: geometry.sections.map((section) => section.family).sort().join("|") });
    const restore = await phone.evaluate((element) => {
      const touched: Array<{ element: HTMLElement; style: string | null }> = [];
      for (let current: HTMLElement | null = element as HTMLElement; current && current !== document.body; current = current.parentElement) { touched.push({ element: current, style: current.getAttribute("style") }); current.style.transform = "none"; current.style.overflow = "visible"; }
      const target = element as HTMLElement; target.style.position = "fixed"; target.style.left = "0"; target.style.top = "0"; target.style.zIndex = "999999"; target.style.width = "390px"; target.style.height = "844px";
      document.body.dataset.auditCapture = "true";
      const style = document.createElement("style"); style.id = "audit-capture-visibility"; style.textContent = 'body[data-audit-capture="true"] *{visibility:hidden!important} body[data-audit-capture="true"] [data-renderer-version="phone-screen-v4"].auditCaptureTarget,body[data-audit-capture="true"] [data-renderer-version="phone-screen-v4"].auditCaptureTarget *{visibility:visible!important}'; document.head.appendChild(style); target.classList.add("auditCaptureTarget");
      return touched.map((item) => item.style);
    });
    const screenshotPath = resolve(root, "screenshots", mode.id, `${archetype}.png`); await mkdir(resolve(screenshotPath, ".."), { recursive: true });
    const captureBox = await phone.boundingBox(); expect(captureBox?.width).toBeCloseTo(CANONICAL_VIEWPORT.width, 2); expect(captureBox?.height).toBeCloseTo(CANONICAL_VIEWPORT.height, 2);
    await page.screenshot({ path: screenshotPath, animations: "disabled", clip: { x: captureBox!.x, y: captureBox!.y, width: CANONICAL_VIEWPORT.width, height: CANONICAL_VIEWPORT.height } });
    await phone.evaluate((element, styles) => { const touched: HTMLElement[] = []; for (let current: HTMLElement | null = element as HTMLElement; current && current !== document.body; current = current.parentElement) touched.push(current); touched.forEach((current, i) => { const value = styles[i]; if (value) current.setAttribute("style", value); else current.removeAttribute("style"); }); (element as HTMLElement).classList.remove("auditCaptureTarget"); delete document.body.dataset.auditCapture; document.getElementById("audit-capture-visibility")?.remove(); }, restore);
    const geometryPath = resolve(root, "geometry", mode.id, `${archetype}.json`); await mkdir(resolve(geometryPath, ".."), { recursive: true }); await writeFile(geometryPath, JSON.stringify(geometry, null, 2));
    manifest.push({ mode: mode.id, archetype, screenId: `${mode.id}-${archetype}`, screenshotPath: `screenshots/${mode.id}/${archetype}.png`, geometryPath: `geometry/${mode.id}/${archetype}.json`, logicalViewport: geometry.logicalViewport, layoutViewport: geometry.layoutViewport, preview: geometry.transformedPreview, valid: true });
  }
  for (const mode of modes) {
    const modeEvidence = topologyEvidence.filter((entry) => entry.mode === mode.id);
    expect(new Set(modeEvidence.map((entry) => entry.sequence)).size).toBe(archetypes.length);
    expect(new Set(modeEvidence.map((entry) => `${entry.spans}:${entry.dominantCount}:${entry.familyHistogram}`)).size).toBe(archetypes.length);
  }
  await writeFile(resolve(root, "matrix-manifest.json"), JSON.stringify({ expectedScreenCount: 42, validRuntimeScreens: manifest.length, viewport: CANONICAL_VIEWPORT, rendererVersion: "phone-screen-v4", entries: manifest }, null, 2));
});
