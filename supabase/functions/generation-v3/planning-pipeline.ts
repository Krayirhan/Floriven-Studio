import { deriveComponentCapabilities, validateComponentCapabilities, type ComponentCapabilities } from './component-capabilities.ts'
import { validateContentPlan, type ContentPlan } from './content-plan.ts'
import { compileDesignSpecScreen, DesignSpecCompileError, type DesignSpecScreen } from './design-spec-compiler.ts'
import { validateLayoutPlan, type LayoutPlan } from './layout-plan.ts'
import { contentPlanMessages, layoutPlanMessages, productModelMessages, screenJobsMessages, uxStructureMessages, withRetryFeedback, type V3PromptMessage } from './prompts.ts'
import { validateProductModel, type ProductModel } from './product-model.ts'
import { runTargetedRepair, type RepairResult } from './repair.ts'
import { validateScreenJobs, type ScreenJobs } from './screen-jobs.ts'
import { runProductStaticCritics, runStaticCritics, type ProductStaticCriticsReport, type StaticCriticsReport } from './static-critics.ts'
import { validateUXStructure, type UXStructure } from './ux-structure.ts'
import { parseStrictJsonObject, type ValidationResult } from './validation.ts'

export type V3PlanningOperation = 'product_model' | 'screen_jobs' | 'ux_structure' | 'component_capabilities' | 'layout_plan' | 'content_plan' | 'design_spec_compile' | 'static_critics' | 'patch_plan'
export type V3PlanningProvider = {
  completeJson(input: { operation: V3PlanningOperation; messages: V3PromptMessage[]; correlationId: string; timeoutMs: number }): Promise<string>
}
export type V3PlanningInput = {
  brief: string; correlationId: string; requestedScreenCount?: number; timeoutMs?: number
  /** Fired after each major milestone so a caller (http-adapter.ts) can persist real stage/progress instead of the job record sitting at "planning" for the whole run with no visibility into where it actually is. */
  onProgress?: (stage: string, progress: number) => Promise<void>
}
export type V3PlanningOutput = {
  productModel: ProductModel; screenJobs: ScreenJobs; uxStructures: UXStructure[]
  componentCapabilities: ComponentCapabilities[]; layoutPlans: LayoutPlan[]; contentPlans: ContentPlan[]
  designSpecScreens: DesignSpecScreen[]
  staticCritics: StaticCriticsReport[]; productStaticCritics: ProductStaticCriticsReport; repairs: RepairResult[]
}
export class V3PlanningError extends Error {
  constructor(public readonly stage: V3PlanningOperation, public readonly issues: string[]) {
    super(`Generation V3 ${stage} validation failed`)
    this.name = 'V3PlanningError'
  }
}

/**
 * Defined here (not in provider.ts) so http-adapter.ts can catch it without importing provider.ts —
 * provider.ts reads Deno.env at module load time, which crashes non-Deno test runners on import.
 */
export class V3ProviderError extends Error {
  constructor(public readonly code: string, message: string, public readonly provider: string, public readonly retryable: boolean) {
    super(message)
    this.name = 'V3ProviderError'
  }
}

/**
 * Retries a planning call up to `maxAttempts` times, feeding the exact validation issues from a
 * rejected attempt back to the model (withRetryFeedback) instead of hoping a fresh, blind attempt
 * happens to avoid the same mistake — a model can usually satisfy a check once it sees precisely
 * which one it missed, which one-shot prompting can't guarantee. Used for every LLM-driven
 * planning stage; component_capabilities no longer goes through this at all (see
 * deriveComponentCapabilities) since it isn't an LLM call anymore.
 */
async function completeWithRetry<T>(params: {
  operation: V3PlanningOperation
  provider: V3PlanningProvider
  correlationId: string
  timeoutMs: number
  buildMessages: (feedback?: string[]) => V3PromptMessage[]
  validate: (raw: unknown) => ValidationResult<T>
  maxAttempts?: number
}): Promise<T> {
  const { operation, provider, correlationId, timeoutMs, buildMessages, validate, maxAttempts = 2 } = params
  let issues: string[] = []
  for (let attempt = 1; attempt <= maxAttempts; attempt += 1) {
    const raw = await provider.completeJson({ operation, messages: buildMessages(attempt > 1 ? issues : undefined), correlationId, timeoutMs })
    const parsed = parseStrictJsonObject(raw)
    if (!parsed.ok) { issues = parsed.issues; continue }
    const validated = validate(parsed.value)
    if (validated.ok) return validated.value
    issues = validated.issues
  }
  throw new V3PlanningError(operation, issues)
}

