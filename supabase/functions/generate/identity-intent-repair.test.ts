import { describe, expect, it } from 'vitest'
import { repairIdentityIntent } from './identity-intent-repair'
import { evaluateSectionMembers } from './section-topology'
import type { ScreenContract } from './screen-contract'

const contract: ScreenContract = {
  version: '1.0.0', job: 'Projeleri yönetmek', requiredSections: ['Filtreler', 'Kayıtlar'],
  primaryAction: 'Proje oluştur', secondaryActions: [], requiredData: ['proje adı', 'durum'], navigationTargetIds: [],
  sectionRoles: [{ section: 'Filtreler', role: 'filters' }, { section: 'Kayıtlar', role: 'entity-list' }],
  identityIntent: { dominantRole: 'entity-list', supportingRole: 'filters', densityProfile: 'balanced' },
}

function root() {
  return { type: 'Screen', children: [
    { id: 'filters', type: 'Stack', props: { semanticContainer: true, contractSection: 'Filtreler', contractSectionRole: 'filters' }, children: [{ id: 'fh', type: 'Text', props: { text: 'Filtreler' } }] },
    { id: 'records', type: 'Stack', props: { semanticContainer: true, contractSection: 'Kayıtlar', contractSectionRole: 'entity-list' }, children: [
      { id: 'rh', type: 'Text', props: { text: 'Kayıtlar' } },
      { id: 'row', type: 'ListItem', props: { contractSection: 'Kayıtlar', contractSectionRole: 'entity-list' } },
    ] },
  ] }
}

describe('identity intent targeted repair', () => {
  it('adds bounded supporting, dominant, and density witnesses without removing existing nodes', () => {
    const screen = root()
    const beforeIds = JSON.stringify(screen).match(/"id":"[^"]+"/g) ?? []
    const report = repairIdentityIntent(screen, contract, { maxAddedNodes: 4 })

    expect(report).toEqual({ addedNodeCount: 4, supportingWitnessAdded: 1, dominantWitnessAdded: 1, densityWitnessAdded: 2, budgetExhausted: false, beforeScore: 0, afterScore: 1, effectivenessGain: 1, effective: true, unnecessary: false })
    expect(beforeIds.every((fragment) => JSON.stringify(screen).includes(fragment))).toBe(true)
    expect(evaluateSectionMembers(screen, contract.sectionRoles)).toMatchObject({ emptyContainerCount: 0, rolePurity: 1 })
    expect(screen.children[1].children.at(-1)?.props).toMatchObject({ contractRepairEvidence: true, identityIntentRepair: 'density', sectionAssignmentMethod: 'explicit' })
  })

  it('reports budget exhaustion and leaves unresolved work for the quality gate', () => {
    const screen = root()
    const report = repairIdentityIntent(screen, { ...contract, identityIntent: { ...contract.identityIntent!, densityProfile: 'dense' } }, { maxAddedNodes: 1 })

    expect(report).toMatchObject({ addedNodeCount: 1, supportingWitnessAdded: 1, budgetExhausted: true, effectivenessGain: 0, effective: false })
    expect(evaluateSectionMembers(screen, contract.sectionRoles).assignedMemberCount).toBe(2)
  })

  it('is idempotent once the intent is fulfilled', () => {
    const screen = root()
    repairIdentityIntent(screen, contract, { maxAddedNodes: 4 })
    const snapshot = JSON.stringify(screen)

    expect(repairIdentityIntent(screen, contract)).toMatchObject({ addedNodeCount: 0 })
    expect(JSON.stringify(screen)).toBe(snapshot)
  })
})
