import type { ProductBlueprint } from './domain.ts'

type Node = Record<string, unknown>

export function canonicalNavigation(blueprint: ProductBlueprint): string[] {
  return blueprint.navigation.primaryScreenIds
    .map((id) => blueprint.screens.find((screen) => screen.id === id)?.name)
    .filter((name): name is string => !!name)
}

export function validateCanonicalNavigation(screens: Node[], blueprint: ProductBlueprint): string[] {
  const expected = JSON.stringify(canonicalNavigation(blueprint))
  const issues: string[] = []
  for (const [index, screen] of screens.entries()) {
    const planned = blueprint.screens[index]
    if (!planned || planned.archetype === 'form' || planned.archetype === 'detail') continue
    const navigation = flatten(asRecord(screen.root)).find((node) => node.type === 'BottomNavigation' || node.type === 'TabBar')
    const actual = asRecord(navigation?.props).items
    if (!Array.isArray(actual) || JSON.stringify(actual) !== expected) {
      issues.push(`${planned.id}: canonical navigation mismatch`)
    }
  }
  return issues
}

export function validateArchetypeMinimumContent(screens: Node[], blueprint: ProductBlueprint): string[] {
  const issues: string[] = []
  for (const [index, screen] of screens.entries()) {
    const planned = blueprint.screens[index]
    if (!planned) continue
    const nodes = flatten(asRecord(screen.root))
    const types = new Set(nodes.map((node) => String(node.type)))
    const text = JSON.stringify(screen).toLocaleLowerCase('tr-TR')
    const has = (...terms: string[]) => terms.every((term) => text.includes(term))
    const enoughNodes = nodes.length - 1 >= 12
    const valid = planned.id === 'overview'
      ? types.has('Metric') && types.has('Chart') && has('bakiye', 'gelir', 'gider', 'vergi')
      : planned.id === 'transactions'
        ? types.has('SearchField') && types.has('SegmentedControl') && types.has('ListItem') && has('gelir', 'gider')
        : planned.id === 'invoices'
          ? types.has('SearchField') && types.has('ListItem') && has('taslak', 'gönderildi', 'gecikmiş', 'ödendi')
          : planned.id === 'invoice_form'
            ? types.has('TextField') && types.has('Button') && has('müşteri', 'miktar', 'birim fiyat', 'vade', 'notlar')
            : planned.id === 'analytics'
              ? types.has('Metric') && types.has('Chart') && has('içgörü')
              : planned.id === 'settings'
                ? types.has('ListItem') && types.has('Switch') && has('para birimi', 'bildirim', 'hesap')
                : true
    if (!valid || !enoughNodes) issues.push(`${planned.id}: archetype minimum content missing`)
  }
  return issues
}

function flatten(node: Node): Node[] {
  const children = Array.isArray(node.children) ? node.children.filter(isRecord) : []
  return [node, ...children.flatMap(flatten)]
}

function asRecord(value: unknown): Node {
  return isRecord(value) ? value : {}
}

function isRecord(value: unknown): value is Node {
  return !!value && typeof value === 'object' && !Array.isArray(value)
}
