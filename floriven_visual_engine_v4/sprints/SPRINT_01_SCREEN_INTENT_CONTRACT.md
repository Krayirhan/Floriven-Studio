# Sprint 01 — Screen Intent Contract

## Amaç

Screen archetype ve UX policy'yi runtime'a typed metadata olarak taşımak.

## Sprint sonucu

Bu sprint sonunda sistemin kazanması gereken kabiliyet:

Renderer artık screen isminden archetype tahmin etmez.

## Etkilenecek / yeni dosyalar

- `packages/design-spec/src/screen-intent.ts`
- `domain/planning contracts`
- `normalization`
- `Screen type`

## İş paketleri

- [ ] ScreenIntent type ekle
- [ ] archetype mapping'i planning'den persist et
- [ ] hero/fab/nav policy taşı
- [ ] legacy screen için compat inference sadece migration katmanında tut

## Test planı

- [ ] contract validation
- [ ] all archetypes fixture
- [ ] legacy compatibility

## Kabul kriterleri

- [ ] runtime screen intent mevcut
- [ ] screen-name heuristic kaldırılabilir
- [ ] invalid archetype fail-fast

## Kapsam dışı

Layout implementation yok.

## Riskler

Metadata duplication ve source-of-truth çatışması.

## Exit gate

Tüm kabul kriterleri PASS olmadan sonraki bağımlı sprint başlayamaz.
