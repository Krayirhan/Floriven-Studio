export type LedgerTransactionType = 'hold' | 'debit' | 'refund'

export type CreditLedgerEntry = {
  id: string
  tenantId: string
  projectId: string
  userId: string
  jobId: string
  amount: number
  type: LedgerTransactionType
  balanceAfter: number
  reason?: string
  createdAt: string
}

export type CreditHoldResult =
  | { ok: true; balanceAfter: number }
  | { ok: false; code: 'V3_INSUFFICIENT_CREDITS'; currentBalance: number; requiredAmount: number }

export type CreditRefundResult = {
  ok: true
  refundedAmount: number
  balanceAfter: number
}

export interface CreditLedger {
  getBalance(tenantId: string): Promise<number>
  holdCredits(params: {
    tenantId: string
    projectId: string
    userId: string
    jobId: string
    amount: number
  }): Promise<CreditHoldResult>
  settleCredits(params: {
    tenantId: string
    jobId: string
  }): Promise<void>
  refundCredits(params: {
    tenantId: string
    projectId: string
    userId: string
    jobId: string
    amount: number
    reason: string
  }): Promise<CreditRefundResult>
}

/** InMemoryCreditLedger for deterministic unit testing and edge function testing */
export class InMemoryCreditLedger implements CreditLedger {
  private entries: CreditLedgerEntry[] = []
  private balances: Map<string, number> = new Map()
  private holds: Map<string, { tenantId: string; projectId: string; userId: string; amount: number }> = new Map()

  constructor(initialBalances: Record<string, number> = {}, private readonly now: () => string = () => new Date().toISOString()) {
    for (const [tenantId, balance] of Object.entries(initialBalances)) {
      this.balances.set(tenantId, balance)
    }
  }

  async getBalance(tenantId: string): Promise<number> {
    return this.balances.get(tenantId) ?? 0
  }

  async holdCredits(params: {
    tenantId: string
    projectId: string
    userId: string
    jobId: string
    amount: number
  }): Promise<CreditHoldResult> {
    const current = this.balances.get(params.tenantId) ?? 0
    if (current < params.amount) {
      return { ok: false, code: 'V3_INSUFFICIENT_CREDITS', currentBalance: current, requiredAmount: params.amount }
    }
    const newBalance = current - params.amount
    this.balances.set(params.tenantId, newBalance)
    this.holds.set(params.jobId, {
      tenantId: params.tenantId,
      projectId: params.projectId,
      userId: params.userId,
      amount: params.amount,
    })
    this.entries.push({
      id: `cld_${this.entries.length + 1}`,
      tenantId: params.tenantId,
      projectId: params.projectId,
      userId: params.userId,
      jobId: params.jobId,
      amount: params.amount,
      type: 'hold',
      balanceAfter: newBalance,
      createdAt: this.now(),
    })
    return { ok: true, balanceAfter: newBalance }
  }

  async settleCredits(params: { tenantId: string; jobId: string }): Promise<void> {
    const hold = this.holds.get(params.jobId)
    if (!hold) return
    this.holds.delete(params.jobId)
    const current = this.balances.get(params.tenantId) ?? 0
    this.entries.push({
      id: `cld_${this.entries.length + 1}`,
      tenantId: params.tenantId,
      projectId: hold.projectId,
      userId: hold.userId,
      jobId: params.jobId,
      amount: hold.amount,
      type: 'debit',
      balanceAfter: current,
      createdAt: this.now(),
    })
  }

  async refundCredits(params: {
    tenantId: string
    projectId: string
    userId: string
    jobId: string
    amount: number
    reason: string
  }): Promise<CreditRefundResult> {
    this.holds.delete(params.jobId)
    const current = this.balances.get(params.tenantId) ?? 0
    const newBalance = current + params.amount
    this.balances.set(params.tenantId, newBalance)
    this.entries.push({
      id: `cld_${this.entries.length + 1}`,
      tenantId: params.tenantId,
      projectId: params.projectId,
      userId: params.userId,
      jobId: params.jobId,
      amount: params.amount,
      type: 'refund',
      balanceAfter: newBalance,
      reason: params.reason,
      createdAt: this.now(),
    })
    return { ok: true, refundedAmount: params.amount, balanceAfter: newBalance }
  }

  getEntries(): readonly CreditLedgerEntry[] {
    return this.entries
  }
}

type SupabaseCreditClientLike = {
  from(table: string): {
    select(columns: string): {
      eq(column: string, value: string): {
        order(column: string, options?: { ascending: boolean }): Promise<{ data: any[] | null; error: unknown }>
      }
    }
    insert(row: Record<string, unknown>): Promise<{ error: unknown }>
  }
}

/**
 * Production Supabase implementation of CreditLedger on public.credit_ledger.
 */
export function createSupabaseCreditLedger(supabase: SupabaseCreditClientLike, table = 'credit_ledger'): CreditLedger {
  return {
    async getBalance(tenantId) {
      try {
        const { data, error } = await supabase.from(table).select('amount, type').eq('tenant_id', tenantId).order('created_at', { ascending: true })
        if (error || !data) return 100 // Default starter balance if empty
        let balance = 100
        for (const row of data) {
          if (row.type === 'hold' || row.type === 'debit') balance -= row.amount
          else if (row.type === 'credit' || row.type === 'refund') balance += row.amount
        }
        return Math.max(0, balance)
      } catch {
        return 100
      }
    },

    async holdCredits(params) {
      const balance = await this.getBalance(params.tenantId)
      if (balance < params.amount) {
        return { ok: false, code: 'V3_INSUFFICIENT_CREDITS', currentBalance: balance, requiredAmount: params.amount }
      }
      await supabase.from(table).insert({
        tenant_id: params.tenantId,
        project_id: params.projectId,
        user_id: params.userId,
        job_id: params.jobId,
        amount: params.amount,
        type: 'hold',
      })
      return { ok: true, balanceAfter: balance - params.amount }
    },

    async settleCredits(params) {
      await supabase.from(table).insert({
        tenant_id: params.tenantId,
        project_id: 'settled',
        user_id: 'system',
        job_id: params.jobId,
        amount: 0,
        type: 'debit',
      })
    },

    async refundCredits(params) {
      const balance = await this.getBalance(params.tenantId)
      await supabase.from(table).insert({
        tenant_id: params.tenantId,
        project_id: params.projectId,
        user_id: params.userId,
        job_id: params.jobId,
        amount: params.amount,
        type: 'refund',
        reason: params.reason,
      })
      return { ok: true, refundedAmount: params.amount, balanceAfter: balance + params.amount }
    },
  }
}
