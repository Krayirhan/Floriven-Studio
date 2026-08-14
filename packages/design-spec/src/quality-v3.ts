import type { CriticReport } from "./critic-gate";
import type { RenderedBounds } from "./geometry-validator";

export type QualityV3Report = {
  semantic: { passed: boolean; failures: string[] };
  structural: { passed: boolean; failures: string[] };
  presentation: { passed: boolean; failures: string[] };
  geometry: { passed: boolean; failures: string[] };
  visual: { passed: boolean; failures: string[] };
  finalEligible: boolean;
};

export type QualityV3Input = {
  semanticFailures?: readonly string[];
  structuralFailures?: readonly string[];
  presentationFailures?: readonly string[];
  geometryFailures?: readonly string[];
  visualCritic?: CriticReport;
  bounds?: readonly RenderedBounds[];
  interactiveBounds?: readonly RenderedBounds[];
  requiredFontFamilies?: readonly string[];
  loadedFontFamilies?: readonly string[];
  maxCrossScreenDistance?: number;
  crossScreenDistance?: number;
  crossPresetDistance?: number;
};

export function evaluateQualityV3(input: QualityV3Input): QualityV3Report {
  const semantic = failures(input.semanticFailures);
  const structural = failures(input.structuralFailures);
  const presentation = failures(input.presentationFailures);
  const geometryFailures = [...(input.geometryFailures ?? [])];
  const bounds = input.bounds ?? [];
  if (bounds.some((box) => box.width <= 0 || box.height <= 0)) geometryFailures.push("INVALID_DIMENSION");
  if (bounds.some((box) => box.x < 0 || box.y < 0 || box.x + box.width > 390 || box.y + box.height > 844)) geometryFailures.push("CLIPPING_OR_OVERFLOW");
  if ((input.interactiveBounds ?? []).some((box) => box.width < 44 || box.height < 44)) geometryFailures.push("TOUCH_TARGET_GATE");
  const presentationFailures = [...presentation.failures];
  for (const family of input.requiredFontFamilies ?? []) if (!(input.loadedFontFamilies ?? []).includes(family)) presentationFailures.push(`FONT_MISSING:${family}`);
  if (input.crossScreenDistance !== undefined && input.maxCrossScreenDistance !== undefined && input.crossScreenDistance > input.maxCrossScreenDistance) presentationFailures.push("CROSS_SCREEN_DISTANCE_GATE");
  if (input.crossPresetDistance !== undefined && input.crossPresetDistance === 0) presentationFailures.push("CROSS_PRESET_DISTANCE_GATE");
  const visualFailures = input.visualCritic ? [...input.visualCritic.failures] : ["VISUAL_EVIDENCE_PENDING"];
  const report = { semantic, structural, presentation: failures(presentationFailures), geometry: failures(geometryFailures), visual: failures(visualFailures) };
  return { ...report, finalEligible: Object.values(report).every((gate) => gate.passed) };
}

function failures(values: readonly string[] | undefined): { passed: boolean; failures: string[] } { const result = [...(values ?? [])]; return { passed: result.length === 0, failures: result }; }
