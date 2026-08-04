# AI Güvenliği ve Guardrail

| Alan | Değer |
|---|---|
| Proje | Floriven Studio |
| Durum | Bağlayıcı |
| Doküman sahibi | Security ve AI Lead |
| Son güncelleme | 2026-08-05 |
| Gözden geçirme | Aylık |

> Projenin resmî ürün adı **Floriven Studio** olarak belirlenmiştir. Mimari kararlar uygulamaya geçmeden önce ilgili ADR ile onaylanır.
## Tehditler

Prompt injection, hassas veri sızıntısı, zararlı içerik, telif/marka taklidi, keyfi kod üretimi, tool abuse, maliyet saldırısı, model sağlayıcı kesintisi ve açıklanamaz karar.

## Kontroller

- Girdi boyutu, dosya türü ve malware taraması.
- PII uyarısı ve gerektiğinde tespit/redaksiyon.
- Sistem talimatı ile kullanıcı/retrieved içerik arasında teknik ayrım.
- Structured output + allowlist registry.
- URL/action/expression validation.
- Tool çağrılarında server-side parametre, scope ve timeout.
- Workspace/job başına maliyet ve concurrency limiti.
- İçerik güvenliği sınıflandırması ve itiraz/support akışı.
- Sağlayıcıya gönderilen veri için minimizasyon ve sözleşme kaydı.

## Yüksek riskli kullanım

Sağlık, finans ve hukuk uygulaması tasarımları üretilebilir; ancak ürün profesyonel tavsiye üretmediğini, UI örneğinin düzenleyici uygunluk garantisi olmadığını belirtir. Kritik beyan ve onay ekranları için insan inceleme uyarısı gösterilir.

## Referans görsel

Kullanıcı kullanım hakkına sahip olduğunu onaylar. Sistem birebir marka/ürün kopyası yerine stil özellikleri çıkarmayı tercih eder. Talep açıkça aldatıcı taklit veya kimlik avına yönelikse reddedilir.

## Olay yönetimi

Prompt/data leak şüphesinde ilgili model logları ve erişim token'ları izole edilir, sağlayıcıya gönderim durdurulabilir, etkilenen tenant belirlenir ve incident planı çalışır.
