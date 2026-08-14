import { type V3JobStore } from './http-adapter.ts'
import { type V3JobRecord } from './http-contract.ts'

/** Matches supabase/migrations/<timestamp>_generation_v3_jobs.sql column-for-column. */
type JobRow = {
  id: string
  project_id: string
  correlation_id: string
  idempotency_key: string
  input_hash: string
  job_token_hash: string
  status: V3JobRecord['status']
  stage: string
  progress: number
  error_code: string | null
  error_message: string | null
  accepted_design_spec: V3JobRecord['acceptedDesignSpec']
  created_at: string
}

type MaybeSingleResult = { data: JobRow | null; error: unknown }
type EqChain = { eq(column: string, value: string): EqChain; maybeSingle(): Promise<MaybeSingleResult> }

type SupabaseClientLike = {
  from(table: string): {
    select(columns: string): EqChain
    insert(row: Record<string, unknown>): { select(columns: string): { single(): Promise<MaybeSingleResult> } }
    update(row: Record<string, unknown>): { eq(column: string, value: string): Promise<{ error: unknown }> }
  }
}

function toRecord(row: JobRow): V3JobRecord {
  return {
    id: row.id, projectId: row.project_id, correlationId: row.correlation_id, idempotencyKey: row.idempotency_key,
    inputHash: row.input_hash, jobTokenHash: row.job_token_hash, status: row.status, stage: row.stage, progress: row.progress,
    errorCode: row.error_code, errorMessage: row.error_message, acceptedDesignSpec: row.accepted_design_spec, createdAt: row.created_at,
  }
}

/** Table-name-only Supabase implementation of V3JobStore — the same (project_id, idempotency_key) uniqueness and service-role-only access pattern as supabase/functions/generate's generation_jobs table (ADR-0009: job/idempotency infra is reused, not reinvented). */
export function createSupabaseV3JobStore(supabase: SupabaseClientLike, table = 'generation_v3_jobs'): V3JobStore {
  return {
    async findByIdempotencyKey(projectId, idempotencyKey) {
      const { data, error } = await supabase.from(table).select('*').eq('project_id', projectId).eq('idempotency_key', idempotencyKey).maybeSingle()
      if (error) throw error
      return data ? toRecord(data) : null
    },
    async findById(jobId) {
      const { data, error } = await supabase.from(table).select('*').eq('id', jobId).maybeSingle()
      if (error) throw error
      return data ? toRecord(data) : null
    },
    async insert(input) {
      const { data, error } = await supabase.from(table).insert({
        project_id: input.projectId, correlation_id: input.correlationId, idempotency_key: input.idempotencyKey,
        input_hash: input.inputHash, job_token_hash: input.jobTokenHash, status: input.status, stage: input.stage,
        progress: input.progress, error_code: input.errorCode, error_message: input.errorMessage, accepted_design_spec: input.acceptedDesignSpec,
      }).select('*').single()
      if (error || !data) throw error ?? new Error('generation_v3_jobs insert returned no row')
      return toRecord(data)
    },
    async update(jobId, patch) {
      const row: Record<string, unknown> = {}
      if (patch.status !== undefined) row.status = patch.status
      if (patch.stage !== undefined) row.stage = patch.stage
      if (patch.progress !== undefined) row.progress = patch.progress
      if (patch.errorCode !== undefined) row.error_code = patch.errorCode
      if (patch.errorMessage !== undefined) row.error_message = patch.errorMessage
      if (patch.acceptedDesignSpec !== undefined) row.accepted_design_spec = patch.acceptedDesignSpec
      const { error } = await supabase.from(table).update(row).eq('id', jobId)
      if (error) throw error
    },
  }
}
