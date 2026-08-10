import { describe, expect, it } from "vitest";
import { assertCertificationReadOnly, issueCertificationSession, validateCertificationSession } from "./certification-session";

describe("certification session security", () => {
  const base = { sessionId: "s-1", jobId: "job-1", candidateHash: "hash-1", now: 1000, ttlMs: 5000, signingSecret: "test-secret" };
  it("issues a signed, candidate-bound read-only session", () => {
    const session = issueCertificationSession(base);
    expect(validateCertificationSession({ token: session.token, jobId: "job-1", candidateHash: "hash-1", now: 2000, signingSecret: "test-secret" }).valid).toBe(true);
    expect(assertCertificationReadOnly("GET")).toBe(true);
    expect(assertCertificationReadOnly("POST")).toBe(false);
  });
  it("blocks wrong job, expiry, replay and mutation", () => {
    const session = issueCertificationSession(base);
    expect(validateCertificationSession({ token: session.token, jobId: "wrong", candidateHash: "hash-1", now: 2000, signingSecret: "test-secret" }).reason).toBe("JOB_MISMATCH");
    expect(validateCertificationSession({ token: session.token, jobId: "job-1", candidateHash: "hash-1", now: 6000, signingSecret: "test-secret" }).reason).toBe("EXPIRED");
    const replayed = new Set<string>();
    expect(validateCertificationSession({ token: session.token, jobId: "job-1", candidateHash: "hash-1", now: 2000, signingSecret: "test-secret", consume: true }, replayed).valid).toBe(true);
    expect(validateCertificationSession({ token: session.token, jobId: "job-1", candidateHash: "hash-1", now: 2000, signingSecret: "test-secret" }, replayed).reason).toBe("REPLAYED");
  });
});
