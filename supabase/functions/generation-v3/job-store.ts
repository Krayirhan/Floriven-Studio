import { type V3JobStore } from './http-adapter.ts'
import { type V3JobRecord } from './http-contract.ts'

/** Matches supabase/migrations/20260814142642_create_generation_v3_jobs.sql + 20260814190000_generation_v3_render_evidence_flow.sql + 20260815000000_generation_v3_resumable_execution.sql column-for-column. */
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
  brief: string
  platform: V3JobRecord['platform']
  locale: string | null
  device_profile: string | null
  requested_screen_count: number | null
  planning_state: V3JobRecord['planningState']
  planning_output: V3JobRecord['planningOutput']
  accepted_design_spec: V3JobRecord['acceptedDesignSpec']
  created_at: string
  updated_at: string
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
    id: row.id,
    projectId: row.project_id,
    correlationId: row.correlation_id,
    idempotencyKey: row.idempotency_key,
    inputHash: row.input_hash,
    jobTokenHash: row.job_token_hash,
    status: row.status,
    stage: row.stage,
    progress: row.progress,
    errorCode: row.error_code,
    errorMessage: row.error_message,
    brief: row.brief,
    platform: row.platform,
    locale: row.locale,
    deviceProfile: row.device_profile,
    requestedScreenCount: row.requested_screen_count,
    planningState: row.planning_state,
    planningOutput: row.planning_output,
    acceptedDesignSpec: row.accepted_design_spec,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  }
}

/** Production Supabase implementation of V3JobStore against public.generation_v3_jobs. */
export function createSupabaseV3JobStore(supabase: SupabaseClientLike, table = 'generation_v3_jobs'): V3JobStore {
  return {
    async findByIdempotencyKey(projectId, idempotencyKey) {
      const { data, error } = await supabase
        .from(table)
        .select('*')
        .eq('project_id', projectId)
        .eq('idempotency_key', idempotencyKey)
        .maybeSingle()
      if (error) throw error
      return data ? toRecord(data) : null
    },

    async findById(jobId) {
      const { data, error } = await supabase
        .from(table)
        .select('*')
        .eq('id', jobId)
        .maybeSingle()
      if (error) throw error
      return data ? toRecord(data) : null
    },

    async insert(input) {
      const { data, error } = await supabase.from(table).insert({
        project_id: input.projectId,
        correlation_id: input.correlationId,
        idempotency_key: input.idempotencyKey,
        input_hash: input.inputHash,
        job_token_hash: input.jobTokenHash,
        status: input.status,
        stage: input.stage,
        progress: input.progress,
        error_code: input.errorCode,
        error_message: input.errorMessage,
        brief: input.brief,
        platform: input.platform,
        locale: input.locale,
        device_profile: input.deviceProfile,
        requested_screen_count: input.requestedScreenCount,
        planning_state: input.planningState,
        planning_output: input.planningOutput,
        accepted_design_spec: input.acceptedDesignSpec,
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
      if (patch.planningState !== undefined) row.planning_state = patch.planningState
      if (patch.planningOutput !== undefined) row.planning_output = patch.planningOutput
      if (patch.acceptedDesignSpec !== undefined) row.accepted_design_spec = patch.acceptedDesignSpec

      const { error } = await supabase.from(table).update(row).eq('id', jobId)
      if (error) throw error
    },
  }
}
