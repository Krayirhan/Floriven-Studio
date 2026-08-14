export type RuntimeHierarchyContract = { version: string; profiles: Record<string, Record<string, number>> }
export type RuntimeHierarchyChange = 'none' | 'minor' | 'major'

export function classifyRuntimeHierarchyChange(previous: RuntimeHierarchyContract, next: RuntimeHierarchyContract): RuntimeHierarchyChange {
  if (JSON.stringify(previous.profiles) === JSON.stringify(next.profiles)) return 'none'
  for (const [name, profile] of Object.entries(previous.profiles)) {
    const candidate = next.profiles[name]
    if (!candidate) return 'major'
    for (const [key, value] of Object.entries(profile)) {
      const nextValue = candidate[key]
      if (nextValue === undefined) return 'major'
      const tighter = key.startsWith('minimum') ? nextValue > value : key.startsWith('maximum') ? nextValue < value : nextValue !== value
      if (tighter) return 'major'
    }
  }
  return 'minor'
}

export function satisfiesRuntimeHierarchyVersion(previousVersion: string, nextVersion: string, change: RuntimeHierarchyChange): boolean {
  const previous = parse(previousVersion); const next = parse(nextVersion)
  if (!previous || !next) return false
  if (change === 'none') return nextVersion === previousVersion
  if (change === 'major') return next[0] > previous[0]
  return next[0] > previous[0] || (next[0] === previous[0] && next[1] > previous[1])
}

function parse(value: string): [number, number, number] | undefined {
  const match = /^(\d+)\.(\d+)\.(\d+)$/.exec(value)
  return match ? [Number(match[1]), Number(match[2]), Number(match[3])] : undefined
}
