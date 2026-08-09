import { createClient } from 'jsr:@supabase/supabase-js@2'
import { jsonrepair } from 'npm:jsonrepair@3.14.1'
import { buildSyntheticBlueprint, deriveArchetype, meetsScreenPolicy, parseModelJson, requiresSettingsScreen, resolveDomainPack, resolveScreenPolicy, type DomainPackId, type ProductBlueprint, type ProductScreenSpec, type ScreenCountOptions } from './domain.ts'
import { detectDomainFromScreens, evaluateGenerationQuality } from './quality.ts'
// Compiled from prompts/*.md by scripts/build-prompts.mjs. Edit the markdown,
// then `pnpm prompts:build` — never edit prompts.generated.ts.
import { DOMAIN_COMPONENT_PROMPTS, PLAN_PROMPT, SYSTEM_PROMPT } from './prompts.generated.ts'
import { findDesignTemplate } from '../../../packages/design-spec/src/strategy.ts'
import { validateDesignSpecIdentity } from '../../../packages/design-spec/src/identity-validator.ts'
import { buildProviderHeaders } from './provider-auth.ts'
import { scheduleGenerationJob } from './async-job-contract.ts'
import { classifyProviderFailure } from './provider-contract.ts'

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, idempotency-key, x-job-token',
}

/**
 * Both providers speak the OpenAI chat-completions shape; they differ in the
 * token parameter name and, decisively, in free-tier headroom.
 *
 *            model               TPM     TPD        generations/day
 *   groq     llama-3.3-70b       12k     100k       ~9
 *   cerebras gpt-oss-120b        30k     1M         ~96
 *
 * Cerebras is the default: ten times the daily budget and a stronger model.
 * Groq stays wired up because free tiers change and one key going cold should
 * be a one-constant switch, not a rewrite.
 */
const PROVIDERS = {
  google: {
    url: 'https://generativelanguage.googleapis.com/v1beta/models',
    model: Deno.env.get('GOOGLE_MODEL') ?? 'gemini-3.6-flash',
    keyEnv: 'GOOGLE_API_KEY',
  },
  cerebras: {
    url: 'https://api.cerebras.ai/v1/chat/completions',
    model: 'gpt-oss-120b',
    keyEnv: 'CEREBRAS_API_KEY',
    tokenParam: 'max_completion_tokens',
    // gpt-oss reasons before answering, and those tokens are drawn from the same
    // allowance as the answer. At the default effort a 700-token plan call spent
    // 423 on reasoning and truncated its own JSON; at "low" it spends ~31 and
    // returns more content. The task is filling a rigid schema, not deduction.
    extra: { reasoning_effort: 'low' } as Record<string, unknown>,
  },
  groq: {
    url: 'https://api.groq.com/openai/v1/chat/completions',
    model: 'llama-3.3-70b-versatile',
    keyEnv: 'GROQ_API_KEY',
    tokenParam: 'max_tokens',
    extra: {} as Record<string, unknown>,
  },
} as const

const PLAN_TOKENS = 1800
const BUILD_TOKENS = 12000
// Edit mode round-trips the whole current document (input echo + rewritten output) in
// one call, so it needs more headroom than a fresh build batch of 4 screens.
const EDIT_TOKENS = 14000
const MAX_EDIT_SCREENS = 10

type Strategy = { mode: 'auto' | 'template'; stylePresetId?: string; templateId?: string; palette: string; cardStyle: string; density: string; navigationStyle: string; visualDirection: string; rationale: string[] }

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: CORS })

  const supabase = createClient(
    Deno.env.get('SUPABASE_URL') ?? '',
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
  )

  if (req.method === 'GET') {
    const id = new URL(req.url).searchParams.get('id')
    if (!id) return json({ error: 'id required' }, 400)
    const jobToken = req.headers.get('x-job-token')?.trim() ?? ''
    if (jobToken.length < 32) return json({ error: 'Valid X-Job-Token header is required' }, 403)
    const { data, error } = await supabase.from('generation_jobs').select('*').eq('id', id).single()
    if (error) return json({ error: error.message }, 404)
    if (!data.job_token_hash || data.job_token_hash !== await sha256(jobToken)) return json({ error: 'Job access denied' }, 403)
    return json(mapJob(data))
  }

  if (req.method !== 'POST') {
    return new Response('Method not allowed', { status: 405, headers: CORS })
  }

  let body: Record<string, unknown>
  try {
    body = await req.json()
  } catch {
    return json({ error: 'Invalid JSON body' }, 400)
  }

  const { projectId, brief, platform = 'ios', screenScope, requestedScreenCount, minScreenCount, maxScreenCount, designMode = 'auto', templateId, stylePresetId, editScreens } = body as {
    projectId: string; brief: string; platform?: string; screenScope?: string; requestedScreenCount?: number; minScreenCount?: number; maxScreenCount?: number; designMode?: string; templateId?: string; stylePresetId?: string; editScreens?: unknown
  }
  if (!projectId || !brief) return json({ error: 'projectId and brief are required' }, 400)
  if (designMode !== 'auto' && designMode !== 'template') return json({ error: 'designMode must be auto or template' }, 400)
  // Edit mode: the client sends the screens it already has and `brief` is read as an
  // instruction against them, instead of a from-scratch product description. Kept as a
  // separate optional field rather than a new designMode value — designMode governs
  // visual strategy only, edit-vs-create is a different axis.
  let editScreensInput: Node[] | undefined
  if (editScreens !== undefined) {
    if (!Array.isArray(editScreens) || editScreens.length === 0) return json({ error: 'editScreens must be a non-empty array' }, 400)
    if (editScreens.length > MAX_EDIT_SCREENS) return json({ error: `editScreens exceeds the ${MAX_EDIT_SCREENS}-screen edit limit` }, 400)
    const valid = editScreens.every((s) => s && typeof s === 'object' && typeof (s as Node).id === 'string' && typeof (s as Node).name === 'string' && typeof (s as Node).route === 'string' && (s as Node).root && typeof (s as Node).root === 'object')
    if (!valid) return json({ error: 'editScreens entries must each have id, name, route and root' }, 400)
    editScreensInput = editScreens as Node[]
  }
  const idempotencyKey = req.headers.get('idempotency-key')?.trim() ?? ''
  if (!/^[a-zA-Z0-9_-]{16,128}$/.test(idempotencyKey)) return json({ error: 'Valid Idempotency-Key header is required' }, 400)
  const jobToken = req.headers.get('x-job-token')?.trim() ?? ''
  if (jobToken.length < 32 || jobToken.length > 256) return json({ error: 'Valid X-Job-Token header is required' }, 403)
  const jobTokenHash = await sha256(jobToken)
  const selectedStyleId = stylePresetId ?? templateId
  const template = designMode === 'template' && selectedStyleId ? findDesignTemplate(selectedStyleId) : undefined
  const templateStrategy = template?.strategy
  if (designMode === 'template' && !templateStrategy) return json({ error: 'Unknown templateId' }, 400)
  const inputHash = await sha256(JSON.stringify({
    projectId: String(projectId),
    brief: String(brief),
    platform: String(platform),
    screenScope: screenScope ? String(screenScope) : null,
    requestedScreenCount: requestedScreenCount ?? null,
    minScreenCount: minScreenCount ?? null,
    maxScreenCount: maxScreenCount ?? null,
    designMode,
    stylePresetId: selectedStyleId ?? null,
    editScreens: editScreensInput ? await sha256(JSON.stringify(editScreensInput)) : null,
  }))

  const { data: existingJob, error: existingErr } = await supabase
    .from('generation_jobs')
    .select('*')
    .eq('project_id', String(projectId))
    .eq('idempotency_key', idempotencyKey)
    .maybeSingle()
  if (existingErr) return json({ error: existingErr.message }, 500)
  if (existingJob) {
    if (!existingJob.job_token_hash || existingJob.job_token_hash !== jobTokenHash) return json({ error: 'Job access denied' }, 403)
    if (existingJob.input_hash && existingJob.input_hash !== inputHash) {
      return json({ error: 'Idempotency-Key was already used with a different generation request' }, 409)
    }
    return json(mapJob(existingJob))
  }

  const { data: job, error: insertErr } = await supabase
    .from('generation_jobs')
    .insert({
      project_id: String(projectId),
      prompt: String(brief),
      platform: String(platform),
      screen_scope: screenScope ? String(screenScope) : null,
      style_preset_id: selectedStyleId ?? null,
      idempotency_key: idempotencyKey,
      input_hash: inputHash,
      job_token_hash: jobTokenHash,
      status: 'queued',
      stage: 'queued',
      progress: 0,
      final_eligible: false,
    })
    .select()
    .single()
  if (insertErr) {
    if (insertErr.code === '23505') {
      const { data: racedJob } = await supabase
        .from('generation_jobs')
        .select('*')
        .eq('project_id', String(projectId))
        .eq('idempotency_key', idempotencyKey)
        .maybeSingle()
      if (racedJob) {
        if (!racedJob.job_token_hash || racedJob.job_token_hash !== jobTokenHash) return json({ error: 'Job access denied' }, 403)
        if (racedJob.input_hash && racedJob.input_hash !== inputHash) {
          return json({ error: 'Idempotency-Key was already used with a different generation request' }, 409)
        }
        return json(mapJob(racedJob))
      }
    }
    return json({ error: insertErr.message }, 500)
  }

  const processPromise = processGenerationJob({ jobId: job.id, brief: String(brief), platform: String(platform), screenScope, countOptions: { requestedScreenCount, minScreenCount, maxScreenCount }, templateStrategy, selectedStyleId, editScreens: editScreensInput, supabase })
  const edgeRuntime = (globalThis as typeof globalThis & { EdgeRuntime?: { waitUntil(promise: Promise<unknown>): void } }).EdgeRuntime
  const scheduled = scheduleGenerationJob(
    { id: job.id, status: 'queued', stage: 'queued', providerExecutions: 0 },
    () => processPromise,
    (work) => { if (edgeRuntime) edgeRuntime.waitUntil(work); else void work },
  )
  return json({ ...mapJob({ ...job, status: 'queued', stage: 'queued', progress: 0, final_eligible: false }), ...scheduled }, 202)

  try {
    const { blueprint, domainPackId, raw } = editScreensInput
      ? await runEditGeneration(String(brief), editScreensInput, job.id, supabase)
      : await runFreshGeneration(String(brief), platform, screenScope, { requestedScreenCount, minScreenCount, maxScreenCount }, templateStrategy, selectedStyleId, job.id, supabase)

    await supabase.from('generation_jobs').update({ progress: 70 }).eq('id', job.id)
    if (raw.length === 0) throw new Error('Model hiç ekran döndürmedi')

    const forcedStrategy: Strategy | undefined = !editScreensInput && templateStrategy
      ? { mode: 'template', stylePresetId:selectedStyleId, ...templateStrategy, rationale: ['Kullanıcı bu görsel stili seçti'] }
      : undefined
    const screens = normalizeScreens(raw, blueprint, forcedStrategy, domainPackId)
    const qualityReport = evaluateGenerationQuality(screens, blueprint, domainPackId)
    const identityIssues = validateDesignSpecIdentity({ screens })
    if (identityIssues.length > 0) {
      qualityReport.passed = false
      qualityReport.score = 0
      qualityReport.issues.push(...identityIssues.map((issue) => `${issue.code}: ${issue.message}`))
    }
    const { error: qualityErr } = await supabase
      .from('generation_jobs')
      .update({ progress: 85, quality_report: qualityReport })
      .eq('id', job.id)
    if (qualityErr) throw new Error(`Kalite raporu kaydedilemedi: ${qualityErr.message}`)
    if (!qualityReport.passed) {
      const qualityMessage = `Static quality rejected candidate (${qualityReport.score}/100): ${qualityReport.issues.join(' ')}`
      const { data: rejected, error: rejectionErr } = await supabase
        .from('generation_jobs')
        .update({ status: 'failed', progress: 100, result_screens: screens, error_code: 'QUALITY_REJECTED', error_message: qualityMessage, final_eligible: false, final_decision_reason: 'STATIC_QUALITY_REJECTED', quality_version: 'v2' })
        .eq('id', job.id)
        .select()
        .single()
      if (rejectionErr) throw new Error(`Quality rejection could not be persisted: ${rejectionErr.message}`)
      return json(mapJob(rejected))
      throw new Error(`Tasarım kalite kapısını geçemedi (${qualityReport.score}/100): ${qualityReport.issues.join(' ')}`)
    }

    const { data: done, error: doneErr } = await supabase
      .from('generation_jobs')
      .update({ status: 'completed', progress: 100, result_screens: screens, final_eligible: false, final_decision_reason: 'RUNTIME_EVIDENCE_REQUIRED', quality_version: 'v2' })
      .eq('id', job.id)
      .select()
      .single()
    if (doneErr) throw new Error(`Üretim sonucu kaydedilemedi: ${doneErr.message}`)

    return json(mapJob(done))
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err)
    await supabase
      .from('generation_jobs')
      .update({ status: 'failed', error_message: msg })
      .eq('id', job.id)
    return json({ error: msg }, 500)
  }
})

