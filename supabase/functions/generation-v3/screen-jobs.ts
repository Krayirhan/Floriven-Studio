import type { ProductModel } from './product-model.ts'
import { canonical, exactKeys, isObject, nonEmptyString, stringList, uniqueIds, type ValidationResult } from './validation.ts'

export const SCREEN_JOBS_VERSION = '1.0.0' as const
export type InteractionCapability = 'inspect' | 'search' | 'filter' | 'create' | 'edit' | 'delete' | 'select' | 'navigate' | 'schedule' | 'reorder' | 'compare' | 'visualize'
export type ScreenJob = {
  id: string
  name: string
  userJob: string
  actorId: string
  entityIds: string[]
  requiredData: string[]
  requiredInteractions: InteractionCapability[]
  completionCriteria: string[]
  entryPoints: string[]
  destinationJobIds: string[]
  priority: 'primary' | 'secondary' | 'support'
}
export type ScreenJobs = { version: typeof SCREEN_JOBS_VERSION; jobs: ScreenJob[] }

export const INTERACTIONS = new Set<InteractionCapability>(['inspect', 'search', 'filter', 'create', 'edit', 'delete', 'select', 'navigate', 'schedule', 'reorder', 'compare', 'visualize'])
const PRIORITIES = new Set(['primary', 'secondary', 'support'])

export const SCREEN_JOBS_JSON_SCHEMA = {
  $id: 'floriven.generation-v3.ScreenJobs@1', type: 'object', additionalProperties: false,
  required: ['version', 'jobs'],
  properties: {
    version: { const: SCREEN_JOBS_VERSION },
    jobs: {
      type: 'array', minItems: 1, maxItems: 12,
      items: {
        type: 'object', additionalProperties: false,
        required: ['id', 'name', 'userJob', 'actorId', 'entityIds', 'requiredData', 'requiredInteractions', 'completionCriteria', 'entryPoints', 'destinationJobIds', 'priority'],
        properties: {
          id: { type: 'string' }, name: { type: 'string' }, userJob: { type: 'string' }, actorId: { type: 'string', description: 'must reference an existing productModel.actors[].id' },
          entityIds: { type: 'array', items: { type: 'string', description: 'must reference existing productModel.entities[].id' } },
          requiredData: { type: 'array', minItems: 2, items: { type: 'string' } },
          requiredInteractions: { type: 'array', minItems: 1, items: { type: 'string', enum: ['inspect', 'search', 'filter', 'create', 'edit', 'delete', 'select', 'navigate', 'schedule', 'reorder', 'compare', 'visualize'] } },
          completionCriteria: { type: 'array', minItems: 1, items: { type: 'string' } },
          entryPoints: { type: 'array', minItems: 1, items: { type: 'string' } },
          destinationJobIds: { type: 'array', items: { type: 'string', description: 'must reference another job in this same array by id' } },
          priority: { type: 'string', enum: ['primary', 'secondary', 'support'] },
        },
      },
    },
  },
} as const

export function validateScreenJobs(input: unknown, product: ProductModel): ValidationResult<ScreenJobs> {
  const issues: string[] = []
  if (!isObject(input)) return { ok: false, issues: ['screenJobs: object required'] }
  exactKeys(input, ['version', 'jobs'], 'screenJobs', issues)
  if (input.version !== SCREEN_JOBS_VERSION) issues.push('screenJobs.version: unsupported version')
  if (!Array.isArray(input.jobs) || input.jobs.length < 1 || input.jobs.length > 12) return { ok: false, issues: [...issues, 'screenJobs.jobs: 1-12 jobs required'] }
  const jobs: ScreenJob[] = []
  input.jobs.forEach((raw, index) => {
    const path = `screenJobs.jobs[${index}]`
    if (!isObject(raw)) { issues.push(`${path}: object required`); return }
    exactKeys(raw, ['id', 'name', 'userJob', 'actorId', 'entityIds', 'requiredData', 'requiredInteractions', 'completionCriteria', 'entryPoints', 'destinationJobIds', 'priority'], path, issues)
    const valid = nonEmptyString(raw.id, `${path}.id`, issues, 80)
      && nonEmptyString(raw.name, `${path}.name`, issues, 120)
      && nonEmptyString(raw.userJob, `${path}.userJob`, issues, 300)
      && nonEmptyString(raw.actorId, `${path}.actorId`, issues, 80)
      && stringList(raw.entityIds, `${path}.entityIds`, issues, { min: 1, max: 10 })
      && stringList(raw.requiredData, `${path}.requiredData`, issues, { min: 2, max: 20 })
      && stringList(raw.requiredInteractions, `${path}.requiredInteractions`, issues, { min: 1, max: 10 })
      && stringList(raw.completionCriteria, `${path}.completionCriteria`, issues, { min: 1, max: 10 })
      && stringList(raw.entryPoints, `${path}.entryPoints`, issues, { min: 1, max: 10 })
      && stringList(raw.destinationJobIds, `${path}.destinationJobIds`, issues, { max: 10 })
    if (!PRIORITIES.has(String(raw.priority))) issues.push(`${path}.priority: invalid priority`)
    if (valid && PRIORITIES.has(String(raw.priority))) jobs.push(raw as ScreenJob)
  })
  uniqueIds(jobs, 'screenJobs.jobs', issues)
  validateReferences(jobs, product, issues)
  const jobNames = jobs.map((job) => canonical(job.userJob))
  if (new Set(jobNames).size !== jobNames.length) issues.push('screenJobs.jobs: user jobs must be distinct')
  if (!jobs.some((job) => job.priority === 'primary')) issues.push('screenJobs.jobs: at least one primary job required')
  return issues.length ? { ok: false, issues } : { ok: true, value: input as ScreenJobs }
}

function validateReferences(jobs: ScreenJob[], product: ProductModel, issues: string[]): void {
  const jobIds = new Set(jobs.map((job) => job.id)); const actorIds = new Set(product.actors.map((actor) => actor.id)); const entityIds = new Set(product.entities.map((entity) => entity.id))
  for (const job of jobs) {
    if (!actorIds.has(job.actorId)) issues.push(`${job.id}: unknown actor ${job.actorId}`)
    job.entityIds.forEach((id) => { if (!entityIds.has(id)) issues.push(`${job.id}: unknown entity ${id}`) })
    job.destinationJobIds.forEach((id) => { if (id === job.id || !jobIds.has(id)) issues.push(`${job.id}: invalid destination ${id}`) })
    job.requiredInteractions.forEach((interaction) => { if (!INTERACTIONS.has(interaction)) issues.push(`${job.id}: unsupported interaction ${interaction}`) })
  }
}
