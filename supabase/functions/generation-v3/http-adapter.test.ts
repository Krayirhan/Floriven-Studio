import { describe, expect, it } from 'vitest'
import {
  advanceV3GenerationJob, handleV3GenerationEdit, handleV3GenerationGet, handleV3GenerationPost, handleV3SubmitRenderEvidence,
  type V3HttpDeps, type V3JobStore,
} from './http-adapter.ts'
import type { V3GenerationPostRequest, V3JobRecord, V3ScreenRenderEvidence } from './http-contract.ts'
import type { V3PlanningProvider } from './planning-pipeline.ts'

function createInMemoryJobStore(now: () => string): V3JobStore & { records: Map<string, V3JobRecord> } {
  const records = new Map<string, V3JobRecord>()
  let nextId = 1
  return {
    records,
    async findByIdempotencyKey(projectId, idempotencyKey) {
      for (const record of records.values()) {
        if (record.projectId === projectId && record.idempotencyKey === idempotencyKey) return record
      }
      return null
    },
    async findById(jobId) { return records.get(jobId) ?? null },
    async insert(input) {
      const record: V3JobRecord = { ...input, id: `job_${nextId}`, updatedAt: now() }
      nextId += 1
      records.set(record.id, record)
      return record
    },
    async update(jobId, patch) {
      const existing = records.get(jobId)
      if (!existing) return
      records.set(jobId, { ...existing, ...patch, updatedAt: now() })
    },
  }
}

