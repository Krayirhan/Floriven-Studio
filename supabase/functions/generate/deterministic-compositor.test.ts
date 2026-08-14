import { describe, expect, it } from 'vitest'
import { fallbackPlanningIntent, resolvePlanningIntent } from './planning-intent.ts'
import { composeDeterministicBaseScreens } from './deterministic-compositor.ts'
import { evaluateGenerationQuality } from './quality.ts'
import type { ProductBlueprint } from './domain.ts'

describe('deterministic compositor', () => {
  it('materializes the defining experience instead of a generic dashboard substitute', () => {
    const blueprint = resolvePlanningIntent(fallbackPlanningIntent('mimarlık proje ve müşteri yönetimi'), 'mimarlık proje ve müşteri yönetimi')
    blueprint.screens[0] = {
      ...blueprint.screens[0],
      id: 'calendar',
      name: 'Takvim',
      purpose: 'Saha ziyaretlerini haftalık saat blokları üzerinde yönetmek',
      experiencePattern: 'calendar',
      contract: {
        ...blueprint.screens[0].contract,
        job: 'Saha ziyaretlerini haftalık saat blokları üzerinde yönetmek',
        requiredData: ['Saha ziyareti', 'Müşteri teslimi'],
      },
    }

    const [calendar] = composeDeterministicBaseScreens(blueprint)
    expect(JSON.stringify(calendar)).toContain('"type":"Calendar"')
  })
  it('renders every ScreenContract obligation without fixed metric fingerprints', () => {
    const specs = [
      ['overview', 'Genel Bakış', 'dashboard', 'Portföy risklerini değerlendirmek', ['Risk özeti', 'Yaklaşan teslimler'], 'Risk planını güncelle', ['risk puanı', 'teslim tarihi']],
      ['projects', 'Projeler', 'management_list', 'Projeleri sorumlu ve duruma göre yönetmek', ['Filtreler', 'Proje kayıtları'], 'Yeni proje oluştur', ['proje sorumlusu', 'proje durumu']],
      ['invoice', 'Fatura Oluştur', 'form', 'Müşteri için yeni fatura hazırlamak', ['Fatura bilgileri', 'Ödeme koşulları'], 'Faturayı kaydet', ['fatura tutarı', 'ödeme tarihi']],
    ] as const
    const screens = specs.map(([id, name, archetype, purpose, sections, primaryAction, requiredData], index) => ({
      id, name, route: `/${id}`, purpose, sections: [...sections],
      role: index === 0 ? 'overview' as const : archetype === 'form' ? 'form' as const : 'core' as const,
      priority: 'primary' as const,
      navigationPlacement: archetype === 'form' ? 'hierarchical' as const : 'primary' as const,
      ...(archetype === 'form' ? { parentId: 'overview' } : {}),
      archetype,
      contentDensity: 'medium' as const,
      heroAllowed: archetype === 'dashboard',
      fabAllowed: false,
      patterns: [],
      contract: { version: '1.0.0' as const, job: purpose, requiredSections: [...sections], sectionRoles: sections.map((section, sectionIndex) => ({ section, role: (archetype === 'form' ? ['form-fields', 'actions'] : archetype === 'management_list' ? ['filters', 'entity-list'] : ['summary', 'analytics'])[sectionIndex] as 'summary' | 'analytics' | 'filters' | 'entity-list' | 'form-fields' | 'actions' })), primaryAction, secondaryActions: ['Kapsamı incele'], requiredData: [...requiredData], navigationTargetIds: index === 0 ? ['projects'] : ['overview'] },
    }))
    const blueprint: ProductBlueprint = {
      productDomain: 'freelance-project-finance', audience: 'Serbest çalışanlar',
      entities: ['proje', 'fatura'], capabilities: ['risk planını güncelle', 'yeni proje oluştur', 'faturayı kaydet'],
      contentVocabulary: ['risk puanı', 'teslim tarihi', 'proje sorumlusu', 'fatura tutarı'], screens,
      navigation: { primaryScreenIds: ['overview', 'projects'], utilityScreenIds: [] },
      screenPolicy: { requestedCount: 3, minCount: 3, maxCount: 3, rationale: 'Test' },
    }

    const output = composeDeterministicBaseScreens(blueprint)
    const report = evaluateGenerationQuality(output, blueprint)
    const serialized = JSON.stringify(output)

    expect(report.metrics.primaryActionCoverage).toBe(1)
    expect(report.metrics.requiredDataCoverage).toBe(1)
    expect(report.metrics.underFulfilledContractCount).toBe(0)
    expect(report.metrics.fallbackMetricFingerprint).toBe(0)
    expect(report.metrics.placeholderContentCount).toBe(0)
    expect(serialized).toContain('Faturayı kaydet')
    expect(serialized).not.toContain('Ana gösterge')
  })
  it('builds a complete Finance tree without a provider', () => {
    const blueprint = resolvePlanningIntent(fallbackPlanningIntent('fatura gelir gider vergi'), 'finance')
    const screens = composeDeterministicBaseScreens(blueprint)
    expect(screens).toHaveLength(6)
    expect(screens.every((screen) => (screen.root as Record<string, unknown>).type === 'Screen')).toBe(true)
  })
  it('keeps screen and node IDs unique', () => {
    const blueprint = resolvePlanningIntent(fallbackPlanningIntent('finance'), 'finance')
    const screens = composeDeterministicBaseScreens(blueprint)
    expect(new Set(screens.map((screen) => screen.id)).size).toBe(screens.length)
  })
  it('keeps arbitrary briefs in their own context when the provider is unavailable', () => {
    const blueprint = resolvePlanningIntent(fallbackPlanningIntent('futbol fantezi ligi uygulaması'), 'futbol fantezi ligi uygulaması')
    const screens = composeDeterministicBaseScreens(blueprint, 'futbol fantezi ligi uygulaması')
    const text = JSON.stringify(screens)
    expect(text).toContain('futbol fantezi ligi')
    expect(text).not.toContain('₺124.500')
    expect(text).not.toContain('Fatura')
    const report = evaluateGenerationQuality(screens, blueprint)
    expect(report.passed).toBe(false)
    expect(report.issues.some((issue) => issue.startsWith('PLACEHOLDER_CONTENT'))).toBe(true)
    expect(report.metrics.vocabularyCoverage).toBeGreaterThanOrEqual(0.25)
  })
  it('reports the real deterministic quality baseline', () => {
    const blueprint = resolvePlanningIntent(fallbackPlanningIntent('fatura gelir gider vergi'), 'finance')
    const report = evaluateGenerationQuality(composeDeterministicBaseScreens(blueprint), blueprint)
    expect(report.score).toBeLessThan(70)
    expect(report.passed).toBe(false)
    expect(report.metrics.fallbackMetricFingerprint).toBe(1)
    expect(report.metrics.nestedCardCount).toBe(0)
  })

  it('RC22_PRODUCTION_REPLAY keeps every Finance archetype above the sparse threshold', () => {
    const blueprint = resolvePlanningIntent(fallbackPlanningIntent('fatura gelir gider vergi'), 'finance')
    const screens = composeDeterministicBaseScreens(blueprint)
    const countNodes = (node: Record<string, unknown>): number => {
      const children = Array.isArray(node.children) ? node.children as Record<string, unknown>[] : []
      return 1 + children.reduce((total, child) => total + countNodes(child), 0)
    }

    expect(screens).toHaveLength(6)
    for (const screen of screens) {
      expect(countNodes(screen.root as Record<string, unknown>) - 1, screen.name).toBeGreaterThanOrEqual(12)
    }
    const report = evaluateGenerationQuality(screens, blueprint)
    expect(report.passed).toBe(false)
    expect(report.metrics.placeholderContentCount).toBeGreaterThan(0)
  })
})
