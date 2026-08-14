import { describe, expect, it } from "vitest";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { compileVisualScreen, DESIGN_TEMPLATES, findDesignTemplate, type DesignNode, type Screen } from "@floriven/design-spec";
import { PhoneScreen as RuntimePhoneScreen, splitScreenNavigation } from "./PhoneScreen";

function PhoneScreen(props: Omit<React.ComponentProps<typeof RuntimePhoneScreen>, "compiled"> & { presentation?: { palette?: string } }) {
  const template = props.presentation?.palette === "serene"
    ? findDesignTemplate("serene-health")!
    : DESIGN_TEMPLATES[0]!;
  const compiled = compileVisualScreen({
    screen: props.screen,
    strategy: { mode: "auto", ...template.strategy, rationale: ["renderer test fixture"] },
    styleSystemProfile: template.system,
  });
  const { presentation: _legacyPresentation, ...runtimeProps } = props;
  return createElement(RuntimePhoneScreen, { ...runtimeProps, compiled });
}

function node(id: string, type: string, children?: DesignNode[]): DesignNode {
  return {
    id,
    type,
    props: {},
    a11y: { role: "group", label: id },
    ...(children ? { children } : {}),
  };
}

describe("splitScreenNavigation", () => {
  it("renders a calendar as a real weekly schedule experience", () => {
    const calendar = node("calendar", "Calendar");
    calendar.props = { label: "Saha Takvimi", days: ["Pzt 12", "Sal 13", "Çar 14"], events: ["Boğaz Evi ziyareti", "Müşteri teslimi"] };
    const screen: Screen = { id: "calendar-screen", name: "Takvim", route: "/takvim", root: node("root", "Screen", [calendar]) };

    const html = renderToStaticMarkup(createElement(PhoneScreen, { screen, selectedNodeId: "", active: true, onSelect: () => undefined }));

    expect(html).toContain("Saha Takvimi");
    expect(html).toContain("Boğaz Evi ziyareti");
    expect(html).toContain("Pzt");
    expect(html).toContain("9:00");
  });
  it("moves bottom navigation outside the scrollable content without mutating the spec", () => {
    const title = node("title", "Text");
    const navigation = node("nav", "BottomNavigation");
    const root = node("root", "Screen", [title, navigation]);

    const result = splitScreenNavigation(root);

    expect(result.navigation).toBe(navigation);
    expect(result.contentRoot.children).toEqual([title]);
    expect(root.children).toEqual([title, navigation]);
  });

  it("keeps screens without navigation unchanged", () => {
    const root = node("root", "Screen", [node("title", "Text")]);

    const result = splitScreenNavigation(root);

    expect(result.contentRoot).toBe(root);
    expect(result.navigation).toBeUndefined();
  });

  it("renders navigation after the scroll viewport and marks the current screen", () => {
    const navigation = node("nav", "BottomNavigation");
    navigation.props = { items: ["Ana Sayfa", "Takvim", "Raporlar", "Profil"] };
    const screen: Screen = {
      id: "screen-home",
      name: "Ana Sayfa",
      route: "/",
      root: node("root", "Screen", [node("title", "Text"), navigation]),
    };

    const html = renderToStaticMarkup(createElement(PhoneScreen, { screen, selectedNodeId: "", active: true, onSelect: () => undefined }));

    expect(html).toContain("</main><nav");
    expect(html).toContain('data-scroll-viewport="true"');
    expect(html).toContain('data-fixed-navigation="true"');
    expect(html).toContain('tabindex="0"');
    expect(html).toContain('aria-current="page"');
    expect(html).toContain("Ana Sayfa");
    expect(html).toContain("<svg");
  });

  it("applies a PresentationSpec to the phone renderer", () => {
    const root = node("root", "Screen", [node("title", "Text")]);
    const screen: Screen = { id: "health", name: "Sağlık", route: "/saglik", root };

    const presentation = { version: "1.0.0" as const, palette: "serene" as const, cardStyle: "soft" as const, density: "comfortable" as const, navigationStyle: "floating" as const, visualDirection: "calm" };
    const html = renderToStaticMarkup(createElement(PhoneScreen, { screen, presentation, selectedNodeId: "", active: true, onSelect: () => undefined }));

    expect(html).toContain("--gen-accent:#0d9488");
    expect(html).toContain("--gen-radius-lg:24px");
    expect(html).toContain("--gen-navigation-radius:24px");
    expect(html).toContain("--gen-card-padding:22px");
    expect(html).toContain("--gen-heading-size:23px");
    expect(html).toContain('data-chart-grid="none"');
    expect(html).toContain('data-grouping-style="card-clusters"');
    expect(html).toContain('data-data-presentation="trend-delta"');
    expect(html).toContain('data-interaction-style="tactile"');
    expect(html).toContain('data-available-layouts="stacked grid"');
    expect(html).toContain('data-viewport-width="390"');
    expect(html).toContain('data-viewport-height="844"');
    expect(html).toContain('data-renderer-version="phone-screen-v4"');
  });

  it("does not infer presentation from a preset identity in the screen tree", () => {
    const root = node("root", "Screen", [node("title", "Text")]);
    root.props = { stylePresetId: "serene-health" };
    const screen: Screen = { id: "health", name: "Sağlık", route: "/saglik", root };
    const html = renderToStaticMarkup(createElement(PhoneScreen, { screen, selectedNodeId: "", active: true, onSelect: () => undefined }));
    expect(html).not.toContain("strategyPaletteSerene");
  });

  it("renders a deterministic diagnostic instead of silently dropping unsupported nodes", () => {
    const screen: Screen = { id: "unsupported", name: "Unsupported", route: "/unsupported", root: node("root", "Screen", [node("unknown", "TimelineFoo")]) };
    const html = renderToStaticMarkup(createElement(PhoneScreen, { screen, selectedNodeId: "", active: true, onSelect: () => undefined }));
    expect(html).toContain('data-renderer-error="UNSUPPORTED_RENDERER_COMPONENT"');
    expect(html).toContain("Unsupported component: TimelineFoo");
  });

  it("renders provider icon aliases as SVG instead of visible words", () => {
    const fab = node("fab", "FloatingActionButton");
    fab.props = { icon: "add" };
    const screen: Screen = { id: "home", name: "Ana Sayfa", route: "/", root: node("root", "Screen", [fab]) };

    const html = renderToStaticMarkup(createElement(PhoneScreen, { screen, selectedNodeId: "", active: true, onSelect: () => undefined }));

    expect(html).toContain("generatedActionIcon");
    expect(html).not.toContain(">add<");
  });

  it("renders the complete Serene Health domain component set", () => {
    const definitions: Array<[string, Record<string, unknown>]> = [
      ["CareSummary", { title: "Bakım planın hazır", subtitle: "Sıradaki adım 12:00", status: "normal", progress: 72 }],
      ["MedicationTimeline", { label: "Bugünkü ilaçlar", items: ["08:00 Aspirin", "12:00 Metformin"] }],
      ["MedicationDoseRow", { name: "Metformin", dose: "500 mg", time: "12:00", instruction: "Yemekle birlikte", status: "due" }],
      ["HealthMetric", { label: "Kan şekeri", value: "98", unit: "mg/dL", status: "normal", caption: "Hedef aralıkta" }],
      ["UnitInput", { label: "Kan şekeri", value: "98", unit: "mg/dL", hint: "70–140 mg/dL" }],
      ["RangeChart", { label: "Son 7 gün", values: [92, 98, 103, 96], minimum: 60, maximum: 180, unit: "mg/dL", targetMinimum: 70, targetMaximum: 140 }],
      ["TargetRange", { label: "Son ölçüm", value: 98, minimum: 70, maximum: 140, unit: "mg/dL" }],
      ["StatusAlert", { title: "Sıradaki doz", message: "Metformin için 25 dakika kaldı", severity: "attention" }],
      ["SafetyNotice", { title: "Ölçümü doğrula", message: "Kritik değerlerde sağlık uzmanına başvur." }],
      ["SuccessFeedback", { title: "Ölçüm kaydedildi", message: "98 mg/dL geçmişine eklendi." }],
    ];
    const components = definitions.map(([type, props], index) => { const item = node(`health-${index}`, type); item.props = props; return item; });
    const screen: Screen = { id: "health", name: "Bugün", route: "/bugun", root: node("root", "Screen", components) };

    const html = renderToStaticMarkup(createElement(PhoneScreen, { screen, selectedNodeId: "", active: true, onSelect: () => undefined }));

    expect(html).toContain("Bakım planın hazır");
    expect(html).toContain("Metformin");
    expect(html).toContain("mg/dL");
    expect(html).toContain("Hedef aralık");
    expect(html).toContain("Ölçüm kaydedildi");
  });

  it("renders the complete Editorial Culture domain component set", () => {
    const definitions: Array<[string, Record<string, unknown>]> = [
      ["EditorialHero", { kicker:"Yeni sayı",headline:"Şehrin görünmeyen ritmi",dek:"Kent kültürüne yakından bakış",issue:"Sayı 24",date:"08 Ağustos 2026" }],
      ["FeatureStory", { category:"Mimarlık",title:"Betonun ardından",summary:"Yeni kamusal alanların hikâyesi" }],
      ["StoryCard", { index:"02",category:"Tasarım",title:"Nesnelerin ikinci hayatı",summary:"Döngüsel tasarım pratikleri" }],
      ["Byline", { author:"Deniz Erdem",role:"Kültür yazarı" }],
      ["MetadataStrip", { date:"08 Ağustos 2026",readingTime:"6 dk okuma",edition:"Sayı 24" }],
      ["PullQuote", { quote:"Bir kentin hafızası gündelik ritminde saklıdır.",attribution:"Deniz Erdem" }],
      ["SectionIndex", { items:["Mimarlık","Tasarım","Edebiyat"] }],
      ["ArchiveEntry", { number:"24",date:"Ağustos 2026",title:"Yeni kamusallık",theme:"Kent kültürü" }],
    ];
    const components = definitions.map(([type, props], index) => { const item=node(`editorial-${index}`,type); item.props=props; return item; });
    const screen: Screen = { id:"culture",name:"Gündem",route:"/gundem",root:node("root","Screen",components) };
    const html = renderToStaticMarkup(createElement(PhoneScreen,{screen,selectedNodeId:"",active:true,onSelect:()=>undefined}));
    expect(html).toContain("Şehrin görünmeyen ritmi");
    expect(html).toContain("Deniz Erdem");
    expect(html).toContain("6 dk okuma");
    expect(html).toContain("Yeni kamusallık");
  });

  it("renders the complete Terracotta Market domain component set", () => {
    const definitions:Array<[string,Record<string,unknown>]>=[
      ["CommerceHero",{eyebrow:"Yeni koleksiyon",title:"Toprağın izleri",subtitle:"Bağımsız üreticiler",cta:"Keşfet"}],
      ["ProductCard",{maker:"Mora Atölye",name:"Kiremit Vazo",description:"El yapımı",price:"₺1.290",status:"Stokta",badge:"Yeni"}],
      ["PriceBlock",{label:"Ürün fiyatı",price:"₺1.290",compareAt:"₺1.490",taxNote:"Vergiler dâhil"}],
      ["ProductGallery",{alt:"Kiremit vazo",current:1,total:4}],
      ["VariantSelector",{label:"Renk",options:["Doğal","Kiremit","Kömür"]}],
      ["CartLine",{name:"Kiremit Vazo",variant:"Kiremit",quantity:2,price:"₺2.580"}],
      ["OrderSummary",{title:"Sipariş özeti",subtotal:"₺2.580",shipping:"Ücretsiz",total:"₺2.580"}],
      ["DeliveryPromise",{title:"Özenle paketlenir",detail:"2–4 iş gününde teslimat"}],
    ];
    const components=definitions.map(([type,props],index)=>{const item=node(`commerce-${index}`,type);item.props=props;return item});
    const screen:Screen={id:"market",name:"Keşfet",route:"/kesfet",root:node("root","Screen",components)};
    const html=renderToStaticMarkup(createElement(PhoneScreen,{screen,selectedNodeId:"",active:true,onSelect:()=>undefined}));
    expect(html).toContain("Toprağın izleri");expect(html).toContain("Kiremit Vazo");expect(html).toContain("₺2.580");expect(html).toContain("2–4 iş gününde teslimat");
  });
  it("renders the complete Electric Learning domain component set",()=>{const defs:Array<[string,Record<string,unknown>]>=[
    ["LearningHero",{eyebrow:"Bugünkü görev",title:"Fiillerle akıcılık",mission:"8 dakikalık pratik",reward:"+120 XP"}],
    ["XpProgress",{label:"Seviye 4",current:"640",target:"1000",value:64,nextReward:"360 XP kaldı"}],
    ["StreakBadge",{days:7,message:"Seriyi sürdür"}],
    ["LessonCard",{level:"L4",topic:"İspanyolca",title:"Geçmiş zaman",duration:"8 dk",status:"Hazır"}],
    ["RoadmapStep",{order:"03",title:"Günlük konuşma",description:"Temel diyaloglar",state:"open"}],
    ["QuizChoice",{key:"A",label:"Yo fui al mercado",state:"selected"}],
    ["AnswerFeedback",{result:"correct",title:"Doğru seçim",explanation:"Geçmiş zaman doğru kullanıldı."}],
    ["AchievementBadge",{icon:"★",title:"Odak ustası",description:"7 günlük seri",earnedAt:"Bugün"}],
  ];const components=defs.map(([type,props],i)=>{const item=node(`learning-${i}`,type);item.props=props;return item});const screen:Screen={id:"learn",name:"Bugün",route:"/bugun",root:node("root","Screen",components)};const html=renderToStaticMarkup(createElement(PhoneScreen,{screen,selectedNodeId:"",active:true,onSelect:()=>undefined}));expect(html).toContain("Fiillerle akıcılık");expect(html).toContain("640 / 1000 XP");expect(html).toContain("Doğru seçim");expect(html).toContain("Odak ustası")});
  it("renders the complete Obsidian Precision domain component set",()=>{const defs:Array<[string,Record<string,unknown>]>=[
    ["CommandSummary",{eyebrow:"Sistem",title:"Operasyon özeti",value:"99.98%",status:"NOMINAL",detail:"Tüm servisler izleniyor"}],
    ["SignalChart",{label:"API gecikmesi",values:[42,58,53,71],window:"24 saat",unit:"ms",annotation:"14:20 anomali"}],
    ["RiskIndicator",{label:"Risk",value:"Düşük",severity:"low",explanation:"Eşik içinde"}],
    ["OperationRow",{name:"Ödeme geçidi",owner:"Platform",updatedAt:"2 dk",status:"Çalışıyor",metric:"124 ms"}],
    ["IncidentTimeline",{label:"Olaylar",events:["Dağıtım tamamlandı","Eşik doğrulandı"]}],
    ["DataMatrix",{columns:["Sinyal","Değer","Durum"],rows:["API · 124 ms","Hata · %0,12"]}],
    ["ControlToggle",{label:"Otomatik koruma",description:"Kritik eşikte uygula",state:"AÇIK",guard:"Onay gerekir"}],
    ["AuditEntry",{time:"14:32",actor:"Emre Y.",action:"Politika güncellendi",target:"Üretim"}],
  ];const components=defs.map(([type,props],i)=>{const item=node(`precision-${i}`,type);item.props=props;return item});const screen:Screen={id:"ops",name:"Komuta",route:"/komuta",root:node("root","Screen",components)};const html=renderToStaticMarkup(createElement(PhoneScreen,{screen,selectedNodeId:"",active:true,onSelect:()=>undefined}));expect(html).toContain("99.98%");expect(html).toContain("124 ms");expect(html).toContain("Otomatik koruma");expect(html).toContain("Emre Y.")});

  it("verifies KanbanBoard renders columns and cards with structural DOM evidence", () => {
    const kanban = node("kanban", "KanbanBoard");
    kanban.props = {
      label: "Mutfak Sipariş Panosu",
      columns: ["Hazırlanıyor", "Hazır", "Servis Edildi"],
      cards: ["Masa 4 - Pizza", "Masa 2 - Salata", "Masa 6 - Makarna"],
    };
    const screen: Screen = { id: "kitchen", name: "Pano", route: "/pano", root: node("root", "Screen", [kanban]) };
    const html = renderToStaticMarkup(createElement(PhoneScreen, { screen, selectedNodeId: "", active: true, onSelect: () => undefined }));

    expect(html).toContain("Mutfak Sipariş Panosu");
    expect(html).toContain("<strong>Hazırlanıyor</strong>");
    expect(html).toContain("<strong>Hazır</strong>");
    expect(html).toContain("<strong>Servis Edildi</strong>");
    expect(html).toContain("<span>Masa 4 - Pizza</span>");
    expect(html).toContain("<span>Masa 2 - Salata</span>");
    expect(html).toContain("<span>Masa 6 - Makarna</span>");
  });

  it("verifies MapView renders coordinates and markers with spatial styling", () => {
    const map = node("map", "MapView");
    map.props = {
      label: "Saha Şantiyeleri Haritası",
      markers: ["Kadıköy Şantiye", "Beşiktaş Restorasyon", "Üsküdar Konut"],
    };
    const screen: Screen = { id: "map-screen", name: "Harita", route: "/harita", root: node("root", "Screen", [map]) };
    const html = renderToStaticMarkup(createElement(PhoneScreen, { screen, selectedNodeId: "", active: true, onSelect: () => undefined }));

    expect(html).toContain("<figure");
    expect(html).toContain("<figcaption>Saha Şantiyeleri Haritası</figcaption>");
    expect(html).toContain("Kadıköy Şantiye");
    expect(html).toContain("Beşiktaş Restorasyon");
    expect(html).toContain("Üsküdar Konut");
    expect(html).toContain("style=\"left:");
  });

  it("verifies Gallery renders lead item and items with captions", () => {
    const gallery = node("gallery", "Gallery");
    gallery.props = {
      label: "Proje Fotoğrafları",
      items: ["Salon Görünümü", "Mutfak Detayı", "Balkon Cephesi"],
    };
    const screen: Screen = { id: "gallery-screen", name: "Galeri", route: "/galeri", root: node("root", "Screen", [gallery]) };
    const html = renderToStaticMarkup(createElement(PhoneScreen, { screen, selectedNodeId: "", active: true, onSelect: () => undefined }));

    expect(html).toContain("Proje Fotoğrafları");
    expect(html).toContain("<figcaption>Salon Görünümü</figcaption>");
    expect(html).toContain("<figcaption>Mutfak Detayı</figcaption>");
    expect(html).toContain("<figcaption>Balkon Cephesi</figcaption>");
  });

  it("verifies Timeline renders numbered steps sequentially", () => {
    const timeline = node("timeline", "Timeline");
    timeline.props = {
      label: "Uygulama Aşamaları",
      events: ["Keşif ve Ölçü", "Statik Hesap", "İnşaat Başlangıcı"],
    };
    const screen: Screen = { id: "timeline-screen", name: "Zaman Çizelgesi", route: "/zaman", root: node("root", "Screen", [timeline]) };
    const html = renderToStaticMarkup(createElement(PhoneScreen, { screen, selectedNodeId: "", active: true, onSelect: () => undefined }));

    expect(html).toContain("Uygulama Aşamaları");
    expect(html).toContain("<b>01</b>");
    expect(html).toContain("<span>Keşif ve Ölçü</span>");
    expect(html).toContain("<b>02</b>");
    expect(html).toContain("<span>Statik Hesap</span>");
    expect(html).toContain("<b>03</b>");
    expect(html).toContain("<span>İnşaat Başlangıcı</span>");
  });

  it("renders a visible, fail-closed alert when an unsupported component is encountered", () => {
    const badNode = node("unsupported-1", "NonExistentComponent");
    const screen: Screen = { id: "bad-screen", name: "Hatalı", route: "/hatali", root: node("root", "Screen", [badNode]) };
    const html = renderToStaticMarkup(createElement(PhoneScreen, { screen, selectedNodeId: "", active: true, onSelect: () => undefined }));

    expect(html).toContain('role="alert"');
    expect(html).toContain('data-renderer-error="UNSUPPORTED_RENDERER_COMPONENT"');
    expect(html).toContain("Unsupported component: NonExistentComponent");
  });
});
