# Sprint 05 — Dashboard & Management List Composers

## Amaç

En yaygın iki archetype için gerçek production hierarchy kurmak.

## Sprint sonucu

Bu sprint sonunda sistemin kazanması gereken kabiliyet:

Dashboard ve management-list artık aynı vertical stack'e düşmez.

## Etkilenecek / yeni dosyalar

- `composition/dashboard.ts`
- `composition/managementList.ts`

## İş paketleri

- [ ] dashboard primary/secondary metric mapping
- [ ] trend region
- [ ] actionable region
- [ ] list toolbar recipe
- [ ] summary strip
- [ ] dense row grouping
- [ ] preset modifiers

## Test planı

- [ ] five preset dashboard snapshots
- [ ] list structural tests
- [ ] CTA dominance tests

## Kabul kriterleri

- [ ] 4 equal-weight metric stack engelleniyor
- [ ] list search/filter/list hierarchy doğru
- [ ] pairwise archetype distance pass

## Kapsam dışı

Form/detail yok.

## Riskler

Over-templating.

## Exit gate

Tüm kabul kriterleri PASS olmadan sonraki bağımlı sprint başlayamaz.
