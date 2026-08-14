import type { ProductBlueprint, ProductScreenPlan } from "./product-blueprint";
import { createScreenIntent } from "./screen-intent";
import type { PresentationSpecV2 } from "./presentation/contracts";
import { composeAnalytics, composeDetail, composeForm, composeSettings } from "./composition/coreComposers";
import { composeDashboard } from "./composition/dashboard";
import { composeManagementList } from "./composition/managementList";
import type { DesignNode } from "./types";
import type { ScreenRenderPlan } from "./render-plan";

export interface DeterministicScreen { id: string; name: string; route: string; root: DesignNode; renderPlan: ScreenRenderPlan; quality: { static: "pass"; geometry: "pending"; visualScore: 6; fallback: true }; }
export interface DeterministicCandidate { screens: DeterministicScreen[]; provider: "deterministic"; deterministicHash: string; }

export function composeDeterministicCandidate(input: { blueprint: ProductBlueprint; presentation: PresentationSpecV2 }): DeterministicCandidate {
  const screens = input.blueprint.screens.map((screen) => composeScreen(screen, input.blueprint, input.presentation));
  const serialized = JSON.stringify(screens.map(({ renderPlan, ...screen }) => ({ ...screen, renderPlan })));
  return { screens, provider: "deterministic", deterministicHash: hash(serialized) };
}

function composeScreen(screen: ProductScreenPlan, blueprint: ProductBlueprint, presentation: PresentationSpecV2): DeterministicScreen {
  const archetype = screen.role === "overview" ? "dashboard" : screen.role === "settings" ? "settings" : screen.role === "form" || screen.role === "onboarding" ? "form" : screen.role === "detail" ? "detail" : "management_list";
  const intent = createScreenIntent({ screenId: screen.id, archetype, navigationMode: archetype === "form" || archetype === "detail" ? "focused" : "root", contentDensity: presentation.spacing.density === "compact" ? "high" : presentation.spacing.density === "spacious" ? "low" : "medium" });
  const root: DesignNode = { id: `${screen.id}_root`, type: "Screen", props: { deterministic: true }, a11y: { role: "main", label: screen.name }, children: contentFor(screen, blueprint) };
  const input = { screen: { id: screen.id, root }, intent, presentation };
  const renderPlan = archetype === "dashboard" ? composeDashboard(input) : archetype === "management_list" ? composeManagementList(input) : archetype === "form" ? composeForm(input) : archetype === "detail" ? composeDetail(input) : archetype === "settings" ? composeSettings(input) : composeDashboard(input);
  return { id: screen.id, name: screen.name, route: screen.route, root, renderPlan, quality: { static: "pass", geometry: "pending", visualScore: 6, fallback: true } };
}

function contentFor(screen: ProductScreenPlan, blueprint: ProductBlueprint): DesignNode[] {
  const vocabulary = blueprint.contentVocabulary.length ? blueprint.contentVocabulary : blueprint.entities;
  const subject = vocabulary[0] ?? screen.purpose;
  const second = vocabulary[1] ?? "güncel kayıt";
  const node = (id: string, type: string, props: Record<string, unknown>): DesignNode => ({ id: `${screen.id}_${id}`, type, props });
  switch (screen.role) {
    case "overview": return [node("title", "TopAppBar", { title: screen.name }), node("metric", "Metric", { label: `${subject} özeti`, value: "12", caption: "Bu dönem" }), node("chart", "Chart", { label: `${subject} trendi`, values: [4, 7, 6, 9] }), node("action", "Button", { label: `${subject} ekle` })];
    case "settings": return [node("section", "Text", { text: `${subject} tercihleri`, variant: "heading" }), node("row", "ListItem", { title: second, subtitle: `${subject} ayarını yönet`, trailing: "Açık" }), node("toggle", "Switch", { label: `${subject} bildirimleri`, checked: true }), node("divider", "Divider", {})];
    case "form": return [node("context", "Text", { text: `${subject} oluştur`, variant: "heading" }), node("field", "TextField", { label: subject, placeholder: `${subject} girin` }), node("notes", "TextField", { label: "Açıklama", placeholder: `${subject} detaylarını yazın` }), node("save", "Button", { label: `${subject} kaydet` })];
    case "detail": return [node("identity", "Text", { text: subject, variant: "title" }), node("state", "Progress", { label: `${subject} ilerlemesi`, value: 64 }), node("timeline", "ListItem", { title: second, subtitle: `${subject} için sonraki adım`, trailing: "64%" }), node("action", "Button", { label: `${subject} güncelle` })];
    case "core": return [node("search", "SearchField", { placeholder: `${subject} ara` }), node("filter", "SegmentedControl", { items: ["Tümü", "Aktif", "Arşiv"] }), node("row1", "ListItem", { title: subject, subtitle: `${second} ile ilişkili`, trailing: "12" }), node("row2", "ListItem", { title: second, subtitle: `${subject} için kayıt`, trailing: "8" })];
    default: return [node("context", "Text", { text: screen.purpose, variant: "heading" }), node("row", "ListItem", { title: subject, subtitle: screen.purpose, trailing: "Güncel" })];
  }
}

function hash(value: string): string { let result = 2166136261; for (const char of value) { result ^= char.charCodeAt(0); result = Math.imul(result, 16777619); } return (result >>> 0).toString(16).padStart(8, "0"); }
