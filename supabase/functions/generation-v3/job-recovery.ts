import { type CreditLedger } from './credit-ledger.ts'
import { type V3JobRecord } from './http-contract.ts'
import { type V3JobStore } from './http-adapter.ts'

export type JobRecoveryResult = {
  scannedCount: number
  recoveredCount: number
  recoveredJobIds: string[]
}

const DEFAULT_MAX_JOB_AGE_MS = 5 * 60 * 1000 // 5 minutes

/**
 * Scans for orphaned or stuck jobs in 'processing' or 'awaiting_render' state that have exceeded the timeout.
 * Transitions them to 'failed' with 'V3_TIMEOUT_RECOVERED' and atomically refunds reserved credits.
 */
export async function recoverStuckJobs(
  store: V3JobStore & { records?: Map<string, V3JobRecord> },
  ledger: CreditLedger,
  currentTimeIso: string,
  maxAgeMs: number = DEFAULT_MAX_JOB_AGE_MS,
): Promise<JobRecoveryResult> {
  const currentTimestamp = new Date(currentTimeIso).getTime()
  const recoveredJobIds: string[] = []
  let scannedCount = 0

  if (store.records) {
    for (const record of store.records.values()) {
      scannedCount += 1
      if (record.status === 'processing' || record.status === 'awaiting_render') {
        const jobCreatedTimestamp = new Date(record.createdAt).getTime()
        const ageMs = currentTimestamp - jobCreatedTimestamp

        if (ageMs > maxAgeMs) {
          const holdJobId = `job_${record.correlationId}`

          await ledger.refundCredits({
            tenantId: record.tenantId,
            projectId: record.projectId,
            userId: record.userId,
            jobId: holdJobId,
            amount: record.creditCost,
            reason: `Job timed out after ${Math.round(ageMs / 1000)}s and was automatically recovered`,
          })

          await store.update(record.tenantId, record.id, {
            status: 'failed',
            stage: 'failed',
            progress: 100,
            errorCode: 'V3_TIMEOUT_RECOVERED',
            errorMessage: `Job timed out after ${Math.round(ageMs / 1000)}s and was automatically recovered`,
          })

          recoveredJobIds.push(record.id)
        }
      }
    }
  }

  return {
    scannedCount,
    recoveredCount: recoveredJobIds.length,
    recoveredJobIds,
  }
}
