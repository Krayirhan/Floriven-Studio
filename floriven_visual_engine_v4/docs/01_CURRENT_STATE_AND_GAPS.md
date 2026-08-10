# 01 — Current State & Gap Analysis

## Kaynak kod baseline'ı

Bu audit aşağıdaki mevcut modüllere göre tasarlanmıştır:

- `packages/design-spec/src/strategy.ts`
- `PhoneScreen.tsx`
- `PhoneScreen.test.ts`
- `StudioCanvas.tsx`
- `StudioPage.module.css`
- `quality.ts`
- `quality.test.ts`
- `deterministic-compositor.ts`
- `deterministic-compositor.test.ts`
- generation `index.ts`
- component registry
- composition prompt

## Güçlü alanlar

### 1. StyleSystemProfile v3 iyi yönde

Profil şu sınıf kararlarını tarif etmektedir:

- card types
- card geometry
- chart rules
- controls
- pills
- button styles
- field styles
- navigation modes
- typography rules
- layout patterns
- grouping
- icons
- avatar
- image treatment
- surfaces
- divider
- status
- data presentation
- interaction
- screen composition
- empty state
- modal
- motion

Sorun contract'ın varlığı değil, runtime kullanım oranıdır.

### 2. Renderer unsupported node'u sessizce kaybetmiyor

Bu önemli bir production invariant'tır ve korunmalıdır.

### 3. Domain capability pack separation doğru

Preset kimliği ürün domain'i üretmemelidir. Görsel stil ve product vocabulary ayrımı korunmalıdır.

### 4. Static structural quality faydalı

Blueprint alignment, navigation, structural diversity, foreign components, card ratio ve archetype
bazlı bazı hatalar bugünün sisteminde değer taşımaktadır.

## Ana boşluklar

### GAP-01 — Presentation daraltılıyor

Studio tarafında screen strategy yalnızca küçük bir PresentationSpec'e çevrilmektedir:

- palette
- cardStyle
- density
- navigationStyle
- visualDirection

Buna karşılık v3 grammar'ın çoğu renderer'a ulaşmaz.

### GAP-02 — Renderer preset-aware

Presentation çözülmüş tokenlar yerine palette adına göre CSS class seçmektedir.
Renderer'ın preset identity bilmesi architecture leakage'tır.

### GAP-03 — Layout engine zayıf

Mevcut layout yaklaşımı pratikte:

- flex column
- flex row
- repeat(2, 1fr) grid

seviyesindedir.

Bununla:
- bento
- editorial asymmetry
- dense operational grid
- split presentation
- timeline geometry

gerçek biçimde uygulanamaz.

### GAP-04 — Screen composition typed metadata'ya dayanmıyor

Screen archetype runtime'a birinci sınıf metadata olarak taşınmalıdır.
Screen adına bakarak form/settings/analytics tahmini yapılmamalıdır.

### GAP-05 — Generic component families

Tek `Card` ve tek chart renderer farklı design-system component family'lerini taklit etmeye çalışmaktadır.

### GAP-06 — Deterministic fallback görsel olarak production baseline değil

Deterministic compositor static requirements'ı karşılamak için faydalıdır;
ancak screen-specific hierarchy ve preset-aware composition üretmediğinde wireframe kalitesine düşebilir.

### GAP-07 — Static quality ≠ visual quality

Mevcut structural metrics gerçek DOM geometry, font size, clipping, visual hierarchy veya screenshot
kalitesini ölçmez. Bu katman final release kararı için yeterli değildir.

### GAP-08 — Device preview coordinate mismatch riski

Studio preview gerçek cihaz logical coordinate space'inde layout edilmeli ve dışarıdan scale edilmelidir.
Metadata bir device ölçüsü gösterirken child layout farklı bir küçük viewport'ta oluşmamalıdır.

## Sonuç

Floriven'daki ana sorun:

> “Preset tanımı eksik” değildir.

Ana sorun:

> “Preset grammar'ı semantic UI'ı gerçek visual composition'a derleyen runtime compiler eksik.”
