import { acceptDesignSpec, DesignSpecAcceptanceError, type AcceptedDesignSpecInput } from './accepted-design-spec.ts'
import { sha256Hex, stableStringify } from './crypto-utils.ts'
import {
  type HttpResult, type ProblemDetails, type V3GenerationEditRequest, type V3GenerationGetRequest, type V3GenerationPostRequest,
  type V3JobRecord, type V3JobSnapshot, type V3SubmitRenderEvidenceRequest,
} from './http-contract.ts'
import { applyV3Patches, PatchConcurrencyError, PatchValidationError } from './patch-engine.ts'
import { patchPlanMessages } from './prompts.ts'
import { validatePatchPlan } from './patch-planner.ts'
import { runV3Planning, V3PlanningError, V3ProviderError, type V3PlanningProvider } from './planning-pipeline.ts'
import { evaluateRenderCritics, type RenderCriticsReport } from './render-critics.ts'
import { parseStrictJsonObject } from './validation.ts'

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
const CANONICAL_RENDERER_VERSION = 'phone-screen-v4'
/** Generous upper bound for the whole planning pipeline even with a slow fallback provider — well past this, the background run is presumed killed rather than merely slow. */
const PROCESSING_TIMEOUT_MS = 4 * 60 * 1000

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
 *
 * There is no tenant/workspace or credit system wired in yet — the product has no user login flow
 * today, so gating on Supabase JWT auth or a per-tenant credit ledger would only add fail-open code
 * against tables that don't exist. Access control is the same capability-token model V2 uses:
 * possession of the client-generated X-Job-Token is what authorizes reading a job.
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
    status: 'queued', stage: 'queued', progress: 0, errorCode: null, errorMessage: null, planningOutput: null, acceptedDesignSpec: null, createdAt: deps.now(),
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

  // A background run killed mid-flight by the platform's own execution ceiling (observed live: a
  // slow provider chain blew past it) never gets to update its own record — it would otherwise
  // stay "processing" forever with no error and no way for the client to know to stop polling.
  if (record.status === 'processing' && Date.now() - Date.parse(record.createdAt) > PROCESSING_TIMEOUT_MS) {
    await deps.jobs.update(record.id, {
      status: 'failed', stage: 'failed', progress: 100,
      errorCode: 'V3_PROCESSING_TIMEOUT',
      errorMessage: 'The job exceeded the maximum processing time and was presumed lost.',
    })
    const timedOut = await deps.jobs.findById(record.id)
    return { ok: true, status: 200, body: toSnapshot(timedOut ?? record) }
  }

  return { ok: true, status: 200, body: toSnapshot(record) }
}

/**
 * POST /generation-v3/jobs/{id}/render-evidence.
 * Submits live browser DOM geometry evidence captured by the client. Re-scores it with
 * `evaluateRenderCritics` and transitions the job to `completed` or `failed`. This is the only
 * path that can move a job out of `awaiting_render` — the server never marks a screen verified
 * on its own claim.
 */