const product = {
  version: '1.0.0', productName: 'MimarFlow', domain: 'mimarlık proje yönetimi', audience: 'Bağımsız mimarlar',
  actors: [{ id: 'architect', name: 'Mimar', goals: ['Projeleri zamanında teslim etmek'] }],
  entities: [{ id: 'project', name: 'Proje', states: ['planlandı', 'aktif', 'tamamlandı'], actions: ['oluştur', 'planla', 'teslim et'] }],
  capabilities: ['Proje planlama', 'Saha ziyareti yönetimi'], vocabulary: ['proje', 'saha ziyareti', 'teslim tarihi'], constraints: ['Mobil kullanım'],
}
const jobs = {
  version: '1.0.0', jobs: [
    { id: 'weekly-schedule', name: 'Haftalık Takvim', userJob: 'Saha ziyaretlerini haftalık saat bloklarında planlamak', actorId: 'architect', entityIds: ['project'], requiredData: ['ziyaret zamanı', 'proje adı'], requiredInteractions: ['inspect', 'schedule'], completionCriteria: ['Boş ve dolu saatler ayırt edilebilir', 'Ziyaret farklı saate taşınabilir'], entryPoints: ['Ana navigasyon'], destinationJobIds: [], priority: 'primary' },
  ],
}
const uxStructure = {
  version: '1.0.0', screenJobId: 'weekly-schedule',
  regions: [
    { id: 'region-calendar', task: 'Haftalık saat bloklarını göster ve ziyaretleri yerleştir', dataBindings: ['ziyaret zamanı'], states: ['ready', 'loading', 'empty'] },
    { id: 'region-visit-details', task: 'Seçili ziyaretin proje bilgisini özetle', dataBindings: ['proje adı'], states: ['ready'] },
  ],
  informationHierarchy: ['region-calendar', 'region-visit-details'],
  actions: [
    { id: 'action-inspect', regionId: 'region-calendar', interaction: 'inspect', intent: 'Bir zaman bloğuna dokunarak ziyaret detayını incele' },
    { id: 'action-schedule', regionId: 'region-calendar', interaction: 'schedule', intent: 'Ziyareti başka bir zaman bloğuna taşı' },
  ],
  flow: [
    { order: 1, actionId: 'action-inspect', description: 'Kullanıcı bir zaman bloğuna dokunur ve ziyaret detayını görür' },
    { order: 2, actionId: 'action-schedule', description: 'Kullanıcı ziyareti yeni bir zaman bloğuna taşır' },
  ],
  completionEvidence: [
    { criterion: 'Boş ve dolu saatler ayırt edilebilir', regionId: 'region-calendar', evidence: 'Dolu bloklar farklı durumda, boş bloklar ayrı durumda görünür' },
    { criterion: 'Ziyaret farklı saate taşınabilir', regionId: 'region-calendar', evidence: 'Taşıma sonrası ziyaret yeni blokta görünür' },
  ],
  navigation: { entryPoints: ['Ana navigasyon'], destinationJobIds: [], exitIntent: 'Kullanıcı başka bir haftaya geçmek için takvimden çıkabilir' },
  responsive: [
    { regionId: 'region-calendar', narrowBehavior: 'Gün bazlı tek sütun akışına geçer', wideBehavior: 'Haftalık çoklu sütun görünümünde kalır' },
    { regionId: 'region-visit-details', narrowBehavior: 'Takvimin altına taşınır', wideBehavior: 'Takvimin yanında sabit kalır' },
  ],
  accessibility: [
    { regionId: 'region-calendar', role: 'birincil etkileşim alanı', focusOrder: 1, announcement: 'Haftalık takvim bölgesi odaklandı' },
    { regionId: 'region-visit-details', role: 'destekleyici bilgi alanı', focusOrder: 2, announcement: 'Ziyaret detay özeti odaklandı' },
  ],
}
const layoutPlan = {
  version: '1.0.0', screenJobId: 'weekly-schedule',
  regions: [
    { regionId: 'region-calendar', mode: 'column', density: 'comfortable', emphasis: 'primary', nodes: [{ id: 'node-calendar', component: 'Calendar', order: 1, size: 'fill' }] },
    { regionId: 'region-visit-details', mode: 'column', density: 'compact', emphasis: 'support', nodes: [{ id: 'node-visit-card', component: 'Text', order: 1, size: 'hug' }] },
  ],
  responsive: [
    { regionId: 'region-calendar', breakpoint: 'narrow', mode: 'column', visible: true },
    { regionId: 'region-calendar', breakpoint: 'wide', mode: 'column', visible: true },
    { regionId: 'region-visit-details', breakpoint: 'narrow', mode: 'column', visible: true },
    { regionId: 'region-visit-details', breakpoint: 'wide', mode: 'row', visible: true },
  ],
  navigation: null,
}
const contentPlan = {
  version: '1.0.0', screenJobId: 'weekly-schedule',
  regions: [
    {
      regionId: 'region-calendar',
      nodes: [{
        nodeId: 'node-calendar', component: 'Calendar',
        props: {
          label: 'Haftalık Saha Ziyaret Takvimi',
          days: ['Pzt 10', 'Sal 11', 'Çar 12', 'Per 13', 'Cum 14'],
          events: ['Salı 14:00 Ahşap Villa saha ziyaret zamanı'],
        },
      }],
      emptyStateMessage: 'Bu hafta için planlanmış saha ziyareti yok',
      loadingStateMessage: 'Haftalık takvim yükleniyor',
      errorStateMessage: null,
    },
    {
      regionId: 'region-visit-details',
      nodes: [{
        nodeId: 'node-visit-card', component: 'Text',
        props: {
          text: 'Proje adı: Ahşap Villa Yenileme — Ahşap kompozit ve iç mekan tasarımı',
        },
      }],
      emptyStateMessage: null, loadingStateMessage: null, errorStateMessage: null,
    },
  ],
}
const patchPlan = {
  version: '1.0.0',
  patches: [
    {
      op: 'replace_props',
      screenId: 'scr_weekly-schedule',
      nodeId: 'node_weekly-schedule_node-calendar',
      props: { label: 'Güncellenmiş Takvim Başlığı' },
    },
  ],
}

// component_capabilities is no longer requested from the provider — see deriveComponentCapabilities.
function respond(operation: string): string {
  if (operation === 'product_model') return JSON.stringify(product)
  if (operation === 'screen_jobs') return JSON.stringify(jobs)
  if (operation === 'ux_structure') return JSON.stringify(uxStructure)
  if (operation === 'layout_plan') return JSON.stringify(layoutPlan)
  if (operation === 'patch_plan') return JSON.stringify(patchPlan)
  return JSON.stringify(contentPlan)
}
const workingProvider: V3PlanningProvider = { completeJson: async ({ operation }) => respond(operation) }

type TestDeps = V3HttpDeps & {
  jobs: ReturnType<typeof createInMemoryJobStore>
  scheduledWork: Array<() => Promise<void>>
  /** Moves the fake clock forward — lets a test simulate "N minutes since the last checkpoint" without a real sleep. */
  advanceClock: (ms: number) => void
}

function createDeps(provider: V3PlanningProvider): TestDeps {
  let correlationCounter = 0
  let currentTimeMs = Date.parse('2026-01-01T00:00:00.000Z')
  const scheduledWork: Array<() => Promise<void>> = []
  const now = () => new Date(currentTimeMs).toISOString()
  return {
    jobs: createInMemoryJobStore(now),
    provider,
    schedule: (work) => { scheduledWork.push(work) },
    now,
    newCorrelationId: () => `corr-${(correlationCounter += 1)}`,
    scheduledWork,
    advanceClock: (ms) => { currentTimeMs += ms },
  }
}