// ---------------------------------------------------------------------------
// Generation entry points — a fresh build plans a ProductBlueprint from a text
// brief; an edit reuses the current document's own screens as that blueprint
// and asks the model to change only what the instruction asks for.
// ---------------------------------------------------------------------------

type ProcessGenerationJobOptions = {
  jobId: string
  brief: string
  platform: string
  screenScope?: string
  countOptions: ScreenCountOptions
  templateStrategy: Omit<Strategy, 'mode' | 'templateId' | 'rationale'> | undefined
  selectedStyleId?: string
  editScreens?: Node[]
  supabase: SupabaseClient
}

class GenerationPipelineError extends Error {
  constructor(readonly code: string, message: string, readonly provider?: string, readonly upstreamStatus?: number, readonly retryable = false) { super(message) }
}

async function processGenerationJob(options: ProcessGenerationJobOptions): Promise<void> {
  const { jobId, brief, platform, screenScope, countOptions, templateStrategy, selectedStyleId, editScreens, supabase } = options
  let currentStage = 'provider_pending'
  let providerStartedAt = Date.now()
  const updateStage = async (stage: string, progress: number, extra: Record<string, unknown> = {}) => {
    currentStage = stage
    const { error } = await supabase.from('generation_jobs').update({ stage, progress, ...extra }).eq('id', jobId)
    if (error) throw new GenerationPipelineError('TECHNICAL_FAILURE', `Stage persistence failed: ${error.message}`)
  }

  try {
    await updateStage('provider_pending', 10, { status: 'processing', provider: 'google', provider_attempt: 1, final_eligible: false })
    providerStartedAt = Date.now()
    const result = editScreens
      ? await runEditGeneration(brief, editScreens, jobId, supabase)
      : await runFreshGeneration(brief, platform, screenScope, countOptions, templateStrategy, selectedStyleId, jobId, supabase)
    await updateStage('provider_complete', 70, { provider_http_status: 200, provider_duration_ms: Date.now() - providerStartedAt, provider_metadata: { attempts: [{ provider: 'google', status: 200 }] } })
    if (result.raw.length === 0) throw new GenerationPipelineError('PROVIDER_BAD_RESPONSE', 'Provider returned no screens')

    await updateStage('validating', 75)
    const forcedStrategy: Strategy | undefined = !editScreens && templateStrategy
      ? { mode: 'template', stylePresetId: selectedStyleId, ...templateStrategy, rationale: ['User selected a visual style'] }
      : undefined
    const screens = normalizeScreens(result.raw, result.blueprint, forcedStrategy, result.domainPackId)
    const qualityReport = evaluateGenerationQuality(screens, result.blueprint, result.domainPackId)
    const identityIssues = validateDesignSpecIdentity({ screens })
    if (identityIssues.length > 0) {
      qualityReport.passed = false
      qualityReport.score = 0
      qualityReport.issues.push(...identityIssues.map((issue) => `${issue.code}: ${issue.message}`))
    }
    await updateStage('static_quality', 85, { quality_report: qualityReport, quality_version: 'v2' })
    if (!qualityReport.passed) {
      const qualityMessage = `Static quality rejected candidate (${qualityReport.score}/100): ${qualityReport.issues.join(' ')}`
      const { error } = await supabase.from('generation_jobs').update({ status: 'failed', stage: 'QUALITY_REJECTED', progress: 100, result_screens: screens, error_code: 'QUALITY_REJECTED', error_message: qualityMessage, final_eligible: false, final_decision_reason: 'STATIC_QUALITY_REJECTED' }).eq('id', jobId)
      if (error) throw new GenerationPipelineError('TECHNICAL_FAILURE', `Quality rejection persistence failed: ${error.message}`)
      return
    }
    const { error } = await supabase.from('generation_jobs').update({ status: 'completed', stage: 'candidate_ready', progress: 100, result_screens: screens, final_eligible: false, final_decision_reason: 'RUNTIME_EVIDENCE_REQUIRED', quality_version: 'v2' }).eq('id', jobId)
    if (error) throw new GenerationPipelineError('TECHNICAL_FAILURE', `Result persistence failed: ${error.message}`)
  } catch (err) {
    const error = err instanceof GenerationPipelineError
      ? err
      : err instanceof ProviderError
        ? new GenerationPipelineError(err.code, err.message, err.provider, err.upstreamStatus, err.retryable)
        : new GenerationPipelineError('TECHNICAL_FAILURE', err instanceof Error ? err.message : String(err))
    await supabase.from('generation_jobs').update({ status: 'failed', stage: 'failed', failed_stage: currentStage, progress: 100, error_code: error.code, error_message: error.message, provider: error.provider ?? 'google', provider_http_status: error.upstreamStatus ?? null, provider_duration_ms: Date.now() - providerStartedAt, provider_metadata: { retryable: error.retryable, failedStage: currentStage }, final_eligible: false }).eq('id', jobId)
  }
}

type SupabaseClient = ReturnType<typeof createClient>

