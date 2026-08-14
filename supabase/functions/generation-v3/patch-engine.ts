import { type AcceptedDesignSpec } from './accepted-design-spec.ts'
import { validateComponentProps } from './component-contracts.ts'
import { sha256Hex, stableStringify } from './crypto-utils.ts'
import { type ContainerNode, type LeafNode, type RegionContainerNode, type ScreenRootNode } from './design-spec-compiler.ts'

export type V3ReplacePropsPatch = {
  op: 'replace_props'
  screenId: string
  nodeId: string
  props: Record<string, unknown>
}

export type V3ReplaceLayoutPatch = {
  op: 'replace_layout'
  screenId: string
  nodeId: string
  layout: {
    mode?: 'column' | 'row' | 'stack' | 'grid' | 'absolute' | 'scroll'
    gap?: string
    align?: 'start' | 'center' | 'end' | 'stretch'
    justify?: 'start' | 'center' | 'end' | 'between' | 'around'
  }
}

export type V3InsertNodePatch = {
  op: 'insert_node'
  screenId: string
  targetContainerId: string
  index?: number
  node: LeafNode | ContainerNode
}

export type V3RemoveNodePatch = {
  op: 'remove_node'
  screenId: string
  nodeId: string
}

export type V3MoveNodePatch = {
  op: 'move_node'
  screenId: string
  nodeId: string
  targetContainerId: string
  targetIndex?: number
}

export type V3PatchOperation =
  | V3ReplacePropsPatch
  | V3ReplaceLayoutPatch
  | V3InsertNodePatch
  | V3RemoveNodePatch
  | V3MoveNodePatch

export class PatchConcurrencyError extends Error {
  constructor(public readonly expectedRevision: number, public readonly actualRevision: number) {
    super(`Patch concurrency conflict: expected revision ${expectedRevision}, but document is at revision ${actualRevision}`)
    this.name = 'PatchConcurrencyError'
  }
}

export class PatchValidationError extends Error {
  constructor(public readonly issues: string[]) {
    super(`Patch validation failed: ${issues.join('; ')}`)
    this.name = 'PatchValidationError'
  }
}

export type ApplyPatchesResult = {
  updatedSpec: AcceptedDesignSpec
  affectedNodeIds: string[]
  patchCount: number
}

function cloneSpec(spec: AcceptedDesignSpec): AcceptedDesignSpec {
  return JSON.parse(JSON.stringify(spec)) as AcceptedDesignSpec
}

/**
 * The compiled tree is exactly two levels deep (screen root -> region containers -> leaves),
 * so lookups are a flat tagged union instead of generic recursion — this keeps every branch
 * precisely typed against the real RegionContainerNode/LeafNode children arrays instead of
 * forcing a lowest-common-denominator node type that would erase which array a node lives in.
 */
type FoundNode =
  | { kind: 'root'; node: ScreenRootNode }
  | { kind: 'region'; node: RegionContainerNode; parent: ScreenRootNode; index: number }
  | { kind: 'leaf'; node: LeafNode; parent: RegionContainerNode; index: number }

function findNode(root: ScreenRootNode, targetId: string): FoundNode | null {
  if (root.id === targetId) return { kind: 'root', node: root }
  for (let i = 0; i < root.children.length; i += 1) {
    const region = root.children[i]
    if (region.id === targetId) return { kind: 'region', node: region, parent: root, index: i }
    for (let j = 0; j < region.children.length; j += 1) {
      const leaf = region.children[j]
      if (leaf.id === targetId) return { kind: 'leaf', node: leaf, parent: region, index: j }
    }
  }
  return null
}

function validateLeafProps(leaf: LeafNode, issues: string[]): void {
  const validation = validateComponentProps(leaf.type as any, leaf.props)
  if (!validation.ok) {
    for (const issue of validation.issues) {
      issues.push(`node ${leaf.id} (${leaf.type}): ${issue}`)
    }
  }
}

/**
 * Applies a sequence of typed patches to an AcceptedDesignSpec document atomically.
 * Enforces optimistic concurrency (expectedRevision === currentRevision).
 * Guarantees that only targeted nodes are altered and all unaffected nodes/screens retain their exact identities.
 * Validates component prop contracts for any modified/inserted node.
 */
