# 12 — Deterministic Compositor V2

## Amaç

Provider başarısız olsa bile minimum production-grade visual composition sağlamak.

## Yeni yapı

```text
deterministic/
  compose.ts
  dashboard.ts
  management-list.ts
  detail.ts
  form.ts
  analytics.ts
  settings.ts
  shared.ts
```

## Input

```ts
composeDeterministicScreen({
  screenSpec,
  blueprint,
  presentation
})
```

## Kurallar

- ortak generic context copy tüm ekranlara yapıştırılmaz
- archetype recipe kullanılır
- presentation grammar kullanılır
- list screen card stack olmaz
- settings hero almaz
- form tek primary action taşır
- analytics gerçek chart composition taşır

## Minimum target

Deterministic candidate:

- static quality: pass
- geometry: pass
- visual critic: >= 6.0
- cross-screen differentiation: pass

olmalıdır.

## Selection policy

AI candidate fail olduğunda deterministic baseline seçilebilir;
fakat deterministic candidate visual/runtime quality'yi geçmeden final eligible olamaz.
