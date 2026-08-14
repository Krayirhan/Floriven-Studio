import { type AcceptedDesignSpec, type Platform } from './accepted-design-spec.ts'

export const V3_JOB_STATUSES = ['queued', 'processing', 'completed', 'failed'] as const
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
  /** `Idempotency-Key` header — same key + same payload returns the prior job; a different payload is a 409. */
  idempotencyKey: string
  /** `X-Job-Token` header — client-generated secret; server stores only its hash and requires it again on GET. */
  jobToken: string
}

export type V3GenerationGetRequest = {
  jobId: string
  jobToken: string
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
  acceptedDesignSpec: AcceptedDesignSpec | null
  createdAt: string
}
