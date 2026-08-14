# Sprint 09 — Chart Engine V2

## Amaç

Gerçek chart family engine implement etmek.

## Sprint sonucu

Bu sprint sonunda sistemin kazanması gereken kabiliyet:

8 chart family production renderer olur.

## Etkilenecek / yeni dosyalar

- `components/charts/*`
- `chart contracts`

## İş paketleri

- [ ] line
- [ ] area
- [ ] bar
- [ ] donut
- [ ] radial
- [ ] sparkline
- [ ] heatmap
- [ ] segmented
- [ ] annotation/target/unit support

## Test planı

- [ ] all chart fixtures
- [ ] edge cases
- [ ] reduced motion
- [ ] visual regression

## Kabul kriterleri

- [ ] radial gerçekten radial
- [ ] preset chart allowlist enforced
- [ ] analytics chart information quality pass

## Kapsam dışı

Advanced interactive chart editor yok.

## Riskler

SVG complexity/performance.

## Exit gate

Tüm kabul kriterleri PASS olmadan sonraki bağımlı sprint başlayamaz.
