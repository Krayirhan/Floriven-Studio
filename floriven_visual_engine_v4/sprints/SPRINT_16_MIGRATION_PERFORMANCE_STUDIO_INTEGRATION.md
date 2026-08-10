# Sprint 16 — Migration, Performance & Studio Integration

## Amaç

V4'ü mevcut documents ve Studio UX ile güvenli biçimde entegre etmek.

## Sprint sonucu

Bu sprint sonunda sistemin kazanması gereken kabiliyet:

Legacy compatibility, performance ve inspector gerçek resolved grammar ile çalışır.

## Etkilenecek / yeni dosyalar

- `compat adapters`
- `Studio compare/inspector`
- `performance profiling`
- `feature flags`

## İş paketleri

- [ ] v1→v2
- [ ] legacy templateId
- [ ] resolved system inspector
- [ ] render profiling
- [ ] feature flags
- [ ] rollback hooks

## Test planı

- [ ] legacy fixture render
- [ ] 6-screen performance
- [ ] flag rollback

## Kabul kriterleri

- [ ] no destructive migration
- [ ] Studio stable
- [ ] performance budget met

## Kapsam dışı

Public rollout yok.

## Riskler

Dual-stack complexity.

## Exit gate

Tüm kabul kriterleri PASS olmadan sonraki bağımlı sprint başlayamaz.
