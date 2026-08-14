import { createClient } from 'jsr:@supabase/supabase-js@2'
import {
  handleV3GenerationGet,
  handleV3GenerationPost,
  handleV3SubmitRenderEvidence,
  handleV3GenerationEdit,
  type V3HttpDeps,
} from './http-adapter.ts'
import {
  type V3GenerationGetRequest,
  type V3GenerationPostRequest,
  type V3SubmitRenderEvidenceRequest,
  type V3GenerationEditRequest,
} from './http-contract.ts'
import { createSupabaseV3JobStore } from './job-store.ts'
import { createLiveV3Provider } from './provider.ts'

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PATCH, OPTIONS',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, idempotency-key, x-job-token',
}

function json(data: unknown, status: number): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: { ...CORS, 'Content-Type': 'application/json' },
  })
}

const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? ''
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
const supabase = createClient(supabaseUrl, supabaseServiceKey)

const deps: V3HttpDeps = {
  jobs: createSupabaseV3JobStore(supabase as any),
  provider: createLiveV3Provider(),
  schedule: (work) => {
    const edgeRuntime = (globalThis as typeof globalThis & { EdgeRuntime?: { waitUntil(promise: Promise<unknown>): void } }).EdgeRuntime
    queueMicrotask(() => {
      if (edgeRuntime) {
        edgeRuntime.waitUntil(work())
      } else {
        void work()
      }
    })
  },
  now: () => new Date().toISOString(),
  newCorrelationId: () => crypto.randomUUID(),
}

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: CORS })
  }

  const url = new URL(req.url)
  const pathname = url.pathname.replace(/\/+$/, '')
  const jobToken = req.headers.get('x-job-token')?.trim() ?? ''

  // 1. Submit Render Evidence: POST /generation-v3/:jobId/render-evidence or /generation-v3/render-evidence?id=:jobId
  const renderEvidenceMatch = pathname.match(/\/generation-v3\/([^/]+)\/render-evidence$/)
  if (req.method === 'POST' && (renderEvidenceMatch || pathname.endsWith('/render-evidence'))) {
    let body: any
    try {
      body = await req.json()
    } catch {
      return json({ error: 'Invalid JSON body' }, 400)
    }

    const jobId = renderEvidenceMatch?.[1] ?? url.searchParams.get('id') ?? body.jobId
    if (!jobId) return json({ error: 'jobId is required' }, 400)

    const request: V3SubmitRenderEvidenceRequest = {
      jobId,
      jobToken,
      evidence: Array.isArray(body.evidence) ? body.evidence : [],
    }

    const result = await handleV3SubmitRenderEvidence(request, deps)
    return json(result.body, result.status)
  }

  // 2. Patch Edit: PATCH /generation-v3/:jobId/edit or PATCH /generation-v3
  const editMatch = pathname.match(/\/generation-v3\/([^/]+)\/edit$/)
  if (req.method === 'PATCH') {
    let body: any
    try {
      body = await req.json()
    } catch {
      return json({ error: 'Invalid JSON body' }, 400)
    }

    const jobId = editMatch?.[1] ?? url.searchParams.get('id') ?? body.jobId
    if (!jobId) return json({ error: 'jobId is required' }, 400)

    const request: V3GenerationEditRequest = {
      jobId,
      jobToken,
      screenId: typeof body.screenId === 'string' ? body.screenId : '',
      instruction: typeof body.instruction === 'string' ? body.instruction : '',
      expectedRevision: typeof body.expectedRevision === 'number' ? body.expectedRevision : 1,
    }

    const result = await handleV3GenerationEdit(request, deps)
    return json(result.body, result.status)
  }

  // 3. New Generation: POST /generation-v3
  if (req.method === 'POST') {
    let body: Record<string, unknown>
    try {
      body = await req.json()
    } catch {
      return json({ error: 'Invalid JSON body' }, 400)
    }

    const { projectId, brief, platform, locale, deviceProfile, requestedScreenCount } = body as {
      projectId?: unknown
      brief?: unknown
      platform?: unknown
      locale?: unknown
      deviceProfile?: unknown
      requestedScreenCount?: unknown
    }

    if (typeof projectId !== 'string' || typeof brief !== 'string') {
      return json({ error: 'projectId and brief are required' }, 400)
    }
    if (platform !== 'ios' && platform !== 'android' && platform !== 'web') {
      return json({ error: 'platform must be ios, android or web' }, 400)
    }

    const request: V3GenerationPostRequest = {
      projectId,
      brief,
      platform,
      idempotencyKey: req.headers.get('idempotency-key')?.trim() ?? '',
      jobToken,
      ...(typeof locale === 'string' ? { locale } : {}),
      ...(typeof deviceProfile === 'string' ? { deviceProfile } : {}),
      ...(typeof requestedScreenCount === 'number' ? { requestedScreenCount } : {}),
    }

    const result = await handleV3GenerationPost(request, deps)
    return json(result.body, result.status)
  }

  // 4. Query Status: GET /generation-v3?id=:jobId
  if (req.method === 'GET') {
    const jobId = url.searchParams.get('id')
    if (!jobId) return json({ error: 'id required' }, 400)

    const request: V3GenerationGetRequest = {
      jobId,
      jobToken,
    }

    const result = await handleV3GenerationGet(request, deps)
    return json(result.body, result.status)
  }

  return new Response('Method not allowed', { status: 405, headers: CORS })
})