async function runScheduled(deps: TestDeps): Promise<void> {
  while (deps.scheduledWork.length) {
    const next = deps.scheduledWork.shift()
    if (next) await next()
  }
}

const validRequest: V3GenerationPostRequest = {
  projectId: 'prj_1',
  brief: 'Mimarlar için proje ve saha takvimi',
  platform: 'ios',
  idempotencyKey: 'a'.repeat(20),
  jobToken: 'b'.repeat(40),
}

const validEvidence: V3ScreenRenderEvidence = {
  screenJobId: 'weekly-schedule',
  screenId: 'scr_weekly-schedule',
  rendererVersion: 'phone-screen-v4',
  contentHash: '',
  viewport: { width: 390, height: 844 },
  metrics: {
    screenJobId: 'weekly-schedule',
    viewport: { width: 390, height: 844 },
    visibleNodeCount: 12,
    sectionCount: 2,
    sectionAreaCoveragePct: 60,
    verticalOccupancyPct: 70,
    nodeDensityPer100kPx: 6,
    sectionHeightVariancePct: 20,
  },
}

describe('Generation V3 state machine & live render evidence verification', () => {
  it('planning transitions to awaiting_render with preliminary NOT_VERIFIED DesignSpec', async () => {
    const deps = createDeps(workingProvider)
    const queued = await handleV3GenerationPost(validRequest, deps)
    expect(queued.ok).toBe(true)
    if (!queued.ok) return

    await runScheduled(deps)

    const record = await deps.jobs.findById(queued.body.jobId)
    expect(record?.status).toBe('awaiting_render')
    expect(record?.progress).toBe(80)
    expect(record?.acceptedDesignSpec?.metadata.renderEvidence).toBe('NOT_VERIFIED')
    expect(record?.acceptedDesignSpec?.metadata.releaseEligible).toBe(false)
  })

  it('submitting valid render evidence transitions job to completed with VERIFIED', async () => {
    const deps = createDeps(workingProvider)
    const queued = await handleV3GenerationPost(validRequest, deps)
    if (!queued.ok) throw new Error('expected queued')

    await runScheduled(deps)

    const result = await handleV3SubmitRenderEvidence({
      jobId: queued.body.jobId,
      jobToken: validRequest.jobToken,
      evidence: [validEvidence],
    }, deps)

    expect(result.ok).toBe(true)
    if (result.ok) {
      expect(result.body.status).toBe('completed')
      expect(result.body.progress).toBe(100)
      expect(result.body.acceptedDesignSpec?.metadata.renderEvidence).toBe('VERIFIED')
      expect(result.body.acceptedDesignSpec?.metadata.releaseEligible).toBe(true)
    }
  })

  it('rejects evidence with failing visual hierarchy metrics (e.g. sectionCount < 2)', async () => {
    const deps = createDeps(workingProvider)
    const queued = await handleV3GenerationPost(validRequest, deps)
    if (!queued.ok) throw new Error('expected queued')

    await runScheduled(deps)

    const failingEvidence: V3ScreenRenderEvidence = {
      ...validEvidence,
      metrics: {
        ...validEvidence.metrics,
        sectionCount: 1, // fails critic
      },
    }

    const result = await handleV3SubmitRenderEvidence({
      jobId: queued.body.jobId,
      jobToken: validRequest.jobToken,
      evidence: [failingEvidence],
    }, deps)

    expect(result.ok).toBe(false)
    if (!result.ok) {
      expect(result.status).toBe(422)
      expect(result.body.code).toBe('V3_RENDER_VERIFICATION_FAILED')
    }

    const record = await deps.jobs.findById(queued.body.jobId)
    expect(record?.status).toBe('failed')
    expect(record?.errorCode).toBe('V3_RENDER_VERIFICATION_FAILED')
  })

  it('rejects evidence carrying a non-canonical renderer version fail-closed', async () => {
    const deps = createDeps(workingProvider)
    const queued = await handleV3GenerationPost(validRequest, deps)
    if (!queued.ok) throw new Error('expected queued')

    await runScheduled(deps)

    const badVersionEvidence: V3ScreenRenderEvidence = {
      ...validEvidence,
      rendererVersion: 'unknown-renderer-v1',
    }

    const result = await handleV3SubmitRenderEvidence({
      jobId: queued.body.jobId,
      jobToken: validRequest.jobToken,
      evidence: [badVersionEvidence],
    }, deps)

    expect(result.ok).toBe(false)
    if (!result.ok) expect(result.status).toBe(422)
  })

  it('rejects evidence with missing screens fail-closed', async () => {
    const deps = createDeps(workingProvider)
    const queued = await handleV3GenerationPost(validRequest, deps)
    if (!queued.ok) throw new Error('expected queued')

    await runScheduled(deps)

    const result = await handleV3SubmitRenderEvidence({
      jobId: queued.body.jobId,
      jobToken: validRequest.jobToken,
      evidence: [], // empty evidence
    }, deps)

    expect(result.ok).toBe(false)
    if (!result.ok) expect(result.status).toBe(422)
  })

  it('rejects evidence submission when job is not in awaiting_render state', async () => {
    const deps = createDeps(workingProvider)
    const queued = await handleV3GenerationPost(validRequest, deps)
    if (!queued.ok) throw new Error('expected queued')

    // Still queued / processing, not awaiting_render yet
    const result = await handleV3SubmitRenderEvidence({
      jobId: queued.body.jobId,
      jobToken: validRequest.jobToken,
      evidence: [validEvidence],
    }, deps)

    expect(result.ok).toBe(false)
    if (!result.ok) expect(result.status).toBe(409)
  })
})