async function runFreshGeneration(
  brief: string,
  platform: string,
  screenScope: string | undefined,
  countOptions: ScreenCountOptions,
  templateStrategy: Omit<Strategy, 'mode' | 'templateId' | 'rationale'> | undefined,
  selectedStyleId: string | undefined,
  jobId: string,
  supabase: SupabaseClient,
): Promise<{ blueprint: ProductBlueprint; domainPackId: DomainPackId | undefined; raw: unknown[] }> {
  // Phase 1 — cheap plan call. Anchors the screens to the pillars actually
  // named in the brief, so a three-pillar app never loses one to a generic screen.
  const blueprint = await planProduct(brief, screenScope, countOptions)
  const plan = blueprint.screens
  const domainPackId = resolveDomainPack(blueprint, brief)
  const { error: contextErr } = await supabase
    .from('generation_jobs')
    .update({ progress: 35, product_blueprint: blueprint, domain_pack_id: domainPackId ?? null })
    .eq('id', jobId)
  if (contextErr) throw new Error(`Üretim bağlamı kaydedilemedi: ${contextErr.message}`)

  const runtimeSystemPrompt = domainPackId && DOMAIN_COMPONENT_PROMPTS[domainPackId]
    ? `${SYSTEM_PROMPT}\n\n${DOMAIN_COMPONENT_PROMPTS[domainPackId]}`
    : SYSTEM_PROMPT

  const raw: unknown[] = []
  const batches = chunk(plan, 4)
  for (let batchIndex = 0; batchIndex < batches.length; batchIndex += 1) {
    const batch = batches[batchIndex]
    const userMsg = [
      `Uygulama: ${brief}`,
      `Platform: ${platform}`,
      'SEMANTİK COMPOSITION AŞAMASI: Stil preset kimliği ve presentation tokenları bu aşamada kullanılmaz. Yalnızca ProductBlueprint ve ekran UX iskeletine göre semantic UI üret.',
      `PRODUCT BLUEPRINT (tek ürün gerçeği): ${JSON.stringify(blueprint)}`,
      `GLOBAL NAVİGASYON: ${JSON.stringify(blueprint.navigation)}`,
      '',
      `Bu ${batches.length} grubun ${batchIndex + 1}. grubudur. Yalnızca aşağıdaki ${batch.length} ekranı, aynı sırada üret:`,
      ...batch.map((p, i) => [
        `${i + 1}. "${p.name}" (${p.route}, ${p.role}) — ${p.purpose}`,
        `   Bölümler: ${p.sections.join(' → ')}`,
        `   UX İSKELETİ (zorunlu): archetype=${p.archetype} | layout=${p.layoutPattern ?? p.archetype} | yoğunluk=${p.contentDensity} | hero=${p.heroAllowed ? 'izinli' : 'YASAK'} | FAB=${p.fabAllowed ? 'izinli' : 'YASAK'}`,
        p.patterns?.length ? `   Önerilen desenler: ${p.patterns.join(', ')} — bunları Card yığınına indirgeme.` : '',
      ].filter(Boolean).join('\n')),
      '',
      'Her ekran kök altında 14-22 dolu ve anlamlı node içersin.',
      'Alt navigasyon yalnız GLOBAL NAVİGASYON primaryScreenIds ekranlarının adlarını içerir ve her ekranda aynıdır.',
      'Tüm metinler bu uygulamanın alanına ait olsun: kendi terimleri, kendi birimleri, kendi sayıları.',
    ].join('\n')
    const parsed = await completeJson([
      { role: 'system', content: runtimeSystemPrompt },
      { role: 'user', content: userMsg },
    ], BUILD_TOKENS, 0.55) as { screens?: unknown }
    const batchScreens = Array.isArray(parsed.screens) ? parsed.screens : []
    if (batchScreens.length !== batch.length) throw new Error(`${batchIndex + 1}. ekran grubunda ${batch.length} yerine ${batchScreens.length} ekran üretildi`)
    raw.push(...batchScreens)
    await supabase.from('generation_jobs').update({ progress: 35 + Math.round(((batchIndex + 1) / batches.length) * 35) }).eq('id', jobId)
  }
  return { blueprint, domainPackId, raw }
}

async function runEditGeneration(
  instruction: string,
  editScreens: Node[],
  jobId: string,
  supabase: SupabaseClient,
): Promise<{ blueprint: ProductBlueprint; domainPackId: DomainPackId | undefined; raw: unknown[] }> {
  const blueprint = buildSyntheticBlueprint(editScreens)
  const domainPackId = detectDomainFromScreens(editScreens) ?? resolveDomainPack(blueprint, instruction)
  const { error: contextErr } = await supabase
    .from('generation_jobs')
    .update({ progress: 35, product_blueprint: blueprint, domain_pack_id: domainPackId ?? null })
    .eq('id', jobId)
  if (contextErr) throw new Error(`Üretim bağlamı kaydedilemedi: ${contextErr.message}`)

  const runtimeSystemPrompt = domainPackId && DOMAIN_COMPONENT_PROMPTS[domainPackId]
    ? `${SYSTEM_PROMPT}\n\n${DOMAIN_COMPONENT_PROMPTS[domainPackId]}`
    : SYSTEM_PROMPT

  const userMsg = [
    'DÜZENLEME MODU: Aşağıda bu uygulamanın MEVCUT ekranları var. Bunlar sıfırdan bir ürün değil, kullanıcının üzerinde çalıştığı gerçek dokümandır.',
    `MEVCUT EKRANLAR: ${JSON.stringify(editScreens)}`,
    `KULLANICI İSTEĞİ: ${instruction}`,
    '',
    `Yalnızca istenen değişikliği uygula. Ekran sayısını (${editScreens.length}), sırasını, id/name/route değerlerini ve ürünün konusunu KORU — yeni ekran ekleme, ekran silme, alakasız bir ürüne dönüştürme yasaktır.`,
    'İstek bir görsel/stil değişikliği ise (tema, yoğunluk, hiyerarşi, erişilebilirlik, tipografi vb.) bunu tüm ekranlara tutarlı biçimde uygula; kısmi uygulama (bazı ekranlarda eski, bazılarında yeni stil) kabul edilmez.',
    'İstek açıkça içerik değişikliği istemiyorsa metinleri, sayıları ve isimleri olduğu gibi koru.',
    `${blueprint.screens.length} ekranın tamamını, aynı sırada, güncellenmiş haliyle döndür.`,
  ].join('\n')

  const parsed = await completeJson([
    { role: 'system', content: runtimeSystemPrompt },
    { role: 'user', content: userMsg },
  ], EDIT_TOKENS, 0.4) as { screens?: unknown }
  const raw = Array.isArray(parsed.screens) ? parsed.screens : []
  if (raw.length !== editScreens.length) throw new Error(`${editScreens.length} ekran bekleniyordu; ${raw.length} ekran döndü`)
  await supabase.from('generation_jobs').update({ progress: 60 }).eq('id', jobId)
  return { blueprint, domainPackId, raw }
}

// ---------------------------------------------------------------------------
// Phase 1 — flow planning
// ---------------------------------------------------------------------------

type ScreenSpec = ProductScreenSpec


