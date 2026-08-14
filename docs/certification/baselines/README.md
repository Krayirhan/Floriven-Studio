# Runtime Replay Baselines

Durum: **PENDING — ilk gerçek altı ekranlı production replay henüz kaydedilmedi.**

Bu klasöre baseline eklemek veya mevcut baseline'ı değiştirmek için aynı PR içinde:

1. `runtime-replay-manifest.json` gerçek trusted runtime capture'dan üretilir.
2. Manifest dosyasının SHA-256 değeri hesaplanır.
3. `runtime-replay-approval.json` içine `baselineSha256`, `approvedBy`, ISO-8601
   `approvedAt` ve PR/ticket `reviewReference` alanları yazılır.
4. Yetkili maintainer PR'a `runtime-baseline-approved` etiketi verir.

CI, etiket ile hash'e bağlı onay kaydından biri eksikse baseline değişikliğini reddeder.
Prompt, kullanıcı metni, credential veya screenshot base64 içeriği bu klasöre konulmaz.

`pnpm certification:runtime-release-evidence` mevcut kanıt zincirini raporlar. Eksik canlı
önkoşullar `NOT_VERIFIED`, açık replay/final başarısızlığı `BLOCKED`, yalnız tam ve başarılı
zincir `VERIFIED` üretir. Release aşamasında `RUNTIME_RELEASE_EVIDENCE_STRICT=true`
kullanılarak `VERIFIED` dışındaki durumlar process hatasına dönüştürülür.
