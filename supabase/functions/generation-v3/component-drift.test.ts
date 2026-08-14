import { describe, expect, it } from 'vitest'
import { COMPONENT_REGISTRY, type AllComponentType } from './component-contracts.ts'
import { V3_COMPONENT_TYPES } from './component-capabilities.ts'
import { COMPONENT_TYPES as WEB_COMPONENT_TYPES } from '../../../apps/web/src/features/studio/canvas/componentRegistry.ts'

describe('Bidirectional Component Registry Drift Guard (Sprint 1)', () => {
  const v3RegistryTypes = Object.keys(COMPONENT_REGISTRY) as AllComponentType[]
  const webTypes = [...WEB_COMPONENT_TYPES]
  const v3CapabilityTypes = [...V3_COMPONENT_TYPES]

  it('has zero drift between V3 Component Registry and Studio Web Component Registry', () => {
    const missingInWeb = v3RegistryTypes.filter((type) => !webTypes.includes(type as (typeof webTypes)[number]))
    const missingInV3 = webTypes.filter((type) => !v3RegistryTypes.includes(type as AllComponentType))

    expect(missingInWeb, `Components in V3 registry but missing in Web renderer registry: ${missingInWeb.join(', ')}`).toEqual([])
    expect(missingInV3, `Components in Web renderer registry but missing in V3 registry: ${missingInV3.join(', ')}`).toEqual([])
    expect(v3RegistryTypes.length).toBe(webTypes.length)
  })

  it('all functional components in V3 capabilities are registered in the central registry', () => {
    const missingInRegistry = v3CapabilityTypes.filter((type) => !v3RegistryTypes.includes(type as AllComponentType))
    expect(missingInRegistry, `Functional components missing in registry: ${missingInRegistry.join(', ')}`).toEqual([])
  })

  it('every component in V3 registry has valid schema and validation rules', () => {
    for (const [type, def] of Object.entries(COMPONENT_REGISTRY)) {
      expect(def.type).toBe(type)
      expect(def.category).toBeDefined()
      expect(def.jsonSchema).toBeDefined()
      expect(typeof def.validate).toBe('function')
    }
  })
})
