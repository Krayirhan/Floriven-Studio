import { deriveArchetype, type ProductBlueprint, type ProductScreenSpec, type ScreenCountOptions } from './domain.ts'

export const SCREEN_KEYS = ['overview', 'transactions', 'invoices', 'invoice_form', 'analytics', 'settings', 'list', 'detail', 'form', 'profile'] as const
export const FEATURE_KEYS = ['tax_reserve', 'search', 'filters', 'invoice_status', 'currency', 'notifications', 'analytics'] as const
export type PlanningIntent = { domain: string; screens: string[]; nav: string[]; features: string[] }

export function validatePlanningIntent(value: unknown): PlanningIntent {
  if (!value || typeof value !== 'object' || Array.isArray(value)) throw new Error('Planning intent must be an object')
  const intent = value as Record<string, unknown>
  const screens = arrayOfKeys(intent.screens, SCREEN_KEYS, 'screens')
  const nav = arrayOfKeys(intent.nav, SCREEN_KEYS, 'nav')
  const features = arrayOfKeys(intent.features, FEATURE_KEYS, 'features')
  if (typeof intent.domain !== 'string' || !intent.domain.trim()) throw new Error('Planning intent domain is required')
  if (screens.length < 3 || screens.length > 8 || nav.length < 1 || nav.some((key) => !screens.includes(key))) throw new Error('Planning intent screen/navigation policy is invalid')
  return { domain: intent.domain, screens, nav, features }
}

export function resolvePlanningIntent(intent: PlanningIntent, brief: string, options: ScreenCountOptions = {}): ProductBlueprint {
  const specs = intent.screens.map((key, index) => toScreenSpec(key, index, intent.nav, brief))
  const primary = specs.filter((screen) => intent.nav.includes(screen.id)).map((screen) => screen.id)
  specs.forEach((screen) => { if (!primary.includes(screen.id) && screen.navigationPlacement === 'hierarchical') screen.parentId = primary[0] })
  const policy = { minCount: specs.length, maxCount: specs.length, requestedCount: specs.length, rationale: 'Deterministic planning intent resolver' }
  return {
    productDomain: intent.domain,
    audience: '',
    entities: intent.features,
    capabilities: intent.features,
    contentVocabulary: intent.features,
    screens: specs,
    navigation: { primaryScreenIds: primary, utilityScreenIds: specs.filter((screen) => !intent.nav.includes(screen.id)).map((screen) => screen.id) },
    screenPolicy: { ...policy, ...(options.requestedScreenCount ? { requestedCount: options.requestedScreenCount } : {}) },
  }
}

export function fallbackPlanningIntent(brief: string): PlanningIntent {
  const text = brief.toLocaleLowerCase('tr-TR')
  const finance = /fatura|gelir|gider|vergi|bakiye|finans/.test(text)
  return finance
    ? { domain: 'finance', screens: ['overview', 'transactions', 'invoices', 'invoice_form', 'analytics', 'settings'], nav: ['overview', 'transactions', 'invoices', 'analytics'], features: ['tax_reserve', 'search', 'filters', 'invoice_status', 'currency', 'notifications', 'analytics'] }
    : { domain: 'general', screens: ['overview', 'list', 'detail', 'form', 'analytics', 'settings'], nav: ['overview', 'list', 'analytics'], features: [] }
}

function arrayOfKeys(value: unknown, allowed: readonly string[], field: string): string[] {
  if (!Array.isArray(value) || value.length === 0 || value.some((item) => typeof item !== 'string' || !allowed.includes(item))) throw new Error(`Invalid planning intent ${field}`)
  return [...new Set(value)]
}

function toScreenSpec(key: string, index: number, nav: string[], brief: string): ProductScreenSpec {
  const role = key === 'overview' ? 'overview' : key === 'settings' || key === 'profile' ? 'settings' : key === 'invoice_form' || key === 'form' ? 'form' : key === 'detail' ? 'detail' : 'core'
  const archetype = key === 'analytics' ? 'dashboard' : key === 'settings' ? 'settings' : key === 'invoice_form' || key === 'form' ? 'form' : key === 'detail' ? 'detail' : key === 'overview' ? 'dashboard' : 'management_list'
  return { id: key, name: key.replace(/_/g, ' '), route: `/${key.replace(/_/g, '-')}`, purpose: `${key} semantic flow`, sections: [], role, priority: nav.includes(key) ? 'primary' : 'secondary', navigationPlacement: nav.includes(key) ? 'primary' : role === 'settings' ? 'utility' : 'hierarchical', archetype, contentDensity: 'medium', heroAllowed: role === 'overview', fabAllowed: role === 'form', patterns: [] }
}
