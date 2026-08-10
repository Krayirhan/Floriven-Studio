# Sprint 15 — Runtime Certification Security Bridge

## Amaç

Historical job-token bağımlılığı olmadan güvenli runtime evidence flow kurmak.

## Sprint sonucu

Bu sprint sonunda sistemin kazanması gereken kabiliyet:

Signed short-lived candidate-bound read-only certification token çalışır.

## Etkilenecek / yeni dosyalar

- `runtime-certification/session`
- `generate GET auth`
- `security tests`
- `runner integration`

## İş paketleri

- [ ] session endpoint
- [ ] signature
- [ ] TTL
- [ ] job/hash binding
- [ ] read-only union
- [ ] runner hydration

## Test planı

- [ ] wrong job/hash
- [ ] expired
- [ ] mutation
- [ ] write attempt
- [ ] normal token regression

## Kabul kriterleri

- [ ] real Studio hydration succeeds
- [ ] security tests pass
- [ ] no auth contract regression

## Kapsam dışı

Final rollout yok.

## Riskler

Auth vulnerability critical.

## Exit gate

Tüm kabul kriterleri PASS olmadan sonraki bağımlı sprint başlayamaz.
