# Floriven Studio Renk Sistemi

## Amaç

Renk, Floriven arayüzünde dekorasyon değil anlam taşır. Uygulama koyu yosun yüzeylerde yaşar; sıcak kil yalnızca odak, seçim ve birincil eylem için kullanılır. Kart türlerini ayırmak için rastgele mor, turuncu, yeşil veya kırmızı arka plan kullanılmaz.

## Çekirdek paket: Moss & Clay

| Rol | Koyu tema | Kullanım |
|---|---:|---|
| Canvas | `#171A16` | Uygulama zemini |
| Surface | `#20251F` | Panel ve kartlar |
| Raised | `#293027` | Menü, input, yükseltilmiş yüzey |
| Border | `#3B4539` | Ayrım ve pasif çerçeve |
| Text | `#F1EFE7` | Ana metin |
| Text secondary | `#C2C6B8` | Açıklama |
| Text muted | `#8D9585` | Metadata |
| Primary | `#D17A59` | Birincil CTA, seçim, odak |

Durum renkleri yalnızca durum bildirmek içindir: başarı `#9DB88D`, uyarı `#DFB65F`, hata `#DF8277`, bilgi `#B2BE9D`.

## Uygulama kuralları

- Yeni UI yalnızca `--color-*` semantic token’larını kullanır.
- Primary kil tonu bir ekranda en fazla bir ana CTA ve aktif seçim için görünür.
- Template ve proje kartlarının zemini nötr kalır; kategori ayrımı metin, thumbnail veya küçük rozetle yapılır.
- Başarı, uyarı ve hata renkleri CTA veya dekorasyon amacıyla kullanılmaz.
- Kontrast sadece opacity düşürerek kurulmaz; `text`, `text-secondary` ve `text-muted` token’ları kullanılır.
- Eski `--accent`, `--bg` gibi token’lar geriye uyumluluk alias’larıdır; yeni kodda tercih edilmez.
