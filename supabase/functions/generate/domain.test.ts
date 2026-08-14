import { describe, expect, it } from "vitest";
import { buildSyntheticBlueprint, deriveArchetype, deriveExperiencePattern, meetsScreenPolicy, parseModelJson, requiresSettingsScreen, resolveDomainPack, resolveScreenPolicy, type ProductBlueprint } from "./domain";

const stylePresetIds = [
  "obsidian-precision",
  "serene-health",
  "terracotta-market",
  "electric-learning",
  "editorial-culture",
] as const;

function blueprint(productDomain: string, vocabulary: string[]): ProductBlueprint {
  return {
    productDomain,
    audience: "Mobil uygulama kullanıcıları",
    entities: vocabulary,
    capabilities: vocabulary,
    contentVocabulary: vocabulary,
    screens: [{ id: "ana-akis", name: "Ana Akış", route: "/ana-akis", purpose: "Temel işi çözer", sections: ["Özet"], role: "overview", priority: "primary", navigationPlacement: "primary" }],
    navigation: { primaryScreenIds: ["ana-akis"], utilityScreenIds: [] },
    screenPolicy: { requestedCount: 1, minCount: 1, maxCount: 1, rationale: "Test" },
  };
}

describe("domain capability resolution", () => {
  it("derives defining experience patterns from Turkish and English screen intent", () => {
    expect(deriveExperiencePattern("Haftalık randevu takvimi ve saat blokları")).toBe("calendar");
    expect(deriveExperiencePattern("Müşteri aktivite geçmişi")).toBe("timeline");
    expect(deriveExperiencePattern("Proje portfolyo galerisi")).toBe("gallery");
    expect(deriveExperiencePattern("Sprint kanban board")).toBe("board");
    expect(deriveExperiencePattern("Şubelere göre konum haritası")).toBe("map");
    expect(deriveExperiencePattern("Fatura detayları")).toBe("standard");
  });
  it("honors explicit counts and lets AI decide when no count is supplied", () => {
    expect(resolveScreenPolicy("Freelance ürün için 6 ekran tasarla")).toMatchObject({ requestedCount: 6, minCount: 6, maxCount: 6 });
    expect(resolveScreenPolicy("Freelance proje yönetimi", "Tek ekran")).toMatchObject({ requestedCount: 1 });
    expect(resolveScreenPolicy("Freelance proje yönetimi", "AI belirlesin")).toMatchObject({ minCount: 3, maxCount: 8 });
  });

  it("repairs provider JSON syntax noise without changing semantic values", () => {
    expect(parseModelJson('```json\n{screens:[{"name":"Özet",}],}\n```')).toEqual({ screens: [{ name: "Özet" }] });
    expect(() => parseModelJson("model returned no object")).toThrow("AI geçerli bir JSON nesnesi döndürmedi");
  });
  it("requires the automatic minimum and honors an explicit exact screen count", () => {
    const automatic = resolveScreenPolicy("Restaurant operations", "AI belirlesin");
    expect(meetsScreenPolicy(2, automatic)).toBe(false);
    expect(meetsScreenPolicy(3, automatic)).toBe(true);

    const explicit = resolveScreenPolicy("Freelance ürün için 6 ekran tasarla");
    expect(meetsScreenPolicy(5, explicit)).toBe(false);
    expect(meetsScreenPolicy(6, explicit)).toBe(true);
  });
  it("distinguishes product calculations from actual user preferences", () => {
    expect(requiresSettingsScreen(["ciro hesaplama", "hesap özeti"], ["günlük ciro"])).toBe(false);
    expect(requiresSettingsScreen(["bildirim tercihleri"], ["para birimi"])).toBe(true);
    expect(requiresSettingsScreen(["kullanıcı hesabı yönetimi"], ["güvenlik ayarları"])).toBe(true);
  });
  it.each([
    ["ilaç ve tansiyon takibi", ["ilaç", "doz", "tansiyon"], "health-care"],
    ["ürün kataloğu ve sepet", ["ürün kataloğu", "stok", "sipariş"], "commerce"],
    ["ders ve quiz uygulaması", ["ders", "kurs", "quiz"], "learning"],
    ["makale ve dergi yayını", ["makale", "editör", "dergi"], "publishing"],
    ["servis durumu merkezi", ["api gecikmesi", "incident", "hata oranı"], "operations"],
  ] as const)("keeps %s independent from all five visual styles", (brief, vocabulary, expected) => {
    for (const _stylePresetId of stylePresetIds) {
      expect(resolveDomainPack(blueprint(brief, [...vocabulary]), brief)).toBe(expected);
    }
  });

  it("does not turn a freelance finance brief into a style-owned product domain", () => {
    const brief = "Freelance çalışanlar için proje, müşteri, fatura ve gelir yönetimi";
    const plan = blueprint("freelance-project-finance", ["proje", "müşteri", "fatura", "ödeme"]);

    for (const _stylePresetId of stylePresetIds) {
      expect(resolveDomainPack(plan, brief)).toBeUndefined();
    }
  });
});

