# Katkı Rehberi

| Alan | Değer |
|---|---|
| Proje | Floriven Studio |
| Durum | Bağlayıcı |
| Doküman sahibi | Mühendislik Lideri |
| Son güncelleme | 2026-08-05 |
| Gözden geçirme | Üç aylık |

> Projenin resmî ürün adı **Floriven Studio** olarak belirlenmiştir. Mimari kararlar uygulamaya geçmeden önce ilgili ADR ile onaylanır.
## Çalışmaya başlamadan önce

- İlgili issue veya görev kaydını doğrulayın.
- Kabul kriterlerinin test edilebilir olduğundan emin olun.
- Mimari veya sözleşme değişikliği varsa ADR gerekip gerekmediğini değerlendirin.
- Büyük işleri dikey dilimlere bölün; tek PR birden fazla bağımsız amacı taşımamalıdır.

## Branch ve commit

Branch örnekleri: `feat/design-spec-patch`, `fix/credit-race-condition`, `docs/ai-evaluation`. Commit mesajları Conventional Commits biçiminde olmalıdır: `feat(editor): add multi-select resize`.

## Pull request gereksinimleri

- Problem ve çözüm özeti.
- Etkilenen kullanıcı akışı.
- Test kanıtı ve gerekiyorsa ekran görüntüsü.
- Veri/API/şema etkisi.
- Güvenlik ve gözlemlenebilirlik etkisi.
- Geri alma yöntemi.
- İlgili doküman güncellemeleri.

## İnceleme politikası

Kritik alanlar en az iki onay ister: kimlik/yetki, ödeme-kredi, tenant izolasyonu, veri migrasyonu, AI güvenliği, dışa aktarım güvenliği ve altyapı. PR yazarı kendi PR'ını nihai olarak onaylamaz.

## Definition of Done

`docs/08-management/DEFINITION_OF_READY_DONE.md` içindeki DoD uygulanır. Test veya doküman borcu ertelenirse sahibi ve son tarihi olan takip işi açılır.
