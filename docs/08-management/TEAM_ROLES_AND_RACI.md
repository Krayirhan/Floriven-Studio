# Ekip Rolleri ve RACI

| Alan | Değer |
|---|---|
| Proje | Floriven Studio |
| Durum | Onay gerekli |
| Doküman sahibi | Project Manager |
| Son güncelleme | 2026-08-05 |
| Gözden geçirme | Üç aylık |

> Projenin resmî ürün adı **Floriven Studio** olarak belirlenmiştir. Mimari kararlar uygulamaya geçmeden önce ilgili ADR ile onaylanır.
## Roller

Product Owner, Product Designer, Tech Lead, Frontend Lead, Backend Lead, AI Lead, QA Lead, Platform/DevOps, Security/Privacy, Growth/Finance.

## RACI

| Karar/çıktı | A | R | C | I |
|---|---|---|---|---|
| Ürün vizyonu/PRD | Product Owner | Product | Design, Tech | Tüm ekip |
| DesignSpec | Tech Lead | Architecture | FE, BE, AI, Export | QA/Product |
| AI model/prompt release | AI Lead | AI | Security, QA, Finance | Product |
| Kredi/ödeme | Product Owner | Backend/Finance | Security | Support |
| Güvenlik politikası | Security Owner | Security | Tech, Privacy | Tüm ekip |
| Production release | Tech Lead | Release Manager | QA, Platform | Product |
| Incident SEV-1 | Incident Commander | Teknik ekip | Legal/Comms | Yönetim |

A: Accountable, R: Responsible, C: Consulted, I: Informed.

## Onay ilkesi

Aynı kişi R ve A olabilir; ancak kritik güvenlik, para ve üretim veri değişikliklerinde bağımsız ikinci onay gerekir.
