import { describe, expect, it } from 'vitest'
import { type AcceptedDesignSpec } from './accepted-design-spec.ts'
import { applyV3Patches, PatchConcurrencyError, PatchValidationError } from './patch-engine.ts'

const sampleSpec: AcceptedDesignSpec = {
  schemaVersion: '1.0.0',
  projectId: 'prj_1',
  platform: 'ios',
  locale: 'tr-TR',
  deviceProfile: 'phone-default',
  tokens: {},
  assets: [],
  flows: [],
  metadata: {
    acceptedAt: '2026-01-01T00:00:00.000Z',
    contentHash: 'hash_original',
    revision: 1,
    screenJobIds: ['screen_1'],
    repairedScreenJobIds: [],
    renderEvidence: 'VERIFIED',
    releaseEligible: true,
  },
  screens: [
    {
      id: 'scr_1',
      name: 'Ana Sayfa',
      route: '/home',
      root: {
        id: 'node_root',
        type: 'Screen',
        layout: { mode: 'column', gap: 'space.4' },
        a11y: { role: 'main', label: 'Ana Sayfa', hint: null, state: null, order: 0 },
        visibility: true,
        children: [
          {
            id: 'region_header',
            type: 'Stack',
            layout: { mode: 'column', gap: 'space.2' },
            a11y: { role: 'banner', label: 'Başlık', hint: null, state: null, order: 1 },
            visibility: true,
            children: [
              {
                id: 'node_card_1',
                type: 'Card',
                props: { title: 'Mimar Portfolyosu', subtitle: '2026 Tasarımları' },
                layout: { size: 'fill' },
                bindings: [],
                interactions: [],
                a11y: { role: 'content', label: 'Mimar Portfolyosu', hint: null, state: null, order: 1 },
                visibility: true,
              },
            ],
          },
          {
            id: 'region_content',
            type: 'Stack',
            layout: { mode: 'column', gap: 'space.4' },
            a11y: { role: 'region', label: 'İçerik', hint: null, state: null, order: 2 },
            visibility: true,
            children: [
              {
                id: 'node_button_1',
                type: 'Button',
                props: { label: 'Projeleri İncele', variant: 'primary', disabled: false },
                layout: { size: 'hug' },
                bindings: [],
                interactions: [],
                a11y: { role: 'button', label: 'Projeleri İncele', hint: null, state: null, order: 2 },
                visibility: true,
              },
            ],
          },
        ],
      },
    },
  ],
}

describe('V3 Patch Engine', () => {
  it('replaces props on a targeted leaf node while preserving all other node and screen identities', async () => {
    const result = await applyV3Patches(sampleSpec, [
      {
        op: 'replace_props',
        screenId: 'scr_1',
        nodeId: 'node_card_1',
        props: { title: 'Yeni Başlık: Ahşap Villa' },
      },
    ], 1)

    expect(result.patchCount).toBe(1)
    expect(result.affectedNodeIds).toEqual(['node_card_1'])
    expect(result.updatedSpec.metadata.revision).toBe(2)
    expect(result.updatedSpec.metadata.contentHash).not.toBe('hash_original')

    // Screen ID and root node IDs preserved
    expect(result.updatedSpec.screens[0].id).toBe('scr_1')
    expect(result.updatedSpec.screens[0].root.id).toBe('node_root')

    // Card 1 modified
    const card = (result.updatedSpec.screens[0].root.children[0] as any).children[0]
    expect(card.props.title).toBe('Yeni Başlık: Ahşap Villa')
    expect(card.props.subtitle).toBe('2026 Tasarımları') // preserved

    // Button 1 unaffected
    const button = (result.updatedSpec.screens[0].root.children[1] as any).children[0]
    expect(button.id).toBe('node_button_1')
    expect(button.props.label).toBe('Projeleri İncele')
  })

  it('inserts a valid new node under a container', async () => {
    const result = await applyV3Patches(sampleSpec, [
      {
        op: 'insert_node',
        screenId: 'scr_1',
        targetContainerId: 'region_content',
        node: {
          id: 'node_badge_new',
          type: 'Badge',
          props: { label: 'Aktif', tone: 'positive' },
          layout: { size: 'hug' },
          bindings: [],
          interactions: [],
          a11y: { role: 'status', label: 'Aktif', hint: null, state: null, order: 3 },
          visibility: true,
        },
      },
    ], 1)

    const contentChildren = (result.updatedSpec.screens[0].root.children[1] as any).children
    expect(contentChildren).toHaveLength(2)
    expect(contentChildren[1].id).toBe('node_badge_new')
    expect(contentChildren[1].props.label).toBe('Aktif')
    expect(result.updatedSpec.metadata.revision).toBe(2)
  })

  it('removes a node from a container', async () => {
    const result = await applyV3Patches(sampleSpec, [
      {
        op: 'remove_node',
        screenId: 'scr_1',
        nodeId: 'node_button_1',
      },
    ], 1)

    const contentChildren = (result.updatedSpec.screens[0].root.children[1] as any).children
    expect(contentChildren).toHaveLength(0)
    expect(result.affectedNodeIds).toEqual(['node_button_1'])
  })

  it('moves a node between containers', async () => {
    const result = await applyV3Patches(sampleSpec, [
      {
        op: 'move_node',
        screenId: 'scr_1',
        nodeId: 'node_button_1',
        targetContainerId: 'region_header',
        targetIndex: 0,
      },
    ], 1)

    const headerChildren = (result.updatedSpec.screens[0].root.children[0] as any).children
    const contentChildren = (result.updatedSpec.screens[0].root.children[1] as any).children
    expect(headerChildren).toHaveLength(2)
    expect(headerChildren[0].id).toBe('node_button_1')
    expect(contentChildren).toHaveLength(0)
  })

  it('replaces layout properties on a container', async () => {
    const result = await applyV3Patches(sampleSpec, [
      {
        op: 'replace_layout',
        screenId: 'scr_1',
        nodeId: 'region_header',
        layout: { mode: 'row', gap: 'space.8' },
      },
    ], 1)

    const header = result.updatedSpec.screens[0].root.children[0] as any
    expect(header.layout.mode).toBe('row')
    expect(header.layout.gap).toBe('space.8')
  })

  it('rejects patch when expectedRevision does not match current document revision (concurrency conflict)', async () => {
    await expect(applyV3Patches(sampleSpec, [
      { op: 'remove_node', screenId: 'scr_1', nodeId: 'node_button_1' },
    ], 99)).rejects.toThrow(PatchConcurrencyError)
  })

  it('rejects patch when new props violate the typed component schema fail-closed', async () => {
    await expect(applyV3Patches(sampleSpec, [
      {
        op: 'replace_props',
        screenId: 'scr_1',
        nodeId: 'node_button_1',
        props: { variant: 'non-existent-variant' },
      },
    ], 1)).rejects.toThrow(PatchValidationError)
  })

  it('rejects removing the root screen node', async () => {
    await expect(applyV3Patches(sampleSpec, [
      { op: 'remove_node', screenId: 'scr_1', nodeId: 'node_root' },
    ], 1)).rejects.toThrow(PatchValidationError)
  })
})
