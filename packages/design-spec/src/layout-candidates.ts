export type LayoutCandidate = { id: string; patternSequence: string[]; regions: string[]; surfaceRatio: number; density: "low" | "medium" | "high"; navigationMode: "root" | "focused" | "modal" | "wizard"; scores: { taskFit: number; scanability: number; densityFit: number; informationPriority: number; aboveFoldUsefulness: number; patternSuitability: number } };

export function rankLayoutCandidates(candidates: readonly LayoutCandidate[]): LayoutCandidate[] {
  return [...candidates].sort((left, right) => score(right) - score(left) || left.id.localeCompare(right.id));
}

export function validateCandidateDiversity(candidates: readonly LayoutCandidate[]): string[] {
  const issues: string[] = [];
  for (let left = 0; left < candidates.length; left += 1) for (let right = left + 1; right < candidates.length; right += 1) {
    const a = candidates[left]; const b = candidates[right];
    if (a && b && a.patternSequence.join("|") === b.patternSequence.join("|") && a.regions.join("|") === b.regions.join("|") && a.navigationMode === b.navigationMode) issues.push("CANDIDATE_NOT_DIVERSE");
  }
  return [...new Set(issues)];
}

function score(candidate: LayoutCandidate): number { return Object.values(candidate.scores).reduce((sum, value) => sum + value, 0) / 6; }

export function candidateDiversitySignature(candidate: LayoutCandidate): string {
  return [candidate.patternSequence.join(">"), candidate.regions.join(">"), candidate.surfaceRatio.toFixed(2), candidate.density, candidate.navigationMode].join("|");
}