export async function applyV3Patches(
  spec: AcceptedDesignSpec,
  patches: V3PatchOperation[],
  expectedRevision: number,
): Promise<ApplyPatchesResult> {
  const currentRevision = spec.metadata.revision ?? 1
  if (expectedRevision !== currentRevision) {
    throw new PatchConcurrencyError(expectedRevision, currentRevision)
  }

  if (!patches.length) {
    return { updatedSpec: spec, affectedNodeIds: [], patchCount: 0 }
  }

  const updated = cloneSpec(spec)
  const affectedNodeIds = new Set<string>()
  const issues: string[] = []

  for (let patchIdx = 0; patchIdx < patches.length; patchIdx += 1) {
    const patch = patches[patchIdx]
    const screen = updated.screens.find((s) => s.id === patch.screenId)
    if (!screen) {
      issues.push(`patch[${patchIdx}]: screen ${patch.screenId} not found`)
      continue
    }

    switch (patch.op) {
      case 'replace_props': {
        const found = findNode(screen.root, patch.nodeId)
        if (!found) {
          issues.push(`patch[${patchIdx}]: node ${patch.nodeId} not found in screen ${patch.screenId}`)
          break
        }
        if (found.kind !== 'leaf') {
          issues.push(`patch[${patchIdx}]: cannot replace props on container node ${patch.nodeId}`)
          break
        }
        const leaf = found.node
        leaf.props = { ...leaf.props, ...patch.props }
        const propCheck = validateComponentProps(leaf.type as any, leaf.props)
        if (!propCheck.ok) {
          issues.push(...propCheck.issues.map((msg) => `patch[${patchIdx}] node ${leaf.id} (${leaf.type}): ${msg}`))
        }
        affectedNodeIds.add(patch.nodeId)
        break
      }

      case 'replace_layout': {
        const found = findNode(screen.root, patch.nodeId)
        if (!found) {
          issues.push(`patch[${patchIdx}]: node ${patch.nodeId} not found in screen ${patch.screenId}`)
          break
        }
        if (found.kind !== 'region') {
          issues.push(`patch[${patchIdx}]: layout can only be replaced on a region container, not ${patch.nodeId}`)
          break
        }
        found.node.layout = { ...found.node.layout, ...patch.layout }
        affectedNodeIds.add(patch.nodeId)
        break
      }

      case 'insert_node': {
        const foundContainer = findNode(screen.root, patch.targetContainerId)
        if (!foundContainer) {
          issues.push(`patch[${patchIdx}]: target container ${patch.targetContainerId} not found in screen ${patch.screenId}`)
          break
        }

        if (foundContainer.kind === 'leaf') {
          issues.push(`patch[${patchIdx}]: target ${patch.targetContainerId} is a leaf node, not a container`)
          break
        }

        if (foundContainer.kind === 'root') {
          if (!('layout' in patch.node) || !('children' in patch.node)) {
            issues.push(`patch[${patchIdx}]: inserting into the screen root requires a region container node`)
            break
          }
          const region = patch.node as RegionContainerNode
          const insertIndex = patch.index !== undefined && patch.index >= 0 && patch.index <= foundContainer.node.children.length
            ? patch.index
            : foundContainer.node.children.length
          foundContainer.node.children.splice(insertIndex, 0, region)
          affectedNodeIds.add(region.id)
          break
        }

        if ('children' in patch.node) {
          issues.push(`patch[${patchIdx}]: inserting into a region requires a leaf node, not another container`)
          break
        }
        const leaf = patch.node as LeafNode
        validateLeafProps(leaf, issues)
        const insertIndex = patch.index !== undefined && patch.index >= 0 && patch.index <= foundContainer.node.children.length
          ? patch.index
          : foundContainer.node.children.length
        foundContainer.node.children.splice(insertIndex, 0, leaf)
        affectedNodeIds.add(leaf.id)
        break
      }

      case 'remove_node': {
        const found = findNode(screen.root, patch.nodeId)
        if (!found) {
          issues.push(`patch[${patchIdx}]: node ${patch.nodeId} not found in screen ${patch.screenId}`)
          break
        }
        if (found.kind === 'root') {
          issues.push(`patch[${patchIdx}]: cannot remove root screen node ${patch.nodeId}`)
          break
        }
        found.parent.children.splice(found.index, 1)
        affectedNodeIds.add(patch.nodeId)
        break
      }

      case 'move_node': {
        const found = findNode(screen.root, patch.nodeId)
        if (!found) {
          issues.push(`patch[${patchIdx}]: node ${patch.nodeId} not found in screen ${patch.screenId}`)
          break
        }
        if (found.kind === 'root') {
          issues.push(`patch[${patchIdx}]: cannot move root screen node ${patch.nodeId}`)
          break
        }
        const foundTarget = findNode(screen.root, patch.targetContainerId)
        if (!foundTarget) {
          issues.push(`patch[${patchIdx}]: target container ${patch.targetContainerId} not found in screen ${patch.screenId}`)
          break
        }

        if (found.kind === 'leaf') {
          if (foundTarget.kind !== 'region') {
            issues.push(`patch[${patchIdx}]: a leaf node can only move into a region container`)
            break
          }
          found.parent.children.splice(found.index, 1)
          const targetIndex = patch.targetIndex !== undefined && patch.targetIndex >= 0 && patch.targetIndex <= foundTarget.node.children.length
            ? patch.targetIndex
            : foundTarget.node.children.length
          foundTarget.node.children.splice(targetIndex, 0, found.node)
        } else {
          if (foundTarget.kind !== 'root') {
            issues.push(`patch[${patchIdx}]: a region container can only move within the screen root`)
            break
          }
          found.parent.children.splice(found.index, 1)
          const targetIndex = patch.targetIndex !== undefined && patch.targetIndex >= 0 && patch.targetIndex <= foundTarget.node.children.length
            ? patch.targetIndex
            : foundTarget.node.children.length
          foundTarget.node.children.splice(targetIndex, 0, found.node)
        }
        affectedNodeIds.add(patch.nodeId)
        break
      }
    }
  }

  if (issues.length > 0) {
    throw new PatchValidationError(issues)
  }

  const newContentHash = await sha256Hex(stableStringify(updated.screens))
  const newRevision = currentRevision + 1

  updated.metadata = {
    ...updated.metadata,
    contentHash: newContentHash,
    revision: newRevision,
  }

  return {
    updatedSpec: updated,
    affectedNodeIds: Array.from(affectedNodeIds),
    patchCount: patches.length,
  }
}
