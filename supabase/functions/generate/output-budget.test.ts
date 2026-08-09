import { describe, expect, it } from 'vitest'
import { assertOutputBudgetWithinModelLimit, estimateCompositionBudget, GOOGLE_COMPOSITION_MAX_OUTPUT_TOKENS, GOOGLE_MODEL_OUTPUT_LIMIT } from './output-budget.ts'

describe('composition output budget', () => {
  it('keeps small apps in one batch', () => expect(estimateCompositionBudget(3)).toMatchObject({ class: 'SMALL', batchSize: 3 }))
  it('bounds medium apps to deterministic batches', () => expect(estimateCompositionBudget(7)).toMatchObject({ class: 'MEDIUM', batchSize: 4 }))
  it('uses smaller batches for large dense apps', () => expect(estimateCompositionBudget(10, 'high').batchSize).toBe(2))
  it('never permits a budget above model capability', () => {
    expect(() => assertOutputBudgetWithinModelLimit(GOOGLE_COMPOSITION_MAX_OUTPUT_TOKENS, GOOGLE_MODEL_OUTPUT_LIMIT)).not.toThrow()
    expect(() => assertOutputBudgetWithinModelLimit(GOOGLE_MODEL_OUTPUT_LIMIT + 1)).toThrow()
  })
})
