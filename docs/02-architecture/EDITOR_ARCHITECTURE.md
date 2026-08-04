# Görsel Editör Mimarisi

| Alan | Değer |
|---|---|
| Proje | Floriven Studio |
| Durum | Onay gerekli |
| Doküman sahibi | Frontend Lead |
| Son güncelleme | 2026-08-05 |
| Gözden geçirme | Aylık |

> Projenin resmî ürün adı **Floriven Studio** olarak belirlenmiştir. Mimari kararlar uygulamaya geçmeden önce ilgili ADR ile onaylanır.
## Hedefler

60 FPS'e yakın doğrudan manipülasyon, erişilebilir properties panel, güvenli autosave, deterministic render ve DesignSpec ile kayıpsız çalışma.

## Katmanlar

- **Document model:** Normalize edilmiş DesignSpec ve node index.
- **Command layer:** Tüm değişiklikleri komut olarak uygular; inverse command üretir.
- **Selection/viewport:** Seçim, hover, zoom, pan ve guide state'i.
- **Renderer:** Registry component'lerini DOM/SVG ile render eder.
- **Inspector:** Schema-driven property form'ları.
- **Persistence:** Debounced autosave, revision ve conflict çözümü.
- **AI patch:** Önizleme, diff ve atomik uygulama.

## State ayrımı

Kalıcı document state ile geçici UI state ayrılır. Zoom, panel açıklığı ve hover server'a yazılmaz. Document değişiklikleri command log üzerinden yürür; komponentler doğrudan global state'i mutasyona uğratmaz.

## Undo/redo

Her komut `execute`, `invert`, `describe` sözleşmesine uyar. Büyük AI patch tek history entry olarak görünür. Server save başarısız olursa yerel değişiklik kaybolmaz; kullanıcıya retry ve export-as-file seçeneği sunulur.

## Autosave

- Değişiklikler 500–1500 ms debounce ile batch edilir.
- İstek `baseRevision` taşır.
- Server yeni revision döndürür.
- Conflict: otomatik merge yalnız farklı node'larda güvenliyse; aksi halde kullanıcıya iki sürüm sunulur.
- Browser kapanmasına karşı IndexedDB recovery buffer kullanılabilir.

## Performans

Node index O(1) lookup sağlar. Seçim değişiminde tüm canvas render edilmez. Büyük listelerde virtualization, thumbnail üretiminde worker ve pahalı geometri hesaplarında memoization kullanılır. 500 node altında p95 etkileşim 100 ms hedeflenir.

## Güvenlik

DesignSpec içindeki metin HTML olarak çalıştırılmaz. URL ve asset kaynakları allowlist/signed URL ile yüklenir. Declarative expression sandbox'tan geçer; eval kullanılmaz.
