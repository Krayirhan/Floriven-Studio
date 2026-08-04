<div align="center">

<br>

```
███████╗██╗      ██████╗ ██████╗ ██╗██╗   ██╗███████╗███╗   ██╗
██╔════╝██║     ██╔═══██╗██╔══██╗██║██║   ██║██╔════╝████╗  ██║
█████╗  ██║     ██║   ██║██████╔╝██║██║   ██║█████╗  ██╔██╗ ██║
██╔══╝  ██║     ██║   ██║██╔══██╗██║╚██╗ ██╔╝██╔══╝  ██║╚██╗██║
██║     ███████╗╚██████╔╝██║  ██║██║ ╚████╔╝ ███████╗██║ ╚████║
╚═╝     ╚══════╝ ╚═════╝ ╚═╝  ╚═╝╚═╝  ╚═══╝  ╚══════╝╚═╝  ╚═══╝
                                                          STUDIO
```

**Doğal dil briefinden dakikalar içinde düzenlenebilir mobil UI tasarımı.**

<br>

[![Status](https://img.shields.io/badge/status-documentation%20phase-6366f1?style=flat-square&labelColor=1e1e2e)](.)
[![Version](https://img.shields.io/badge/docs-v1.1.0-10b981?style=flat-square&labelColor=1e1e2e)](CHANGELOG.md)
[![License](https://img.shields.io/badge/license-proprietary-64748b?style=flat-square&labelColor=1e1e2e)](.)
[![ADRs](https://img.shields.io/badge/ADRs-5%20accepted-f59e0b?style=flat-square&labelColor=1e1e2e)](docs/02-architecture/ARCHITECTURE_DECISIONS.md)
[![Agents](https://img.shields.io/badge/agents-12%20defined-ec4899?style=flat-square&labelColor=1e1e2e)](docs/09-agents/)

<br>

</div>

---

## Ne yapar?

Floriven Studio; kullanıcının doğal dilde verdiği ürün fikrini, marka girdisini veya referans görseli alarak **mobil uygulama ekranları**, **tasarım sistemi** ve **etkileşim akışları** üreten web tabanlı AI-first SaaS ürünüdür. Oluşan ekranlar görsel editörde düzenlenir, sürümlenir ve Figma veya kod formatına dışa aktarılır.

| Sorun | Floriven Studio çözümü |
|---|---|
| Fikir → tasarım geçişi saatler alıyor | Brief'ten düzenlenebilir ekrana dakikalar içinde |
| Tasarım bilgisi sınırlı ekipler tutarsız UI üretiyor | Token tabanlı otomatik tasarım sistemi |
| Tasarım–geliştirme arası çeviri maliyeti yüksek | `DesignSpec` sözleşmesiyle Figma ve kod dışa aktarımı |
| AI çıktısı güvenilmez ve doğrulanamıyor | Pydantic şema validasyonu + guardrail katmanı |

---

## Teknoloji yığını

<div align="center">

![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)
![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)
![Java](https://img.shields.io/badge/Java_21-ED8B00?style=for-the-badge&logo=openjdk&logoColor=white)
![Spring Boot](https://img.shields.io/badge/Spring_Boot_3-6DB33F?style=for-the-badge&logo=spring-boot&logoColor=white)
![Python](https://img.shields.io/badge/Python-3776AB?style=for-the-badge&logo=python&logoColor=white)
![FastAPI](https://img.shields.io/badge/FastAPI-009688?style=for-the-badge&logo=fastapi&logoColor=white)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-316192?style=for-the-badge&logo=postgresql&logoColor=white)
![Redis](https://img.shields.io/badge/Redis-DC382D?style=for-the-badge&logo=redis&logoColor=white)
![RabbitMQ](https://img.shields.io/badge/RabbitMQ-FF6600?style=for-the-badge&logo=rabbitmq&logoColor=white)
![OpenTelemetry](https://img.shields.io/badge/OpenTelemetry-000000?style=for-the-badge&logo=opentelemetry&logoColor=white)

</div>

---

## Mimari

```mermaid
flowchart LR
    U([👤 Kullanıcı]) --> W[Web App\nReact + TS]
    W -->|OIDC| IDP([Identity Provider])
    W -->|REST / SSE| API

    subgraph core [Core API — Spring Boot]
        API[API Gateway] --> WS[Workspace]
        API --> PRJ[Project]
        API --> DS[DesignSpec]
        API --> CR[Credits]
        API --> JOB[Jobs]
    end

    JOB -->|Queue| MQ[(RabbitMQ)]
    MQ --> AI

    subgraph ai [AI Worker — Python / FastAPI]
        AI[Orchestrator] --> PL[Planner\nScreenGraph]
        PL --> GEN[Generator\nDesignSpec]
        GEN --> VAL[Validator\nPydantic]
    end

    VAL -->|Patch| DS
    AI <-->|Structured output| LLM([🤖 LLM Provider])
    core --> DB[(PostgreSQL)]
    core --> RD[(Redis)]
    core --> S3[(Object Storage)]
    core --> EXP[Export Worker]
    EXP --> OUT([📦 Figma / ZIP])
```

<details>
<summary><strong>Üretim akışı (sequence)</strong></summary>

```mermaid
sequenceDiagram
    participant UI
    participant API
    participant MQ
    participant AI
    participant LLM

    UI->>API: POST /generation-jobs + Idempotency-Key
    API->>API: Yetki + kredi rezervasyonu
    API-->>UI: 202 Accepted
    API->>MQ: Job event
    MQ->>AI: Consume
    AI->>LLM: ScreenGraph üret
    LLM-->>AI: Structured JSON
    AI->>LLM: DesignSpec üret
    LLM-->>AI: Structured JSON
    AI->>AI: Pydantic validasyon
    AI->>API: DesignSpec patch
    API->>API: Kredi commit
    UI->>API: SSE / polling
    API-->>UI: completed + snapshot
```

</details>

---

## Dokümantasyon

Bu repo şu an **dokümantasyon paketidir** — kod geliştirme başlamadan önce tüm kararları görünür kılmak ve insan ekiplerle AI agent'ların aynı kurallarla çalışmasını sağlamak için hazırlanmıştır.

### Başlamak için

| Öncelik | Dosya | İçerik |
|:---:|---|---|
| 1 | [`00_START_HERE.md`](00_START_HERE.md) | Başlangıç rehberi |
| 2 | [`docs/01-product/PRODUCT_VISION.md`](docs/01-product/PRODUCT_VISION.md) | Ürünün varoluş nedeni |
| 3 | [`docs/01-product/PRD.md`](docs/01-product/PRD.md) | Uçtan uca gereksinimler |
| 4 | [`docs/01-product/MVP_SCOPE.md`](docs/01-product/MVP_SCOPE.md) | İlk sürüm sınırları |
| 5 | [`docs/02-architecture/SYSTEM_ARCHITECTURE.md`](docs/02-architecture/SYSTEM_ARCHITECTURE.md) | Sistem ve veri akışı |
| 6 | [`docs/02-architecture/DESIGN_SPEC.md`](docs/02-architecture/DESIGN_SPEC.md) | Kanonik tasarım sözleşmesi |
| 7 | [`AGENTS.md`](AGENTS.md) | AI agent çalışma kuralları |

<details>
<summary><strong>Klasör yapısı</strong></summary>

```
Floriven-Studio/
├── 00_START_HERE.md              # Başlangıç rehberi
├── AGENTS.md                     # Agent çalışma kuralları (bağlayıcı)
├── MANIFEST.md                   # Tüm dosyaların bütünlük kaydı
├── docs/
│   ├── 00-brand/                 # Marka kimliği ve ürün adı
│   ├── 01-product/               # Vizyon, PRD, MVP, persona, roadmap
│   ├── 02-architecture/          # Sistem, AI, editör, ADR'ler, DesignSpec
│   ├── 03-engineering/           # API, kodlama standartları, test, performans
│   ├── 04-ai/                    # Prompt mühendisliği, model stratejisi, eval
│   ├── 05-security/              # Güvenlik, tehdit modeli, uyum
│   ├── 06-operations/            # Deployment, gözlemlenebilirlik, runbook'lar
│   ├── 07-business/              # İş modeli, fiyatlandırma, GTM, risk
│   ├── 08-management/            # Yönetişim, RACI, karar günlüğü
│   ├── 09-agents/                # Uzman agent tanımları ve handoff şablonu
│   └── 10-templates/             # ADR, user story, PR, incident şablonları
└── SHA256SUMS.txt                # SHA-256 bütünlük doğrulama
```

</details>

<details>
<summary><strong>Mimari kararlar (ADR)</strong></summary>

| ADR | Karar | Durum |
|---|---|:---:|
| [ADR-0001](docs/02-architecture/ADR-0001.md) | Core API için modüler monolit | ✅ Kabul edildi |
| [ADR-0002](docs/02-architecture/ADR-0002.md) | DesignSpec kanonik ara model | ✅ Kabul edildi |
| [ADR-0003](docs/02-architecture/ADR-0003.md) | AI orkestrasyonu için ayrı Python worker | ✅ Kabul edildi |
| [ADR-0004](docs/02-architecture/ADR-0004.md) | Editörde DOM/SVG-first renderer | ✅ Kabul edildi |
| [ADR-0005](docs/02-architecture/ADR-0005.md) | Monorepo yapısı (Turborepo) | ✅ Kabul edildi |

Yeni kararlar [ADR şablonu](docs/10-templates/ADR_TEMPLATE.md) ile oluşturulur.

</details>

<details>
<summary><strong>MVP backlog özeti</strong></summary>

| Alan | Toplam iş | P0 | P1 | P2 |
|---|:---:|:---:|:---:|:---:|
| Kimlik ve workspace | 3 | 3 | — | — |
| Proje ve DesignSpec | 4 | 2 | 2 | — |
| AI üretim | 6 | 4 | 2 | — |
| Görsel editör | 4 | — | 2 | 2 |
| Kredi sistemi | 3 | 1 | 2 | — |
| Export | 2 | — | 1 | 1 |
| Güvenlik ve uyum | 3 | 3 | — | — |

Detaylar: [`BACKLOG_AND_PRIORITIZATION.md`](docs/01-product/BACKLOG_AND_PRIORITIZATION.md)

</details>

---

## Agent sistemi

Floriven Studio, hem insan hem AI agent'larla çalışmak üzere tasarlanmıştır. 12 uzman agent tanımlıdır:

<div align="center">

| Agent | Sorumluluk |
|---|---|
| [Product](docs/09-agents/PRODUCT_AGENT.md) | Ürün gereksinimleri |
| [Architecture](docs/09-agents/ARCHITECTURE_AGENT.md) | Sistem tasarımı ve ADR'ler |
| [Frontend](docs/09-agents/FRONTEND_AGENT.md) | Web editörü ve UI |
| [Backend](docs/09-agents/BACKEND_AGENT.md) | API, domain ve veri |
| [AI](docs/09-agents/AI_AGENT.md) | Prompt, model ve eval |
| [DevOps](docs/09-agents/DEVOPS_AGENT.md) | CI/CD ve runtime |
| [QA](docs/09-agents/QA_AGENT.md) | Test ve kalite |
| [Security](docs/09-agents/SECURITY_AGENT.md) | Güvenlik kontrolleri |
| [Data](docs/09-agents/DATA_AGENT.md) | Analitik ve veri |
| [Documentation](docs/09-agents/DOCUMENTATION_AGENT.md) | Doküman tutarlılığı |
| [Review](docs/09-agents/REVIEW_AGENT.md) | Kod inceleme |
| [Support](docs/09-agents/SUPPORT_AGENT.md) | Kullanıcı desteği |

</div>

Tüm agent'lar [`AGENTS.md`](AGENTS.md) kurallarına tabidir.

---

## Katkı

Katkıda bulunmadan önce [`CONTRIBUTING.md`](CONTRIBUTING.md) ve [`AGENTS.md`](AGENTS.md) dosyalarını oku. Tüm mimari değişiklikler ADR ile kayıt altına alınır.

[![Davranış Kuralları](https://img.shields.io/badge/Davranış%20Kuralları-CODE__OF__CONDUCT-64748b?style=flat-square)](CODE_OF_CONDUCT.md)
[![Katkı Rehberi](https://img.shields.io/badge/Katkı%20Rehberi-CONTRIBUTING-64748b?style=flat-square)](CONTRIBUTING.md)

---

<div align="center">
<sub>Floriven Studio — AI destekli mobil UI tasarım platformu</sub>
</div>
