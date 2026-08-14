import { type V3PatchOperation } from './patch-engine.ts'
import { isObject, type ValidationResult } from './validation.ts'

export const PATCH_PLAN_VERSION = '1.0.0' as const

/**
 * The subset of V3PatchOperation a free-text instruction can safely be turned into. insert_node
 * is deliberately excluded — it requires synthesizing a brand-new, fully-typed leaf/region node
 * from scratch, which is a much higher-risk generation task than editing something that already
 * exists; a "add a new X" request should go through full re-generation, not a patch.
 */
export type PatchPlanOp = Extract<V3PatchOperation, { op: 'replace_props' | 'replace_layout' | 'remove_node' | 'move_node' }>

export const PATCH_PLAN_JSON_SCHEMA = {
  $id: 'floriven.generation-v3.PatchPlan@1', type: 'object', additionalProperties: false,
  required: ['version', 'patches'],
  properties: {
    version: { const: PATCH_PLAN_VERSION },
    patches: {
      type: 'array', minItems: 1, maxItems: 10,
      items: {
        type: 'object', additionalProperties: false,
        required: ['op', 'screenId', 'nodeId'],
        properties: {
          op: { type: 'string', enum: ['replace_props', 'replace_layout', 'remove_node', 'move_node'] },
          screenId: { type: 'string', description: 'must be SCREEN_TREE.id' },
          nodeId: { type: 'string', description: 'must be an id copied verbatim from SCREEN_TREE' },
          props: { type: 'object', description: 'required when op is replace_props' },
          layout: { type: 'object', description: 'required when op is replace_layout' },
          targetContainerId: { type: 'string', description: 'required when op is move_node' },
          targetIndex: { type: 'number' },
        },
      },
    },
  },
} as const

function isPatchPlanOp(raw: unknown): raw is PatchPlanOp {
  if (!isObject(raw)) return false
  if (typeof raw.op !== 'string' || typeof raw.screenId !== 'string' || typeof raw.nodeId !== 'string') return false
  if (raw.op === 'replace_props') return isObject(raw.props)
  if (raw.op === 'replace_layout') return isObject(raw.layout)
  if (raw.op === 'remove_node') return true
  if (raw.op === 'move_node') return typeof raw.targetContainerId === 'string'
  return false
}

/**
 * Structural validation only — whether a nodeId actually exists, a container accepts the move, or
 * replace_props keys match the component's own contract is re-checked fail-closed by
 * applyV3Patches (patch-engine.ts) when the plan is applied. This function only rejects output
 * that isn't even shaped like one of the four supported operations.
 */
export function validatePatchPlan(raw: unknown): ValidationResult<PatchPlanOp[]> {
  if (!isObject(raw)) return { ok: false, issues: ['patchPlan: object required'] }
  if (raw.version !== PATCH_PLAN_VERSION) return { ok: false, issues: ['patchPlan.version: unsupported version'] }
  if (!Array.isArray(raw.patches) || raw.patches.length < 1 || raw.patches.length > 10) {
    return { ok: false, issues: ['patchPlan.patches: 1-10 entries required'] }
  }
  const issues: string[] = []
  const valid: PatchPlanOp[] = []
  raw.patches.forEach((op, index) => {
    if (isPatchPlanOp(op)) valid.push(op)
    else issues.push(`patchPlan.patches[${index}]: malformed or unsupported patch operation`)
  })
  return issues.length ? { ok: false, issues } : { ok: true, value: valid }
}