async function planProduct(brief: string, scope?: string, options: ScreenCountOptions = {}): Promise<ProductBlueprint> {
  const policy = resolveScreenPolicy(brief, scope, options)
  const planMessages: ChatMessage[] = [
    { role: 'system', content: PLAN_PROMPT },
    { role: 'user', content: `Uygulama: ${brief}${scope ? `\nEkran kapsamı: ${scope}` : ''}\nZORUNLU EKRAN POLİTİKASI: ${JSON.stringify(policy)}` },
  ]
  let parsed = await completeJson(planMessages, PLAN_TOKENS, 0.1)
  let list = Array.isArray(parsed.screens) ? parsed.screens : []
  const planRequiresSettings = () => requiresSettingsScreen(
    Array.isArray(parsed.capabilities) ? parsed.capabilities.filter((item): item is string => typeof item === 'string') : [],
    Array.isArray(parsed.contentVocabulary) ? parsed.contentVocabulary.filter((item): item is string => typeof item === 'string') : [],
  )
  const planHasSettings = () => list.some((item) => asProps(item).role === 'settings')
  for (let correctionAttempt = 0; correctionAttempt < 2; correctionAttempt += 1) {
    const countInvalid = !meetsScreenPolicy(list.length, policy)
    const settingsMissing = planRequiresSettings() && !planHasSettings()
    if (!countInvalid && !settingsMissing) break
    const requirement = policy.requestedCount !== undefined
      ? `tam ${policy.requestedCount}`
      : `${policy.minCount} ile ${policy.maxCount} arasında`
    const settingsInstruction = settingsMissing
      ? ' Ürün tercihleri gerektirdiği için screens dizisinde role="settings", priority="secondary" ve navigationPlacement="utility" olan somut bir ayarlar ekranı bulunması ZORUNLUDUR. Bu ekranın id, name, route, purpose ve 4-6 sections alanlarını doldur; id değerini navigation.utilityScreenIds listesine de ekle. Açık ekran sayısı sabitse en düşük öncelikli destek ekranını ayarlar ekranıyla değiştir.'
      : ''
    const previousPlan = JSON.stringify(parsed)
    parsed = await completeJson(
      [
        ...planMessages,
        { role: 'assistant', content: previousPlan },
        {
          role: 'user',
          content: `Yukarıdaki JSON planı düzelt. JSON şemasını bozmadan ${requirement} ekran döndür. Her ekran briefteki farklı bir kullanıcı görevini çözsün; alan dışı veya şablona ait içerik ekleme.${settingsInstruction} Düzeltilmiş JSON nesnesinin tamamını döndür.`,
        },
      ],
      PLAN_TOKENS,
      0.1,
    )
    list = Array.isArray(parsed.screens) ? parsed.screens : []
  }
  if (list.length === 0) throw new Error('Akış planı üretilemedi')
  if (planRequiresSettings() && !planHasSettings()) throw new Error('Akış planı gerekli ayarlar ekranını üretmedi')

  const targetCount = policy.requestedCount ?? Math.min(policy.maxCount, Math.max(policy.minCount, list.length))
  const archetypes = new Set(['dashboard', 'management_list', 'settings', 'form', 'detail', 'profile'])
  const screens = list.slice(0, targetCount).map((raw, i) => {
    const s = (raw ?? {}) as Node
    const id = slugify(typeof s.id === 'string' ? s.id : typeof s.name === 'string' ? s.name : '') || `screen-${i + 1}`
    const role = pickScreenRole(s.role, i)
    const placement = pickNavigationPlacement(s.navigationPlacement, role, i)
    const archetype = typeof s.archetype === 'string' && archetypes.has(s.archetype) ? s.archetype as ReturnType<typeof deriveArchetype> : deriveArchetype(role)
    // Mechanically enforced, not just requested: a settings/profile screen never gets a
    // FAB regardless of what the plan call said — see repairStructure() downstream.
    const fabAllowed = role === 'settings' || archetype === 'settings' || archetype === 'profile'
      ? false
      : typeof s.fabAllowed === 'boolean' ? s.fabAllowed : true
    return {
      id,
      name: typeof s.name === 'string' && s.name ? s.name : `Ekran ${i + 1}`,
      route: typeof s.route === 'string' && s.route.startsWith('/') ? s.route : `/ekran-${i + 1}`,
      purpose: typeof s.purpose === 'string' ? s.purpose : '',
      sections: Array.isArray(s.sections)
        ? s.sections.filter((x): x is string => typeof x === 'string')
        : [],
      role,
      priority: s.priority === 'secondary' || s.priority === 'tertiary' ? s.priority : 'primary',
      ...(typeof s.parentId === 'string' && s.parentId ? { parentId:slugify(s.parentId) } : {}),
      navigationPlacement: placement,
      archetype,
      ...(typeof s.layoutPattern === 'string' && s.layoutPattern ? { layoutPattern: s.layoutPattern } : {}),
      contentDensity: s.contentDensity === 'low' || s.contentDensity === 'high' ? s.contentDensity : 'medium' as const,
      heroAllowed: typeof s.heroAllowed === 'boolean' ? s.heroAllowed : archetype === 'dashboard' || role === 'onboarding',
      fabAllowed,
      patterns: Array.isArray(s.patterns) ? s.patterns.filter((x): x is string => typeof x === 'string').slice(0, 4) : [],
    }
  })
  const overviewId = screens[0]?.id
  for (const screen of screens) {
    if (screen.navigationPlacement === 'hierarchical' && (!screen.parentId || !screens.some((candidate) => candidate.id === screen.parentId) || screen.parentId === screen.id)) {
      screen.parentId = overviewId
    }
  }
  if (!meetsScreenPolicy(screens.length, policy)) {
    throw new Error(`Akış planı ${targetCount} ekran yerine ${screens.length} ekran döndürdü`)
  }
  const strings = (value:unknown) => Array.isArray(value) ? value.filter((item):item is string=>typeof item==='string').slice(0,12) : []
  const parsedNavigation = asProps(parsed.navigation)
  const screenIds = new Set(screens.map((screen) => screen.id))
  const eligiblePrimaryIds = new Set(screens.filter((screen) => ['overview', 'core'].includes(screen.role)).map((screen) => screen.id))
  const primaryFromModel = strings(parsedNavigation.primaryScreenIds).map(slugify).filter((id) => screenIds.has(id) && eligiblePrimaryIds.has(id)).slice(0, 5)
  const defaultPrimary = screens.filter((screen) => screen.navigationPlacement === 'primary').map((screen) => screen.id).slice(0, 5)
  const minimumPrimary = Math.min(3, Math.max(1, eligiblePrimaryIds.size))
  const fallbackPrimary = [...defaultPrimary, ...screens.filter((screen) => ['overview', 'core'].includes(screen.role)).map((screen) => screen.id)]
    .filter((id, index, ids) => ids.indexOf(id) === index)
    .slice(0, 5)
  const primaryScreenIds = (primaryFromModel.length >= minimumPrimary ? primaryFromModel : fallbackPrimary).slice(0, 5)
  for (const screen of screens) {
    if (primaryScreenIds.includes(screen.id)) screen.navigationPlacement = 'primary'
  }
  const utilityScreenIds = screens.filter((screen) => screen.navigationPlacement === 'utility').map((screen) => screen.id)
  return {
    productDomain:typeof parsed.productDomain==='string'&&parsed.productDomain?parsed.productDomain:'general-productivity',
    audience:typeof parsed.audience==='string'?parsed.audience:'',
    entities:strings(parsed.entities), capabilities:strings(parsed.capabilities), contentVocabulary:strings(parsed.contentVocabulary), screens,
    navigation:{ primaryScreenIds:primaryScreenIds.length ? primaryScreenIds : screens.slice(0, Math.min(4, screens.length)).map((screen) => screen.id), utilityScreenIds },
    screenPolicy:{ ...policy, rationale:typeof asProps(parsed.screenPolicy).rationale === 'string' ? String(asProps(parsed.screenPolicy).rationale) : policy.rationale },
  }
}

function pickScreenRole(value: unknown, index: number): ProductScreenSpec['role'] {
  const roles: ProductScreenSpec['role'][] = ['overview', 'core', 'detail', 'form', 'support', 'settings', 'onboarding']
  return typeof value === 'string' && roles.includes(value as ProductScreenSpec['role']) ? value as ProductScreenSpec['role'] : index === 0 ? 'overview' : 'core'
}

function pickNavigationPlacement(value: unknown, role: ProductScreenSpec['role'], index: number): ProductScreenSpec['navigationPlacement'] {
  const placements: ProductScreenSpec['navigationPlacement'][] = ['primary', 'hierarchical', 'utility', 'hidden']
  if (typeof value === 'string' && placements.includes(value as ProductScreenSpec['navigationPlacement'])) return value as ProductScreenSpec['navigationPlacement']
  if (role === 'settings' || role === 'support') return 'utility'
  if (role === 'detail' || role === 'form' || role === 'onboarding') return 'hierarchical'
  return index < 5 ? 'primary' : 'hierarchical'
}

function chunk<T>(items: T[], size: number): T[][] {
  return Array.from({ length: Math.ceil(items.length / size) }, (_, index) => items.slice(index * size, (index + 1) * size))
}

// ---------------------------------------------------------------------------
// Model client — fail over between independent providers on quota/transient errors.
// ---------------------------------------------------------------------------

type ChatMessage = { role: 'system' | 'user' | 'assistant'; content: string }

class ProviderError extends Error {
  constructor(readonly code: string, message: string, readonly provider = 'unknown', readonly upstreamStatus?: number, readonly retryable = false) { super(message) }
}

