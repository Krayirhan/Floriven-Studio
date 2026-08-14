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
 * with real content visible, not just structural type-compatibility.
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
            // Realistic Generation V3 ContentPlan output: free-form field names, no knowledge
            // of PhoneScreen's expected `label`/`days`/`events` keys for this component type.
            props: { title: "Salı 14:00 Ahşap Villa saha ziyareti" },
            layout: { size: "fill" },
            bindings: [{ dataPath: "ziyaret zamanı" }],
            interactions: [{ event: "press", action: { type: "setLocalState", params: { interaction: "inspect", actionId: "action-inspect" } } }],
            a11y: { role: "content", label: "Salı 14:00 Ahşap Villa saha ziyareti", hint: null, state: null, order: 1 },
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
            props: { projectName: "Proje adı: Ahşap Villa Yenileme" },
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

  it("makes the V3 content actually visible even though the field name (title) doesn't match what the component looks up (label)", () => {
    const html = renderV3Screen(scheduleV3Screen);
    expect(html).toContain("Salı 14:00 Ahşap Villa saha ziyareti");
    expect(html).toContain("Proje adı: Ahşap Villa Yenileme");
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
  });

  it("stamps each UXStructure region as a semantic section — required for capturePhoneRuntime to recognize sections at all", () => {
    const html = renderV3Screen(scheduleV3Screen);
    // Both regions carry data-semantic-container="true" and their own a11y role as the section role.
    expect((html.match(/data-semantic-container="true"/g) ?? []).length).toBe(2);
    expect(html).toContain('data-section-role="birincil etkileşim alanı"');
    expect(html).toContain('data-section-role="destekleyici bilgi alanı"');
    // Leaves are ordinary content, not sections.
    expect(html).not.toMatch(/data-node-id="node_weekly-schedule_node-calendar"[^>]*data-semantic-container/);
  });
});
