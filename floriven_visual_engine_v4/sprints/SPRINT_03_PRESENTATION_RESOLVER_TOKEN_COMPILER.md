# Sprint 03 — Presentation Resolver & Token Compiler

## Amaç

Preset/auto strategy'yi preset-agnostic resolved presentation'a dönüştürmek.

## Sprint sonucu

Bu sprint sonunda sistemin kazanması gereken kabiliyet:

Renderer'a hazır token/family/layout kararları tek resolver'dan çıkar.

## Etkilenecek / yeni dosyalar

- `presentation/resolvePresentation.ts`
- `presentation/tokenCompiler.ts`
- `presentation/resolvers/*`

## İş paketleri

- [ ] preset profile resolve et
- [ ] screen intent modifier uygula
- [ ] a11y constraints uygula
- [ ] CSS variable/token output üret
- [ ] fallback reason metadata üret

## Test planı

- [ ] five preset resolver fixtures
- [ ] same input deterministic hash
- [ ] unknown fallback tests

## Kabul kriterleri

- [ ] PhoneScreen preset identity'ye ihtiyaç duymuyor
- [ ] StyleSystemProfile alanları gerçek output üretiyor
- [ ] no preset branch invariant

## Kapsam dışı

Composition engine yok.

## Riskler

Resolver içinde renderer logic birikmesi.

## Exit gate

Tüm kabul kriterleri PASS olmadan sonraki bağımlı sprint başlayamaz.