describe('handleV3GenerationPost request validation & idempotency', () => {
  it('rejects a missing projectId', async () => {
    const deps = createDeps(workingProvider)
    const result = await handleV3GenerationPost({ ...validRequest, projectId: '' }, deps)
    expect(result.ok).toBe(false)
    if (!result.ok) expect(result.body.code).toBe('V3_INVALID_REQUEST')
  })

  it('rejects an invalid job token', async () => {
    const deps = createDeps(workingProvider)
    const result = await handleV3GenerationPost({ ...validRequest, jobToken: 'short' }, deps)
    expect(result.ok).toBe(false)
    if (!result.ok) expect(result.body.code).toBe('V3_INVALID_JOB_TOKEN')
  })

  it('replays the same job for the same Idempotency-Key and payload', async () => {
    const deps = createDeps(workingProvider)
    const first = await handleV3GenerationPost(validRequest, deps)
    const second = await handleV3GenerationPost(validRequest, deps)
    expect(deps.jobs.records.size).toBe(1)
    expect(second.ok && second.status).toBe(200)
    if (first.ok && second.ok) expect(second.body.jobId).toBe(first.body.jobId)
  })

  it('rejects the same Idempotency-Key reused with a different payload', async () => {
    const deps = createDeps(workingProvider)
    await handleV3GenerationPost(validRequest, deps)
    const result = await handleV3GenerationPost({ ...validRequest, brief: 'Farklı bir brief' }, deps)
    expect(result.ok).toBe(false)
    if (!result.ok) expect(result.status).toBe(409)
  })

  it('rejects a different job token reusing the same Idempotency-Key', async () => {
    const deps = createDeps(workingProvider)
    await handleV3GenerationPost(validRequest, deps)
    const result = await handleV3GenerationPost({ ...validRequest, jobToken: 'z'.repeat(40) }, deps)
    expect(result.ok).toBe(false)
    if (!result.ok) expect(result.body.code).toBe('V3_JOB_ACCESS_DENIED')
  })
})

describe('handleV3GenerationGet job-token capability check', () => {
  it('returns the job snapshot when the job token matches', async () => {
    const deps = createDeps(workingProvider)
    const queued = await handleV3GenerationPost(validRequest, deps)
    if (!queued.ok) throw new Error('expected queued')

    const result = await handleV3GenerationGet({ jobId: queued.body.jobId, jobToken: validRequest.jobToken }, deps)
    expect(result.ok).toBe(true)
    if (result.ok) expect(result.body.jobId).toBe(queued.body.jobId)
  })

  it('rejects the wrong job token with 403', async () => {
    const deps = createDeps(workingProvider)
    const queued = await handleV3GenerationPost(validRequest, deps)
    if (!queued.ok) throw new Error('expected queued')

    const result = await handleV3GenerationGet({ jobId: queued.body.jobId, jobToken: 'z'.repeat(40) }, deps)
    expect(result.ok).toBe(false)
    if (!result.ok) expect(result.status).toBe(403)
  })

  it('rejects an unknown job id with 404', async () => {
    const deps = createDeps(workingProvider)
    const result = await handleV3GenerationGet({ jobId: 'job_missing', jobToken: validRequest.jobToken }, deps)
    expect(result.ok).toBe(false)
    if (!result.ok) expect(result.status).toBe(404)
  })
})