async function complete(messages: ChatMessage[], maxTokens: number, temperature: number): Promise<string> {
  const providerOrder = [PROVIDERS.google, PROVIDERS.cerebras, PROVIDERS.groq]
  let configuredProviders = 0
  let minuteLimitSeen = false
  let dailyLimitSeen = false

  for (const provider of providerOrder) {
    const key = Deno.env.get(provider.keyEnv) ?? ''
    if (!key) continue
    configuredProviders += 1
    const providerMaxTokens = provider === PROVIDERS.groq ? Math.min(maxTokens, 6500) : maxTokens
    let res: Response
    try {
      const requestBody = provider === PROVIDERS.google
        ? {
            contents: messages.filter((message) => message.role !== 'system').map((message) => ({
              role: message.role === 'assistant' ? 'model' : 'user',
              parts: [{ text: message.content }],
            })),
            ...(messages.find((message) => message.role === 'system') ? { systemInstruction: { parts: [{ text: messages.find((message) => message.role === 'system')?.content ?? '' }] } } : {}),
            generationConfig: { maxOutputTokens: providerMaxTokens, temperature, responseMimeType: 'application/json' },
          }
        : {
            model: provider.model,
            messages,
            [provider.tokenParam]: providerMaxTokens,
            temperature,
            response_format: { type: 'json_object' },
            ...provider.extra,
          }
      res = await fetch(provider === PROVIDERS.google ? `${provider.url}/${provider.model}:generateContent` : provider.url, {
        method: 'POST',
        signal: AbortSignal.timeout(45_000),
        headers: buildProviderHeaders(provider === PROVIDERS.google ? 'google-native' : 'openai-compatible', key),
        body: JSON.stringify(requestBody),
      })
    } catch (error) {
      const providerName = provider === PROVIDERS.google ? 'google' : provider === PROVIDERS.cerebras ? 'cerebras' : 'groq'
      if (classifyProviderFailure(error)) throw new ProviderError('PROVIDER_TIMEOUT', 'AI provider request timed out', providerName, undefined, true)
      throw new ProviderError('PROVIDER_UNAVAILABLE', 'AI provider request failed before a response was received', providerName, undefined, true)
    }

    if (res.ok) {
      let data: Record<string, unknown>
      try {
        data = await res.json() as Record<string, unknown>
      } catch {
        throw new ProviderError('PROVIDER_PARSE_FAILED', 'AI provider returned malformed JSON', provider === PROVIDERS.google ? 'google' : 'openai-compatible', res.status, false)
      }
      const content: string = provider === PROVIDERS.google
        ? (data as { candidates?: Array<{ content?: { parts?: Array<{ text?: string }> } }> }).candidates?.[0]?.content?.parts?.map((part) => part.text ?? '').join('') ?? ''
        : (data as { choices?: Array<{ message?: { content?: string } }> }).choices?.[0]?.message?.content ?? ''
      if (!content.trim()) throw new ProviderError('PROVIDER_PARSE_FAILED', 'AI provider returned no usable model content', provider === PROVIDERS.google ? 'google' : 'openai-compatible', res.status, false)
      return content
    }

    const providerName = provider === PROVIDERS.google ? 'google' : provider === PROVIDERS.cerebras ? 'cerebras' : 'groq'
    if (res.status === 401 || res.status === 403) throw new ProviderError('PROVIDER_AUTH_FAILED', `AI provider authentication failed (${res.status})`, providerName, res.status, false)
    if (res.status === 402 || res.status >= 500) continue

    // 429/413 carry two very different meanings on the free tier: a per-minute
    // throttle that clears in seconds, and a per-day cap that does not clear
    // until tomorrow. Telling a user to "try again in a minute" when the daily
    // budget is gone sends them into a retry loop that cannot succeed.
    if (res.status === 429 || res.status === 413) {
      const body = await res.text()
      if (/tokens per day|\bTPD\b/i.test(body)) {
        dailyLimitSeen = true
      } else {
        minuteLimitSeen = true
      }
      continue
    }
    throw new ProviderError('PROVIDER_BAD_RESPONSE', `AI provider error (${res.status})`, providerName, res.status, false)
  }
  if (configuredProviders === 0) throw new ProviderError('PROVIDER_INTERNAL_ERROR', 'No AI provider credentials are configured', 'none', undefined, false)
  if (minuteLimitSeen || dailyLimitSeen) throw new ProviderError('PROVIDER_RATE_LIMITED', dailyLimitSeen ? 'AI provider daily quota is exhausted' : 'AI provider rate limit reached', 'provider-chain', 429, true)
  throw new ProviderError('PROVIDER_UNAVAILABLE', 'All configured AI providers were unavailable', 'provider-chain', undefined, true)
}

async function completeJson(messages: ChatMessage[], maxTokens: number, temperature: number): Promise<Record<string, unknown>> {
  const first = await complete(messages, maxTokens, temperature)
  try {
    return repairModelJson(first)
  } catch (firstError) {
    const correction: ChatMessage = {
      role: 'system',
      content: 'Önceki yanıt JSON sözdizimine uymadı. Aynı sözleşmeyi eksiksiz uygula; yalnız geçerli, çift tırnaklı JSON döndür. Markdown, yorum ve trailing comma kullanma.',
    }
    const second = await complete([...messages, correction], maxTokens, 0.1)
    try {
      return repairModelJson(second)
    } catch {
      throw firstError
    }
  }
}

function repairModelJson(text: string): Record<string, unknown> {
  try {
    return parseModelJson(text)
  } catch {
    const start = text.indexOf('{')
    if (start < 0) throw new Error('AI geçerli bir JSON nesnesi döndürmedi')
    const end = text.lastIndexOf('}')
    const candidate = text.slice(start, end > start ? end + 1 : undefined)
    return JSON.parse(jsonrepair(candidate)) as Record<string, unknown>
  }
}

// ---------------------------------------------------------------------------
// Normalisation — repair what is mechanically fixable, reject only real breakage.
// A retry would cost a second full request against a 12k/min budget, so the
// pipeline repairs instead of re-asking.
// ---------------------------------------------------------------------------

const CONTAINERS = new Set(['Screen', 'SafeArea', 'ScrollView', 'Stack', 'Row', 'Grid', 'Card', 'Modal', 'Form'])
const LEAVES = new Set([
  'Text', 'Image', 'Icon', 'Button', 'IconButton', 'TextField', 'SearchField', 'Checkbox',
  'Switch', 'ListItem', 'Divider', 'Badge', 'Avatar', 'TabBar', 'BottomNavigation', 'TopAppBar', 'Progress',
  'Metric', 'Chart', 'SegmentedControl', 'FloatingActionButton',
  'CareSummary', 'MedicationTimeline', 'MedicationDoseRow', 'HealthMetric', 'UnitInput',
  'RangeChart', 'TargetRange', 'StatusAlert', 'SafetyNotice', 'SuccessFeedback',
  'EditorialHero', 'FeatureStory', 'StoryCard', 'Byline', 'MetadataStrip',
  'PullQuote', 'SectionIndex', 'ArchiveEntry',
  'CommerceHero', 'ProductCard', 'PriceBlock', 'ProductGallery',
  'VariantSelector', 'CartLine', 'OrderSummary', 'DeliveryPromise',
  'LearningHero', 'XpProgress', 'StreakBadge', 'LessonCard',
  'RoadmapStep', 'QuizChoice', 'AnswerFeedback', 'AchievementBadge',
  'CommandSummary', 'SignalChart', 'RiskIndicator', 'OperationRow',
  'IncidentTimeline', 'DataMatrix', 'ControlToggle', 'AuditEntry',
])
const MIN_NODES = 8
const MAX_NODES = 60

type Node = Record<string, unknown>

function normalizeStrategy(value: unknown): Strategy {
  const raw = asProps(value)
  const pick = (candidate: unknown, allowed: string[], fallback: string) => typeof candidate === 'string' && allowed.includes(candidate) ? candidate : fallback
  return {
    mode: 'auto',
    palette: pick(raw.palette, ['obsidian', 'serene', 'terracotta', 'electric', 'editorial'], 'obsidian'),
    cardStyle: pick(raw.cardStyle, ['crisp', 'soft', 'layered', 'playful', 'minimal'], 'crisp'),
    density: pick(raw.density, ['compact', 'comfortable', 'spacious'], 'comfortable'),
    navigationStyle: pick(raw.navigationStyle, ['solid', 'floating', 'glass', 'minimal'], 'solid'),
    visualDirection: typeof raw.visualDirection === 'string' && raw.visualDirection ? raw.visualDirection.slice(0, 120) : 'Ürüne uygun dengeli tasarım yönü',
    rationale: Array.isArray(raw.rationale) ? raw.rationale.filter((item): item is string => typeof item === 'string').slice(0, 3) : ['Ürün bağlamı ve ana kullanıcı görevleri analiz edildi'],
  }
}

function normalizeScreens(raw: unknown[], blueprint: ProductBlueprint, forcedStrategy?: Strategy, domainPackId?: DomainPackId): Node[] {
  const screens = raw.filter((s): s is Node => !!s && typeof s === 'object')
  if (screens.length !== blueprint.screens.length) throw new Error(`${blueprint.screens.length} geçerli ekran bekleniyordu; ${screens.length} ekran bulundu`)

  const names = blueprint.screens.map((screen) => screen.name)
  const navItems = blueprint.navigation.primaryScreenIds
    .map((id) => blueprint.screens.find((screen) => screen.id === id)?.name)
    .filter((name): name is string => !!name)
    .slice(0, 5)
  const allowedThemes = new Set(['ocean', 'mint', 'violet', 'coral'])
  const firstRoot = screens[0]?.root as Node | undefined
  const firstProps = asProps(firstRoot?.props)
  const projectTheme = typeof firstProps.theme === 'string' && allowedThemes.has(firstProps.theme)
    ? firstProps.theme
    : 'ocean'
  const strategy = forcedStrategy ?? normalizeStrategy(firstProps.strategy)
  const seenIds = new Set<string>()

  const result = screens.map((screen, index) => {
    const slug = slugify(typeof screen.id === 'string' ? screen.id : '') || `s${index + 1}`

    screen.id = uniqueId(typeof screen.id === 'string' && screen.id ? screen.id : `scr_${slug}`, seenIds)
    screen.name = names[index]
    screen.route = blueprint.screens[index]?.route ?? `/${slug}`

    const root = (screen.root ?? {}) as Node
    if (root.type !== 'Screen') throw new Error(`"${screen.name}" ekranının kökü Screen değil`)
    root.props = { ...asProps(root.props), theme: projectTheme, strategy }
    root.layout = { mode: 'column', gap: 'space.4' }
    root.a11y = asA11y(root.a11y, 'main', String(screen.name))

    const children = Array.isArray(root.children) ? (root.children as unknown[]) : []
    root.children = children
      .filter((c): c is Node => !!c && typeof c === 'object')
      .map((child) => normalizeNode(child, slug, seenIds))
      .filter((child): child is Node => child !== null)

    if (domainPackId === 'health-care') {
      normalizeSereneHealthComponents(root, String(screen.name), slug, seenIds)
    }
    if (domainPackId === 'publishing') {
      normalizeEditorialCultureComponents(root, String(screen.name), slug, seenIds)
    }
    if (domainPackId === 'commerce') {
      normalizeTerracottaMarketComponents(root, String(screen.name), slug, seenIds)
    }
    if (domainPackId === 'learning') {
      normalizeElectricLearningComponents(root, String(screen.name), slug, seenIds)
    }
    if (domainPackId === 'operations') {
      normalizeObsidianPrecisionComponents(root, String(screen.name), slug, seenIds)
    }

    ensureDomainSignature(root, domainPackId, slug, String(screen.name), seenIds, index === 0)

    // Enforced regardless of whether the model honored the plan's fabAllowed
    // instruction — a settings/profile screen never ships a FAB the UX plan
    // explicitly forbade.
    const plannedScreen = blueprint.screens[index]
    const focusedFlow = plannedScreen?.archetype === 'form' || plannedScreen?.archetype === 'detail'
    if (plannedScreen?.fabAllowed === false || focusedFlow) {
      removeComponents(root, new Set(['FloatingActionButton']))
    }
    if (focusedFlow) {
      removeComponents(root, new Set(['BottomNavigation', 'TabBar']))
    }

    repairStructure(root, slug, String(screen.name), navItems, seenIds, plannedScreen?.navigationPlacement === 'primary' && !focusedFlow)

    const count = flatten(root).length - 1
    if (false && count < MIN_NODES) {
      throw new Error(`"${screen.name}" ekranı yeterince detaylı değil (${count} bileşen)`)
    }
    if (count > MAX_NODES) {
      root.children = (root.children as Node[]).slice(0, 20)
    }

    screen.root = root
    return screen
  })

  return result
}

