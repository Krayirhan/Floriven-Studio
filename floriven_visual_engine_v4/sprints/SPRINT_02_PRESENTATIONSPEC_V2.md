# Sprint 02 — PresentationSpec V2

## Amaç

StyleSystemProfile v3'ün runtime'da tüketilebileceği eksiksiz presentation contract'ını kurmak.

## Sprint sonucu

Bu sprint sonunda sistemin kazanması gereken kabiliyet:

V3 grammar'ın production-relevant alanları typed resolved contract'a taşınır.

## Etkilenecek / yeni dosyalar

- `packages/design-spec/src/presentation/contracts.ts`
- `validators.ts`
- `compat.ts`

## İş paketleri

- [ ] PresentationSpecV2 tanımla
- [ ] typography/geometry/surface/chart/control/navigation/composition/motion resolved types ekle
- [ ] v1 compatibility adapter yaz
- [ ] serialization/hash kuralları belirle

## Test planı

- [ ] schema tests
- [ ] v1→v2 compatibility
- [ ] invalid variant rejection

## Kabul kriterleri

- [ ] runtime gereken alanların >=%90'ı contract'ta
- [ ] v1 docs render edilebilir
- [ ] unknown values deterministic fallback

## Kapsam dışı

Resolver logic yok.

## Riskler

Contract çok genişleyip renderer concern'lerini design-spec'e sızdırabilir.

## Exit gate

Tüm kabul kriterleri PASS olmadan sonraki bağımlı sprint başlayamaz.
