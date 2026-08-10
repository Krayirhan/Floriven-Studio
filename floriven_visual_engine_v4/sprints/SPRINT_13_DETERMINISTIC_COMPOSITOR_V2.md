# Sprint 13 — Deterministic Compositor V2

## Amaç

Provider-independent fallback'ı production quality'ye çıkarmak.

## Sprint sonucu

Bu sprint sonunda sistemin kazanması gereken kabiliyet:

Deterministic candidate aynı compiler/render pipeline'ını kullanır.

## Etkilenecek / yeni dosyalar

- `deterministic/dashboard.ts`
- `management-list.ts`
- `form.ts`
- `detail.ts`
- `analytics.ts`
- `settings.ts`
- `compose.ts`

## İş paketleri

- [ ] archetype recipes
- [ ] screen-specific copy
- [ ] presentation integration
- [ ] remove generic repeated context
- [ ] quality metadata

## Test planı

- [ ] 6 screen finance replay
- [ ] multi-domain deterministic fixtures
- [ ] visual baseline

## Kabul kriterleri

- [ ] visual >=6 target
- [ ] static+geometry pass
- [ ] no repeated generic skeleton

## Kapsam dışı

AI enhancement yok.

## Riskler

Fallback complexity.

## Exit gate

Tüm kabul kriterleri PASS olmadan sonraki bağımlı sprint başlayamaz.