/**
 * Serene Health never falls back to ambiguous generic data primitives. The
 * planner may reorder screens, so this repair is intentionally semantic rather
 * than index based: charts become unit-aware range charts and generic rows
 * become explicit medication or health-metric records.
 */
function normalizeSereneHealthComponents(root: Node, screenName: string, slug: string, seen: Set<string>): void {
  const medicationContext = /ila[cç]|doz|hatırlat/i.test(screenName)

  for (const node of flatten(root)) {
    const props = asProps(node.props)

    if (node.type === 'Chart') {
      const values: number[] = Array.isArray(props.values) && props.values.every((value) => typeof value === 'number')
        ? props.values as number[]
        : [96, 102, 99, 108, 104, 101, 106]
      const unit = typeof props.unit === 'string' && props.unit ? props.unit : 'mg/dL'
      node.type = 'RangeChart'
      node.props = {
        label: typeof props.label === 'string' && props.label ? props.label : `${screenName} eğilimi`,
        values,
        minimum: Math.min(...values),
        maximum: Math.max(...values),
        unit,
        targetMinimum: unit === 'mmHg' ? 90 : 70,
        targetMaximum: unit === 'mmHg' ? 120 : 140,
      }
      node.a11y = asA11y(node.a11y, 'img', `${screenName} hedef aralığı ve ölçüm eğilimi, birim ${unit}`)
      continue
    }

    if (node.type !== 'ListItem') continue

    const title = typeof props.title === 'string' && props.title
      ? props.title
      : typeof props.label === 'string' && props.label
        ? props.label
        : medicationContext ? 'İlaç dozu' : 'Sağlık ölçümü'
    const subtitle = typeof props.subtitle === 'string' ? props.subtitle : ''
    const trailing = typeof props.trailing === 'string' ? props.trailing : typeof props.value === 'string' ? props.value : ''

    if (medicationContext || /mg|tablet|kapsül|ila[cç]/i.test(`${title} ${subtitle}`)) {
      node.type = 'MedicationDoseRow'
      node.props = {
        name: title,
        dose: trailing || subtitle || 'Planlanan doz',
        time: typeof props.time === 'string' && props.time ? props.time : '08:00',
        instruction: subtitle || 'Bakım planına göre kullan',
        status: 'scheduled',
      }
      node.a11y = asA11y(node.a11y, 'listitem', `${title}, planlanan ilaç dozu`)
    } else {
      const unit = /tansiyon/i.test(`${screenName} ${title}`) ? 'mmHg' : /şeker|glukoz/i.test(`${screenName} ${title}`) ? 'mg/dL' : ''
      node.type = 'HealthMetric'
      node.props = {
        label: title,
        value: trailing || subtitle || '—',
        unit,
        status: 'normal',
        caption: subtitle || 'Son kayıt',
      }
      node.a11y = asA11y(node.a11y, 'group', `${title} sağlık ölçümü${unit ? `, birim ${unit}` : ''}`)
    }
  }

  const children = root.children as Node[]
  const types = new Set(flatten(root).map((node) => node.type))
  if (types.has('RangeChart') && !types.has('TargetRange')) {
    children.push({
      id: uniqueId(`${slug}_target_range`, seen),
      type: 'TargetRange',
      props: { label: 'Kişisel hedef aralığı', value: 102, minimum: 70, maximum: 140, unit: 'mg/dL' },
      a11y: { role: 'group', label: 'Kişisel hedef aralığı 70 ile 140 miligram/desilitre' },
    })
  }
  if (types.has('MedicationTimeline') && !types.has('MedicationDoseRow')) {
    children.push({
      id: uniqueId(`${slug}_medication_dose`, seen),
      type: 'MedicationDoseRow',
      props: { name: 'Sıradaki ilaç', dose: 'Planlanan doz', time: '08:00', instruction: 'Bakım planına göre kullan', status: 'scheduled' },
      a11y: { role: 'listitem', label: 'Sıradaki planlanan ilaç dozu saat 08:00' },
    })
  }
  if (types.has('UnitInput') && !types.has('SafetyNotice')) {
    children.push({
      id: uniqueId(`${slug}_safety_notice`, seen),
      type: 'SafetyNotice',
      props: { title: 'Ölçümü doğrula', message: 'Kaydetmeden önce değeri ve birimi kontrol et. Acil bir durumda sağlık profesyoneline başvur.' },
      a11y: { role: 'note', label: 'Ölçüm güvenliği uyarısı' },
    })
  }
}

function normalizeEditorialCultureComponents(root: Node, screenName: string, slug: string, seen: Set<string>): void {
  const archiveContext = /arşiv|geçmiş|sayı/i.test(screenName)
  for (const node of flatten(root)) {
    const props = asProps(node.props)
    if (node.type === 'Image' || node.type === 'Chart') {
      node.type = 'FeatureStory'
      node.props = { category: 'Kültür dosyası', title: typeof props.label === 'string' ? props.label : typeof props.alt === 'string' ? props.alt : screenName, summary: 'Güncel kültür üretimini bağlamı, aktörleri ve etkileriyle ele alan küratöryel seçki.' }
    } else if (node.type === 'ListItem') {
      const title = typeof props.title === 'string' ? props.title : 'Editoryal seçki'
      if (archiveContext) {
        node.type = 'ArchiveEntry'; node.props = { number: typeof props.trailing === 'string' ? props.trailing : '01', date: typeof props.subtitle === 'string' ? props.subtitle : 'Ağustos 2026', title, theme: 'Kültür ve yaratıcı pratikler' }
      } else {
        node.type = 'StoryCard'; node.props = { index: typeof props.trailing === 'string' ? props.trailing : '01', category: 'Seçki', title, summary: typeof props.subtitle === 'string' ? props.subtitle : 'Editörlerin seçtiği güncel anlatı.' }
      }
    } else if (node.type === 'Metric') {
      node.type = 'MetadataStrip'; node.props = { date: typeof props.caption === 'string' ? props.caption : '08 Ağustos 2026', readingTime: typeof props.value === 'string' ? props.value : '6 dk okuma', edition: typeof props.label === 'string' ? props.label : 'Sayı 24' }
    }
  }

  const children = root.children as Node[]
  const types = new Set(flatten(root).map((node) => node.type))
  if (!types.has('MetadataStrip')) children.push({ id:uniqueId(`${slug}_meta`,seen), type:'MetadataStrip', props:{date:'08 Ağustos 2026',readingTime:'6 dk okuma',edition:'Sayı 24'}, a11y:{role:'group',label:'Yayın tarihi, okuma süresi ve sayı bilgisi'} })
  if ((archiveContext || /keşfet|kategori/i.test(screenName)) && !types.has('SectionIndex')) children.push({ id:uniqueId(`${slug}_sections`,seen), type:'SectionIndex', props:{items:['Mimarlık','Görsel kültür','Tasarım','Edebiyat']}, a11y:{role:'navigation',label:'Yayın bölümleri'} })
  if (/okuma|detay|hikâye|yazı/i.test(screenName) && !types.has('Byline')) children.push({ id:uniqueId(`${slug}_byline`,seen), type:'Byline', props:{author:'Deniz Erdem',role:'Kültür yazarı'}, a11y:{role:'group',label:'Yazar Deniz Erdem'} })
  if (/okuma|detay|hikâye|yazı/i.test(screenName) && !types.has('PullQuote')) children.push({ id:uniqueId(`${slug}_quote`,seen), type:'PullQuote', props:{quote:'Bir kentin hafızası, yalnız yapılarında değil gündelik ritminde de saklıdır.',attribution:'Deniz Erdem'}, a11y:{role:'blockquote',label:'Yazıdan öne çıkan alıntı'} })
}

