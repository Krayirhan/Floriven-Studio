import { describe, expect, it } from "vitest";
import { compileVisualScreen } from "./visual-compiler";
import { findDesignTemplate } from "./strategy";
import type { Screen } from "./types";

function fixture(archetype: string): Screen {
  return { id: archetype, name: "Unrelated title", root: { id: `${archetype}-root`, type: "Screen", props: { screenIntent: { archetype, navigationMode: archetype === "form" || archetype === "detail" ? "focused" : "root", contentDensity: "medium" } }, children: [
    { id: `${archetype}-bar`, type: "TopAppBar", props: { title: "Başlık" } },
    { id: `${archetype}-metric`, type: "Metric", props: { label: "Toplam", value: "12" } },
    { id: `${archetype}-chart`, type: "Chart", props: { label: "Trend", values: [1, 3, 2] } },
    { id: `${archetype}-field`, type: "TextField", props: { label: "Alan" } },
    { id: `${archetype}-row`, type: "ListItem", props: { title: "Kayıt", subtitle: "Detay", trailing: "12" } },
    { id: `${archetype}-button`, type: "Button", props: { label: "Kaydet" } },
  ] } };
}

describe("production visual compiler", () => {
  it.each(["dashboard", "management_list", "detail", "form", "analytics", "settings"])("compiles %s through V2, RenderPlan and LayoutEngine", (archetype) => {
    const template = findDesignTemplate("terracotta-market")!;
    const compiled = compileVisualScreen({ screen: fixture(archetype), strategy: { mode: "template", ...template.strategy, stylePresetId: template.id, rationale: [] }, styleSystemProfile: template.system });
    expect(compiled.intent.archetype).toBe(archetype);
    expect(compiled.presentation.version).toBe("2.0.0");
    expect(compiled.renderPlan.version).toBe("1.0.0");
    expect(compiled.layout.viewport).toMatchObject({ width: 390, height: 844 });
  });
});
