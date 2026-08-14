import { exactKeys, isObject, nonEmptyString, stringList, uniqueIds, type JsonObject, type ValidationResult } from './validation.ts'

export const PRODUCT_MODEL_VERSION = '1.0.0' as const

export type ProductActor = { id: string; name: string; goals: string[] }
export type ProductEntity = { id: string; name: string; states: string[]; actions: string[] }
export type ProductModel = {
  version: typeof PRODUCT_MODEL_VERSION
  productName: string
  domain: string
  audience: string
  actors: ProductActor[]
  entities: ProductEntity[]
  capabilities: string[]
  vocabulary: string[]
  constraints: string[]
}

export const PRODUCT_MODEL_JSON_SCHEMA = {
  $id: 'floriven.generation-v3.ProductModel@1', type: 'object', additionalProperties: false,
  required: ['version', 'productName', 'domain', 'audience', 'actors', 'entities', 'capabilities', 'vocabulary', 'constraints'],
  properties: {
    version: { const: PRODUCT_MODEL_VERSION }, productName: { type: 'string', minLength: 1, maxLength: 120 },
    domain: { type: 'string', minLength: 1, maxLength: 120 }, audience: { type: 'string', minLength: 1, maxLength: 240 },
    actors: {
      type: 'array', minItems: 1, maxItems: 8,
      items: { type: 'object', additionalProperties: false, required: ['id', 'name', 'goals'], properties: { id: { type: 'string' }, name: { type: 'string' }, goals: { type: 'array', items: { type: 'string' } } } },
    },
    entities: {
      type: 'array', minItems: 1, maxItems: 20,
      items: { type: 'object', additionalProperties: false, required: ['id', 'name', 'states', 'actions'], properties: { id: { type: 'string' }, name: { type: 'string' }, states: { type: 'array', items: { type: 'string' } }, actions: { type: 'array', items: { type: 'string' } } } },
    },
    capabilities: { type: 'array', minItems: 2, maxItems: 30, items: { type: 'string' } }, vocabulary: { type: 'array', minItems: 3, maxItems: 40, items: { type: 'string' } },
    constraints: { type: 'array', maxItems: 20, items: { type: 'string' } },
  },
} as const

export function validateProductModel(input: unknown): ValidationResult<ProductModel> {
  const issues: string[] = []
  if (!isObject(input)) return { ok: false, issues: ['productModel: object required'] }
  exactKeys(input, ['version', 'productName', 'domain', 'audience', 'actors', 'entities', 'capabilities', 'vocabulary', 'constraints'], 'productModel', issues)
  if (input.version !== PRODUCT_MODEL_VERSION) issues.push('productModel.version: unsupported version')
  nonEmptyString(input.productName, 'productModel.productName', issues, 120)
  nonEmptyString(input.domain, 'productModel.domain', issues, 120)
  nonEmptyString(input.audience, 'productModel.audience', issues, 240)
  stringList(input.capabilities, 'productModel.capabilities', issues, { min: 2, max: 30 })
  stringList(input.vocabulary, 'productModel.vocabulary', issues, { min: 3, max: 40 })
  stringList(input.constraints, 'productModel.constraints', issues, { max: 20 })
  const actors = validateActors(input.actors, issues)
  const entities = validateEntities(input.entities, issues)
  if (issues.length || !actors || !entities) return { ok: false, issues }
  return { ok: true, value: input as ProductModel }
}

function validateActors(value: unknown, issues: string[]): ProductActor[] | undefined {
  if (!Array.isArray(value) || value.length < 1 || value.length > 8) { issues.push('productModel.actors: 1-8 actors required'); return undefined }
  const actors: ProductActor[] = []
  value.forEach((raw, index) => {
    const path = `productModel.actors[${index}]`
    if (!isObject(raw)) { issues.push(`${path}: object required`); return }
    exactKeys(raw, ['id', 'name', 'goals'], path, issues)
    if (nonEmptyString(raw.id, `${path}.id`, issues, 80) && nonEmptyString(raw.name, `${path}.name`, issues, 120) && stringList(raw.goals, `${path}.goals`, issues, { min: 1, max: 10 })) actors.push(raw as ProductActor)
  })
  uniqueIds(actors, 'productModel.actors', issues)
  return actors
}

function validateEntities(value: unknown, issues: string[]): ProductEntity[] | undefined {
  if (!Array.isArray(value) || value.length < 1 || value.length > 20) { issues.push('productModel.entities: 1-20 entities required'); return undefined }
  const entities: ProductEntity[] = []
  value.forEach((raw, index) => {
    const path = `productModel.entities[${index}]`
    if (!isObject(raw)) { issues.push(`${path}: object required`); return }
    exactKeys(raw, ['id', 'name', 'states', 'actions'], path, issues)
    if (nonEmptyString(raw.id, `${path}.id`, issues, 80) && nonEmptyString(raw.name, `${path}.name`, issues, 120) && stringList(raw.states, `${path}.states`, issues, { min: 1, max: 15 }) && stringList(raw.actions, `${path}.actions`, issues, { min: 1, max: 15 })) entities.push(raw as ProductEntity)
  })
  uniqueIds(entities, 'productModel.entities', issues)
  return entities
}