describe('handleV3GenerationEdit', () => {
  it('successfully applies a typed patch and increments revision to 2', async () => {
    const deps = createDeps(workingProvider)
    const queued = await handleV3GenerationPost(validRequest, deps)
    if (!queued.ok) throw new Error('expected queued')

    await runScheduled(deps)

    const editResult = await handleV3GenerationEdit({
      jobId: queued.body.jobId,
      jobToken: validRequest.jobToken,
      screenId: 'scr_weekly-schedule',
      instruction: 'Takvim başlığını güncelle',
      expectedRevision: 1,
    }, deps)

    expect(editResult.ok).toBe(true)
    if (editResult.ok) {
      expect(editResult.body.acceptedDesignSpec?.metadata.revision).toBe(2)
    }
  })

  it('rejects an edit with a stale revision with 409 conflict', async () => {
    const deps = createDeps(workingProvider)
    const queued = await handleV3GenerationPost(validRequest, deps)
    if (!queued.ok) throw new Error('expected queued')

    await runScheduled(deps)

    const editResult = await handleV3GenerationEdit({
      jobId: queued.body.jobId,
      jobToken: validRequest.jobToken,
      screenId: 'scr_weekly-schedule',
      instruction: 'Takvim başlığını güncelle',
      expectedRevision: 99, // Stale revision
    }, deps)

    expect(editResult.ok).toBe(false)
    if (!editResult.ok) {
      expect(editResult.status).toBe(409)
      expect(editResult.body.code).toBe('V3_CONCURRENCY_CONFLICT')
    }
  })

  it('rejects an edit against a job with no design spec yet with 409', async () => {
    const deps = createDeps(workingProvider)
    const queued = await handleV3GenerationPost(validRequest, deps)
    if (!queued.ok) throw new Error('expected queued')

    // Not scheduled yet — job has no acceptedDesignSpec
    const editResult = await handleV3GenerationEdit({
      jobId: queued.body.jobId,
      jobToken: validRequest.jobToken,
      screenId: 'scr_weekly-schedule',
      instruction: 'Takvim başlığını güncelle',
      expectedRevision: 1,
    }, deps)

    expect(editResult.ok).toBe(false)
    if (!editResult.ok) expect(editResult.status).toBe(409)
  })

  it('rejects an edit whose instruction is empty', async () => {
    const deps = createDeps(workingProvider)
    const queued = await handleV3GenerationPost(validRequest, deps)
    if (!queued.ok) throw new Error('expected queued')
    await runScheduled(deps)

    const editResult = await handleV3GenerationEdit({
      jobId: queued.body.jobId,
      jobToken: validRequest.jobToken,
      screenId: 'scr_weekly-schedule',
      instruction: '  ',
      expectedRevision: 1,
    }, deps)

    expect(editResult.ok).toBe(false)
    if (!editResult.ok) expect(editResult.body.code).toBe('V3_INVALID_REQUEST')
  })

  it('rejects an edit against an unknown screenId', async () => {
    const deps = createDeps(workingProvider)
    const queued = await handleV3GenerationPost(validRequest, deps)
    if (!queued.ok) throw new Error('expected queued')
    await runScheduled(deps)

    const editResult = await handleV3GenerationEdit({
      jobId: queued.body.jobId,
      jobToken: validRequest.jobToken,
      screenId: 'scr_does_not_exist',
      instruction: 'Takvim başlığını güncelle',
      expectedRevision: 1,
    }, deps)

    expect(editResult.ok).toBe(false)
    if (!editResult.ok) expect(editResult.body.code).toBe('V3_INVALID_REQUEST')
  })
})

