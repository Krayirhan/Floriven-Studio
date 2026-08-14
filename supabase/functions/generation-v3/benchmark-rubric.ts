/**
 * ADR-0009 Human Evaluation & Blind Comparison Rubric for Generation V3 Benchmark Corpus.
 * Evaluates generated DesignSpecs across 5 core quality dimensions on a 1-5 Likert scale.
 */

export type RubricDimension =
  | 'domain_fidelity'
  | 'information_hierarchy'
  | 'component_suitability'
  | 'accessibility_and_responsive'
  | 'overall_usability'

export type RubricScoreLevel = 1 | 2 | 3 | 4 | 5

export type DimensionGuideline = {
  dimension: RubricDimension
  title: string
  description: string
  criteria: Record<RubricScoreLevel, string>
}

export const BENCHMARK_EVALUATION_RUBRIC: Record<RubricDimension, DimensionGuideline> = {
  domain_fidelity: {
    dimension: 'domain_fidelity',
    title: 'Domain ve Brief Uygunluğu',
    description: 'Tasarımın brief içindeki alan terminolojisi, aktörler ve iş hedeflerini yansıtma derecesi.',
    criteria: {
      1: 'Jenerik veya alakasız terimler kullanılmış; hedef domain ile uyuşmuyor.',
      2: 'Sadece 1-2 terim doğru, ancak iş akışı domain gereksinimlerini karşılamıyor.',
      3: 'Temel domain terminolojisi mevcut ancak bazı kritik kavramlar eksik.',
      4: 'Domain terimleri ve iş hedefleri doğru ve tutarlı biçimde yansıtılmış.',
      5: 'Mükemmel domain derinliği, gerçekçi veriler ve zengin terim dağarcığı.',
    },
  },
  information_hierarchy: {
    dimension: 'information_hierarchy',
    title: 'Bilgi Hiyerarşisi ve Akış',
    description: 'Ekran bölgelerinin görev önemine göre sıralanması ve görsel ağırlık dengesi.',
    criteria: {
      1: 'Düz, hiyerarşisiz veya kaotik yerleşim; birincil görev ayırt edilemiyor.',
      2: 'Zayıf vurgu; destekleyici alanlar birincil görevi gölgeliyor.',
      3: 'Temel hiyerarşi mevcut ancak görsel ağırlık dağılımı mükemmel değil.',
      4: 'Net birincil ve destekleyici bölgeler; odak sıralaması mantıklı.',
      5: 'Kusursuz görsel ritim, net odak ve akıcı kullanıcı rehberliği.',
    },
  },
  component_suitability: {
    dimension: 'component_suitability',
    title: 'Bileşen Seçimi ve Tanımlayıcı Zenginlik',
    description: 'Arketipe özgü tanımlayıcı bileşenlerin (Calendar, Board, Map, Timeline vb.) uygun kullanımı.',
    criteria: {
      1: 'Tamamen yanlış veya jenerik bileşenler kullanılmış (ör. takvim yerine düz kart listesi).',
      2: 'Tanımlayıcı bileşen eksik; jenerik bileşenlerle zayıf ikame edilmiş.',
      3: 'Tanımlayıcı bileşen seçilmiş ancak prop sözleşmesi zayıf doldurulmuş.',
      4: 'Arketipe tam uygun tanımlayıcı bileşenler ve zengin prop konfigürasyonu.',
      5: 'Mükemmel bileşen ekosistemi, eksiksiz prop sözleşmeleri ve sıfır placeholder.',
    },
  },
  accessibility_and_responsive: {
    dimension: 'accessibility_and_responsive',
    title: 'Erişilebilirlik ve Duyarlı Davranış',
    description: 'A11y rolleri, duyurular, focus sırası ve dar/geniş ekran davranışları.',
    criteria: {
      1: 'Erişilebilirlik rolleri eksik veya geçersiz; responsive davranış tanımlanmamış.',
      2: 'Yalnızca varsayılan a11y rolleri; dar/geniş ekran ayrımı yapılmamış.',
      3: 'Temel roller ve responsive modlar tanımlı ancak bazı detaylar eksik.',
      4: 'Eksiksiz a11y etiketleri, mantıklı odak sırası ve net breakpoint kuralları.',
      5: 'Tam a11y uyumu, ekran okuyucu duyuruları ve kusursuz responsive geçişleri.',
    },
  },
  overall_usability: {
    dimension: 'overall_usability',
    title: 'Genel Kullanılabilirlik ve Tamamlanabilirlik',
    description: 'Görevin baştan sona tamamlanabilirliği ve kullanıcı deneyimi kalitesi.',
    criteria: {
      1: 'Kullanılamaz veya görev tamamlanamaz; kritik etkileşimler eksik.',
      2: 'Eksik etkileşim veya çıkış yolları nedeniyle kullanım zorluğu var.',
      3: 'Görev tamamlanabilir ancak gereksiz sürtünme noktaları mevcut.',
      4: 'Rahat, sezgisel ve sürtünmesiz görev tamamlama akışı.',
      5: 'Üst düzey profesyonel tasarım, kusursuz tamamlama kanıtı ve yüksek tatmin.',
    },
  },
}

export type BlindComparisonSession = {
  id: string
  briefId: string
  candidateA: { version: 'v2' | 'v3'; designSpecHash: string }
  candidateB: { version: 'v2' | 'v3'; designSpecHash: string }
  evaluatorId: string
  preference: 'A' | 'B' | 'equal'
  scoresA: Record<RubricDimension, RubricScoreLevel>
  scoresB: Record<RubricDimension, RubricScoreLevel>
  notes?: string
}

export const BENCHMARK_QUALITY_THRESHOLDS = {
  minRequiredInteractionCoveragePct: 100,
  minRequiredDataCoveragePct: 100,
  minDefiningComponentCompletenessPct: 100,
  maxUnsupportedComponentCount: 0,
  maxPlaceholderCount: 0,
  maxStructuralDuplicateRatePct: 10,
  minRuntimeVerifiedRatePct: 100,
} as const
