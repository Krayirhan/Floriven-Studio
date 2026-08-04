# Veri Modeli

| Alan | Değer |
|---|---|
| Proje | Floriven Studio |
| Durum | Onay gerekli |
| Doküman sahibi | Backend Lead |
| Son güncelleme | 2026-08-05 |
| Gözden geçirme | Her migrasyon |

> Projenin resmî ürün adı **Floriven Studio** olarak belirlenmiştir. Mimari kararlar uygulamaya geçmeden önce ilgili ADR ile onaylanır.
## Temel varlıklar

| Varlık | Amaç | Kritik alanlar |
|---|---|---|
| users | Kimlik sağlayıcıyla eşleşen kişi | id, subject, status |
| workspaces | Tenant ve faturalama sınırı | id, plan, region |
| memberships | Kullanıcı-tenant rolü | workspace_id, user_id, role |
| projects | Ürün çalışması | workspace_id, settings, status |
| design_documents | Aktif çalışma kopyası | project_id, revision, schema_version |
| snapshots | Immutable DesignSpec sürümü | object_key/hash, created_by |
| generation_jobs | AI iş state machine'i | type, status, input_hash, cost |
| export_jobs | Dışa aktarım işi | target, status, artifact_key |
| assets | Yüklenen/üretilen varlık | mime, size, scan_status |
| credit_accounts | Workspace kredi bakiyesi projeksiyonu | balance, version |
| credit_ledger | Append-only hareketler | amount, reason, reference_id |
| subscriptions | Plan/sağlayıcı eşlemesi | provider IDs, period |
| audit_events | Güvenlik ve yönetim izi | actor, action, resource, metadata |

## Tenant kuralı

Tenant'a ait her tabloda `workspace_id` bulunur veya parent üzerinden zorunlu join ile türetilir. Repository metodları tenant parametresini açıkça alır. Üretim DB rolü cross-tenant sorguyu teknik olarak da sınırlandırmak için row-level security değerlendirmesine tabidir.

## Snapshot depolama

Küçük dokümanlar JSONB, büyüyen snapshot'lar sıkıştırılmış object storage nesnesi + DB metadata olarak tutulabilir. Her snapshot SHA-256 hash taşır. Aktif document normalize/denormalize kararı performans testiyle ADR'de verilir.

## Kredi defteri

Ledger değiştirilemez. `RESERVE`, `COMMIT`, `RELEASE`, `GRANT`, `PURCHASE`, `REFUND`, `ADJUSTMENT` hareketleri referans kimliğiyle idempotenttir. Bakiye transaction içinde optimistic/pessimistic lock ile korunur; günlük reconciliation ledger toplamıyla projeksiyonu karşılaştırır.

## Silme

Proje önce soft-delete olur; restore süresinden sonra purge job'u snapshot, asset ve export nesnelerini siler. Audit ve mali kayıtlar mevzuata uygun ayrı saklama politikasına tabidir. Kullanıcı silme talebi ilişkilendirilmiş PII'ı anonimleştirir veya siler.

## İndeksler

- `(workspace_id, updated_at)` projects.
- `(workspace_id, status, created_at)` jobs.
- `(project_id, created_at)` snapshots.
- Unique `(workspace_id, idempotency_key)` kritik istekler.
- Unique `(provider, provider_event_id)` ödeme webhook'ları.
- Partitioning yalnız ölçüm sonrası jobs/audit/ledger için.
