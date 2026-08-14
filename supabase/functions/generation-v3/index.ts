import { createClient } from 'jsr:@supabase/supabase-js@2'
import { handleV3GenerationGet, handleV3GenerationPost, type V3HttpDeps } from './http-adapter.ts'
import { type V3GenerationGetRequest, type V3GenerationPostRequest } from './http-contract.ts'
import { createSupabaseV3JobStore } from './job-store.ts'
import { createLiveV3Provider } from './provider.ts'

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, idempotency-key, x-job-token',
}

function json(data: unknown, status: number): Response {
  return new Response(JSON.stringify(data), { status, headers: { ...CORS, 'Content-Type': 'application/json' } })
}

const supabase = createClient(Deno.env.get('SUPABASE_URL') ?? '', Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '')
const deps: V3HttpDeps = {
  jobs: createSupabaseV3JobStore(supabase),
  provider: createLiveV3Provider(),
  schedule: (work) => {
    const edgeRuntime = (globalThis as typeof globalThis & { EdgeRuntime?: { waitUntil(promise: Promise<unknown>): void } }).EdgeRuntime
    queueMicrotask(() => { if (edgeRuntime) edgeRuntime.waitUntil(work()); else void work() })
  },
  now: () => new Date().toISOString(),
  newCorrelationId: () => crypto.randomUUID(),
}

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: CORS })

  if (req.method === 'POST') {
    let body: Record<string, unknown>
    try {
      body = await req.json()
    } catch {
      return json({ error: 'Invalid JSON body' }, 400)
    }
    const { projectId, brief, platform, locale, deviceProfile, requestedScreenCount } = body as {
      projectId?: unknown; brief?: unknown; platform?: unknown; locale?: unknown; deviceProfile?: unknown; requestedScreenCount?: unknown
    }
    if (typeof projectId !== 'string' || typeof brief !== 'string') return json({ error: 'projectId and brief are required' }, 400)
    if (platform !== 'ios' && platform !== 'android' && platform !== 'web') return json({ error: 'platform must be ios, android or web' }, 400)

    const request: V3GenerationPostRequest = {
      projectId, brief, platform,
      ...(typeof locale === 'string' ? { locale } : {}),
      ...(typeof deviceProfile === 'string' ? { deviceProfile } : {}),
      ...(typeof requestedScreenCount === 'number' ? { requestedScreenCount } : {}),
      idempotencyKey: req.headers.get('idempotency-key')?.trim() ?? '',
      jobToken: req.headers.get('x-job-token')?.trim() ?? '',
    }
    const result = await handleV3GenerationPost(request, deps)
    return json(result.body, result.status)
  }

  if (req.method === 'GET') {
    const jobId = new URL(req.url).searchParams.get('id')
    if (!jobId) return json({ error: 'id required' }, 400)
    const request: V3GenerationGetRequest = { jobId, jobToken: req.headers.get('x-job-token')?.trim() ?? '' }
    const result = await handleV3GenerationGet(request, deps)
    return json(result.body, result.status)
  }

  return new Response('Method not allowed', { status: 405, headers: CORS })
})
