import { describe, expect, it } from 'vitest'
import { InMemoryCreditLedger } from './credit-ledger.ts'
import type { V3JobRecord } from './http-contract.ts'
import { recoverStuckJobs } from './job-recovery.ts'
import { validateDeploymentPreflight } from './preflight.ts'

describe('Deployment Secret Preflight Validator', () => {
  it('rejects deployment when essential Supabase secrets are missing', () => {
    const env = {
      SUPABASE_URL: '',
      SUPABASE_SERVICE_ROLE_KEY: '',
      ANTHROPIC_API_KEY: 'test-key',
    }

    const result = validateDeploymentPreflight(env)
    expect(result.ok).toBe(false)
    if (!result.ok) {
      expect(result.missingVariables).toContain('SUPABASE_URL')
      expect(result.missingVariables).toContain('SUPABASE_SERVICE_ROLE_KEY')
    }
  })

  it('rejects deployment when no AI provider API key is configured', () => {
    const env = {
      SUPABASE_URL: 'https://example.supabase.co',
      SUPABASE_SERVICE_ROLE_KEY: 'service-role-key',
      SUPABASE_ANON_KEY: 'anon-key',
    }

    const result = validateDeploymentPreflight(env)
    expect(result.ok).toBe(false)
    if (!result.ok) {
      expect(result.issues[0]).toContain('No AI provider API key found')
    }
  })

  it('accepts deployment when all required Supabase secrets and at least one AI provider key exist', () => {
    const env = {
      SUPABASE_URL: 'https://example.supabase.co',
      SUPABASE_SERVICE_ROLE_KEY: 'service-role-key',
      SUPABASE_ANON_KEY: 'anon-key',
      GEMINI_API_KEY: 'gemini-secret-key',
    }

    const result = validateDeploymentPreflight(env)
    expect(result.ok).toBe(true)
  })
})

describe('Stuck-Job Recovery & Timeout Refund Engine', () => {
  it('recovers stuck jobs older than max age, marks them failed, and refunds credits', async () => {
    const ledger = new InMemoryCreditLedger({ tenant_arch: 100 })

    // Simulate credit hold
    await ledger.holdCredits({
      tenantId: 'tenant_arch',
      projectId: 'prj_1',
      userId: 'usr_1',
      jobId: 'job_corr_old',
      amount: 5,
    })

    expect(await ledger.getBalance('tenant_arch')).toBe(95)

    const records = new Map<string, V3JobRecord>()
    const staleTime = '2026-01-01T00:00:00.000Z'
    const freshTime = '2026-01-01T00:08:00.000Z'
    const currentTime = '2026-01-01T00:10:00.000Z' // 10 minutes later

    const stuckJob: V3JobRecord = {
      id: 'job_stuck_1',
      tenantId: 'tenant_arch',
      projectId: 'prj_1',
      userId: 'usr_1',
      correlationId: 'corr_old',
      idempotencyKey: 'idemp_stuck_1234567890',
      inputHash: 'hash1',
      jobTokenHash: 'hash2',
      creditCost: 5,
      status: 'awaiting_render',
      stage: 'awaiting_render',
      progress: 80,
      errorCode: null,
      errorMessage: null,
      acceptedDesignSpec: null,
      createdAt: staleTime,
    }

    const freshJob: V3JobRecord = {
      id: 'job_fresh_2',
      tenantId: 'tenant_arch',
      projectId: 'prj_1',
      userId: 'usr_1',
      correlationId: 'corr_fresh',
      idempotencyKey: 'idemp_fresh_1234567890',
      inputHash: 'hash3',
      jobTokenHash: 'hash4',
      creditCost: 5,
      status: 'processing',
      stage: 'planning',
      progress: 30,
      errorCode: null,
      errorMessage: null,
      acceptedDesignSpec: null,
      createdAt: freshTime, // only 2 minutes old
    }

    records.set(stuckJob.id, stuckJob)
    records.set(freshJob.id, freshJob)

    const mockStore = {
      records,
      async findByIdempotencyKey() { return null },
      async findById(tenantId: string, jobId: string) { return records.get(jobId) ?? null },
      async insert(r: any) { return r },
      async update(tenantId: string, jobId: string, patch: any) {
        const existing = records.get(jobId)
        if (existing) records.set(jobId, { ...existing, ...patch })
      },
    }

    const recoveryResult = await recoverStuckJobs(mockStore, ledger, currentTime, 5 * 60 * 1000)

    expect(recoveryResult.scannedCount).toBe(2)
    expect(recoveryResult.recoveredCount).toBe(1)
    expect(recoveryResult.recoveredJobIds).toEqual(['job_stuck_1'])

    // Stuck job updated to failed with V3_TIMEOUT_RECOVERED
    const updatedStuck = records.get('job_stuck_1')
    expect(updatedStuck?.status).toBe('failed')
    expect(updatedStuck?.errorCode).toBe('V3_TIMEOUT_RECOVERED')

    // Fresh job remains untouched
    const updatedFresh = records.get('job_fresh_2')
    expect(updatedFresh?.status).toBe('processing')

    // Credits refunded to original balance
    expect(await ledger.getBalance('tenant_arch')).toBe(100)
    const entries = ledger.getEntries()
    expect(entries.some((e) => e.type === 'refund')).toBe(true)
  })
})
