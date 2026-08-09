export type JobSnapshot = { id: string; status: 'queued' | 'processing' | 'completed' | 'failed'; stage: string; providerExecutions: number }

export type BackgroundScheduler = (work: () => Promise<void>) => void

export function scheduleGenerationJob(
  job: JobSnapshot,
  process: () => Promise<void>,
  schedule: BackgroundScheduler,
): { jobId: string; status: JobSnapshot['status']; stage: string } {
  schedule(process)
  return { jobId: job.id, status: 'queued', stage: 'queued' }
}