export async function handleV3SubmitRenderEvidence(
  request: V3SubmitRenderEvidenceRequest,
  deps: V3HttpDeps,
): Promise<HttpResult<V3JobSnapshot>> {
  const correlationId = deps.newCorrelationId()
  if (request.jobToken.length < 32) return problem(403, 'V3_INVALID_JOB_TOKEN', 'a valid X-Job-Token header is required', correlationId)

  const record = await deps.jobs.findById(request.jobId)
  if (!record) return problem(404, 'V3_JOB_NOT_FOUND', 'job not found', correlationId)

  const jobTokenHash = await sha256Hex(request.jobToken)
  if (record.jobTokenHash !== jobTokenHash) return problem(403, 'V3_JOB_ACCESS_DENIED', 'job access denied', correlationId)

  if (record.status !== 'awaiting_render' || !record.planningOutput) {
    return problem(409, 'V3_INVALID_JOB_STATE', `job is not awaiting render evidence (current status: ${record.status})`, correlationId)
  }

  const planning = record.planningOutput
  const expectedScreenCount = planning.designSpecScreens.length

  if (!Array.isArray(request.evidence) || request.evidence.length !== expectedScreenCount) {
    return problem(422, 'V3_INVALID_RENDER_EVIDENCE', `expected evidence for ${expectedScreenCount} screens, got ${request.evidence?.length ?? 0}`, correlationId)
  }

  const reports: RenderCriticsReport[] = []
  const validationIssues: string[] = []

  for (const item of request.evidence) {
    if (item.rendererVersion !== CANONICAL_RENDERER_VERSION) {
      validationIssues.push(`screen ${item.screenJobId}: rendererVersion must be ${CANONICAL_RENDERER_VERSION} (got ${item.rendererVersion})`)
    }
    const compiledScreen = planning.designSpecScreens.find((s) => s.id === item.screenId)
    if (!compiledScreen) {
      validationIssues.push(`unknown screenId ${item.screenId}`)
      continue
    }
    const expectedHash = await sha256Hex(stableStringify(compiledScreen))
    if (item.contentHash && item.contentHash !== expectedHash) {
      validationIssues.push(`screen ${item.screenJobId}: contentHash mismatch`)
    }

    const report = evaluateRenderCritics(item.metrics)
    reports.push(report)
    if (!report.passed) {
      validationIssues.push(`screen ${item.screenJobId} render critic failed: ${report.violations.map((v) => v.code).join(', ')}`)
    }
  }

  if (validationIssues.length > 0) {
    await deps.jobs.update(request.jobId, {
      status: 'failed', stage: 'failed', progress: 100,
      errorCode: 'V3_RENDER_VERIFICATION_FAILED', errorMessage: validationIssues.join('; '),
    })
    return problem(422, 'V3_RENDER_VERIFICATION_FAILED', 'render verification critics did not pass', correlationId, validationIssues)
  }

  try {
    const acceptanceInput: AcceptedDesignSpecInput = {
      projectId: record.projectId, platform: 'ios', locale: 'tr-TR', deviceProfile: 'phone-default', acceptedAt: deps.now(), renderCritics: reports,
    }
    const verifiedSpec = await acceptDesignSpec(planning, acceptanceInput)

    await deps.jobs.update(request.jobId, { status: 'completed', stage: 'completed', progress: 100, acceptedDesignSpec: verifiedSpec })
    const updated = await deps.jobs.findById(request.jobId)
    return { ok: true, status: 200, body: toSnapshot(updated ?? record) }
  } catch (error) {
    const { code, message } = mapErrorToJobFailure(error)
    await deps.jobs.update(request.jobId, { status: 'failed', stage: 'failed', progress: 100, errorCode: code, errorMessage: message })
    return problem(422, code, message, correlationId)
  }
}

/** Background worker: runs the planning pipeline and parks the job at `awaiting_render` for the client to submit live DOM evidence. Never throws — always resolves after updating the job record. */
export async function runV3GenerationJob(jobId: string, request: V3GenerationPostRequest, deps: V3HttpDeps): Promise<void> {
  const record = await deps.jobs.findById(jobId)
  if (!record) return
  await deps.jobs.update(jobId, { status: 'processing', stage: 'planning' })

  try {
    const planning = await runV3Planning({
      brief: request.brief, correlationId: record.correlationId,
      ...(request.requestedScreenCount !== undefined ? { requestedScreenCount: request.requestedScreenCount } : {}),
      // Real stage/progress instead of the record sitting at "planning" for the whole run with no
      // visibility into where a slow or stuck run actually is.
      onProgress: async (stage, progress) => { await deps.jobs.update(jobId, { stage, progress }) },
    }, deps.provider)
    await deps.jobs.update(jobId, { stage: 'accepting' })

    const acceptanceInput: AcceptedDesignSpecInput = {
      projectId: request.projectId, platform: request.platform, locale: request.locale ?? 'tr-TR', deviceProfile: request.deviceProfile ?? 'phone-default', acceptedAt: deps.now(),
    }
    const preliminarySpec = await acceptDesignSpec(planning, acceptanceInput)

    await deps.jobs.update(jobId, {
      status: 'awaiting_render', stage: 'awaiting_render', progress: 80,
      planningOutput: planning, acceptedDesignSpec: preliminarySpec,
    })
  } catch (error) {
    const { code, message } = mapErrorToJobFailure(error)
    await deps.jobs.update(jobId, { status: 'failed', stage: 'failed', progress: 100, errorCode: code, errorMessage: message })
  }
}

