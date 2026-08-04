# API Tasarım Spesifikasyonu

| Alan | Değer |
|---|---|
| Proje | Floriven Studio |
| Durum | Onay gerekli |
| Doküman sahibi | Backend Lead |
| Son güncelleme | 2026-08-05 |
| Gözden geçirme | Her API sürümü |

> Projenin resmî ürün adı **Floriven Studio** olarak belirlenmiştir. Mimari kararlar uygulamaya geçmeden önce ilgili ADR ile onaylanır.
## Genel

JSON tabanlı HTTPS API. Public sözleşme OpenAPI ile tutulur; bu doküman davranış ilkelerini tanımlar. API kökü `/api/v1`.

## Kimlik ve tenant

Bearer OIDC access token doğrulanır. Workspace bağlamı path veya açık header ile taşınır; token'daki üyelik server tarafından kontrol edilir. Client'ın gönderdiği owner/user alanlarına güvenilmez.

## Temel endpoint'ler

```text
POST   /workspaces
GET    /workspaces/{workspaceId}
POST   /workspaces/{workspaceId}/invitations
GET    /workspaces/{workspaceId}/projects
POST   /workspaces/{workspaceId}/projects
GET    /projects/{projectId}
PATCH  /projects/{projectId}
GET    /projects/{projectId}/design-document
PATCH  /projects/{projectId}/design-document
POST   /projects/{projectId}/snapshots
POST   /projects/{projectId}/generation-jobs
GET    /generation-jobs/{jobId}
POST   /generation-jobs/{jobId}/cancel
POST   /projects/{projectId}/export-jobs
GET    /export-jobs/{jobId}
GET    /workspaces/{workspaceId}/credits
GET    /workspaces/{workspaceId}/credit-ledger
```

## Idempotency

Generation, export, kredi satın alma ve webhook yan etkileri `Idempotency-Key` kullanır. Aynı key + aynı payload önceki sonucu döndürür; farklı payload 409 verir. Kayıt saklama süresi endpoint'e göre belgelenir.

## Concurrency

Design document update `If-Match`/revision taşır. Uyuşmazlıkta:

```json
{
  "type": "https://errors.example/conflict",
  "title": "Revision conflict",
  "status": 409,
  "code": "DOCUMENT_REVISION_CONFLICT",
  "currentRevision": 19,
  "correlationId": "..."
}
```

## Hata formatı

RFC 9457 Problem Details yaklaşımı kullanılır. Hata mesajı PII veya internal stack trace içermez. `code`, `correlationId`, alan hataları ve güvenli retry bilgisi bulunur.

## Pagination ve filtre

Cursor pagination varsayılandır. Limit maksimumu server belirler. Sıralama allowlist'ten seçilir; keyfi kolon adı kabul edilmez.

## Asenkron durum

Job endpoint 202 döndürür. Durum SSE ile `/jobs/stream` veya kontrollü polling ile izlenir. Event sırası ve tekrarları için event ID bulunur; UI state machine idempotent olmalıdır.

## Rate limit

Kullanıcı, workspace, IP ve maliyetli operasyon sınıfına göre ayrı bucket. 429 yanıtı `Retry-After` taşır. Rate limit başarısızlığı kredi kesmez.

## Sürümleme

Geriye uyumlu alan ekleme aynı v1 içinde olabilir. Alan anlamını değiştirme, silme veya enum daraltma yeni API sürümü veya geçiş dönemi ister. Deprecation header ve en az bir istemci sürümü geçiş süresi sağlanır.

## Çapraz referanslar

| Konu | Doküman |
|---|---|
| DesignSpec şema detayı | [DESIGN_SPEC.md](../02-architecture/DESIGN_SPEC.md) |
| Modüler monolit kararı (servis sınırları) | [ADR-0001](../02-architecture/ADR-0001.md) |
| Kanonik model kararı | [ADR-0002](../02-architecture/ADR-0002.md) |
| AI job akışı | [AI_ARCHITECTURE.md](../02-architecture/AI_ARCHITECTURE.md) |
| Kimlik ve tenant modeli | [SECURITY_AND_PRIVACY.md](../05-security/SECURITY_AND_PRIVACY.md) |
| Kredi endpoint davranışı | [PRICING_AND_CREDITS.md](../07-business/PRICING_AND_CREDITS.md) |
| Hata ve retry standartları | [ERROR_HANDLING.md](ERROR_HANDLING.md) |
