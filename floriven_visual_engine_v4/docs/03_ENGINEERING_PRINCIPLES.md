# 03 — Engineering Principles

## P1 — Semantic truth ile presentation truth ayrılmalıdır

Aynı semantic content farklı presetlerde farklı görünmelidir; product anlamı değişmemelidir.

## P2 — Renderer karar vermez

Renderer resolved kararları uygular.

## P3 — Preset bir palette değildir

Bir preset en az şu boyutlarda fark yaratmalıdır:

- layout
- hierarchy
- typography
- surfaces
- component families
- chart families
- controls
- navigation
- motion
- information density

## P4 — Archetype birinci sınıf contract'tır

Dashboard, list, form, detail, analytics ve settings aynı skeleton paylaşamaz.

## P5 — Visual quality runtime'da ölçülür

DOM ve screenshot evidence olmadan final kalite kararı verilemez.

## P6 — Deterministic sistem utanç fallback'ı değildir

Provider başarısız olduğunda kullanıcıya kırık veya wireframe UI değil,
tutarlı bir minimum production composition verilmelidir.

## P7 — Grayscale test

Preset farkı yalnız renkse başarısızdır.

## P8 — Accessibility tasarım motorunun parçasıdır

A11y sonradan lint değildir. Layout ve component constraints içine gömülmelidir.

## P9 — Test fixture tasarım kontratıdır

Canonical fixtures release boyunca sabit tutulmalı; visual regression bilinçli değişiklik olmadan update edilmemelidir.

## P10 — Motion polish'tir, foundation değildir

Layout ve hierarchy çözülmeden motion sprint'i başlamaz.
