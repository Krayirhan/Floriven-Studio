import { type AcceptedDesignSpec, type Platform } from './accepted-design-spec.ts'
import { type V3PlanningOutput, type V3PlanningState } from './planning-pipeline.ts'
import { type RuntimeCaptureMetrics } from './render-critics.ts'

export const V3_JOB_STATUSES = ['queued', 'processing', 'awaiting_render', 'render_verifying', 'completed', 'failed'] as const
export type V3JobStatus = typeof V3_JOB_STATUSES[number]

/** RFC 9457 Problem Details (docs/03-engineering/API_SPEC.md — "Hata formatı"). Never carries PII, stack traces, raw prompts or provider output. */
export type ProblemDetails = {
  type: string
  title: string
  status: number
  code: string
  correlationId: string
  detail: string[]
}

export type HttpResult<T> = { ok: true; status: number; body: T } | { ok: false; status: number; body: ProblemDetails }

export type V3GenerationPostRequest = {
  projectId: string
  brief: string
  platform: Platform
  locale?: string
  deviceProfile?: string
  requestedScreenCount?: number
  /** `Idempotency-Key` header — same key + same payload within a project returns the prior job; a different payload is a 409. */
  idempotencyKey: string
  /** `X-Job-Token` header — client-generated secret; server stores only its hash and requires it again on GET as an additional capability check. */
  jobToken: string
}

export type V3GenerationGetRequest = {
  jobId: string
  jobToken: string
}

export type V3ScreenRenderEvidence = {
  screenJobId: string
  screenId: string
  rendererVersion: string
  contentHash: string
  viewport: { width: number; height: number }
  metrics: RuntimeCaptureMetrics
  screenshotHash?: string
}

export type V3SubmitRenderEvidenceRequest = {
  jobId: string
  jobToken: string
  evidence: V3ScreenRenderEvidence[]
}

export type V3GenerationEditRequest = {
  jobId: string
  jobToken: string
  screenId: string
  /** Free-text revision instruction from the user — the server plans and validates the actual patches; the client never computes them. */
  instruction: string
  expectedRevision: number
}

export type V3JobSnapshot = {
  jobId: string
  projectId: string
  correlationId: string
  status: V3JobStatus
  stage: string
  progress: number
  errorCode?: string
  errorMessage?: string
  acceptedDesignSpec?: AcceptedDesignSpec
}

/** Persisted job row — the storage-layer shape a real Supabase table would mirror column-for-column. */
export type V3JobRecord = {
  id: string
  projectId: string
  correlationId: string
  idempotencyKey: string
  inputHash: string
  jobTokenHash: string
  status: V3JobStatus
  stage: string
  progress: number
  errorCode: string | null
  errorMessage: string | null
  // Original request fields, persisted so a resumed run (triggered from a GET, which only carries
  // jobId + jobToken) can reconstruct the planning input without the client resending it.
  brief: string
  platform: Platform
  locale: string | null
  deviceProfile: string | null
  requestedScreenCount: number | null
  /** Checkpoint after every single work item (see planning-pipeline.ts's V3PlanningState) — what makes a run resumable across as many separate invocations as it takes, each safely inside Supabase's own execution ceiling. Null once compiled into planningOutput. */
  planningState?: V3PlanningState | null
  planningOutput?: V3PlanningOutput | null
  acceptedDesignSpec: AcceptedDesignSpec | null
  createdAt: string
  updatedAt: string
}
