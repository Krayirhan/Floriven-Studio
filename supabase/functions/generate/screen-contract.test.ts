import { describe, expect, it } from 'vitest'
import { validateScreenContracts, type ScreenContractSource } from './screen-contract'

function screen(overrides: Partial<ScreenContractSource> = {}): ScreenContractSource {
  return {
    id: 'projects',
    purpose: 'Projeleri durum ve teslim tarihine göre yönetmek',
    sections: ['Durum özeti', 'Proje listesi', 'Hızlı işlemler'],
    contract: {
      version: '1.0.0',
      job: 'Projeleri durum ve teslim tarihine göre yönetmek',
      requiredSections: ['Durum özeti', 'Proje listesi'],
      primaryAction: 'Yeni proje oluştur',
      secondaryActions: ['Projeleri filtrele'],
      requiredData: ['proje adı', 'teslim tarihi', 'durum'],
      navigationTargetIds: [],
      sectionRoles: [
        { section: 'Durum özeti', role: 'summary' },
        { section: 'Proje listesi', role: 'entity-list' },
        { section: 'Hızlı işlemler', role: 'actions' },
      ],
    },
    ...overrides,
  }
}

describe('ScreenContract', () => {
  it('accepts distinct jobs with concrete section, action, data and navigation obligations', () => {
    const projects = screen({ contract: { ...screen().contract, navigationTargetIds: ['invoices'] } })
    const invoices = screen({
      id: 'invoices',
      purpose: 'Faturaları ödeme durumuna göre takip etmek',
      sections: ['Tahsilat özeti', 'Fatura listesi'],
      contract: {
        ...screen().contract,
        job: 'Faturaları ödeme durumuna göre takip etmek',
        requiredSections: ['Tahsilat özeti', 'Fatura listesi'],
        primaryAction: 'Yeni fatura oluştur',
        requiredData: ['fatura numarası', 'tutar', 'ödeme durumu'],
        navigationTargetIds: ['projects'],
        sectionRoles: [
          { section: 'Tahsilat özeti', role: 'summary' },
          { section: 'Fatura listesi', role: 'entity-list' },
        ],
      },
    })

    expect(validateScreenContracts([projects, invoices])).toEqual([])
  })

  it('rejects title-only, incomplete or cloned screen obligations', () => {
    const incomplete = screen({
      id: 'tasks',
      purpose: 'Görevleri planlamak',
      contract: {
        ...screen().contract,
        primaryAction: '',
        requiredSections: ['Olmayan bölüm'],
        requiredData: ['başlık'],
        navigationTargetIds: ['tasks'],
      },
    })

    const issues = validateScreenContracts([screen(), incomplete])
    expect(issues).toEqual(expect.arrayContaining([
      'tasks: contract job must match purpose',
      'tasks: primary action missing',
      'tasks: at least two required sections are needed',
      'tasks: at least two required data fields are needed',
      'tasks: contract section is absent from screen sections',
      'tasks: invalid navigation target',
      'screen contracts must define distinct jobs',
    ]))
  })

  it('validates identity intent roles and same-archetype uniqueness', () => {
    const identityIntent = { dominantRole: 'summary' as const, supportingRole: 'entity-list' as const, densityProfile: 'balanced' as const }
    const projects = screen({ archetype: 'management_list', contract: { ...screen().contract, identityIntent } })
    const invoices = screen({
      id: 'invoices',
      archetype: 'management_list',
      purpose: 'Faturaları takip etmek',
      contract: { ...screen().contract, job: 'Faturaları takip etmek', identityIntent },
    })

    expect(validateScreenContracts([projects, invoices])).toEqual(expect.arrayContaining([
      'projects: same-archetype identity intent must be unique',
      'invoices: same-archetype identity intent must be unique',
    ]))

    const invalid = screen({
      contract: { ...screen().contract, identityIntent: { dominantRole: 'filters', supportingRole: 'filters', densityProfile: 'focused' } },
    })
    expect(validateScreenContracts([invalid])).toEqual(expect.arrayContaining([
      'projects: identity intent roles must exist in section roles',
      'projects: identity intent roles must differ',
    ]))
  })
})