/**
 * PATCH /generation-v3/jobs/{id}/edit.
 * The client sends a free-text revision instruction, never hand-computed patches — the server
 * plans the actual patch operations from the instruction (patchPlanMessages) and validates them
 * fail-closed, the same way every other planning stage works. Applies with optimistic concurrency
 * checking.
 */
export async function handleV3GenerationEdit(
  request: V3GenerationEditRequest,
  deps: V3HttpDeps,
): Promise<HttpResult<V3JobSnapshot>> {
  const correlationId = deps.newCorrelationId()
  if (request.jobToken.length < 32) return problem(403, 'V3_INVALID_JOB_TOKEN', 'a valid X-Job-Token header is required', correlationId)
  if (!request.instruction.trim() || request.instruction.length > 2_000) {
    return problem(400, 'V3_INVALID_REQUEST', 'instruction must be 1-2000 characters', correlationId)
  }

  const record = await deps.jobs.findById(request.jobId)
  if (!record) return problem(404, 'V3_JOB_NOT_FOUND', 'job not found', correlationId)

  const jobTokenHash = await sha256Hex(request.jobToken)
  if (record.jobTokenHash !== jobTokenHash) return problem(403, 'V3_JOB_ACCESS_DENIED', 'job access denied', correlationId)

  if (!record.acceptedDesignSpec) {
    return problem(409, 'V3_INVALID_JOB_STATE', 'job has no design spec to edit', correlationId)
  }

  const targetScreen = record.acceptedDesignSpec.screens.find((screen) => screen.id === request.screenId)
  if (!targetScreen) return problem(400, 'V3_INVALID_REQUEST', `screen ${request.screenId} not found in this job`, correlationId)

  let patches
  try {
    const raw = await deps.provider.completeJson({
      operation: 'patch_plan', messages: patchPlanMessages(targetScreen, request.instruction), correlationId, timeoutMs: 30_000,
    })
    const parsed = parseStrictJsonObject(raw)
    if (!parsed.ok) return problem(422, 'V3_PATCH_PLAN_FAILED', 'patch plan response was not valid JSON', correlationId, parsed.issues)
    const validated = validatePatchPlan(parsed.value)
    if (!validated.ok) return problem(422, 'V3_PATCH_PLAN_FAILED', 'patch plan did not match the expected shape', correlationId, validated.issues)
    patches = validated.value
  } catch (error) {
    const { code, message } = mapErrorToJobFailure(error)
    return problem(502, code, message, correlationId)
  }

  try {
    const { updatedSpec } = await applyV3Patches(record.acceptedDesignSpec, patches, request.expectedRevision)
    await deps.jobs.update(request.jobId, { acceptedDesignSpec: updatedSpec })
    const updated = await deps.jobs.findById(request.jobId)
    return { ok: true, status: 200, body: toSnapshot(updated ?? record) }
  } catch (error) {
    if (error instanceof PatchConcurrencyError) {
      return problem(409, 'V3_CONCURRENCY_CONFLICT', error.message, correlationId, [
        `expectedRevision: ${error.expectedRevision}`, `actualRevision: ${error.actualRevision}`,
      ])
    }
    if (error instanceof PatchValidationError) {
      return problem(422, 'V3_PATCH_VALIDATION_FAILED', error.message, correlationId, error.issues)
    }
    return problem(500, 'V3_INTERNAL_ERROR', 'Unexpected error applying patches', correlationId)
  }
}

function mapErrorToJobFailure(error: unknown): { code: string; message: string } {
  if (error instanceof V3PlanningError) return { code: `V3_${error.stage.toUpperCase()}_FAILED`, message: error.issues.join('; ') }
  if (error instanceof DesignSpecAcceptanceError) return { code: 'V3_ACCEPTANCE_FAILED', message: error.issues.join('; ') }
  if (error instanceof V3ProviderError) return { code: `V3_${error.code}`, message: `${error.provider}: ${error.message}` }
  return { code: 'V3_INTERNAL_ERROR', message: 'An unexpected error occurred' }
}
