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
    const enoughNodes = nodes.length - 1 >= 12
    const valid = planned.archetype === 'dashboard'
      ? types.has('Metric') && types.has('Chart') && types.has('ListItem')
      : planned.archetype === 'list'
        ? types.has('SearchField') && types.has('SegmentedControl') && types.has('ListItem')
        : planned.archetype === 'form'
          ? types.has('TextField') && types.has('Button') && types.has('SegmentedControl')
          : planned.archetype === 'analytics'
            ? types.has('Metric') && types.has('Chart') && types.has('ListItem')
            : planned.archetype === 'settings' || planned.archetype === 'profile'
              ? types.has('ListItem') && types.has('Switch') && types.has('Button')
              : planned.archetype === 'detail'
                ? types.has('Metric') && types.has('Progress') && types.has('Button')
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
