# Sprint 08 — Component Families

## Amaç

Generic Card/Field/Control renderer'ı production component family sistemine çevirmek.

## Sprint sonucu

Bu sprint sonunda sistemin kazanması gereken kabiliyet:

Preset family mapping gerçek React componentlerine bağlanır.

## Etkilenecek / yeni dosyalar

- `components/cards/*`
- `components/fields/*`
- `components/controls/*`
- `renderer/DesignNodeRenderer.tsx`

## İş paketleri

- [ ] 8 card family
- [ ] field variants
- [ ] control variants
- [ ] status/pill families
- [ ] family resolver

## Test planı

- [ ] family unit tests
- [ ] state tests
- [ ] a11y
- [ ] visual snapshots

## Kabul kriterleri

- [ ] resolved family gerçekten farklı DOM/class/geometry üretir
- [ ] unsupported family explicit fallback
- [ ] touch-safe controls

## Kapsam dışı

Charts ayrı sprint.

## Riskler

Component explosion.

## Exit gate

Tüm kabul kriterleri PASS olmadan sonraki bağımlı sprint başlayamaz.
