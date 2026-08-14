import { acceptDesignSpec, DesignSpecAcceptanceError, type AcceptedDesignSpecInput } from './accepted-design-spec.ts'
import { sha256Hex, stableStringify } from './crypto-utils.ts'
import {
  type HttpResult, type ProblemDetails, type V3GenerationGetRequest, type V3GenerationPostRequest,
  type V3JobRecord, type V3JobSnapshot,
} from './http-contract.ts'
import { runV3Planning, V3PlanningError, type V3PlanningProvider } from './planning-pipeline.ts'

export type BackgroundScheduler = (work: () => Promise<void>) => void

export type V3JobStore = {
  findByIdempotencyKey(projectId: string, idempotencyKey: string): Promise<V3JobRecord | null>
  findById(jobId: string): Promise<V3JobRecord | null>
  insert(record: Omit<V3JobRecord, 'id'>): Promise<V3JobRecord>
  update(jobId: string, patch: Partial<Omit<V3JobRecord, 'id' | 'projectId' | 'idempotencyKey' | 'jobTokenHash' | 'createdAt'>>): Promise<void>
}

export type V3HttpDeps = {
  jobs: V3JobStore
  provider: V3PlanningProvider
  schedule: BackgroundScheduler
  now: () => string
  newCorrelationId: () => string
}

const IDEMPOTENCY_KEY_PATTERN = /^[a-zA-Z0-9_-]{16,128}$/

function problem(status: number, code: string, title: string, correlationId: string, detail: string[] = []): HttpResult<never> {
  const body: ProblemDetails = { type: `https://errors.floriven.dev/${code.toLowerCase()}`, title, status, code, correlationId, detail }
  return { ok: false, status, body }
}

function toSnapshot(record: V3JobRecord): V3JobSnapshot {
  return {
    jobId: record.id, projectId: record.projectId, correlationId: record.correlationId,
    status: record.status, stage: record.stage, progress: record.progress,
    ...(record.errorCode ? { errorCode: record.errorCode } : {}),
    ...(record.errorMessage ? { errorMessage: record.errorMessage } : {}),
    ...(record.acceptedDesignSpec ? { acceptedDesignSpec: record.acceptedDesignSpec } : {}),
  }
}

/**
 * POST /generation-v3/jobs equivalent. Validates the request, resolves idempotency the same way
 * as the V2 `generate` function (same Idempotency-Key + same payload replays the prior job; a
 * different payload is a 409), persists a queued job, and schedules the actual planning +
 * acceptance work in the background — mirroring supabase/functions/generate/async-job-contract.ts
 * so the async job/polling infrastructure genuinely carries over per ADR-0009.
 */
export async function handleV3GenerationPost(request: V3GenerationPostRequest, deps: V3HttpDeps): Promise<HttpResult<V3JobSnapshot>> {
  const correlationId = deps.newCorrelationId()

  if (!request.projectId.trim()) return problem(400, 'V3_INVALID_REQUEST', 'projectId is required', correlationId)
  if (!request.brief.trim() || request.brief.length > 12_000) return problem(400, 'V3_INVALID_REQUEST', 'brief must be 1-12000 characters', correlationId)
  if (request.requestedScreenCount !== undefined && (request.requestedScreenCount < 1 || request.requestedScreenCount > 12)) {
    return problem(400, 'V3_INVALID_REQUEST', 'requestedScreenCount must be between 1 and 12', correlationId)
  }
  if (!IDEMPOTENCY_KEY_PATTERN.test(request.idempotencyKey)) return problem(400, 'V3_INVALID_IDEMPOTENCY_KEY', 'a valid Idempotency-Key header is required', correlationId)
  if (request.jobToken.length < 32 || request.jobToken.length > 256) return problem(403, 'V3_INVALID_JOB_TOKEN', 'a valid X-Job-Token header is required', correlationId)

  const jobTokenHash = await sha256Hex(request.jobToken)
  const inputHash = await sha256Hex(stableStringify({
    projectId: request.projectId, brief: request.brief, platform: request.platform,
    locale: request.locale ?? null, deviceProfile: request.deviceProfile ?? null, requestedScreenCount: request.requestedScreenCount ?? null,
  }))

  const existing = await deps.jobs.findByIdempotencyKey(request.projectId, request.idempotencyKey)
  if (existing) {
    if (existing.jobTokenHash !== jobTokenHash) return problem(403, 'V3_JOB_ACCESS_DENIED', 'job access denied', correlationId)
    if (existing.inputHash !== inputHash) return problem(409, 'V3_IDEMPOTENCY_KEY_REUSED', 'Idempotency-Key was already used with a different request', correlationId)
    return { ok: true, status: 200, body: toSnapshot(existing) }
  }

  const record = await deps.jobs.insert({
    projectId: request.projectId, correlationId, idempotencyKey: request.idempotencyKey, inputHash, jobTokenHash,
    status: 'queued', stage: 'queued', progress: 0, errorCode: null, errorMessage: null, acceptedDesignSpec: null, createdAt: deps.now(),
  })

  deps.schedule(() => runV3GenerationJob(record.id, request, deps))

  return { ok: true, status: 202, body: toSnapshot(record) }
}

