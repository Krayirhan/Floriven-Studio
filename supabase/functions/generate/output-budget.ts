export type OutputBudgetClass = 'SMALL' | 'MEDIUM' | 'LARGE'

export const GOOGLE_MODEL_OUTPUT_LIMIT = 65_536
export const GOOGLE_COMPOSITION_MAX_OUTPUT_TOKENS = 24_000
export const GOOGLE_PLAN_MAX_OUTPUT_TOKENS = 800
export const GOOGLE_EDIT_MAX_OUTPUT_TOKENS = 24_000

export type BudgetEstimate = {
  class: OutputBudgetClass
  estimatedTokens: number
  batchSize: number
}

export function estimateCompositionBudget(screenCount: number, contentDensity: 'low' | 'medium' | 'high' = 'medium'): BudgetEstimate {
  const perScreen = contentDensity === 'high' ? 3_200 : contentDensity === 'low' ? 1_600 : 2_400
  const estimatedTokens = Math.max(1, screenCount) * perScreen
  if (estimatedTokens <= 12_000) return { class: 'SMALL', estimatedTokens, batchSize: Math.max(1, screenCount) }
  if (estimatedTokens <= 24_000) return { class: 'MEDIUM', estimatedTokens, batchSize: Math.min(4, Math.max(1, Math.ceil(24_000 / perScreen))) }
  return { class: 'LARGE', estimatedTokens, batchSize: Math.min(3, Math.max(1, Math.floor(24_000 / perScreen))) }
}

export function assertOutputBudgetWithinModelLimit(maxOutputTokens: number, modelOutputLimit = GOOGLE_MODEL_OUTPUT_LIMIT): void {
  if (!Number.isInteger(maxOutputTokens) || maxOutputTokens < 1 || maxOutputTokens > modelOutputLimit) {
    throw new Error(`Configured output budget ${maxOutputTokens} exceeds model limit ${modelOutputLimit}`)
  }
}
