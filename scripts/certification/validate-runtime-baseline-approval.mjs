import crypto from 'node:crypto';
import fs from 'node:fs/promises';
import path from 'node:path';
import process from 'node:process';
import { execFile } from 'node:child_process';
import { promisify } from 'node:util';

const exec = promisify(execFile);
const baseRef = process.env.RUNTIME_BASELINE_BASE_REF;
const changed = baseRef ? (await exec('git', ['diff', '--name-only', `${baseRef}...HEAD`])).stdout.split(/\r?\n/).filter(Boolean) : [];
if (!changed.some((file) => file.replaceAll('\\', '/').startsWith('docs/certification/baselines/'))) {
  console.log(JSON.stringify({ passed: true, baselineChanged: false }));
  process.exit(0);
}
if (process.env.RUNTIME_BASELINE_APPROVED !== 'true') {
  console.error(JSON.stringify({ passed: false, issues: ['RUNTIME_BASELINE_MAINTAINER_APPROVAL_MISSING'] }));
  process.exit(1);
}
const manifestPath = path.resolve('docs/certification/baselines/runtime-replay-manifest.json');
const approvalPath = path.resolve('docs/certification/baselines/runtime-replay-approval.json');
try {
  const manifestBytes = await fs.readFile(manifestPath);
  const approval = JSON.parse(await fs.readFile(approvalPath, 'utf8'));
  const expectedHash = crypto.createHash('sha256').update(manifestBytes).digest('hex');
  const issues = [];
  if (!/^[a-f0-9]{64}$/i.test(approval.baselineSha256 ?? '') || approval.baselineSha256 !== expectedHash) issues.push('RUNTIME_BASELINE_APPROVAL_HASH_MISMATCH');
  if (!approval.approvedBy?.trim()) issues.push('RUNTIME_BASELINE_APPROVER_MISSING');
  if (!approval.reviewReference?.trim()) issues.push('RUNTIME_BASELINE_REVIEW_REFERENCE_MISSING');
  if (!approval.approvedAt || Number.isNaN(Date.parse(approval.approvedAt))) issues.push('RUNTIME_BASELINE_APPROVAL_DATE_INVALID');
  console.log(JSON.stringify({ passed: issues.length === 0, baselineChanged: true, issues }, null, 2));
  if (issues.length) process.exitCode = 1;
} catch {
  console.error(JSON.stringify({ passed: false, issues: ['RUNTIME_BASELINE_APPROVAL_FILES_MISSING'] }));
  process.exitCode = 1;
}
