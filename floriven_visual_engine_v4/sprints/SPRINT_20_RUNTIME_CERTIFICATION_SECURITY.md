# Sprint 20 — Runtime Certification Security

## Amaç

Runtime evidence runner için güvenli, kısa ömürlü ve yalnızca okunabilir certification session oluşturmak.

## İş paketleri

- Certification session endpoint
- Signed token
- TTL ve candidate hash binding
- Read-only auth union
- Studio hydration
- Wrong job/hash, expiry, replay, mutation ve write-attempt testleri
- Normal job-token regression

## Exit gate

Gerçek Studio hydration başarılı, tüm security testleri PASS, normal auth contract değişmeden korunmuş olmalı.

## Durum

**TAMAMLANDI — 2026-08-10**

- Signed, short-lived, candidate-hash-bound certification session eklendi.
- Session scope yalnızca `runtime:evidence:read` olarak sınırlandı.
- Wrong job, candidate hash, expiry, replay, signature ve mutation/write-attempt kapıları test edildi.
- Mevcut runtime evidence ve normal job-token sözleşmeleri değiştirilmedi.
- Design-spec security testleri ve type-check PASS.
