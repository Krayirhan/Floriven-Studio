# Güvenlik ve Gizlilik

| Alan | Değer |
|---|---|
| Proje | Floriven Studio |
| Durum | Bağlayıcı |
| Doküman sahibi | Security Owner |
| Son güncelleme | 2026-08-05 |
| Gözden geçirme | Aylık |

> Projenin resmî ürün adı **Floriven Studio** olarak belirlenmiştir. Mimari kararlar uygulamaya geçmeden önce ilgili ADR ile onaylanır.
## Güvenlik hedefleri

Tenant verisinin gizliliği, DesignSpec ve kredi hareketlerinin bütünlüğü, üretim/export hizmetinin erişilebilirliği ve tüm kritik eylemlerin izlenebilirliği.

## Kimlik ve yetki

OIDC authorization code + PKCE. Kısa ömürlü access token, güvenli refresh yaklaşımı. Yetki server-side RBAC + resource ownership ile. Admin/support erişimi ayrı rol, MFA, süreli yükseltme ve audit ister.

## Veri koruma

TLS 1.2+ taşıma, yönetilen KMS ile disk/object encryption. Secret manager kullanılır. Hassas alanlar gerekiyorsa uygulama seviyesinde envelope encryption. Backup'lar şifreli ve erişim ayrıdır.

## Uygulama güvenliği

OWASP ASVS sınıfı kontroller: input validation, CSRF/XSS/SSRF/SQLi önleme, güvenli header/cookie, rate limit, dependency/secret scan, SAST/DAST, file upload isolation. CORS dar allowlist.

## Tenant izolasyonu

Her istek workspace üyeliğini doğrular. IDOR testleri otomatik. Cache anahtarları tenant prefix taşır. Object key ve signed URL tenant bağlamıyla üretilir. Admin sorguları normal repository yolunu bypass etmez.

## AI ve veri

Model sağlayıcıya minimum bağlam gönderilir. Sağlayıcının eğitimde kullanmama, saklama süresi ve region koşulları sözleşmeyle doğrulanır. Ham prompt ve DesignSpec varsayılan uygulama loguna yazılmaz.

## Audit

Üyelik/rol, faturalama, export, support access, veri silme, secret/config, admin retry ve güvenlik ayarı değişiklikleri audit edilir. Audit log append-only ve kullanıcı tarafından değiştirilemez.

## Güvenlik yaşam döngüsü

Threat modeling, secure design review, code review, otomatik tarama, pentest ve vulnerability disclosure. Kritik açık için hedef düzeltme 24–72 saat; ayrıntı risk politikasında tanımlanır.

## Hukuki not

Bu doküman teknik kontrol planıdır; KVKK/GDPR ve sektör uyumu için hukuk danışmanlığı yerine geçmez.
