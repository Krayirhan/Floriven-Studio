# 08. Screenshot Redesign Mode

## Amaç

Floriven Studio ana çalışma alanında yalnızca **Screenshot Redesign Mode** birimini iyileştirmek. Diğer başarılı bölümleri korumak.

## Kullanım

Mevcut Floriven Studio ekran görüntüsünü referans olarak yükleyin ve aşağıdaki promptu tek başına uygulayın.

## Prompt

```text
Refine ONLY the “Ekranı Yeniden Tasarla” workflow inside the Floriven Studio composer.

It must be completely adapted to screenshot redesign.

Do not display the standard prompt-first composer when this mode is active.

Use an upload-first workflow.

HEADER:

“Mevcut ekranını yeniden tasarla”

Supporting text:

“Ekranını yükle. Floriven içerikleri ve kullanıcı aksiyonlarını analiz ederek işlevleri koruyan yeni tasarım yönleri oluştursun.”

MAIN DROPZONE:

“Ekran görüntüsünü buraya bırak”

“veya dosya seç”

Supported:
PNG · JPG · WebP

Secondary action:

“Birden fazla ekran yükle”

After upload:

Show a large readable screenshot preview.

ANALYSIS STATE:

“Ekran analiz ediliyor…”

Then show:

Floriven şunları algıladı:

✓ Alt navigasyon
✓ 4 temel kullanıcı aksiyonu
✓ 3 içerik bölümü
✓ Form bileşenleri
⚠ 2 erişilebilirlik sorunu

PRESERVE OPTIONS:

✓ İçeriği koru
✓ Kullanıcı aksiyonlarını koru
✓ Navigasyonu koru
✓ Veri alanlarını koru

OPTIONAL INSTRUCTION:

“Neyi değiştirmek istiyorsun?”

Example:

“Kart kullanımını azalt, bilgi hiyerarşisini güçlendir ve daha premium bir finans ürünü hissi oluştur.”

DESIGN DIRECTION:

Otomatik
Editorial Minimal
Soft Futurism
Warm Organic
Modern Native
Experimental

VARIATIONS:

1
2
3

Primary CTA:

“✦ Yeniden tasarla”

After generation:

Show the original screen and generated alternatives side-by-side.

Do not treat screenshot redesign as simply another prompt tab.

Make it feel like a specialized Floriven capability.
```
