import type { CriticScores, RuntimeCertificationEvidence } from '../../../packages/design-spec/src/index.ts';

export class RuntimeCriticError extends Error {
  constructor(readonly code: 'RUNTIME_CRITIC_UNAVAILABLE' | 'RUNTIME_CRITIC_TIMEOUT' | 'RUNTIME_CRITIC_INVALID_RESPONSE', message: string) { super(message); }
}

export type RuntimeCritic = (evidence: RuntimeCertificationEvidence, mode: 'visual' | 'cross_screen') => Promise<CriticScores>;

export const googleRuntimeCritic: RuntimeCritic = async (evidence, mode) => {
  const apiKey = Deno.env.get('GOOGLE_API_KEY');
  if (!apiKey) throw new RuntimeCriticError('RUNTIME_CRITIC_UNAVAILABLE', 'GOOGLE_API_KEY is not configured for runtime criticism');
  const model = Deno.env.get('GOOGLE_RUNTIME_CRITIC_MODEL') ?? Deno.env.get('GOOGLE_MODEL') ?? 'gemini-3.6-flash';
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 45_000);
  try {
    const screenshots = mode === 'visual' ? evidence.screens.slice(0, 1) : evidence.screens;
    const parts: Array<Record<string, unknown>> = [
      { text: `You are Floriven's runtime ${mode === 'visual' ? 'visual' : 'cross-screen'} critic. Inspect ONLY these trusted renderer screenshots. Return JSON only with numeric 0..10 fields: visualHierarchy, taskClarity, informationDensity, spacingRhythm, typography, surfaceUsage, patternSuitability, navigation, screenDifferentiation, crossScreenConsistency. Be strict; do not add prose.` },
      ...screenshots.map((screen) => ({ inlineData: dataUrlToInlineData(screen.screenshotData) })),
    ];
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model)}:generateContent`, {
      method: 'POST', signal: controller.signal,
      headers: { 'Content-Type': 'application/json', 'x-goog-api-key': apiKey },
      body: JSON.stringify({ contents: [{ role: 'user', parts }], generationConfig: { responseMimeType: 'application/json', temperature: 0 } }),
    });
    if (!response.ok) throw new RuntimeCriticError('RUNTIME_CRITIC_UNAVAILABLE', `Runtime critic upstream HTTP ${response.status}`);
    const body = await response.json() as { candidates?: Array<{ content?: { parts?: Array<{ text?: string }> } }> };
    const text = body.candidates?.[0]?.content?.parts?.map((part) => part.text ?? '').join('') ?? '';
    const parsed = JSON.parse(text) as unknown;
    if (!isCriticScores(parsed)) throw new RuntimeCriticError('RUNTIME_CRITIC_INVALID_RESPONSE', 'Runtime critic returned an invalid score object');
    return parsed;
  } catch (error) {
    if (error instanceof RuntimeCriticError) throw error;
    if (controller.signal.aborted) throw new RuntimeCriticError('RUNTIME_CRITIC_TIMEOUT', 'Runtime critic timed out');
    throw new RuntimeCriticError('RUNTIME_CRITIC_INVALID_RESPONSE', error instanceof Error ? error.message : 'Runtime critic failed');
  } finally { clearTimeout(timer); }
};

function dataUrlToInlineData(value: string) {
  const match = value.match(/^data:(image\/[a-zA-Z0-9.+-]+);base64,([A-Za-z0-9+/=]+)$/);
  if (!match) throw new RuntimeCriticError('RUNTIME_CRITIC_INVALID_RESPONSE', 'Trusted screenshot payload is not a valid image data URL');
  return { mimeType: match[1], data: match[2] };
}

function isCriticScores(value: unknown): value is CriticScores {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return false;
  const record = value as Record<string, unknown>;
  return ['visualHierarchy', 'taskClarity', 'informationDensity', 'spacingRhythm', 'typography', 'surfaceUsage', 'patternSuitability', 'navigation', 'screenDifferentiation', 'crossScreenConsistency'].every((key) => typeof record[key] === 'number' && Number.isFinite(record[key]) && record[key] >= 0 && record[key] <= 10);
}