/** GET /generation-v3/jobs/{id} equivalent — same token-hash re-check as V2's job read path. */
export async function handleV3GenerationGet(request: V3GenerationGetRequest, deps: V3HttpDeps): Promise<HttpResult<V3JobSnapshot>> {
  const correlationId = deps.newCorrelationId()
  if (request.jobToken.length < 32) return problem(403, 'V3_INVALID_JOB_TOKEN', 'a valid X-Job-Token header is required', correlationId)

  const record = await deps.jobs.findById(request.jobId)
  if (!record) return problem(404, 'V3_JOB_NOT_FOUND', 'job not found', correlationId)

  const jobTokenHash = await sha256Hex(request.jobToken)
  if (record.jobTokenHash !== jobTokenHash) return problem(403, 'V3_JOB_ACCESS_DENIED', 'job access denied', correlationId)

  return { ok: true, status: 200, body: toSnapshot(record) }
}

/** Background worker: runs the full planning + acceptance pipeline and persists the outcome. Never throws — always resolves after updating the job record. */
export async function runV3GenerationJob(jobId: string, request: V3GenerationPostRequest, deps: V3HttpDeps): Promise<void> {
  const record = await deps.jobs.findById(jobId)
  if (!record) return
  await deps.jobs.update(jobId, { status: 'processing', stage: 'planning' })

  try {
    const planning = await runV3Planning({ brief: request.brief, correlationId: record.correlationId, ...(request.requestedScreenCount !== undefined ? { requestedScreenCount: request.requestedScreenCount } : {}) }, deps.provider)
    await deps.jobs.update(jobId, { stage: 'accepting' })

    const acceptanceInput: AcceptedDesignSpecInput = {
      projectId: request.projectId, platform: request.platform, locale: request.locale ?? 'tr-TR', deviceProfile: request.deviceProfile ?? 'phone-default', acceptedAt: deps.now(),
    }
    const accepted = await acceptDesignSpec(planning, acceptanceInput)
    await deps.jobs.update(jobId, { status: 'completed', stage: 'completed', progress: 100, acceptedDesignSpec: accepted })
  } catch (error) {
    const { code, message } = mapErrorToJobFailure(error)
    await deps.jobs.update(jobId, { status: 'failed', stage: 'failed', progress: 100, errorCode: code, errorMessage: message })
  }
}

function mapErrorToJobFailure(error: unknown): { code: string; message: string } {
  if (error instanceof V3PlanningError) return { code: `V3_${error.stage.toUpperCase()}_FAILED`, message: error.issues.join('; ') }
  if (error instanceof DesignSpecAcceptanceError) return { code: 'V3_ACCEPTANCE_FAILED', message: error.issues.join('; ') }
  return { code: 'V3_INTERNAL_ERROR', message: 'An unexpected error occurred' }
}
