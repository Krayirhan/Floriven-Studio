# Sprint 00 — Visual Baseline Freeze

## Amaç

Mevcut generated-design sisteminin gerçek görsel ve structural baseline'ını dondurmak.

## Sprint sonucu

Bu sprint sonunda sistemin kazanması gereken kabiliyet:

5 preset + Auto + Deterministic için canonical screenshot/evidence seti oluşturulur.

## Etkilenecek / yeni dosyalar

- `visual-baseline/*`
- `scripts/capture-visual-baseline.ts`
- `quality baseline manifest`

## İş paketleri

- [ ] 6 canonical archetype fixture tanımla
- [ ] 7 visual mode için render et
- [ ] 42+ screenshot al
- [ ] DOM bounds ve tree signature kaydet
- [ ] baseline manifest üret

## Test planı

- [ ] fixture determinism testi
- [ ] same hash → same output testi
- [ ] screenshot capture smoke test

## Kabul kriterleri

- [ ] tüm canonical ekranlar render oluyor
- [ ] baseline artifact versioned
- [ ] known failures dokümante

## Kapsam dışı

Yeni visual behavior implement edilmez.

## Riskler

Baseline üretimi gerçek runtime ile aynı renderer'ı kullanmazsa ileride kıyas anlamsızlaşır.

## Exit gate

Tüm kabul kriterleri PASS olmadan sonraki bağımlı sprint başlayamaz.
