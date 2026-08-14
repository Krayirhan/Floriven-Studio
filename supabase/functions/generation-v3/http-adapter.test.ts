import { describe, expect, it } from 'vitest'
import { handleV3GenerationGet, handleV3GenerationPost, runV3GenerationJob, type V3HttpDeps, type V3JobStore } from './http-adapter.ts'
import type { V3GenerationPostRequest, V3JobRecord } from './http-contract.ts'
import type { V3PlanningProvider } from './planning-pipeline.ts'

function createInMemoryJobStore(): V3JobStore & { records: Map<string, V3JobRecord> } {
  const records = new Map<string, V3JobRecord>()
  let nextId = 1
  return {
    records,
    async findByIdempotencyKey(projectId, idempotencyKey) {
      for (const record of records.values()) if (record.projectId === projectId && record.idempotencyKey === idempotencyKey) return record
      return null
    },
    async findById(jobId) { return records.get(jobId) ?? null },
    async insert(input) {
      const record: V3JobRecord = { ...input, id: `job_${nextId}` }
      nextId += 1
      records.set(record.id, record)
      return record
    },
    async update(jobId, patch) {
      const existing = records.get(jobId)
      if (!existing) return
      records.set(jobId, { ...existing, ...patch })
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
const componentCapabilities = {
  version: '1.0.0', screenJobId: 'weekly-schedule',
  regions: [
    { regionId: 'region-calendar', selectedComponents: ['Calendar'], justification: [
      { capability: 'display', component: 'Calendar', reason: 'Haftalık blokları görselleştirir' },
      { capability: 'inspect', component: 'Calendar', reason: 'Bloğa dokunarak detay gösterir' },
      { capability: 'schedule', component: 'Calendar', reason: 'Ziyareti başka bloğa taşımayı destekler' },
    ] },
    { regionId: 'region-visit-details', selectedComponents: ['Card'], justification: [
      { capability: 'display', component: 'Card', reason: 'Proje bilgisini özetler' },
    ] },
  ],
}
const layoutPlan = {
  version: '1.0.0', screenJobId: 'weekly-schedule',
  regions: [
    { regionId: 'region-calendar', mode: 'column', density: 'comfortable', emphasis: 'primary', nodes: [{ id: 'node-calendar', component: 'Calendar', order: 1, size: 'fill' }] },
    { regionId: 'region-visit-details', mode: 'column', density: 'compact', emphasis: 'support', nodes: [{ id: 'node-visit-card', component: 'Card', order: 1, size: 'hug' }] },
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
      nodes: [{ nodeId: 'node-calendar', component: 'Calendar', fields: [
        { field: 'title', value: 'Salı 14:00 Ahşap Villa saha ziyareti' },
        { field: 'subtitle', value: 'Bu hafta planlanan ziyaret zamanı: Salı 14:00' },
      ] }],
      emptyStateMessage: 'Bu hafta için planlanmış saha ziyareti yok',
      loadingStateMessage: 'Haftalık takvim yükleniyor',
      errorStateMessage: null,
    },
    {
      regionId: 'region-visit-details',
      nodes: [{ nodeId: 'node-visit-card', component: 'Card', fields: [{ field: 'projectName', value: 'Proje adı: Ahşap Villa Yenileme' }] }],
      emptyStateMessage: null, loadingStateMessage: null, errorStateMessage: null,
    },
  ],
}
function respond(operation: string): string {
  if (operation === 'product_model') return JSON.stringify(product)
  if (operation === 'screen_jobs') return JSON.stringify(jobs)
  if (operation === 'ux_structure') return JSON.stringify(uxStructure)
  if (operation === 'component_capabilities') return JSON.stringify(componentCapabilities)
  if (operation === 'layout_plan') return JSON.stringify(layoutPlan)
  return JSON.stringify(contentPlan)
}
const workingProvider: V3PlanningProvider = { completeJson: async ({ operation }) => respond(operation) }
const brokenProvider: V3PlanningProvider = { completeJson: async () => 'not json' }

type TestDeps = V3HttpDeps & { jobs: ReturnType<typeof createInMemoryJobStore>; scheduledWork: Array<() => Promise<void>> }

function createDeps(provider: V3PlanningProvider): TestDeps {
  let correlationCounter = 0
  const scheduledWork: Array<() => Promise<void>> = []
  return {
    jobs: createInMemoryJobStore(),
    provider,
    schedule: (work) => { scheduledWork.push(work) },
    now: () => '2026-01-01T00:00:00.000Z',
    newCorrelationId: () => `corr-${(correlationCounter += 1)}`,
    scheduledWork,
  }
}

async function runScheduled(deps: TestDeps): Promise<void> {
  while (deps.scheduledWork.length) {
    const next = deps.scheduledWork.shift()
    if (next) await next()
  }
}

const validRequest: V3GenerationPostRequest = {
  projectId: 'prj_1', brief: 'Mimarlar için proje ve saha takvimi', platform: 'ios',
  idempotencyKey: 'a'.repeat(20), jobToken: 'b'.repeat(40),
}

describe('handleV3GenerationPost', () => {
  it('queues a job and completes it once the scheduled work runs', async () => {
    const deps = createDeps(workingProvider)
    const queued = await handleV3GenerationPost(validRequest, deps)
    expect(queued.ok).toBe(true)
    if (!queued.ok) return
    expect(queued.status).toBe(202)
    expect(queued.body.status).toBe('queued')

    await runScheduled(deps)

    const finalRecord = await deps.jobs.findById(queued.body.jobId)
    expect(finalRecord?.status).toBe('completed')
    expect(finalRecord?.acceptedDesignSpec?.screens).toHaveLength(1)
  })

  it('replays the same job for the same Idempotency-Key and payload instead of creating a second one', async () => {
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

  it('rejects a replay attempt carrying the wrong job token', async () => {
    const deps = createDeps(workingProvider)
    await handleV3GenerationPost(validRequest, deps)
    const result = await handleV3GenerationPost({ ...validRequest, jobToken: 'c'.repeat(40) }, deps)
    expect(result.ok).toBe(false)
    if (!result.ok) expect(result.status).toBe(403)
  })

  it('rejects an invalid Idempotency-Key format', async () => {
    const deps = createDeps(workingProvider)
    const result = await handleV3GenerationPost({ ...validRequest, idempotencyKey: 'short' }, deps)
    expect(result.ok).toBe(false)
    if (!result.ok) expect(result.status).toBe(400)
  })

  it('rejects a job token shorter than 32 characters', async () => {
    const deps = createDeps(workingProvider)
    const result = await handleV3GenerationPost({ ...validRequest, jobToken: 'short' }, deps)
    expect(result.ok).toBe(false)
    if (!result.ok) expect(result.status).toBe(403)
  })

  it('rejects an empty projectId or brief', async () => {
    const deps = createDeps(workingProvider)
    expect((await handleV3GenerationPost({ ...validRequest, projectId: '  ' }, deps)).ok).toBe(false)
    expect((await handleV3GenerationPost({ ...validRequest, brief: '' }, deps)).ok).toBe(false)
  })

  it('rejects a requestedScreenCount outside 1-12', async () => {
    const deps = createDeps(workingProvider)
    const result = await handleV3GenerationPost({ ...validRequest, requestedScreenCount: 13 }, deps)
    expect(result.ok).toBe(false)
    if (!result.ok) expect(result.status).toBe(400)
  })

  it('marks the job failed with a safe, code-only error when planning fails — never leaking the raw provider response', async () => {
    const deps = createDeps(brokenProvider)
    const queued = await handleV3GenerationPost(validRequest, deps)
    await runScheduled(deps)
    if (!queued.ok) throw new Error('expected queued')
    const record = await deps.jobs.findById(queued.body.jobId)
    expect(record?.status).toBe('failed')
    expect(record?.errorCode).toBe('V3_PRODUCT_MODEL_FAILED')
    expect(record?.errorMessage).not.toContain('not json')
  })
})

describe('handleV3GenerationGet', () => {
  it('returns the job snapshot for the correct job token', async () => {
    const deps = createDeps(workingProvider)
    const queued = await handleV3GenerationPost(validRequest, deps)
    if (!queued.ok) throw new Error('expected queued')
    const result = await handleV3GenerationGet({ jobId: queued.body.jobId, jobToken: validRequest.jobToken }, deps)
    expect(result.ok).toBe(true)
    if (result.ok) expect(result.body.jobId).toBe(queued.body.jobId)
  })

  it('rejects the wrong job token', async () => {
    const deps = createDeps(workingProvider)
    const queued = await handleV3GenerationPost(validRequest, deps)
    if (!queued.ok) throw new Error('expected queued')
    const result = await handleV3GenerationGet({ jobId: queued.body.jobId, jobToken: 'z'.repeat(40) }, deps)
    expect(result.ok).toBe(false)
    if (!result.ok) expect(result.status).toBe(403)
  })

  it('returns 404 for an unknown job id', async () => {
    const deps = createDeps(workingProvider)
    const result = await handleV3GenerationGet({ jobId: 'job_does_not_exist', jobToken: validRequest.jobToken }, deps)
    expect(result.ok).toBe(false)
    if (!result.ok) expect(result.status).toBe(404)
  })
})

describe('runV3GenerationJob', () => {
  it('is a no-op when the job record no longer exists', async () => {
    const deps = createDeps(workingProvider)
    await expect(runV3GenerationJob('missing-job', validRequest, deps)).resolves.toBeUndefined()
  })
})
