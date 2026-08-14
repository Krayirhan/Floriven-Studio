# Sprint 07 — Layout Engine V2 & Real Device Viewport

## Amaç

RenderPlan'i gerçek mobile geometry'ye çevirmek ve 390×844 logical space'e geçmek.

## Sprint sonucu

Bu sprint sonunda sistemin kazanması gereken kabiliyet:

Bento, strict-grid, editorial asymmetry ve stacked gerçekten layout olur.

## Etkilenecek / yeni dosyalar

- `layout/LayoutRenderer.tsx`
- `layout/bento.ts`
- `layout/editorialAsymmetry.ts`
- `layout/strictGrid.ts`
- `PhoneScreen.tsx`
- `StudioCanvas.tsx`

## İş paketleri

- [ ] span/tracks engine
- [ ] safe area
- [ ] section gaps
- [ ] full-width regions
- [ ] 390×844 inner viewport
- [ ] preview outer scale
- [ ] export aynı renderer

## Test planı

- [ ] layout unit fixtures
- [ ] 390×844 geometry snapshot
- [ ] no overflow smoke
- [ ] export regression

## Kabul kriterleri

- [ ] metadata ile gerçek layout coordinate aynı
- [ ] bento gerçekten spans üretir
- [ ] editorial unequal columns üretir

## Kapsam dışı

Component family polish yok.

## Riskler

Snapshot churn ve Studio zoom koordinat sorunları.

## Exit gate

Tüm kabul kriterleri PASS olmadan sonraki bağımlı sprint başlayamaz.