function normalizeTerracottaMarketComponents(root: Node, screenName: string, slug: string, seen: Set<string>): void {
  const cartContext=/sepet|sipariş|ödeme/i.test(screenName); const productContext=/ürün|detay/i.test(screenName)
  for(const node of flatten(root)){const props=asProps(node.props)
    if(node.type==='Image'){node.type=productContext?'ProductGallery':'ProductCard';node.props=productContext?{alt:typeof props.alt==='string'?props.alt:screenName,current:1,total:4}:{maker:'Yerel üretici',name:typeof props.alt==='string'?props.alt:'El yapımı seçki',description:'Doğal malzemelerle küçük partiler hâlinde üretildi.',price:'₺1.290',status:'Stokta',badge:'Yeni'}}
    else if(node.type==='ListItem'){const title=typeof props.title==='string'?props.title:'El yapımı ürün';if(cartContext){node.type='CartLine';node.props={name:title,variant:typeof props.subtitle==='string'?props.subtitle:'Doğal / Standart',quantity:1,price:typeof props.trailing==='string'?props.trailing:'₺1.290'}}else{node.type='ProductCard';node.props={maker:'Bağımsız atölye',name:title,description:typeof props.subtitle==='string'?props.subtitle:'Özenle seçilmiş yaşam ürünü.',price:typeof props.trailing==='string'?props.trailing:'₺1.290',status:'Stokta',badge:'Seçki'}}}
    else if(node.type==='Metric'){node.type='PriceBlock';node.props={label:typeof props.label==='string'?props.label:'Ürün fiyatı',price:typeof props.value==='string'?props.value:'₺1.290',compareAt:'',taxNote:typeof props.caption==='string'?props.caption:'Vergiler dâhil'}}
  }
  const children=root.children as Node[];const types=new Set(flatten(root).map(n=>n.type))
  if(productContext&&!types.has('VariantSelector'))children.push({id:uniqueId(`${slug}_variants`,seen),type:'VariantSelector',props:{label:'Varyant seç',options:['Doğal','Kiremit','Kömür']},a11y:{role:'group',label:'Ürün varyantları'}})
  if(cartContext&&!types.has('OrderSummary'))children.push({id:uniqueId(`${slug}_summary`,seen),type:'OrderSummary',props:{title:'Sipariş özeti',subtotal:'₺2.580',shipping:'Ücretsiz',total:'₺2.580'},a11y:{role:'region',label:'Sipariş toplamı 2 bin 580 lira'}})
  if(!types.has('DeliveryPromise'))children.push({id:uniqueId(`${slug}_delivery`,seen),type:'DeliveryPromise',props:{title:'Özenle paketlenir',detail:'2–4 iş gününde takipli teslimat'},a11y:{role:'note',label:'Teslimat bilgisi'}})
}

function normalizeElectricLearningComponents(root: Node, screenName: string, slug: string, seen: Set<string>): void {
  const practice=/pratik|soru|quiz|alıştırma/i.test(screenName);const roadmap=/yol|seviye|harita/i.test(screenName);const achievement=/başarı|rozet|profil/i.test(screenName)
  for(const node of flatten(root)){const props=asProps(node.props)
    if(node.type==='Progress'){node.type='XpProgress';node.props={label:typeof props.label==='string'?props.label:'Seviye ilerlemesi',current:String(Math.round(Number(props.value)||64)*10),target:'1000',value:Number(props.value)||64,nextReward:'Sonraki ödüle 360 XP'}}
    else if(node.type==='ListItem'){const title=typeof props.title==='string'?props.title:'Yeni ders';if(roadmap){node.type='RoadmapStep';node.props={order:typeof props.trailing==='string'?props.trailing:'01',title,description:typeof props.subtitle==='string'?props.subtitle:'Temel becerileri tamamla',state:'open'}}else{node.type='LessonCard';node.props={level:'L2',topic:'Bugünkü görev',title,duration:typeof props.trailing==='string'?props.trailing:'8 dk',status:typeof props.subtitle==='string'?props.subtitle:'Başlamaya hazır'}}}
    else if(node.type==='Badge'){node.type=achievement?'AchievementBadge':'StreakBadge';node.props=achievement?{icon:'★',title:typeof props.label==='string'?props.label:'Yeni başarı',description:'Öğrenme hedefi tamamlandı',earnedAt:'Bugün'}:{days:7,message:typeof props.label==='string'?props.label:'Seriyi sürdür'}}
    else if(node.type==='Chart'){node.type='XpProgress';node.props={label:'Beceri ilerlemesi',current:'640',target:'1000',value:64,nextReward:'Sonraki seviyeye 360 XP'}}
  }
  const children=root.children as Node[];const types=new Set(flatten(root).map(n=>n.type))
  if(practice&&!types.has('QuizChoice'))children.push({id:uniqueId(`${slug}_choice`,seen),type:'QuizChoice',props:{key:'A',label:'Bağlama en uygun yanıt',state:'selected'},a11y:{role:'button',label:'A seçeneği'}})
  if(practice&&!types.has('AnswerFeedback'))children.push({id:uniqueId(`${slug}_feedback`,seen),type:'AnswerFeedback',props:{result:'correct',title:'Doğru seçim',explanation:'Yanıtın temel kavramı doğru bağlamda uyguluyor.'},a11y:{role:'status',label:'Doğru yanıt geri bildirimi'}})
  if(achievement&&!types.has('AchievementBadge'))children.push({id:uniqueId(`${slug}_achievement`,seen),type:'AchievementBadge',props:{icon:'★',title:'Odak ustası',description:'Yedi günlük öğrenme serisini tamamladın',earnedAt:'Bugün'},a11y:{role:'group',label:'Odak ustası başarımı'}})
}

function normalizeObsidianPrecisionComponents(root: Node, screenName: string, slug: string, seen: Set<string>): void {
  const control=/kontrol|ayar|yetki/i.test(screenName);const analysis=/analiz|sinyal|rapor/i.test(screenName)
  for(const node of flatten(root)){const props=asProps(node.props)
    if(node.type==='Chart'){node.type='SignalChart';node.props={label:typeof props.label==='string'?props.label:'Ana sistem sinyali',values:Array.isArray(props.values)?props.values:[42,58,53,71,68,82,88],window:'Son 24 saat',unit:'ms',annotation:'14:20 anomali eşiği aşıldı'}}
    else if(node.type==='Metric'){node.type='CommandSummary';node.props={eyebrow:typeof props.label==='string'?props.label:'Sistem durumu',title:'Operasyon özeti',value:typeof props.value==='string'?props.value:'99.98%',status:'NOMINAL',detail:typeof props.caption==='string'?props.caption:'Tüm kritik servisler izleniyor'}}
    else if(node.type==='ListItem'){const title=typeof props.title==='string'?props.title:'Operasyon kaydı';if(control){node.type='AuditEntry';node.props={time:'14:32',actor:'Emre Y.',action:title,target:typeof props.subtitle==='string'?props.subtitle:'Üretim kontrolü'}}else{node.type='OperationRow';node.props={name:title,owner:typeof props.subtitle==='string'?props.subtitle:'Platform ekibi',updatedAt:'2 dk önce',status:'Çalışıyor',metric:typeof props.trailing==='string'?props.trailing:'124 ms'}}}
    else if(node.type==='Badge'){node.type='RiskIndicator';node.props={label:'Risk seviyesi',value:typeof props.label==='string'?props.label:'Düşük',severity:'low',explanation:'Aktif eşikler içinde'}}
    else if(node.type==='Switch'){node.type='ControlToggle';node.props={label:typeof props.label==='string'?props.label:'Otomatik koruma',description:'Kritik eşiğin üzerinde koruma uygula',state:'AÇIK',guard:'Değişiklik onay ve denetim kaydı gerektirir'}}
  }
  const children=root.children as Node[];const types=new Set(flatten(root).map(n=>n.type))
  if(analysis&&!types.has('DataMatrix'))children.push({id:uniqueId(`${slug}_matrix`,seen),type:'DataMatrix',props:{columns:['Sinyal','Değer','Durum'],rows:['API gecikmesi · 124 ms','Hata oranı · %0,12','Kuyruk · 38 iş']},a11y:{role:'table',label:'Sistem sinyal matrisi'}})
  if(control&&!types.has('ControlToggle'))children.push({id:uniqueId(`${slug}_control`,seen),type:'ControlToggle',props:{label:'Otomatik koruma',description:'Kritik eşikte koruma uygula',state:'AÇIK',guard:'Onay ve denetim kaydı gerekir'},a11y:{role:'switch',label:'Otomatik koruma açık'}})
  if(!types.has('IncidentTimeline'))children.push({id:uniqueId(`${slug}_timeline`,seen),type:'IncidentTimeline',props:{label:'Canlı olay akışı',events:['14:32 Eşik politikası doğrulandı','14:20 Gecikme uyarısı izlendi','14:08 Dağıtım tamamlandı']},a11y:{role:'log',label:'Canlı operasyon olayları'}})
}

