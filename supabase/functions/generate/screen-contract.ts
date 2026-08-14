import { validateSectionTopology, type SectionTopologyRequirement } from './section-topology.ts'

export type ScreenContract = {
  version: '1.0.0'
  job: string
  requiredSections: string[]
  primaryAction: string
  secondaryActions: string[]
  requiredData: string[]
  navigationTargetIds: string[]
  sectionRoles: SectionTopologyRequirement[]
  identityIntent?: {
    dominantRole: SectionTopologyRequirement['role']
    supportingRole: SectionTopologyRequirement['role']
    densityProfile: 'focused' | 'balanced' | 'dense'
  }
}

export type ScreenContractSource = {
  id: string
  purpose: string
  sections: string[]
  contract: ScreenContract
  archetype?: import('./domain.ts').ScreenArchetype
}

export function validateScreenContracts(screens: ScreenContractSource[]): string[] {
  const issues: string[] = []
  const ids = new Set(screens.map((screen) => screen.id))

  for (const screen of screens) {
    const contract = screen.contract
    if (contract.version !== '1.0.0') issues.push(`${screen.id}: unsupported screen contract version`)
    if (!contract.job.trim() || contract.job.trim() !== screen.purpose.trim()) issues.push(`${screen.id}: contract job must match purpose`)
    if (!contract.primaryAction.trim()) issues.push(`${screen.id}: primary action missing`)
    if (contract.requiredSections.length < 2) issues.push(`${screen.id}: at least two required sections are needed`)
    if (contract.requiredData.length < 2) issues.push(`${screen.id}: at least two required data fields are needed`)
    if (contract.requiredSections.some((section) => !screen.sections.includes(section))) issues.push(`${screen.id}: contract section is absent from screen sections`)
    if (contract.navigationTargetIds.some((targetId) => targetId === screen.id || !ids.has(targetId))) issues.push(`${screen.id}: invalid navigation target`)
    issues.push(...validateSectionTopology(screen.archetype, screen.sections, contract.sectionRoles ?? []).map((issue) => `${screen.id}: ${issue}`))
    if (contract.identityIntent) {
      const roles = new Set(contract.sectionRoles.map((item) => item.role))
      if (!roles.has(contract.identityIntent.dominantRole) || !roles.has(contract.identityIntent.supportingRole)) issues.push(`${screen.id}: identity intent roles must exist in section roles`)
      if (contract.identityIntent.dominantRole === contract.identityIntent.supportingRole) issues.push(`${screen.id}: identity intent roles must differ`)
    }
  }

  const jobs = screens.map((screen) => canonical(screen.contract.job))
  if (new Set(jobs).size !== jobs.length) issues.push('screen contracts must define distinct jobs')
  const identityKeys = screens.map((screen) => screen.contract.identityIntent && screen.archetype
    ? `${screen.archetype ?? ''}:${screen.contract.identityIntent.dominantRole}:${screen.contract.identityIntent.supportingRole}:${screen.contract.identityIntent.densityProfile}`
    : undefined)
  for (let index = 0; index < identityKeys.length; index += 1) {
    if (identityKeys[index] && identityKeys.some((key, candidateIndex) => candidateIndex !== index && key === identityKeys[index])) {
      issues.push(`${screens[index].id}: same-archetype identity intent must be unique`)
    }
  }
  return issues
}

function canonical(value: string): string {
  return value.trim().toLocaleLowerCase('tr-TR').replace(/\s+/g, ' ')
}
