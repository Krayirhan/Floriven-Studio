# Sprint 11 — Five Presets — Full Runtime Completion

## Amaç

Beş mevcut preset'i gerçek design system seviyesinde tamamlamak.

## Sprint sonucu

Bu sprint sonunda sistemin kazanması gereken kabiliyet:

Her preset 6 archetype üzerinde structural, component ve chart farkı üretir.

## Etkilenecek / yeni dosyalar

- `preset fixtures`
- `resolved profiles`
- `visual regression baselines`

## İş paketleri

- [ ] Obsidian full pass
- [ ] Serene full pass
- [ ] Terracotta full pass
- [ ] Electric full pass
- [ ] Editorial full pass
- [ ] grayscale comparison

## Test planı

- [ ] 5×6 snapshots
- [ ] pairwise structural distance
- [ ] contract parity

## Kabul kriterleri

- [ ] her preset pair >=0.40 distance
- [ ] no color-only distinction
- [ ] all core archetypes >= target visual score

## Kapsam dışı

Yeni preset eklenmez.

## Riskler

Polish uğruna architecture bypass edilmesi.

## Exit gate

Tüm kabul kriterleri PASS olmadan sonraki bağımlı sprint başlayamaz.
