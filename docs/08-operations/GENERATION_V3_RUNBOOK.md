# Generation V3 Operasyon ve Müdahale Runbook'u

| Alan | Değer |
|---|---|
| Servis | Generation V3 (`/generation-v3`) |
| Doküman Sahibi | Backend Lead & DevOps Lead |
| Son Güncelleme | 2026-08-14 |
| Durum | Üretim Bağlayıcı |

---

## 1. Servis Mimarisi ve Uç Noktalar

Generation V3; Supabase Edge Functions üzerinde çalışan, çok kiracılı (multi-tenant), fail-closed doğrulama ve append-only kredi defteri (`CreditLedger`) ile entegre uçtan uca AI tasarım üretim motorudur.

### Uç Noktalar
- `POST /generation-v3` — Yeni üretim işi kuyruğa alma (JWT, rol, rate-limit ve kredi hold kontrollü).
- `GET /generation-v3?id={jobId}` — Üretim durumu ve snapshot sorgulama (JWT + `X-Job-Token` capability hash doğrulamalı).
- `POST /generation-v3/{jobId}/render-evidence` — Canlı tarayıcı render geometrisi ve visual hierarchy kanıtı yükleme.
- `PATCH /generation-v3/{jobId}/edit` — Optimistic concurrency (`revision`) kontrollü kimlikli typed patch uygulama.

---

## 2. Dağıtım ve Secret Preflight Kontrolü

Canlıya veya staging ortamına dağıtım yapılmadan önce `preflight.ts` çalıştırılır:

### Zorunlu Ortam Değişkenleri
- `SUPABASE_URL`: Supabase API URL'si
- `SUPABASE_SERVICE_ROLE_KEY`: Service role gizli anahtarı
- `SUPABASE_ANON_KEY`: Anonim erişim anahtarı
- `ANTHROPIC_API_KEY` veya `GEMINI_API_KEY` veya `OPENAI_API_KEY`: En az bir aktif model sağlayıcı anahtarı.

> [!WARNING]
> Secret eksikliği durumunda preflight fail-closed olarak dağıtımı durdurur.

---

## 3. Servis Seviyesi Hedefleri (SLO) ve Alarmlar

| Metrik | Hedef / Eşik | Alarm Seviyesi |
|---|---|---|
| P95 Üretim Gecikmesi | < 15 saniye | P2 Warning |
| API Hata Oranı (5xx) | < %0.5 | P1 Critical |
| Başarısız Runtime Critic Oranı | < %2 | P2 Warning |
| Kredi Bakiye Tutarsızlığı | %0 (Tam mutabakat) | P0 Blocker |

---

## 4. Acil Durum Müdahale Prosedürleri

### A. Acil Durum Kill Switch (V2 Fallback)
Bir provider kesintisi, kritik regression veya güvenlik anomalisi tespit edildiğinde:

1. `feature-flags.ts` üzerinden `v3KillSwitchEnabled: true` ayarlanır.
2. Tüm yeni üretim ve edit istekleri saniyeler içinde hiçbir veri kaybı olmadan V2 motoruna yönlendirilir.
3. Kuyruktaki mevcut işler otomatik olarak tamamlanır veya `recoverStuckJobs` ile kredileri iade edilir.

### B. Takılı Kalan İşlerin Kurtarılması (Stuck-Job Recovery)
Ağ kopması veya istemci çökmesi nedeniyle `processing` veya `awaiting_render` durumunda 5 dakikadan uzun süre bekleyen işler için cron/job tetiklenir:

```typescript
import { recoverStuckJobs } from './job-recovery.ts'
// 5 dakikayı aşan işleri failed yapar ve kredilerini otomatik iade eder
await recoverStuckJobs(jobStore, creditLedger, new Date().toISOString(), 300_000)
```

### C. Sağlayıcı Kesintisi (Provider Outage)
Model sağlayıcısından yanıt alınamadığında sistem `503 V3_PROVIDER_UNAVAILABLE` döner ve rezerve edilen kredileri kullanıcıya anında iade eder (`refundCredits`).

---

## 5. Rollback Prosedürü

1. **Feature Flag Kapatma**: `v3KillSwitchEnabled: true` yaparak tüm trafiği V2'ye çevir.
2. **Edge Function Geri Alma**: `supabase functions deploy generation-v3 --version <onceki-calisan-versiyon>`.
3. **Kredi Mutabakatı**: `CreditLedger` üzerinde açıkta kalan `hold` işlemlerini `refundCredits` ile kapat.
