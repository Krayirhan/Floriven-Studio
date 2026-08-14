import { readFile } from "node:fs/promises";

const report = JSON.parse(await readFile(new URL("../../audit-artifacts/grammar-coverage.json", import.meta.url), "utf8"));
const weights = { ACTIVE: 1, PARTIAL: 0.5, DEAD: 0, UNKNOWN: 0 };
const included = report.families.filter((item) => item.status !== "UNSUPPORTED");
const unknownStatuses = included.filter((item) => !(item.status in weights));
const weightedPoints = included.reduce((sum, item) => sum + (weights[item.status] ?? 0), 0);
const coverage = weightedPoints / included.length;
const required = ["screenComposition", "layoutPatterns", "typographyRules", "chartRules", "cardTypes", "cardGeometry", "formFieldStyles", "navigationModes"];
const forbiddenCore = required.filter((family) => {
  const item = report.families.find((candidate) => candidate.family === family);
  return !item || item.status === "DEAD" || item.status === "UNKNOWN";
});
const incompleteEvidence = included.filter((item) => !item.sourceDefinition || !item.resolverPath || !item.presentationField || !item.planConsumer || !item.runtimeConsumer || !item.measurableEffect || !item.tests?.length);
const exact = Math.abs(coverage - report.summary.weightedProductionCoverage) < 1e-10;
const passed = unknownStatuses.length === 0 && forbiddenCore.length === 0 && incompleteEvidence.length === 0 && exact && coverage >= .9;
console.log(JSON.stringify({ passed, familyCount: included.length, weightedPoints, weightedProductionCoverage: coverage, weightedProductionCoveragePercent: coverage * 100, forbiddenCore, incompleteEvidence: incompleteEvidence.map((item) => item.family), unknownStatuses: unknownStatuses.map((item) => item.family) }, null, 2));
if (!passed) process.exitCode = 1;
