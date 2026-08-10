# Floriven Studio — Tam Görsel Preset Sistemi Sprint Planı

## Amaç

Beş preset’i yalnızca renk teması olmaktan çıkarıp kart, grafik, kontrol, tipografi, layout, navigation, motion ve ekran kompozisyonunu kapsayan gerçek görsel sistemlere dönüştürmek.

## Kapsam dışı

- ProductBlueprint domain’i değişmeyecek.
- Ekran sayısı, route’lar ve kullanıcı görevleri preset tarafından değiştirilmeyecek.
- Preset seçimi kullanıcı içeriğini veya ürün terminolojisini değiştirmeyecek.

## Sprint 1 — Sözleşme ve mevcut durum denetimi

Durum: **Tamamlandı** — ayrıntılı rapor: [PRESET_SYSTEM_SPRINT1_AUDIT.md](PRESET_SYSTEM_SPRINT1_AUDIT.md)

Teslimler:

- Mevcut `StyleSystemProfile`, DesignSpec, renderer ve component registry envanteri.
- Eksik, çakışan ve yalnızca CSS’te kalan preset kurallarının raporu.
- Preset alanları için geriye uyumlu şema planı.

Kabul kriterleri:

- Her listedeki alanın hangi domain sözleşmesine ait olduğu belgelenir.
- Mevcut ekranların preset seçimine göre neden aynı kaldığı ölçülür.

## Sprint 2 — StyleSystemProfile v3

Kapsanacak alanlar:

- Kart tipi ve geometrisi.
- Grafik tipi ve grafik davranışı.
- Switch, checkbox, toggle, segmented control, accordion ve disclosure.
- Status badge, filter pill, category chip, tag ve notification badge.
- Buton ve form alanı varyantları.
- Navigation ve tab davranışı.
- Font, ağırlık, harf aralığı, başlık, line-height ve uppercase kuralları.
- Density, spacing rhythm, grid ve composition pattern.
- İçerik gruplama, ikonografi, avatar ve görsel maskeleri.
- Renk kullanımı, yüzey dili, divider ve durum dili.
- Veri sunumu, interaction state, empty state, modal/sheet ve motion.

Kabul kriterleri:

- Tüm alanlar tipli TypeScript sözleşmesinde bulunur.
- Bilinmeyen varyantlar reddedilir veya güvenli varsayılanla eşlenir.
- Preset verisi schema/test validasyonundan geçer.

## Sprint 3 — Beş preset profilinin doldurulması

Preset’ler:

- `obsidian-precision`: yoğun teknik veri, cam panel, neon aksan, tabular metrik, glass navigation.
- `serene-health`: geniş nefes alanı, yumuşak yüzey, organik kart, sakin tipografi, floating navigation.
- `terracotta-market`: editoryal asimetri, sıcak kâğıt yüzey, layered card, serif başlık, güçlü CTA.
- `electric-learning`: yüksek kontrast, playful grafik, progress/radial veri, geniş pill ve enerjik motion.
- `editorial-culture`: tipografik ritim, düz yüzey, story card, magazine grid, minimal navigation.

Kabul kriterleri:

- Her preset listedeki her alan için açık değer taşır.
- Her preset’in `signatureComponents` ve `avoid` listesi bulunur.
- İki preset’in yalnızca renk farkıyla eşitlenmediği parity testiyle kanıtlanır.

## Sprint 4 — Renderer adapter katmanı

Teslimler:

- `resolvePresetPresentation()` adapter’ı.
- CSS custom property üretimi.
- Component variant resolver.
- Layout ve spacing modifier’ları.
- Typography ve icon resolver.

Kabul kriterleri:

- Renderer doğrudan preset adına göre if/else yazmaz; profil adapter’ını tüketir.
- Aynı DesignSpec farklı preset ile farklı presentation tree/class/token çıktısı verir.

## Sprint 5 — Component çeşitlendirme

Uygulanacak bileşenler:

- Metric, list, hero, split, timeline, media, glass ve editorial card.
- Bar, line, area, donut, radial, sparkline, heatmap ve segmented chart.
- Form, control, pill, badge, button, avatar, image ve divider varyantları.
- Empty state, modal, bottom sheet ve side panel.

Kabul kriterleri:

- Her bileşen preset profilinden varyant alır.
- Desteklenmeyen varyant sessizce yutulmaz; güvenli fallback veya açık capability uyarısı verir.

## Sprint 6 — Ekran kompozisyon adapter’ları

Ekran tipleri:

- Dashboard.
- Management list.
- Detail.
- Form.
- Analytics.
- Settings.

Kabul kriterleri:

- ProductBlueprint aynı kalırken ekranların bilgi gruplaması ve yerleşim ritmi preset’e göre değişir.
- Detail, list ve form aynı skeleton’ı paylaşmaz.
- Navbar, preset’in navigation kuralına göre değişir.

## Sprint 7 — Motion, state ve responsive davranış

Teslimler:

- Hover, pressed, selected, disabled, focus ve loading state’leri.
- Kart açılma, grafik animasyonu ve navbar geçişleri.
- Modal, sheet ve full-screen flow geçişleri.
- Responsive density ve breakpoint davranışları.

Kabul kriterleri:

- Motion preset profiline göre farklı easing/duration kullanır.
- Reduced-motion tercihinde animasyonlar güvenli biçimde azalır.
- Erişilebilir focus ve keyboard davranışı korunur.

## Sprint 8 — Test ve görsel kalite kapısı

Testler:

- StyleSystemProfile schema testleri.
- Preset parity testleri.
- Renderer unit testleri.
- Component variant testleri.
- 6 ekran E2E testleri.
- Her preset için visual regression snapshot’ları.
- Accessibility ve reduced-motion testleri.

Kabul kriterleri:

- Her preset en az bir yapısal fark üretir.
- Screenshot karşılaştırması yalnız renk farkıyla sınırlı kalmaz.
- Type-check, lint, unit ve E2E testleri geçer.

## Sprint 9 — Deploy, certification ve handoff

Teslimler:

- Generate ve renderer deploy’u.
- 10 dakikalık denetçi token’ıyla 6 ekran certification.
- Screenshot, bounds, geometry ve visual critic kanıtı.
- Güncel dokümantasyon ve task handoff.

Kabul kriterleri:

- Her preset için gerçek 6 ekran çıktısı alınır.
- Runtime kalite kararı server tarafında oluşur.
- Bilinen riskler, desteklenmeyen varyantlar ve takip işleri raporlanır.

## Genel tamamlanma kriteri

Bir preset ancak renk, yapı, bilgi yoğunluğu, tipografi, component seçimi, ekran kompozisyonu, navigation ve motion davranışlarında ölçülebilir fark oluşturuyorsa tamamlanmış sayılır.
