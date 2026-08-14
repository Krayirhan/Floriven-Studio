/**
 * Generation V3 Deployment Secret & Environment Preflight Validator.
 * Prevents deployment and runtime boot if required secrets or configurations are missing.
 */

export type PreflightCheckResult =
  | { ok: true; checkedVariables: string[] }
  | { ok: false; missingVariables: string[]; issues: string[] }

const REQUIRED_SECRETS = [
  'SUPABASE_URL',
  'SUPABASE_SERVICE_ROLE_KEY',
  'SUPABASE_ANON_KEY',
] as const

const OPTIONAL_AI_KEYS = [
  'ANTHROPIC_API_KEY',
  'GEMINI_API_KEY',
  'OPENAI_API_KEY',
] as const

export function validateDeploymentPreflight(env: Record<string, string | undefined>): PreflightCheckResult {
  const missing: string[] = []
  const issues: string[] = []

  for (const secret of REQUIRED_SECRETS) {
    const value = env[secret]
    if (!value || !value.trim()) {
      missing.push(secret)
      issues.push(`Required environment variable ${secret} is missing or empty`)
    }
  }

  const hasAnyAiKey = OPTIONAL_AI_KEYS.some((key) => {
    const val = env[key]
    return val && val.trim().length > 0
  })

  if (!hasAnyAiKey) {
    missing.push('AI_PROVIDER_KEY (at least one of ANTHROPIC_API_KEY, GEMINI_API_KEY, OPENAI_API_KEY)')
    issues.push('No AI provider API key found. At least one of ANTHROPIC_API_KEY, GEMINI_API_KEY, or OPENAI_API_KEY must be provided.')
  }

  if (missing.length > 0) {
    return { ok: false, missingVariables: missing, issues }
  }

  return { ok: true, checkedVariables: [...REQUIRED_SECRETS] }
}
