import { validateComponentCapabilities, type ComponentCapabilities } from './component-capabilities.ts'
import { validateContentPlan, type ContentPlan } from './content-plan.ts'
import { compileDesignSpecScreen, DesignSpecCompileError, type DesignSpecScreen } from './design-spec-compiler.ts'
import { validateLayoutPlan, type LayoutPlan } from './layout-plan.ts'
import { componentCapabilitiesMessages, contentPlanMessages, layoutPlanMessages, productModelMessages, screenJobsMessages, uxStructureMessages, type V3PromptMessage } from './prompts.ts'
import { validateProductModel, type ProductModel } from './product-model.ts'
import { runTargetedRepair, type RepairResult } from './repair.ts'
import { validateScreenJobs, type ScreenJobs } from './screen-jobs.ts'
import { runProductStaticCritics, runStaticCritics, type ProductStaticCriticsReport, type StaticCriticsReport } from './static-critics.ts'
import { validateUXStructure, type UXStructure } from './ux-structure.ts'
import { parseStrictJsonObject } from './validation.ts'

export type V3PlanningOperation = 'product_model' | 'screen_jobs' | 'ux_structure' | 'component_capabilities' | 'layout_plan' | 'content_plan' | 'design_spec_compile' | 'static_critics' | 'patch_plan'
export type V3PlanningProvider = {
  completeJson(input: { operation: V3PlanningOperation; messages: V3PromptMessage[]; correlationId: string; timeoutMs: number }): Promise<string>
}
export type V3PlanningInput = { brief: string; correlationId: string; requestedScreenCount?: number; timeoutMs?: number }
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

export async function runV3Planning(input: V3PlanningInput, provider: V3PlanningProvider): Promise<V3PlanningOutput> {
  const brief = input.brief.trim()
  if (!brief || brief.length > 12_000) throw new V3PlanningError('product_model', ['brief: length must be between 1 and 12000 characters'])
  if (!input.correlationId.trim()) throw new V3PlanningError('product_model', ['correlationId: required'])
  const timeoutMs = Math.min(60_000, Math.max(1_000, input.timeoutMs ?? 30_000))

  const productRaw = await provider.completeJson({ operation: 'product_model', messages: productModelMessages(brief), correlationId: input.correlationId, timeoutMs })
  const productJson = parseStrictJsonObject(productRaw)
  if (!productJson.ok) throw new V3PlanningError('product_model', productJson.issues)
  const product = validateProductModel(productJson.value)
  if (!product.ok) throw new V3PlanningError('product_model', product.issues)

  const jobsRaw = await provider.completeJson({ operation: 'screen_jobs', messages: screenJobsMessages(product.value, input.requestedScreenCount), correlationId: input.correlationId, timeoutMs })
  const jobsJson = parseStrictJsonObject(jobsRaw)
  if (!jobsJson.ok) throw new V3PlanningError('screen_jobs', jobsJson.issues)
  const jobs = validateScreenJobs(jobsJson.value, product.value)
  if (!jobs.ok) throw new V3PlanningError('screen_jobs', jobs.issues)
  if (input.requestedScreenCount !== undefined && jobs.value.jobs.length !== input.requestedScreenCount) {
    throw new V3PlanningError('screen_jobs', [`screenJobs.jobs: expected exactly ${input.requestedScreenCount} jobs`])
  }

  const uxStructures: UXStructure[] = []
  for (const job of jobs.value.jobs) {
    const uxRaw = await provider.completeJson({ operation: 'ux_structure', messages: uxStructureMessages(job), correlationId: input.correlationId, timeoutMs })
    const uxJson = parseStrictJsonObject(uxRaw)
    if (!uxJson.ok) throw new V3PlanningError('ux_structure', uxJson.issues)
    const ux = validateUXStructure(uxJson.value, job)
    if (!ux.ok) throw new V3PlanningError('ux_structure', ux.issues)
    uxStructures.push(ux.value)
  }

  const componentCapabilities: ComponentCapabilities[] = []
  for (const structure of uxStructures) {
    const capabilitiesRaw = await provider.completeJson({ operation: 'component_capabilities', messages: componentCapabilitiesMessages(structure), correlationId: input.correlationId, timeoutMs })
    const capabilitiesJson = parseStrictJsonObject(capabilitiesRaw)
    if (!capabilitiesJson.ok) throw new V3PlanningError('component_capabilities', capabilitiesJson.issues)
    const capabilities = validateComponentCapabilities(capabilitiesJson.value, structure)
    if (!capabilities.ok) throw new V3PlanningError('component_capabilities', capabilities.issues)
    componentCapabilities.push(capabilities.value)
  }

  const layoutPlans: LayoutPlan[] = []
  for (const [structure, capabilities] of uxStructures.map((structure, index) => [structure, componentCapabilities[index]] as const)) {
    if (!capabilities) throw new V3PlanningError('layout_plan', [`layout_plan: missing componentCapabilities for ${structure.screenJobId}`])
    const layoutRaw = await provider.completeJson({ operation: 'layout_plan', messages: layoutPlanMessages(structure, capabilities), correlationId: input.correlationId, timeoutMs })
    const layoutJson = parseStrictJsonObject(layoutRaw)
    if (!layoutJson.ok) throw new V3PlanningError('layout_plan', layoutJson.issues)
    const layout = validateLayoutPlan(layoutJson.value, structure, capabilities)
    if (!layout.ok) throw new V3PlanningError('layout_plan', layout.issues)
    layoutPlans.push(layout.value)
  }

  const contentPlans: ContentPlan[] = []
  for (const [structure, layout] of uxStructures.map((structure, index) => [structure, layoutPlans[index]] as const)) {
    if (!layout) throw new V3PlanningError('content_plan', [`content_plan: missing layoutPlan for ${structure.screenJobId}`])
    const contentRaw = await provider.completeJson({ operation: 'content_plan', messages: contentPlanMessages(product.value, structure, layout), correlationId: input.correlationId, timeoutMs })
    const contentJson = parseStrictJsonObject(contentRaw)
    if (!contentJson.ok) throw new V3PlanningError('content_plan', contentJson.issues)
    const content = validateContentPlan(contentJson.value, structure, layout)
    if (!content.ok) throw new V3PlanningError('content_plan', content.issues)
    contentPlans.push(content.value)
  }

  const designSpecScreens: DesignSpecScreen[] = []
  const staticCritics: StaticCriticsReport[] = []
  const repairs: RepairResult[] = []
  for (const [job, structure, capabilitiesEntry, layoutEntry, contentEntry] of jobs.value.jobs.map((job, index) =>
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

  return { productModel: product.value, screenJobs: jobs.value, uxStructures, componentCapabilities, layoutPlans, contentPlans, designSpecScreens, staticCritics, productStaticCritics: productCritic, repairs }
}
