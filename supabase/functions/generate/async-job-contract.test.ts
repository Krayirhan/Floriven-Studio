import { describe, expect, it } from 'vitest'
import { scheduleGenerationJob, type JobSnapshot } from './async-job-contract'

describe('async generation contract', () => {
  it('returns 202-shaped job metadata before a delayed provider settles', async () => {
    const job: JobSnapshot = { id: 'job-async', status: 'queued', stage: 'queued', providerExecutions: 0 }
    let resolveProvider!: () => void
    const provider = new Promise<void>((resolve) => { resolveProvider = resolve })
    let background!: Promise<void>
    const startedAt = performance.now()

    const response = scheduleGenerationJob(job, async () => {
      job.status = 'processing'
      job.stage = 'provider_pending'
      job.providerExecutions += 1
      await provider
      job.stage = 'candidate_ready'
      job.status = 'completed'
    }, (work) => { background = work })

    expect(performance.now() - startedAt).toBeLessThan(100)
    expect(response).toEqual({ jobId: 'job-async', status: 'queued', stage: 'queued' })
    expect(job.providerExecutions).toBe(1)
    expect(job.stage).toBe('provider_pending')
    resolveProvider()
    await background
    expect(job).toMatchObject({ status: 'completed', stage: 'candidate_ready', providerExecutions: 1 })
  })

  it('reuses the same idempotency key without a second provider execution', async () => {
    const jobs = new Map<string, JobSnapshot>()
    let executions = 0
    const create = (key: string) => {
      const existing = jobs.get(key)
      if (existing) return existing
      const job: JobSnapshot = { id: 'job-idempotent', status: 'queued', stage: 'queued', providerExecutions: 0 }
      jobs.set(key, job)
      executions += 1
      return job
    }

    const first = create('same-key')
    const second = create('same-key')
    expect(second.id).toBe(first.id)
    expect(executions).toBe(1)
  })
})
