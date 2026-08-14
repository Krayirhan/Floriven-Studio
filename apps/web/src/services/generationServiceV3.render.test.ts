import { describe, expect, it } from "vitest";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { compileVisualScreen, DESIGN_TEMPLATES } from "@floriven/design-spec";
import { PhoneScreen } from "../features/studio/canvas/PhoneScreen";
import { toV2Screens, type V3DesignSpecScreen } from "./generationServiceV3";

/**
 * Proves the actual integration claim: a screen produced by the Generation V3 compiler
 * (supabase/functions/generation-v3/design-spec-compiler.ts), once adapted through
 * toV2Screens, flows through the SAME compositor and renderer the Studio canvas already uses
 * for V2 — compileVisualScreen (packages/design-spec) then <PhoneScreen> — with no crash and
 * with real typed content visible, not just structural type-compatibility.
 */
function renderV3Screen(v3Screen: V3DesignSpecScreen): string {
  const [screen] = toV2Screens([v3Screen]);
  if (!screen) throw new Error("expected an adapted screen");
  const template = DESIGN_TEMPLATES[0];
  if (!template) throw new Error("expected a default design template");
  const compiled = compileVisualScreen({
    screen,
    strategy: { mode: "auto", ...template.strategy, rationale: ["V3 integration test — no strategy on the V3 screen itself"] },
    styleSystemProfile: template.system,
  });
  return renderToStaticMarkup(createElement(PhoneScreen, { screen, compiled, selectedNodeId: "", active: true, onSelect: () => undefined }));
}

const scheduleV3Screen: V3DesignSpecScreen = {
  id: "scr_weekly-schedule",
  name: "Haftalık Takvim",
  route: "/weekly-schedule",
  root: {
    id: "node_weekly-schedule_root",
    type: "Screen",
    layout: { mode: "column", gap: "space.4" },
    a11y: { role: "main", label: "Haftalık Takvim", hint: null, state: null, order: 0 },
    visibility: true,
    children: [
      {
        id: "node_weekly-schedule_region-calendar",
        type: "Stack",
        layout: { mode: "column", gap: "space.4" },
        a11y: { role: "birincil etkileşim alanı", label: "Haftalık takvim bölgesi odaklandı", hint: null, state: null, order: 1 },
        visibility: true,
        children: [
          {
            id: "node_weekly-schedule_node-calendar",
            type: "Calendar",
            props: {
              label: "Haftalık Saha Ziyaret Takvimi",
              days: ["Pzt 10", "Sal 11", "Çar 12", "Per 13", "Cum 14"],
              events: ["Salı 14:00 Ahşap Villa saha ziyareti"],
            },
            layout: { size: "fill" },
            bindings: [{ dataPath: "ziyaret zamanı" }],
            interactions: [{ event: "press", action: { type: "setLocalState", params: { interaction: "inspect", actionId: "action-inspect" } } }],
            a11y: { role: "content", label: "Haftalık Saha Ziyaret Takvimi", hint: null, state: null, order: 1 },
            visibility: true,
          },
        ],
      },
      {
        id: "node_weekly-schedule_region-visit-details",
        type: "Stack",
        layout: { mode: "column", gap: "space.2" },
        a11y: { role: "destekleyici bilgi alanı", label: "Ziyaret detay özeti odaklandı", hint: null, state: null, order: 2 },
        visibility: true,
        children: [
          {
            id: "node_weekly-schedule_node-visit-card",
            type: "Card",
            props: {
              title: "Proje adı: Ahşap Villa Yenileme",
              subtitle: "Ahşap kompozit ve iç mekan tasarımı",
            },
            layout: { size: "hug" },
            bindings: [{ dataPath: "proje adı" }],
            interactions: [],
            a11y: { role: "content", label: "Proje adı: Ahşap Villa Yenileme", hint: null, state: null, order: 1 },
            visibility: true,
          },
        ],
      },
    ],
  },
};

describe("Generation V3 screens through the real Studio canvas pipeline", () => {
  it("compiles and renders without crashing, with no unsupported-component fallback", () => {
    const html = renderV3Screen(scheduleV3Screen);
    expect(html).not.toContain("UNSUPPORTED_RENDERER_COMPONENT");
  });

  it("renders structural defining-component content (days, hours, events, card title/subtitle)", () => {
    const html = renderV3Screen(scheduleV3Screen);
    expect(html).toContain("Haftalık Saha Ziyaret Takvimi");
    expect(html).toContain("Pzt");
    expect(html).toContain("Sal");
    expect(html).toContain("9:00");
    expect(html).toContain("Salı 14:00 Ahşap Villa saha ziyareti");
    expect(html).toContain("Proje adı: Ahşap Villa Yenileme");
    expect(html).toContain("Ahşap kompozit ve iç mekan tasarımı");
  });

  it("renders the phone frame at the canonical viewport regardless of the V3 screen carrying no strategy", () => {
    const html = renderV3Screen(scheduleV3Screen);
    expect(html).toContain('data-viewport-width="390"');
    expect(html).toContain('data-viewport-height="844"');
    expect(html).toContain('data-renderer-version="phone-screen-v4"');
  });

  it("marks selectable nodes with their V3-derived, globally-unique ids", () => {
    const html = renderV3Screen(scheduleV3Screen);
    expect(html).toContain('data-floriven-node-id="node_weekly-schedule_node-calendar"');
    expect(html).toContain('data-floriven-node-id="node_weekly-schedule_node-visit-card"');
  });

  it("stamps each UXStructure region as a semantic section — required for capturePhoneRuntime to recognize sections at all", () => {
    const html = renderV3Screen(scheduleV3Screen);
    expect((html.match(/data-semantic-container="true"/g) ?? []).length).toBe(2);
    expect(html).toContain('data-section-role="birincil etkileşim alanı"');
    expect(html).toContain('data-section-role="destekleyici bilgi alanı"');
    expect(html).not.toMatch(/data-node-id="node_weekly-schedule_node-calendar"[^>]*data-semantic-container/);
  });
});
