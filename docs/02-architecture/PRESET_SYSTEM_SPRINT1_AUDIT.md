# Preset System — Sprint 1 Audit

## Tarih

2026-08-10

## Sonuç

Mevcut sistemde preset bilgisi kısmen tanımlı, fakat renderer’a tam bağlanmamış. Bu nedenle iki farklı preset çoğunlukla aynı semantic ekran iskeletini ve aynı component ailesini gösteriyor.

## Mevcut sözleşme

`packages/design-spec/src/strategy.ts` içindeki `StyleSystemProfile` şu alanları taşıyor:

- `typography`
- `colorIntent`
- `layoutRhythm`
- `signatureComponents`
- `avoid`
- `compositionPatterns`

`DesignStrategy` ayrıca `palette`, `cardStyle`, `density`, `navigationStyle` ve `visualDirection` taşıyor.

## Mevcut uygulama boşlukları

| Alan | Durum | Kanıt |
|---|---|---|
| Palette renkleri | Kısmi | `StudioPage.module.css` preset palette sınıfları var |
| Kart geometrisi | Kısmi | `strategyCards*` sınıfları var; renderer adapter’ı yok |
| Density | Kısmi | `strategyDensity*` sınıfları var; class bağlama eksik |
| Navigation | Kısmi | `strategyNavigation*` sınıfları var; class bağlama eksik |
| Typography | Kısmi | palette CSS içinde bazı font kuralları var |
| Card varyantı | Kısmi | `generatedCard*` varyantları var; preset profili seçmiyor |
| Chart ailesi | Eksik | Renderer esas olarak tek SVG chart şekli kullanıyor |
| Control/pill varyantları | Eksik | Genel renderer var, preset resolver yok |
| Form alanları | Eksik | Ortak form renderer’ı var, preset-specific mapping yok |
| İkonografi | Eksik | Genel glyph seçimi var, preset profiliyle bağlı değil |
| Avatar/görsel maskesi | Eksik | Ortak renderer var, preset maskesi yok |
| Surface/divider dili | Kısmi | CSS override’ları mevcut, sistematik token yok |
| Data presentation | Eksik | Metric/Chart yapısı preset’e göre seçilmiyor |
| Interaction state | Eksik | Temel selected/disabled davranışı var |
| Empty state | Eksik | Ortak preset contract yok |
| Modal/sheet | Eksik | Renderer desteği sınırlı, preset mapping yok |
| Motion | Eksik | Preset’e bağlı motion token’ları yok |
| Screen composition | Kısmi | Prompt’a style system gönderiliyor; fallback aynı skeleton’ı koruyor |

## Kritik kök nedenler

1. `StyleSystemProfile` listedeki tüm varyantları tipli olarak taşımıyor.
2. Renderer’da preset’e özel CSS sınıfları bulunmasına rağmen `PhoneScreen` yalnızca palette sınıfını bağlıyor.
3. `strategyCards*`, `strategyDensity*` ve `strategyNavigation*` sınıfları aktif presentation class’ına bağlanmıyor.
4. Composition prompt’unda stil profili artık gönderiliyor; ancak deterministic fallback hâlâ ortak bir compositor kullanıyor.
5. Chart, control, pill, form, icon ve motion seçimleri için ortak resolver bulunmuyor.

## Sprint 1 kararı

Sprint 2’de `StyleSystemProfile v3` genişletilecek. Sprint 4’te renderer’a `resolvePresetPresentation()` adapter’ı bağlanmadan preset’ler tamamlanmış sayılmayacak.

## Sprint 1 kabul durumu

- [x] Mevcut sözleşme envanteri
- [x] Renderer ve CSS boşlukları
- [x] Prompt/fallback çakışması
- [x] Geriye uyumlu genişletme planı
- [ ] Sprint 2 sözleşme uygulaması
