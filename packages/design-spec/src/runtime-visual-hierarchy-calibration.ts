import { evaluateRuntimeScreenVisualHierarchy, type RuntimeScreenVisualIdentity, type RuntimeVisualIdentityMetrics } from './runtime-visual-identity'

export const RUNTIME_HIERARCHY_CALIBRATION_VERSION = '1.0.0'

export type RuntimeHierarchyCalibrationCase = {
  id: string
  archetype: string
  expectedPass: boolean
  metrics: RuntimeVisualIdentityMetrics
}

const metrics = (sectionAreaCoverage: number, verticalOccupancy: number, nodeDensityPer100k: number, sectionHeightVariation: number): RuntimeVisualIdentityMetrics => ({
  visibleNodeCount: 8, sectionCount: 2, sectionAreaCoverage, verticalOccupancy, nodeDensityPer100k,
  sectionHeightVariation, sectionRoleSequence: ['summary', 'actions'],
  identityVector: [2, sectionAreaCoverage, verticalOccupancy, nodeDensityPer100k, sectionHeightVariation],
})

export const RUNTIME_HIERARCHY_CALIBRATION_CORPUS: readonly RuntimeHierarchyCalibrationCase[] = [
  { id: 'dashboard-layered', archetype: 'dashboard', expectedPass: true, metrics: metrics(0.62, 0.78, 3.2, 0.24) },
  { id: 'dashboard-flat', archetype: 'dashboard', expectedPass: false, metrics: metrics(0.62, 0.78, 3.2, 0.03) },
  { id: 'analytics-dense', archetype: 'analytics', expectedPass: true, metrics: metrics(0.68, 0.82, 4.2, 0.18) },
  { id: 'analytics-sparse', archetype: 'analytics', expectedPass: false, metrics: metrics(0.24, 0.38, 0.9, 0.12) },
  { id: 'list-operational', archetype: 'management_list', expectedPass: true, metrics: metrics(0.58, 0.72, 3.6, 0.12) },
  { id: 'list-title-only', archetype: 'management_list', expectedPass: false, metrics: { ...metrics(0.12, 0.18, 0.7, 0), sectionCount: 1 } },
  { id: 'form-focused', archetype: 'form', expectedPass: true, metrics: metrics(0.36, 0.52, 1.1, 0.035) },
  { id: 'form-empty', archetype: 'form', expectedPass: false, metrics: metrics(0.12, 0.22, 0.4, 0.01) },
  { id: 'detail-focused', archetype: 'detail', expectedPass: true, metrics: metrics(0.34, 0.5, 1, 0.03) },
  { id: 'detail-empty', archetype: 'detail', expectedPass: false, metrics: metrics(0.14, 0.24, 0.5, 0.01) },
  { id: 'settings-structured', archetype: 'settings', expectedPass: true, metrics: metrics(0.38, 0.56, 1.3, 0.06) },
  { id: 'settings-flat', archetype: 'settings', expectedPass: false, metrics: metrics(0.38, 0.56, 1.3, 0.01) },
  { id: 'profile-structured', archetype: 'profile', expectedPass: true, metrics: metrics(0.4, 0.58, 1.2, 0.07) },
  { id: 'profile-sparse', archetype: 'profile', expectedPass: false, metrics: metrics(0.16, 0.3, 0.6, 0.02) },
]

export function evaluateRuntimeHierarchyCalibration(corpus = RUNTIME_HIERARCHY_CALIBRATION_CORPUS) {
  let falsePositiveCount = 0
  let falseNegativeCount = 0
  for (const item of corpus) {
    const screen: RuntimeScreenVisualIdentity = { screenId: item.id, archetype: item.archetype, metrics: item.metrics }
    const actualPass = evaluateRuntimeScreenVisualHierarchy([screen]).passed
    if (actualPass && !item.expectedPass) falsePositiveCount += 1
    if (!actualPass && item.expectedPass) falseNegativeCount += 1
  }
  const correctCount = corpus.length - falsePositiveCount - falseNegativeCount
  return { caseCount: corpus.length, correctCount, falsePositiveCount, falseNegativeCount, accuracy: corpus.length ? correctCount / corpus.length : 0, passed: corpus.length > 0 && falsePositiveCount === 0 && falseNegativeCount === 0 }
}
