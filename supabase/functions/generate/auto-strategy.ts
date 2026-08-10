import { directAutoDesign } from '../../../packages/design-spec/src/auto-design-director.ts'
import { findDesignTemplate } from '../../../packages/design-spec/src/strategy.ts'
import type { ProductBlueprint } from './domain.ts'

export type AutoStrategy = {
  mode: 'auto'
  palette: string
  cardStyle: string
  density: string
  navigationStyle: string
  visualDirection: string
  rationale: string[]
}

const PALETTES = ['obsidian', 'serene', 'terracotta', 'electric', 'editorial']
const CARD_STYLES = ['crisp', 'soft', 'layered', 'playful', 'minimal']
const DENSITIES = ['compact', 'comfortable', 'spacious']
const NAVIGATION_STYLES = ['solid', 'floating', 'glass', 'minimal']

/** Resolves Auto mode without ever claiming that the user selected a template. */
export function resolveAutoStrategy(value: unknown, blueprint: ProductBlueprint, brief = ''): AutoStrategy {
  const raw = asRecord(value)
  const decision = directAutoDesign({
    ...blueprint,
    productDomain: [blueprint.productDomain, brief].filter(Boolean).join(' · '),
    contentVocabulary: brief ? [...blueprint.contentVocabulary, brief] : blueprint.contentVocabulary,
  })
  const directedTemplate = findDesignTemplate(decision.presetId)
  const fallback = directedTemplate?.strategy

  return {
    mode: 'auto',
    palette: pick(raw.palette, PALETTES, fallback?.palette ?? 'serene'),
    cardStyle: pick(raw.cardStyle, CARD_STYLES, fallback?.cardStyle ?? 'soft'),
    density: pick(raw.density, DENSITIES, fallback?.density ?? 'comfortable'),
    navigationStyle: pick(raw.navigationStyle, NAVIGATION_STYLES, fallback?.navigationStyle ?? 'solid'),
    visualDirection: typeof raw.visualDirection === 'string' && raw.visualDirection.trim()
      ? raw.visualDirection.trim().slice(0, 120)
      : fallback?.visualDirection ?? `${blueprint.productDomain} için bağlama duyarlı görsel yön`,
    rationale: Array.isArray(raw.rationale) && raw.rationale.some((item) => typeof item === 'string' && item.trim())
      ? raw.rationale.filter((item): item is string => typeof item === 'string' && !!item.trim()).slice(0, 3)
      : decision.rationale.slice(0, 3),
  }
}

function pick(candidate: unknown, allowed: string[], fallback: string): string {
  return typeof candidate === 'string' && allowed.includes(candidate) ? candidate : fallback
}

function asRecord(value: unknown): Record<string, unknown> {
  return value && typeof value === 'object' && !Array.isArray(value) ? value as Record<string, unknown> : {}
}
