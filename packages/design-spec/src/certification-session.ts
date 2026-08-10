import { createSemanticHash } from "./semantic-hash";

export const CERTIFICATION_SESSION_VERSION = "v1" as const;
export type CertificationScope = "runtime:evidence:read";
export type CertificationSession = { sessionId: string; jobId: string; candidateHash: string; scope: CertificationScope; issuedAt: number; expiresAt: number; token: string };
export type SessionValidation = { valid: boolean; reason?: "MALFORMED" | "SIGNATURE_MISMATCH" | "EXPIRED" | "REPLAYED" | "JOB_MISMATCH" | "CANDIDATE_HASH_MISMATCH" | "SCOPE_DENIED"; session?: CertificationSession };

export function issueCertificationSession(input: { sessionId: string; jobId: string; candidateHash: string; now: number; ttlMs: number; signingSecret: string }): CertificationSession {
  const session = { sessionId: input.sessionId, jobId: input.jobId, candidateHash: input.candidateHash, scope: "runtime:evidence:read" as const, issuedAt: input.now, expiresAt: input.now + input.ttlMs };
  return { ...session, token: `${encode(session)}.${sign(input.signingSecret, session)}` };
}

export function validateCertificationSession(input: { token: string; jobId: string; candidateHash: string; now: number; signingSecret: string; consume?: boolean }, replayedSessionIds = new Set<string>()): SessionValidation {
  const [encoded, signature] = input.token.split(".");
  if (!encoded || !signature) return { valid: false, reason: "MALFORMED" };
  let session: Omit<CertificationSession, "token">;
  try { session = JSON.parse(decode(encoded)) as Omit<CertificationSession, "token">; } catch { return { valid: false, reason: "MALFORMED" }; }
  if (sign(input.signingSecret, session) !== signature) return { valid: false, reason: "SIGNATURE_MISMATCH" };
  if (session.scope !== "runtime:evidence:read") return { valid: false, reason: "SCOPE_DENIED" };
  if (input.now >= session.expiresAt) return { valid: false, reason: "EXPIRED" };
  if (replayedSessionIds.has(session.sessionId)) return { valid: false, reason: "REPLAYED" };
  if (session.jobId !== input.jobId) return { valid: false, reason: "JOB_MISMATCH" };
  if (session.candidateHash !== input.candidateHash) return { valid: false, reason: "CANDIDATE_HASH_MISMATCH" };
  if (input.consume) replayedSessionIds.add(session.sessionId);
  return { valid: true, session: { ...session, token: input.token } };
}

export function assertCertificationReadOnly(method: string): boolean { return method.toUpperCase() === "GET"; }
function encode(value: unknown): string { return btoa(unescape(encodeURIComponent(JSON.stringify(value)))).replace(/=/g, ""); }
function decode(value: string): string { return decodeURIComponent(escape(atob(value))); }
function sign(secret: string, payload: unknown): string { return createSemanticHash({ screens: [{ id: "certification", name: secret, root: { id: "session", type: "Session", props: payload as Record<string, unknown> } }], flows: [] }); }
