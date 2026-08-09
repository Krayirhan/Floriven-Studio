# Floriven Studio Design Engine V2 — Sprint 0 Baseline Audit

> Tarih: 2026-08-09  
> Kapsam: mevcut çalışma ağacındaki Design Engine V2 sözleşmeleri ve generation hattı

## Amaç

Bu belge, V2 sözleşmelerinin dosya olarak mevcut olmasını değil, production generation hattında hangi aşamada kullanıldığını ölçülebilir biçimde kaydeder. Bu audit, Sprint 1–3 için başlangıç kapısıdır.

## Kullanım matrisi

| Contract | Generation | Normalize | Quality | Renderer | Final gate | Durum | Kanıt / not |
|---|---:|---:|---:|---:|---:|---|---|
| UXSpec | PARTIAL | PARTIAL | PARTIAL | DEAD | PARTIAL | PARTIAL | `ux-spec.ts` ve domain archetype planı var; renderer doğrudan UXSpec tüketmiyor |
| Archetype | ACTIVE | ACTIVE | ACTIVE | PARTIAL | PARTIAL | ACTIVE | `domain.ts`, `archetype.ts`, prompt planning/composition ve quality kontrolleri |
| Pattern Registry | PARTIAL | DEAD | PARTIAL | DEAD | DEAD | PARTIAL | Registry ve testleri var; generation çıktısında zorunlu enforcement yok |
| Surface Semantics | PARTIAL | ACTIVE | ACTIVE | PARTIAL | PARTIAL | ACTIVE | `surface-semantics.ts`, tree simplifier ve quality metrikleri mevcut |
| Typography Budget | PARTIAL | PARTIAL | PARTIAL | DEAD | DEAD | PARTIAL | Contract/test mevcut; runtime pipeline’a tam gate olarak bağlanmamış |
| Geometry Validator | DEAD | DEAD | PARTIAL | DEAD | PARTIAL | PARTIAL | Validator ve runtime evidence contract mevcut; trusted screenshot üretimi eksik |
| Action Semantics | PARTIAL | DEAD | ACTIVE | PARTIAL | PARTIAL | PARTIAL | Static validation mevcut; renderer intent’i tam typed contract olarak kullanmıyor |
| Typed Content | PARTIAL | PARTIAL | PARTIAL | PARTIAL | DEAD | PARTIAL | Shared contract mevcut; final eligibility’ye bağlı değil |
| Critic Gate | DEAD | DEAD | PARTIAL | DEAD | PARTIAL | PARTIAL | Threshold ve runtime report contract mevcut; gerçek visual critic entegrasyonu eksik |
| Structural Metrics | ACTIVE | ACTIVE | ACTIVE | DEAD | PARTIAL | ACTIVE | Generation quality raporuna max depth, card ratio ve action metrikleri giriyor |
| Patch Validator | DEAD | DEAD | DEAD | DEAD | DEAD | FUTURE | Contract/test mevcut; repair loop orchestration’a bağlı değil |
| Production Gates | DEAD | DEAD | PARTIAL | DEAD | PARTIAL | PARTIAL | Gate modeli mevcut; CI benchmark release gate’i henüz zorunlu değil |

Durum anlamları: `ACTIVE` üretim hattında enforce ediliyor, `PARTIAL` kısmen bağlı, `DEAD` yalnızca tanım/test seviyesinde, `FUTURE` sonraki sprint bağımlılığı.

## Mevcut benchmark baseline

- Katalog: `docs/benchmarks/catalog.json`
- Domain sayısı: 7 (`finance`, `restaurant`, `ecommerce`, `fitness`, `project-management`, `travel`, `education`)
- Stil varyantı: 6 (`auto` + 5 preset)
- Zorunlu ekran türleri: 6
- Sonuç dosyası: `docs/benchmarks/results/2026-08-09T11-14-03-848Z.json`
- Sonuç kaynağı: `local-uncommitted`; bu nedenle commit karşılaştırması henüz güvenilir değil.

### Baseline gözlemleri

- Benchmark üretim script’i 42 kombinasyon planlıyor.
- Mevcut sonuçlarda bazı koşular provider dakika kotası nedeniyle başarısız olmuş; bu nedenle sonuç dosyası tam ve deterministik baseline olarak kabul edilmemeli.
- Mevcut kalite raporu ekran sayısı, settings coverage, blueprint alignment, structure diversity, vocabulary coverage ve navigation metriklerini içeriyor.
- V2 hedef metrikleri (`nestedCardCount`, `overflowCount`, `overlapCount`, `visualScore`, `taskClarity`) sonuç özetinde henüz tüm koşular için standartlaştırılmış değil.

## Sprint 1 giriş koşulları

1. Benchmark çalıştırıcısı her koşuda aynı metric şemasını yazmalı.
2. Başarısız provider çağrısı ile kalite başarısızlığı ayrı durumlar olarak raporlanmalı.
3. `sourceRevision` gerçek git commit’i veya açıkça `dirty:<hash>` biçiminde tutulmalı.
4. Contract matrisi güncel generation bağlantılarıyla birlikte korunmalı.
5. Bundan sonraki değişiklikler semantic hash parity testine bağlanmalı.

## Karar

Sprint 0 baseline dokümantasyonu oluşturuldu. Sonraki uygulama işi **Sprint 1 — UX / Style Hard Separation**: composition promptundan preset/presentation bilgisini çıkarmak ve semantic freeze/hash guard eklemek.

