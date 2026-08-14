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

/**
 * Accumulates as the plan is built, one work item at a time. Persistable as-is (plain JSON) —
 * this is exactly what a caller checkpoints to survive a single invocation not living long enough
 * to finish the whole pipeline (see runV3WorkItem / nextV3WorkItem).
 */
export type V3PlanningState = {
  productModel?: ProductModel
  screenJobs?: ScreenJobs
  uxStructures: UXStructure[]
  componentCapabilities: ComponentCapabilities[]
  layoutPlans: LayoutPlan[]
  contentPlans: ContentPlan[]
}

export function emptyV3PlanningState(): V3PlanningState {
  return { uxStructures: [], componentCapabilities: [], layoutPlans: [], contentPlans: [] }
}

/**
 * One atomic, always-single-LLM-call unit of work — deliberately small enough that even with the
 * two completeWithRetry attempts and a provider-chain fallback, one item's worst case stays well
 * inside a single Edge Function invocation's execution ceiling (Supabase free tier: 150s
 * background-task limit). A run of any length is just "keep doing the next item" across as many
 * invocations as it takes; nothing about the pipeline itself has a length limit anymore.
 */
export type V3WorkItem =
  | { kind: 'product_model' }
  | { kind: 'screen_jobs' }
  | { kind: 'ux_structure'; index: number }
  | { kind: 'layout_plan'; index: number }
  | { kind: 'content_plan'; index: number }
  | { kind: 'compile' }

/** A short, stable label for stage/progress reporting — same shape whether driven by runV3Planning's internal loop or an external chunked driver. */
export function describeV3WorkItem(item: V3WorkItem, totalScreens: number): string {
  switch (item.kind) {
    case 'product_model': return 'product_model'
    case 'screen_jobs': return 'screen_jobs'
    case 'ux_structure': return `ux_structure ${item.index + 1}/${totalScreens}`
    case 'layout_plan': return `layout_plan ${item.index + 1}/${totalScreens}`
    case 'content_plan': return `content_plan ${item.index + 1}/${totalScreens}`
    case 'compile': return 'design_spec_compile'
  }
}

/** Rough, monotonically increasing progress estimate for the UI — not exact, just always moving forward. */
export function estimateV3Progress(item: V3WorkItem, totalScreens: number): number {
  const perScreenSpan = totalScreens > 0 ? 60 / totalScreens : 0
  switch (item.kind) {
    case 'product_model': return 5
    case 'screen_jobs': return 15
    case 'ux_structure': return Math.round(20 + perScreenSpan * item.index + perScreenSpan * 0.3)
    case 'layout_plan': return Math.round(20 + perScreenSpan * item.index + perScreenSpan * 0.6)
    case 'content_plan': return Math.round(20 + perScreenSpan * item.index + perScreenSpan)
    case 'compile': return 82
  }
}

/** What work remains given how much of the plan is already known — null once nothing is left. */
export function nextV3WorkItem(state: V3PlanningState): V3WorkItem | null {
  if (!state.productModel) return { kind: 'product_model' }
  if (!state.screenJobs) return { kind: 'screen_jobs' }
  const total = state.screenJobs.jobs.length
  if (state.uxStructures.length < total) return { kind: 'ux_structure', index: state.uxStructures.length }
  if (state.layoutPlans.length < total) return { kind: 'layout_plan', index: state.layoutPlans.length }
  if (state.contentPlans.length < total) return { kind: 'content_plan', index: state.contentPlans.length }
  return { kind: 'compile' }
}

export type V3WorkItemInput = { brief: string; correlationId: string; requestedScreenCount?: number; timeoutMs: number }

