import { describe, expect, it } from "vitest";
import { rankLayoutCandidates, validateCandidateDiversity, type LayoutCandidate } from "./layout-candidates";

const base: LayoutCandidate = { id: "a", patternSequence: ["SearchBar", "TransactionRow"], regions: ["controls", "list"], surfaceRatio: 0.1, density: "high", navigationMode: "root", scores: { taskFit: 8, scanability: 8, densityFit: 8, informationPriority: 8, aboveFoldUsefulness: 8, patternSuitability: 8 } };
describe("layout candidates", () => {
  it("ranks the highest-scoring candidate first", () => expect(rankLayoutCandidates([base, { ...base, id: "b", scores: { ...base.scores, taskFit: 9 } }])[0]?.id).toBe("b"));
  it("rejects candidates that differ only by incidental styling", () => expect(validateCandidateDiversity([base, { ...base, id: "b", surfaceRatio: 0.2 }])).toEqual(["CANDIDATE_NOT_DIVERSE"]));
});
