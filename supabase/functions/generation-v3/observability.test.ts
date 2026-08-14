import { describe, expect, it } from 'vitest'
import { resolveGenerationEngine, type GenerationFeatureFlags } from './feature-flags.ts'
import { evaluateShadowComparison, type GenerationMetrics } from './shadow-mode.ts'
import { InMemoryTelemetrySink, maskSensitiveData, type TelemetryEvent } from './telemetry.ts'

describe('GenerationFeatureFlags & Kill Switch', () => {
  it('emergency kill switch immediately routes 100% of traffic to V2', () => {
    const flags: GenerationFeatureFlags = {
      v3KillSwitchEnabled: true,
      v3RolloutPercentage: 100,
      allowedTenantIds: ['tenant_whitelisted'],
    }

    expect(resolveGenerationEngine('tenant_whitelisted', 'user_1', flags)).toBe('v2')
    expect(resolveGenerationEngine('tenant_random', 'user_2', flags)).toBe('v2')
  })

  it('whitelisted allowedTenantIds always route to V3 when kill switch is off', () => {
    const flags: GenerationFeatureFlags = {
      v3KillSwitchEnabled: false,
      v3RolloutPercentage: 0,
      allowedTenantIds: ['tenant_vip'],
    }

    expect(resolveGenerationEngine('tenant_vip', 'user_1', flags)).toBe('v3')
    expect(resolveGenerationEngine('tenant_regular', 'user_1', flags)).toBe('v2')
  })

  it('routes deterministically based on rollout percentage', () => {
    const flags50: GenerationFeatureFlags = {
      v3KillSwitchEnabled: false,
      v3RolloutPercentage: 50,
    }

    const decision1 = resolveGenerationEngine('tenant_arch', 'user_alice', flags50)
    const decision2 = resolveGenerationEngine('tenant_arch', 'user_alice', flags50)
    expect(decision1).toBe(decision2) // Deterministic

    const flags0: GenerationFeatureFlags = { v3KillSwitchEnabled: false, v3RolloutPercentage: 0 }
    const flags100: GenerationFeatureFlags = { v3KillSwitchEnabled: false, v3RolloutPercentage: 100 }

    expect(resolveGenerationEngine('tenant_1', 'user_1', flags0)).toBe('v2')
    expect(resolveGenerationEngine('tenant_1', 'user_1', flags100)).toBe('v3')
  })
})

describe('Privacy-Safe Telemetry', () => {
  it('masks tokens, passwords, raw prompts and long content from telemetry payloads', () => {
    const payload = {
      correlationId: 'corr_123',
      tenantId: 'tenant_arch',
      userToken: 'eyJhGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.secret',
      authHeader: 'Bearer secret-jwt-token-12345',
      password: 'my-super-secret-password',
      prompt: 'Mimarlar için haftalık takvim yap...',
      userEmail: 'architect@studio.com',
      metadata: {
        safeField: 'normal-value',
        nestedSecret: 'secret-api-key',
      },
    }

    const masked = maskSensitiveData(payload) as any

    expect(masked.correlationId).toBe('corr_123')
    expect(masked.tenantId).toBe('tenant_arch')
    expect(masked.userToken).toBe('[REDACTED]')
    expect(masked.authHeader).toBe('[REDACTED]')
    expect(masked.password).toBe('[REDACTED]')
    expect(masked.prompt).toBe('[REDACTED]')
    expect(masked.userEmail).toBe('[REDACTED]')
    expect(masked.metadata.safeField).toBe('normal-value')
    expect(masked.metadata.nestedSecret).toBe('[REDACTED]')
  })

  it('records structured events without sensitive data in telemetry sink', () => {
    const sink = new InMemoryTelemetrySink()
    const event: TelemetryEvent = {
      correlationId: 'corr-test',
      tenantId: 'tenant_1',
      projectId: 'prj_1',
      stage: 'acceptance',
      status: 'succeeded',
      latencyMs: 142,
      costCredits: 5,
      repairCount: 0,
      timestamp: '2026-01-01T00:00:00.000Z',
    }

    sink.emit(event)
    expect(sink.getEvents()).toHaveLength(1)
    expect(sink.getEvents()[0]?.correlationId).toBe('corr-test')
  })
})

describe('Shadow Mode Comparator', () => {
  it('computes comparison metrics showing V3 improvements over V2', () => {
    const v2Metrics: GenerationMetrics = {
      success: true,
      latencyMs: 3200,
      screenCount: 4,
      placeholderCount: 6,
      duplicateRatePct: 25,
      verifiedScreenCount: 0,
    }

    const v3Metrics: GenerationMetrics = {
      success: true,
      latencyMs: 2400,
      screenCount: 4,
      placeholderCount: 0,
      duplicateRatePct: 0,
      verifiedScreenCount: 4,
    }

    const comparison = evaluateShadowComparison('architecture-schedule', v2Metrics, v3Metrics)

    expect(comparison.comparison.taskSuccessNonDegraded).toBe(true)
    expect(comparison.comparison.placeholderReductionPct).toBe(100) // 100% reduction in placeholders
    expect(comparison.comparison.duplicateReductionPct).toBe(100) // 100% reduction in duplicates
    expect(comparison.comparison.latencyDeltaMs).toBe(-800) // 800ms faster
  })
})