/** Executes exactly one work item and returns the state it produces — never more than one LLM call (plus that call's own bounded retry). Throws V3PlanningError/V3ProviderError on failure, same as before; the caller decides whether to persist a checkpoint and try again later or fail the whole job. */
export async function runV3WorkItem(state: V3PlanningState, item: V3WorkItem, provider: V3PlanningProvider, input: V3WorkItemInput): Promise<V3PlanningState> {
  switch (item.kind) {
    case 'product_model': {
      const product = await completeWithRetry({
        operation: 'product_model', provider, correlationId: input.correlationId, timeoutMs: input.timeoutMs,
        buildMessages: (feedback) => withRetryFeedback(productModelMessages(input.brief), feedback),
        validate: (raw) => validateProductModel(raw),
      })
      return { ...state, productModel: product }
    }
    case 'screen_jobs': {
      if (!state.productModel) throw new V3PlanningError('screen_jobs', ['screen_jobs: product_model must complete first'])
      const productModel = state.productModel
      const jobs = await completeWithRetry({
        operation: 'screen_jobs', provider, correlationId: input.correlationId, timeoutMs: input.timeoutMs,
        buildMessages: (feedback) => withRetryFeedback(screenJobsMessages(productModel, input.requestedScreenCount), feedback),
        validate: (raw) => {
          const result = validateScreenJobs(raw, productModel)
          if (!result.ok) return result
          if (input.requestedScreenCount !== undefined && result.value.jobs.length !== input.requestedScreenCount) {
            return { ok: false, issues: [`screenJobs.jobs: expected exactly ${input.requestedScreenCount} jobs`] }
          }
          return result
        },
      })
      return { ...state, screenJobs: jobs }
    }
    case 'ux_structure': {
      if (!state.screenJobs) throw new V3PlanningError('ux_structure', ['ux_structure: screen_jobs must complete first'])
      const job = state.screenJobs.jobs[item.index]
      if (!job) throw new V3PlanningError('ux_structure', [`ux_structure: no screen job at index ${item.index}`])
      const structure = await completeWithRetry({
        operation: 'ux_structure', provider, correlationId: input.correlationId, timeoutMs: input.timeoutMs,
        buildMessages: (feedback) => withRetryFeedback(uxStructureMessages(job), feedback),
        validate: (raw) => validateUXStructure(raw, job),
      })
      // Deterministic, not an LLM call — folded into the same work item since it costs no
      // request/time budget (see deriveComponentCapabilities).
      const capabilities = deriveComponentCapabilities(structure)
      const validatedCapabilities = validateComponentCapabilities(capabilities, structure)
      if (!validatedCapabilities.ok) throw new V3PlanningError('component_capabilities', validatedCapabilities.issues)
      return {
        ...state,
        uxStructures: [...state.uxStructures, structure],
        componentCapabilities: [...state.componentCapabilities, validatedCapabilities.value],
      }
    }
    case 'layout_plan': {
      const structure = state.uxStructures[item.index]
      const capabilities = state.componentCapabilities[item.index]
      if (!structure || !capabilities) throw new V3PlanningError('layout_plan', [`layout_plan: missing prerequisite for index ${item.index}`])
      const layout = await completeWithRetry({
        operation: 'layout_plan', provider, correlationId: input.correlationId, timeoutMs: input.timeoutMs,
        buildMessages: (feedback) => withRetryFeedback(layoutPlanMessages(structure, capabilities), feedback),
        validate: (raw) => validateLayoutPlan(raw, structure, capabilities),
      })
      return { ...state, layoutPlans: [...state.layoutPlans, layout] }
    }
    case 'content_plan': {
      const structure = state.uxStructures[item.index]
      const layout = state.layoutPlans[item.index]
      if (!state.productModel || !structure || !layout) throw new V3PlanningError('content_plan', [`content_plan: missing prerequisite for index ${item.index}`])
      const productModel = state.productModel
      const content = await completeWithRetry({
        operation: 'content_plan', provider, correlationId: input.correlationId, timeoutMs: input.timeoutMs,
        buildMessages: (feedback) => withRetryFeedback(contentPlanMessages(productModel, structure, layout), feedback),
        validate: (raw) => validateContentPlan(raw, structure, layout),
      })
      return { ...state, contentPlans: [...state.contentPlans, content] }
    }
    case 'compile':
      return state
  }
}

/**
 * Deterministic compilation + static critics — no LLM calls, always fast. Turns a fully-populated
 * V3PlanningState into the final V3PlanningOutput. Only ever called once nextV3WorkItem returns
 * `{ kind: 'compile' }`, i.e. every screen has a product model, screen jobs, and a UX structure/
 * layout/content plan for every job.
 */
export function compileV3PlanningOutput(state: V3PlanningState): V3PlanningOutput {
  if (!state.productModel || !state.screenJobs) throw new V3PlanningError('design_spec_compile', ['design_spec_compile: planning is not complete'])
  const productModel = state.productModel
  const screenJobs = state.screenJobs

  const designSpecScreens: DesignSpecScreen[] = []
  const staticCritics: StaticCriticsReport[] = []
  const repairs: RepairResult[] = []
  for (const [job, structure, capabilitiesEntry, layoutEntry, contentEntry] of screenJobs.jobs.map((job, index) =>
    [job, state.uxStructures[index], state.componentCapabilities[index], state.layoutPlans[index], state.contentPlans[index]] as const)) {
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

  return {
    productModel, screenJobs, uxStructures: state.uxStructures, componentCapabilities: state.componentCapabilities,
    layoutPlans: state.layoutPlans, contentPlans: state.contentPlans, designSpecScreens, staticCritics,
    productStaticCritics: productCritic, repairs,
  }
}

export type V3PlanningInput = {
  brief: string; correlationId: string; requestedScreenCount?: number; timeoutMs?: number
  /** Fired after each work item completes so a caller can persist real stage/progress instead of the job record sitting at "planning" for the whole run with no visibility into where it actually is. */
  onProgress?: (stage: string, progress: number) => Promise<void>
}

/**
 * Runs the whole pipeline to completion in one call by repeatedly asking nextV3WorkItem what's
 * left and executing it — the synchronous, unchunked reference path (used directly by tests and
 * anywhere total run time isn't constrained). The real Edge Function background job
 * (http-adapter.ts's advanceV3GenerationJob) uses nextV3WorkItem/runV3WorkItem/compileV3PlanningOutput
 * directly instead, so it can persist a checkpoint after every single item and resume across
 * multiple invocations rather than needing the whole run to fit in one.
 */
export async function runV3Planning(input: V3PlanningInput, provider: V3PlanningProvider): Promise<V3PlanningOutput> {
  const brief = input.brief.trim()
  if (!brief || brief.length > 12_000) throw new V3PlanningError('product_model', ['brief: length must be between 1 and 12000 characters'])
  if (!input.correlationId.trim()) throw new V3PlanningError('product_model', ['correlationId: required'])
  const timeoutMs = Math.min(60_000, Math.max(1_000, input.timeoutMs ?? 30_000))

  let state = emptyV3PlanningState()
  let item = nextV3WorkItem(state)
  while (item && item.kind !== 'compile') {
    state = await runV3WorkItem(state, item, provider, { brief, correlationId: input.correlationId, requestedScreenCount: input.requestedScreenCount, timeoutMs })
    const totalScreens = state.screenJobs?.jobs.length ?? 0
    await input.onProgress?.(describeV3WorkItem(item, totalScreens), estimateV3Progress(item, totalScreens))
    item = nextV3WorkItem(state)
  }

  const output = compileV3PlanningOutput(state)
  const totalScreens = state.screenJobs?.jobs.length ?? 0
  await input.onProgress?.(describeV3WorkItem({ kind: 'compile' }, totalScreens), estimateV3Progress({ kind: 'compile' }, totalScreens))
  return output
}
