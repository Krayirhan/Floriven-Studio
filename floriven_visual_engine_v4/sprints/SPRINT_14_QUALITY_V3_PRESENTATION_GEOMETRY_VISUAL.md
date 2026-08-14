# Sprint 14 — Quality V3 — Presentation, Geometry & Visual

## Amaç

Static quality'nin üstüne gerçek visual/runtime gates kurmak.

## Sprint sonucu

Bu sprint sonunda sistemin kazanması gereken kabiliyet:

Semantic/Structural/Presentation/Runtime quality ayrı raporlardır.

## Etkilenecek / yeni dosyalar

- `quality/semantic.ts`
- `structural.ts`
- `presentation.ts`
- `geometry.ts`
- `visual.ts`

## İş paketleri

- [ ] quality reports split
- [ ] DOM bounds collector
- [ ] touch/font/clipping gates
- [ ] visual critic contract
- [ ] cross-screen distance
- [ ] cross-preset distance

## Test planı

- [ ] bad screenshot fixtures
- [ ] geometry violation fixtures
- [ ] false positive tests

## Kabul kriterleri

- [ ] static alone final veremez
- [ ] critical geometry=0
- [ ] distance thresholds enforced

## Kapsam dışı

Certification auth Sprint 15.

## Riskler

Visual critic nondeterminism.

## Exit gate

Tüm kabul kriterleri PASS olmadan sonraki bağımlı sprint başlayamaz.
