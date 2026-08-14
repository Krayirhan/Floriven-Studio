import { type DesignSpecScreen, type LeafNode, type RegionContainerNode } from './design-spec-compiler.ts'
import { type ScreenJob } from './screen-jobs.ts'
import { type UXStructure } from './ux-structure.ts'

export const STATIC_CRITICS_VERSION = '1.0.0' as const

export type StaticViolationCode =
  | 'EMPTY_SCREEN' | 'EMPTY_REGION' | 'ACCESSIBILITY_GAP'
  | 'MISSING_REQUIRED_INTERACTION' | 'MISSING_DATA_COVERAGE' | 'INCOMPLETE_COMPLETION_EVIDENCE'

export type StaticViolation = { code: StaticViolationCode; message: string; nodeId: string | null }
export type StaticCriticsReport = { version: typeof STATIC_CRITICS_VERSION; screenJobId: string; passed: boolean; violations: StaticViolation[] }

/**
 * Deterministic, LLM-free re-check of the compiled screen against the ScreenJob/UXStructure
 * contracts it was built from. Defense in depth: upstream stages already enforce coverage on
 * their own JSON shapes — this re-verifies the same guarantees hold in the *compiled tree*,
 * catching compiler bugs rather than provider mistakes.
 */
export function runStaticCritics(job: ScreenJob, structure: UXStructure, screen: DesignSpecScreen): StaticCriticsReport {
  const violations: StaticViolation[] = []

  if (screen.root.children.length === 0) violations.push({ code: 'EMPTY_SCREEN', message: 'Compiled screen has no region containers', nodeId: screen.root.id })
  for (const container of screen.root.children) {
    if (container.children.length === 0) violations.push({ code: 'EMPTY_REGION', message: `Region container ${container.id} has no content`, nodeId: container.id })
    checkA11y(container, violations)
    for (const leaf of container.children) checkA11y(leaf, violations)
  }

  const allLeaves: LeafNode[] = screen.root.children.flatMap((container) => container.children)

  const compiledInteractions = new Set(allLeaves.flatMap((leaf) => leaf.interactions.map((event) => event.action.params.interaction)))
  for (const interaction of job.requiredInteractions) {
    if (!compiledInteractions.has(interaction)) violations.push({ code: 'MISSING_REQUIRED_INTERACTION', message: `No compiled node exposes required interaction "${interaction}"`, nodeId: null })
  }

  const compiledDataPaths = new Set(allLeaves.flatMap((leaf) => leaf.bindings.map((binding) => binding.dataPath)))
  for (const term of job.requiredData) {
    if (!compiledDataPaths.has(term)) violations.push({ code: 'MISSING_DATA_COVERAGE', message: `No compiled node binds required data "${term}"`, nodeId: null })
  }

  const containerByRegionId = new Map(
    screen.root.children.map((container) => [container.extensions['floriven.v3'].regionId, container]),
  )
  for (const evidence of structure.completionEvidence) {
    const container = containerByRegionId.get(evidence.regionId)
    if (!container || container.children.length === 0) {
      violations.push({ code: 'INCOMPLETE_COMPLETION_EVIDENCE', message: `Completion criterion "${evidence.criterion}" has no rendered content in region ${evidence.regionId}`, nodeId: container?.id ?? null })
    }
  }

  return { version: STATIC_CRITICS_VERSION, screenJobId: job.id, passed: violations.length === 0, violations }
}

function checkA11y(node: RegionContainerNode | LeafNode, violations: StaticViolation[]): void {
  if (!node.a11y.role.trim()) violations.push({ code: 'ACCESSIBILITY_GAP', message: `Node ${node.id} has an empty a11y role`, nodeId: node.id })
  if (!node.a11y.label.trim()) violations.push({ code: 'ACCESSIBILITY_GAP', message: `Node ${node.id} has an empty a11y label`, nodeId: node.id })
}

export type StructuralDuplicate = { screenJobIdA: string; screenJobIdB: string; similarity: number }
export type ProductStaticCriticsReport = { version: typeof STATIC_CRITICS_VERSION; passed: boolean; duplicationRatePct: number; duplicates: StructuralDuplicate[] }

const DUPLICATE_SIMILARITY_THRESHOLD = 0.9
/** ADR-0009 kabul kapısı: aynı ürün içi başlık-hariç yapısal kopya oranı en fazla %10. */
const MAX_DUPLICATION_RATE_PCT = 10

/** Text/id-blind structural fingerprint: layout mode, gap and ordered leaf component types per region. */
function structuralSignature(screen: DesignSpecScreen): Array<{ mode: string; gap: string; leafTypes: string[] }> {
  return screen.root.children.map((container) => ({ mode: container.layout.mode, gap: container.layout.gap, leafTypes: container.children.map((leaf) => leaf.type) }))
}

function similarity(a: ReturnType<typeof structuralSignature>, b: ReturnType<typeof structuralSignature>): number {
  const longest = Math.max(a.length, b.length)
  if (longest === 0) return 1
  let matched = 0
  const used = new Set<number>()
  for (const containerA of a) {
    const matchIndex = b.findIndex((containerB, index) =>
      !used.has(index) && containerB.mode === containerA.mode && containerB.gap === containerA.gap
      && containerB.leafTypes.length === containerA.leafTypes.length && containerB.leafTypes.every((type, i) => type === containerA.leafTypes[i]))
    if (matchIndex >= 0) { matched += 1; used.add(matchIndex) }
  }
  return matched / longest
}

/** Runs across every screen compiled for one product/brief in the same planning run. */
export function runProductStaticCritics(screens: DesignSpecScreen[]): ProductStaticCriticsReport {
  const duplicates: StructuralDuplicate[] = []
  const signatures = screens.map((screen) => ({ screenJobId: screen.id, signature: structuralSignature(screen) }))
  for (const [i, entryA] of signatures.entries()) {
    for (const entryB of signatures.slice(i + 1)) {
      const score = similarity(entryA.signature, entryB.signature)
      if (score >= DUPLICATE_SIMILARITY_THRESHOLD) duplicates.push({ screenJobIdA: entryA.screenJobId, screenJobIdB: entryB.screenJobId, similarity: score })
    }
  }
  const totalPairs = (screens.length * (screens.length - 1)) / 2
  const duplicationRatePct = totalPairs === 0 ? 0 : (duplicates.length / totalPairs) * 100
  return { version: STATIC_CRITICS_VERSION, passed: duplicationRatePct <= MAX_DUPLICATION_RATE_PCT, duplicationRatePct, duplicates }
}
