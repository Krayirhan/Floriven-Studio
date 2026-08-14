import { execFileSync } from 'node:child_process'
import { resolve } from 'node:path'
import { describe, expect, it } from 'vitest'

const script = resolve(process.cwd(), '../../scripts/certification/runtime-live-preflight.mjs')
const names = ['RUNTIME_JOB_ID', 'VITE_SUPABASE_URL', 'VITE_SUPABASE_ANON_KEY', 'RUNTIME_INSPECTOR_GRANT', 'RUNTIME_APP_URL']
function run(values: Record<string, string>) {
  const env = { ...process.env, ...Object.fromEntries(names.map((name) => [name, ''])), ...values }
  try { return { passed: true, output: execFileSync(process.execPath, [script], { encoding: 'utf8', env }) } }
  catch (error) { const failure = error as { stdout?: string }; return { passed: false, output: failure.stdout ?? '' } }
}

describe('runtime live preflight', () => {
  it('reports missing names without exposing values', () => { const result = run({}); expect(result.passed).toBe(false); expect(JSON.parse(result.output)).toMatchObject({ ready: false, presentCount: 0, missing: names }) })
  it('accepts a structurally safe live configuration', () => { const secret = 's'.repeat(40); const result = run({ RUNTIME_JOB_ID: 'job-123', VITE_SUPABASE_URL: 'https://example.supabase.co', VITE_SUPABASE_ANON_KEY: 'a'.repeat(24), RUNTIME_INSPECTOR_GRANT: secret, RUNTIME_APP_URL: 'https://studio.example.com' }); expect(result.passed).toBe(true); expect(result.output).not.toContain(secret) })
  it('rejects credential-bearing URLs and insecure remote origins', () => { const result = run({ RUNTIME_JOB_ID: 'job-123', VITE_SUPABASE_URL: 'https://user:pass@example.com', VITE_SUPABASE_ANON_KEY: 'a'.repeat(24), RUNTIME_INSPECTOR_GRANT: 's'.repeat(40), RUNTIME_APP_URL: 'http://studio.example.com' }); expect(JSON.parse(result.output).invalid).toEqual(expect.arrayContaining(['VITE_SUPABASE_URL', 'RUNTIME_APP_URL'])) })
})