describe('Resumable execution — the guarantee that a run of any length eventually completes', () => {
  it('completes correctly across many separate advanceV3GenerationJob calls (simulated invocations), each doing exactly one work item', async () => {
    // Proves the whole pipeline finishes even when *zero* invocation is ever allowed to do more
    // than a single work item — the exact shape a real Supabase execution-ceiling kill would force
    // every invocation into.
    const deps = createDeps(workingProvider)
    const queued = await handleV3GenerationPost(validRequest, deps)
    if (!queued.ok) throw new Error('expected queued')
    deps.scheduledWork.length = 0 // discard the auto-scheduled advance; drive it manually below, one item at a time

    let invocations = 0
    let record = await deps.jobs.findById(queued.body.jobId)
    while (record && (record.status === 'queued' || record.status === 'processing')) {
      invocations += 1
      await advanceV3GenerationJob(queued.body.jobId, deps, 0) // budgetMs: 0 — never more than one item
      record = await deps.jobs.findById(queued.body.jobId)
      if (invocations > 20) throw new Error('resumable execution did not converge — likely stuck')
    }

    expect(record?.status).toBe('awaiting_render')
    expect(invocations).toBe(5) // product_model, screen_jobs, ux_structure, layout_plan, content_plan
    expect(record?.planningState).toBeFalsy() // cleared once compiled into planningOutput
    expect(record?.planningOutput?.designSpecScreens).toHaveLength(1)
  })

  it('GET nudges a processing job forward when its checkpoint is old enough, without waiting for a poll timeout', async () => {
    const deps = createDeps(workingProvider)
    const queued = await handleV3GenerationPost(validRequest, deps)
    if (!queued.ok) throw new Error('expected queued')
    deps.scheduledWork.length = 0 // discard the auto-scheduled advance

    // Run exactly one item manually so the job is genuinely "processing" with a real checkpoint.
    await advanceV3GenerationJob(queued.body.jobId, deps, 0)
    const midway = await deps.jobs.findById(queued.body.jobId)
    expect(midway?.status).toBe('processing')

    deps.advanceClock(10_000) // 10s since the last checkpoint — past CONTINUATION_MIN_GAP_MS, nowhere near STALE_JOB_THRESHOLD_MS
    const polled = await handleV3GenerationGet({ jobId: queued.body.jobId, jobToken: validRequest.jobToken }, deps)
    expect(polled.ok).toBe(true)
    expect(deps.scheduledWork.length).toBe(1) // GET scheduled a continuation

    await runScheduled(deps)
    const advanced = await deps.jobs.findById(queued.body.jobId)
    // Real default budget — the scheduled continuation runs the rest of the pipeline to completion.
    expect(advanced?.status).toBe('awaiting_render')
  })

  it('GET does not pile up a second continuation when one just ran (checkpoint too fresh)', async () => {
    const deps = createDeps(workingProvider)
    const queued = await handleV3GenerationPost(validRequest, deps)
    if (!queued.ok) throw new Error('expected queued')
    deps.scheduledWork.length = 0

    await advanceV3GenerationJob(queued.body.jobId, deps, 0)
    // No clock advance — checkpoint is "fresh" from the client's point of view.
    const polled = await handleV3GenerationGet({ jobId: queued.body.jobId, jobToken: validRequest.jobToken }, deps)
    expect(polled.ok).toBe(true)
    expect(deps.scheduledWork.length).toBe(0)
  })

  it('GET resolves a job to V3_PROCESSING_TIMEOUT once its checkpoint has genuinely gone stale', async () => {
    const deps = createDeps(workingProvider)
    const queued = await handleV3GenerationPost(validRequest, deps)
    if (!queued.ok) throw new Error('expected queued')
    deps.scheduledWork.length = 0

    await advanceV3GenerationJob(queued.body.jobId, deps, 0)
    deps.advanceClock(4 * 60 * 1000) // 4 minutes — past STALE_JOB_THRESHOLD_MS (3 minutes)

    const polled = await handleV3GenerationGet({ jobId: queued.body.jobId, jobToken: validRequest.jobToken }, deps)
    expect(polled.ok).toBe(true)
    if (polled.ok) {
      expect(polled.body.status).toBe('failed')
      expect(polled.body.errorCode).toBe('V3_PROCESSING_TIMEOUT')
    }
    expect(deps.scheduledWork.length).toBe(0) // a job just marked failed is not also re-scheduled
  })

  it('advanceV3GenerationJob is a safe no-op on an already-terminal job (no duplicate work, no crash)', async () => {
    const deps = createDeps(workingProvider)
    const queued = await handleV3GenerationPost(validRequest, deps)
    if (!queued.ok) throw new Error('expected queued')
    await runScheduled(deps)
    const completedOnce = await deps.jobs.findById(queued.body.jobId)
    expect(completedOnce?.status).toBe('awaiting_render')

    await advanceV3GenerationJob(queued.body.jobId, deps) // should just return immediately
    const stillSame = await deps.jobs.findById(queued.body.jobId)
    expect(stillSame).toEqual(completedOnce)
  })
})