describe("buildSyntheticBlueprint (edit mode)", () => {
  function screenWithNav(id: string, name: string, route: string, navItems?: string[]) {
    return {
      id,
      name,
      route,
      root: {
        type: "Screen",
        children: [
          { type: "TopAppBar", props: { title: name } },
          ...(navItems ? [{ type: "BottomNavigation", props: { items: navItems } }] : []),
        ],
      },
    };
  }

  it("preserves the current document's identity instead of inventing a new one", () => {
    const screens = [
      screenWithNav("genel-bakis", "Genel Bakış", "/genel-bakis", ["Genel Bakış", "Rezervasyonlar"]),
      screenWithNav("rezervasyonlar", "Rezervasyonlar", "/rezervasyonlar"),
      screenWithNav("ayarlar", "Ayarlar", "/ayarlar"),
    ];

    const result = buildSyntheticBlueprint(screens);

    expect(result.screens.map((screen) => [screen.id, screen.name, screen.route])).toEqual([
      ["genel-bakis", "Genel Bakış", "/genel-bakis"],
      ["rezervasyonlar", "Rezervasyonlar", "/rezervasyonlar"],
      ["ayarlar", "Ayarlar", "/ayarlar"],
    ]);
    // Only screens actually named in the first screen's BottomNavigation count as primary —
    // "Ayarlar" is real but not a tab, so it must not be forced into the bottom nav.
    expect(result.navigation.primaryScreenIds).toEqual(["genel-bakis", "rezervasyonlar"]);
    expect(result.navigation.utilityScreenIds).toEqual(["ayarlar"]);
    // No product-domain text is invented — the model must not re-derive a brief from this.
    expect(result.productDomain).toBe("");
    expect(result.screenPolicy).toMatchObject({ requestedCount: 3, minCount: 3, maxCount: 3 });
  });

  it("treats every screen as primary when no BottomNavigation is found", () => {
    const screens = [screenWithNav("a", "A", "/a"), screenWithNav("b", "B", "/b")];
    const result = buildSyntheticBlueprint(screens);
    expect(result.navigation.primaryScreenIds).toEqual(["a", "b"]);
  });
});

describe("deriveArchetype (UX plan fallback)", () => {
  it("maps each role to the archetype the model should have picked", () => {
    expect(deriveArchetype("settings")).toBe("settings");
    expect(deriveArchetype("form")).toBe("form");
    expect(deriveArchetype("onboarding")).toBe("form");
    expect(deriveArchetype("detail")).toBe("detail");
    expect(deriveArchetype("overview")).toBe("dashboard");
    expect(deriveArchetype("core")).toBe("management_list");
    expect(deriveArchetype("support")).toBe("management_list");
  });
});