export async function runV3Planning(input: V3PlanningInput, provider: V3PlanningProvider): Promise<V3PlanningOutput> {
  const brief = input.brief.trim()
  if (!brief || brief.length > 12_000) throw new V3PlanningError('product_model', ['brief: length must be between 1 and 12000 characters'])
  if (!input.correlationId.trim()) throw new V3PlanningError('product_model', ['correlationId: required'])
  const timeoutMs = Math.min(60_000, Math.max(1_000, input.timeoutMs ?? 30_000))

  const product = await completeWithRetry({
    operation: 'product_model', provider, correlationId: input.correlationId, timeoutMs,
    buildMessages: (feedback) => withRetryFeedback(productModelMessages(brief), feedback),
    validate: (raw) => validateProductModel(raw),
  })

  await input.onProgress?.('product_model', 10)

  const jobs = await completeWithRetry({
    operation: 'screen_jobs', provider, correlationId: input.correlationId, timeoutMs,
    buildMessages: (feedback) => withRetryFeedback(screenJobsMessages(product, input.requestedScreenCount), feedback),
    validate: (raw) => {
      const result = validateScreenJobs(raw, product)
      if (!result.ok) return result
      if (input.requestedScreenCount !== undefined && result.value.jobs.length !== input.requestedScreenCount) {
        return { ok: false, issues: [`screenJobs.jobs: expected exactly ${input.requestedScreenCount} jobs`] }
      }
      return result
    },
  })
  await input.onProgress?.('screen_jobs', 20)

  const uxStructures: UXStructure[] = []
  for (const [index, job] of jobs.jobs.entries()) {
    const structure = await completeWithRetry({
      operation: 'ux_structure', provider, correlationId: input.correlationId, timeoutMs,
      buildMessages: (feedback) => withRetryFeedback(uxStructureMessages(job), feedback),
      validate: (raw) => validateUXStructure(raw, job),
    })
    uxStructures.push(structure)
    await input.onProgress?.(`ux_structure ${index + 1}/${jobs.jobs.length}`, 20 + Math.round(((index + 1) / jobs.jobs.length) * 15))
  }

  // Deterministic, not an LLM call — which component satisfies which capability is a closed
  // lookup (COMPONENT_CAPABILITY_MATRIX), so a greedy set-cover is both more reliable and a full
  // request/token cheaper per screen than asking a model to reason it out each time. Still
  // validated through the exact same fail-closed validateComponentCapabilities as before.
  const componentCapabilities: ComponentCapabilities[] = []
  for (const structure of uxStructures) {
    const capabilities = deriveComponentCapabilities(structure)
    const validated = validateComponentCapabilities(capabilities, structure)
    if (!validated.ok) throw new V3PlanningError('component_capabilities', validated.issues)
    componentCapabilities.push(validated.value)
  }
  await input.onProgress?.('component_capabilities', 40)

  const layoutPlans: LayoutPlan[] = []
  for (const [index, [structure, capabilities]] of uxStructures.map((structure, index) => [structure, componentCapabilities[index]] as const).entries()) {
    if (!capabilities) throw new V3PlanningError('layout_plan', [`layout_plan: missing componentCapabilities for ${structure.screenJobId}`])
    const layout = await completeWithRetry({
      operation: 'layout_plan', provider, correlationId: input.correlationId, timeoutMs,
      buildMessages: (feedback) => withRetryFeedback(layoutPlanMessages(structure, capabilities), feedback),
      validate: (raw) => validateLayoutPlan(raw, structure, capabilities),
    })
    layoutPlans.push(layout)
    await input.onProgress?.(`layout_plan ${index + 1}/${uxStructures.length}`, 40 + Math.round(((index + 1) / uxStructures.length) * 15))
  }

  const contentPlans: ContentPlan[] = []
  for (const [index, [structure, layout]] of uxStructures.map((structure, index) => [structure, layoutPlans[index]] as const).entries()) {
    if (!layout) throw new V3PlanningError('content_plan', [`content_plan: missing layoutPlan for ${structure.screenJobId}`])
    const content = await completeWithRetry({
      operation: 'content_plan', provider, correlationId: input.correlationId, timeoutMs,
      buildMessages: (feedback) => withRetryFeedback(contentPlanMessages(product, structure, layout), feedback),
      validate: (raw) => validateContentPlan(raw, structure, layout),
    })
    contentPlans.push(content)
    await input.onProgress?.(`content_plan ${index + 1}/${uxStructures.length}`, 55 + Math.round(((index + 1) / uxStructures.length) * 15))
  }

  const designSpecScreens: DesignSpecScreen[] = []
  const staticCritics: StaticCriticsReport[] = []
  const repairs: RepairResult[] = []
  for (const [job, structure, capabilitiesEntry, layoutEntry, contentEntry] of jobs.jobs.map((job, index) =>
    [job, uxStructures[index], componentCapabilities[index], layoutPlans[index], contentPlans[index]] as const)) {
    if (!structure || !capabilitiesEntry || !layoutEntry || !contentEntry) throw new V3PlanningError('design_spec_compile', [`design_spec_compile: missing planning stage output for ${job.id}`])
    let screen: DesignSpecScreen
    try {
      screen = compileDesignSpecScreen(job, structure, capabilitiesEntry, layoutEntry, contentEntry)
    } catch (error) {
      throw new V3PlanningError('design_spec_compile', error instanceof DesignSpecCompileError ? error.issues : [String(error)])
    }

    let critic = runStaticCritics(job, structure, screen)
    if (!critic.passed) {
      const repair = runTargetedRepair(job, structure, capabilitiesEntry, screen, critic)
      repairs.push(repair)
      screen = repair.screen
      critic = runStaticCritics(job, structure, screen)
      if (!critic.passed) throw new V3PlanningError('static_critics', repair.unrepairable.map((violation) => `${violation.code}: ${violation.message}`))
    }

    designSpecScreens.push(screen)
    staticCritics.push(critic)
  }

  const productCritic = runProductStaticCritics(designSpecScreens)
  if (!productCritic.passed) {
    throw new V3PlanningError('static_critics', [`duplicationRatePct ${productCritic.duplicationRatePct.toFixed(1)} exceeds the 10% gate`, ...productCritic.duplicates.map((duplicate) => `${duplicate.screenJobIdA} ~ ${duplicate.screenJobIdB}: ${(duplicate.similarity * 100).toFixed(0)}% structural similarity`)])
  }
  await input.onProgress?.('design_spec_compile', 78)

  return { productModel: product, screenJobs: jobs, uxStructures, componentCapabilities, layoutPlans, contentPlans, designSpecScreens, staticCritics, productStaticCritics: productCritic, repairs }
}