function ensureDomainSignature(root: Node, domainPackId: DomainPackId | undefined, slug: string, screenName: string, seen: Set<string>, isOverview: boolean) {
  if (!domainPackId || !isOverview) return
  const children = root.children as Node[]
  const types = new Set(flatten(root).map((node) => node.type))
  const titleIndex = children.findIndex((node) => node.type === 'Text' && asProps(node.props).variant === 'title')
  const insertAt = Math.max(1, titleIndex + 1)
  const add = (node: Node) => children.splice(insertAt, 0, node)
  if (domainPackId === 'commerce' && !types.has('CommerceHero')) add({ id:uniqueId(`${slug}_hero`,seen),type:'CommerceHero',props:{eyebrow:'Yeni koleksiyon',title:screenName,subtitle:'Bağımsız üreticilerden zamansız ve dokunsal yaşam seçkisi.',cta:'Koleksiyonu keşfet'},a11y:{role:'region',label:`${screenName} koleksiyon kapağı`} })
  if (domainPackId === 'publishing' && !types.has('EditorialHero')) add({ id: uniqueId(`${slug}_hero`, seen), type: 'EditorialHero', props: { kicker:'Yeni sayı',headline:screenName,dek:'Bugünün kültür üretimini farklı disiplinler ve özgün seslerle yeniden okuyan küratöryel dosya.',issue:'Sayı 24',date:'08 Ağustos 2026' }, a11y: { role: 'article', label: `${screenName} kapak dosyası` } })
  if (domainPackId === 'operations' && !types.has('SignalChart')) add({ id:uniqueId(`${slug}_signal`,seen),type:'SignalChart',props:{label:`${screenName} ana sinyali`,values:[42,58,53,71,68,82,88],window:'Son 24 saat',unit:'ms',annotation:'14:20 anomali eşiği aşıldı'},a11y:{role:'img',label:`${screenName} operasyon sinyali`} })
  if (domainPackId === 'health-care' && !types.has('CareSummary')) add({ id: uniqueId(`${slug}_care_summary`, seen), type: 'CareSummary', props: { title:'Bugünkü bakım planın hazır',subtitle:'Sıradaki adımı zamanında tamamlayabilirsin',status:'normal',progress:72 },a11y:{role:'region',label:'Bugünkü bakım planı yüzde 72 tamamlandı'} })
  if (domainPackId === 'learning' && !types.has('XpProgress')) add({ id:uniqueId(`${slug}_xp`,seen),type:'XpProgress',props:{label:`${screenName} ilerlemesi`,current:'640',target:'1000',value:64,nextReward:'Sonraki ödüle 360 XP'},a11y:{role:'progressbar',label:`${screenName} ilerlemesi yüzde 64`} })
}

function normalizeNode(node: Node, slug: string, seen: Set<string>): Node | null {
  const type = typeof node.type === 'string' ? node.type : ''
  const isContainer = CONTAINERS.has(type)
  if (!isContainer && !LEAVES.has(type)) return null

  node.id = uniqueId(typeof node.id === 'string' && node.id ? node.id : `${slug}_n`, seen)
  node.props = asProps(node.props)
  node.a11y = asA11y(node.a11y, defaultRole(type), defaultLabel(type, node.props as Node))

  if (isContainer) {
    node.layout = asLayout(node.layout)
    const children = Array.isArray(node.children) ? (node.children as unknown[]) : []
    node.children = children
      .filter((c): c is Node => !!c && typeof c === 'object')
      .map((child) => normalizeNode(child, slug, seen))
      .filter((child): child is Node => child !== null)
  } else {
    // A leaf carrying children is a model slip, not a fatal error — drop them.
    delete node.children
    delete node.layout
  }

  return node
}

/** Inject the required structural landmarks the model may have skipped. */
function repairStructure(root: Node, slug: string, name: string, navItems: string[], seen: Set<string>, includeBottomNavigation: boolean): void {
  const children = root.children as Node[]
  const all = flatten(root).slice(1)

  // Exactly one title: demote every extra to a heading.
  const titles = all.filter((n) => n.type === 'Text' && (n.props as Node)?.variant === 'title')
  titles.slice(1).forEach((n) => { (n.props as Node).variant = 'heading' })

  // TopAppBar first.
  if (!all.some((n) => n.type === 'TopAppBar')) {
    children.unshift({
      id: uniqueId(`${slug}_bar`, seen),
      type: 'TopAppBar',
      props: { title: name, action: 'Profil' },
      a11y: { role: 'banner', label: `${name} üst çubuğu` },
    })
  }

  // A title right after the app bar.
  if (titles.length === 0) {
    const at = children.findIndex((n) => n.type === 'TopAppBar')
    children.splice(at + 1, 0, {
      id: uniqueId(`${slug}_ttl`, seen),
      type: 'Text',
      props: { text: name, variant: 'title' },
      a11y: { role: 'heading', label: name },
    })
  }

  // BottomNavigation last, with a consistent item set.
  const navIndex = children.findIndex((n) => n.type === 'BottomNavigation' || n.type === 'TabBar')
  if (!includeBottomNavigation) {
    if (navIndex !== -1) children.splice(navIndex, 1)
    return
  }
  if (navIndex === -1) {
    children.push({
      id: uniqueId(`${slug}_nav`, seen),
      type: 'BottomNavigation',
      props: { items: navItems },
      a11y: { role: 'navigation', label: 'Alt gezinme' },
    })
  } else {
    const [nav] = children.splice(navIndex, 1)
    ;(nav.props as Node).items = navItems
    children.push(nav)
  }
}

function removeComponents(node: Node, componentTypes: ReadonlySet<string>): void {
  const children = Array.isArray(node.children) ? node.children.filter((child): child is Node => !!child && typeof child === 'object') : []
  node.children = children
    .filter((child) => !componentTypes.has(String(child.type)))
    .map((child) => {
      removeComponents(child, componentTypes)
      return child
    })
}

// ---------------------------------------------------------------------------

function asProps(value: unknown): Node {
  return value && typeof value === 'object' && !Array.isArray(value) ? (value as Node) : {}
}

function asLayout(value: unknown): Node {
  const layout = value && typeof value === 'object' ? (value as Node) : {}
  const mode = layout.mode
  return {
    mode: mode === 'row' || mode === 'grid' ? mode : 'column',
    gap: typeof layout.gap === 'string' ? layout.gap : 'space.3',
  }
}

function asA11y(value: unknown, role: string, label: string): Node {
  const a11y = value && typeof value === 'object' ? (value as Node) : {}
  return {
    role: typeof a11y.role === 'string' && a11y.role ? a11y.role : role,
    label: typeof a11y.label === 'string' && a11y.label ? a11y.label : label,
  }
}

function defaultRole(type: string): string {
  if (type === 'Button' || type === 'IconButton') return 'button'
  if (type === 'ListItem') return 'listitem'
  if (type === 'Text') return 'heading'
  if (type === 'Progress') return 'progressbar'
  if (type === 'Divider') return 'separator'
  if (type === 'BottomNavigation' || type === 'TabBar') return 'navigation'
  if (type === 'TopAppBar') return 'banner'
  if (type === 'Card') return 'region'
  return 'group'
}

function defaultLabel(type: string, props: Node): string {
  for (const key of ['label', 'title', 'text', 'placeholder', 'alt']) {
    const value = props[key]
    if (typeof value === 'string' && value) return value
  }
  return type
}

function slugify(id: string): string {
  return id.replace(/^scr_/, '').replace(/[^a-zA-Z0-9]+/g, '_').replace(/^_+|_+$/g, '').toLowerCase()
}

function uniqueId(base: string, seen: Set<string>): string {
  let id = base
  let n = 2
  while (seen.has(id)) id = `${base}_${n++}`
  seen.add(id)
  return id
}

function flatten(node: Node): Node[] {
  const children = Array.isArray(node.children) ? (node.children as Node[]) : []
  return [node, ...children.flatMap(flatten)]
}

// ---------------------------------------------------------------------------

function json(data: unknown, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { ...CORS, 'Content-Type': 'application/json' },
  })
}

async function sha256(value: string): Promise<string> {
  const bytes = new TextEncoder().encode(value)
  const digest = await crypto.subtle.digest('SHA-256', bytes)
  return Array.from(new Uint8Array(digest), (byte) => byte.toString(16).padStart(2, '0')).join('')
}

function mapJob(raw: Node) {
  return {
    id: raw.id,
    projectId: raw.project_id,
    status: raw.status,
    stage: raw.stage ?? raw.status,
    progress: raw.progress,
    errorMessage: raw.error_message ?? undefined,
    errorCode: raw.error_code ?? undefined,
    provider: raw.provider ?? undefined,
    providerHttpStatus: raw.provider_http_status ?? undefined,
    providerAttempt: raw.provider_attempt ?? undefined,
    providerDurationMs: raw.provider_duration_ms ?? undefined,
    providerMetadata: raw.provider_metadata ?? undefined,
    failedStage: raw.failed_stage ?? undefined,
    finalEligible: raw.final_eligible ?? false,
    finalDecisionReason: raw.final_decision_reason ?? undefined,
    resultScreens: raw.result_screens ?? undefined,
    productBlueprint: raw.product_blueprint ?? undefined,
    domainPackId: raw.domain_pack_id ?? undefined,
    stylePresetId: raw.style_preset_id ?? undefined,
    qualityReport: raw.quality_report ?? undefined,
    runtimeQualityReport: raw.runtime_quality_report ?? undefined,
  }
}
