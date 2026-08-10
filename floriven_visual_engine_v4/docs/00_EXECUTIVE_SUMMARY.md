# 00 — Executive Summary

## Problem Statement

Floriven'ın mevcut generated-design sistemi semantic olarak kullanılabilir ekranlar üretebilmekte,
ancak kullanıcıya görünen son tasarım kalitesi production-grade değildir.

Ana sebep model kalitesi değil, **semantic output ile visual rendering arasındaki compiler katmanının
eksik olmasıdır**.

Mevcut sistemde:

- `StyleSystemProfile` çok sayıda zengin görsel karar tanımlar.
- Studio renderer bu kararların yalnız küçük bir alt kümesini tüketir.
- Layout motoru esas olarak column / row / iki kolon grid davranışına indirgenir.
- Screen composition büyük ölçüde component sırası ve CSS override seviyesindedir.
- Chart rendering gerçek chart family sistemine sahip değildir.
- Deterministic fallback static gate'i geçebilir ama görsel olarak final ürün kalitesini garanti etmez.
- Static quality renderer-independent olduğu için “structurally valid” ile “visually good” ayrımı
  final kararda yeterince güçlü değildir.

## Hedef

Floriven V4 bir **Visual Compiler** olacaktır.

Semantic layer:
- ne gösterileceğini belirler.

Presentation layer:
- hangi görsel grammar'ın kullanılacağını belirler.

Composition layer:
- bilginin ekranda nasıl gruplanacağını belirler.

Layout engine:
- gerçek geometry'yi belirler.

Renderer:
- resolved component family'leri çizer.

Runtime quality:
- gerçek DOM + screenshot üzerinden sonucu doğrular.

## North Star

Aynı semantic document beş preset ile render edildiğinde:

- renkleri grayscale yapsak bile presetler ayırt edilebilmeli,
- dashboard ve settings geometry'si birbirine benzememeli,
- chart family preset ve screen job'a göre değişmeli,
- form gerçek bir form system gibi görünmeli,
- deterministic fallback minimum production baseline sağlamalı.

## Program hedefi

Visual Engine V4 için minimum final kalite:

- Visual critic: ≥ 8.0 / 10
- Cross-screen differentiation: ≥ 0.85
- Cross-preset structural differentiation: ≥ 0.40 her çiftte
- Critical geometry violation: 0
- Critical a11y violation: 0
- Unsupported renderer component: 0
- Final eligible yalnız runtime evidence sonrası `true`
