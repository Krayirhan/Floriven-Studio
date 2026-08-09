#!/usr/bin/env node
/**
 * Compiles the markdown prompt layer into a Deno module the Edge Function imports.
 *
 * Supabase's deploy bundles the entry point and its static imports — it does not
 * upload loose .md files, so the markdown cannot be read at runtime. The .md files
 * stay the human source of truth; this script produces the machine artifact.
 *
 * Only the text between <!-- prompt:start --> and <!-- prompt:end --> is emitted.
 * Everything else in those files is documentation and never reaches the model.
 *
 * The build fails when contract.md and componentRegistry.ts disagree, because that
 * particular drift is silent at runtime: the model emits a type the renderer has no
 * case for, validation passes, and the node disappears with no error.
 *
 *   node scripts/build-prompts.mjs
 */
import { readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const promptsDir = join(root, "supabase/functions/generate/prompts");
const registryPath = join(root, "apps/web/src/features/studio/canvas/componentRegistry.ts");
const rendererPath = join(root, "apps/web/src/features/studio/canvas/PhoneScreen.tsx");
const outPath = join(root, "supabase/functions/generate/prompts.generated.ts");

/** Order matters: contract defines the vocabulary, composition the shape, content the copy. */
const BUILD_CHAIN = ["contract.md", "composition.md", "content.md"];
const PLAN_FILE = "planning.md";
const DOMAIN_COMPONENT_TYPES = {
  "health-care": ["CareSummary","MedicationTimeline","MedicationDoseRow","HealthMetric","UnitInput","RangeChart","TargetRange","StatusAlert","SafetyNotice","SuccessFeedback"],
  publishing: ["EditorialHero","FeatureStory","StoryCard","Byline","MetadataStrip","PullQuote","SectionIndex","ArchiveEntry"],
  commerce: ["CommerceHero","ProductCard","PriceBlock","ProductGallery","VariantSelector","CartLine","OrderSummary","DeliveryPromise"],
  learning: ["LearningHero","XpProgress","StreakBadge","LessonCard","RoadmapStep","QuizChoice","AnswerFeedback","AchievementBadge"],
  operations: ["CommandSummary","SignalChart","RiskIndicator","OperationRow","IncidentTimeline","DataMatrix","ControlToggle","AuditEntry"],
};

function extractPrompt(file) {
  const source = readFileSync(join(promptsDir, file), "utf8");
  const match = source.match(/<!--\s*prompt:start\s*-->\n([\s\S]*?)\n<!--\s*prompt:end\s*-->/);
  if (!match) throw new Error(`${file}: no <!-- prompt:start --> … <!-- prompt:end --> block`);
  return match[1].trim();
}

/**
 * Types the prompt tells the model it may emit.
 *
 * Parsed structurally rather than by scanning for capitalised words, so prose
 * inside the TYPES block ("Containers", "Leaves") is never mistaken for a type
 * and — more importantly — a genuinely unknown type is never skipped.
 *
 * Two shapes carry types:
 *   Containers (may have "children"): Screen, ScrollView, Stack, ...
 *   TopAppBar {title, action?}          ← the token(s) before a prop block
 *   Checkbox|Switch {label}             ← alternatives share one prop block
 */
function typesInPrompt(text) {
  const section = text.match(/^TYPES$([\s\S]*?)^A leaf carrying/m);
  if (!section) throw new Error("contract.md: TYPES section not found in prompt block");
  const body = section[1];

  const types = new Set();

  const containers = body.match(/^Containers[^:]*:\s*(.+)$/m);
  if (!containers) throw new Error("contract.md: Containers line not found");
  for (const name of containers[1].split(",")) types.add(name.trim());

  for (const [, names] of body.matchAll(/([A-Za-z|]+)\s*\{/g)) {
    for (const name of names.split("|")) types.add(name.trim());
  }

  if (types.size < 10) throw new Error(`contract.md: parsed only ${types.size} types, expected ~25`);
  return types;
}

function checkDrift(contractPrompt) {
  const registry = readFileSync(registryPath, "utf8");
  const renderer = readFileSync(rendererPath, "utf8");

  const declared = new Set(
    (registry.match(/export const COMPONENT_TYPES = \[([\s\S]*?)\]/)?.[1] ?? "")
      .match(/"([A-Za-z]+)"/g)
      ?.map((s) => s.slice(1, -1)) ?? [],
  );
  if (declared.size === 0) throw new Error("componentRegistry.ts: COMPONENT_TYPES not parseable");

  const errors = [];
  for (const type of typesInPrompt(contractPrompt)) {
    if (!declared.has(type)) {
      errors.push(`  ${type}: in contract.md but missing from componentRegistry.ts`);
    } else if (!renderer.includes(`case "${type}"`)) {
      errors.push(`  ${type}: in contract.md and the registry, but PhoneScreen.tsx has no case`);
    }
  }

  if (errors.length > 0) {
    throw new Error(
      `contract.md has drifted from the renderer.\n${errors.join("\n")}\n\n` +
        "A type the renderer cannot draw is lost silently at runtime — the node\n" +
        "vanishes, validation passes, and nothing is logged. Fix the mismatch.",
    );
  }
  return declared.size;
}

const fullChain = BUILD_CHAIN.map(extractPrompt);
const planPrompt = extractPrompt(PLAN_FILE);
const registrySize = checkDrift(fullChain[0]);

const domainTypes = new Set(Object.values(DOMAIN_COMPONENT_TYPES).flat());
const contractLines = fullChain[0].split("\n");
const domainComponentPrompts = Object.fromEntries(Object.entries(DOMAIN_COMPONENT_TYPES).map(([domainPackId, types]) => [
  domainPackId,
  ["DOMAIN CAPABILITY PACK — use only when this product domain was derived from ProductBlueprint:", ...contractLines.filter((line) => types.some((type) => line.trimStart().startsWith(`${type} `)))].join("\n"),
]));
const coreContract = contractLines.filter((line) => ![...domainTypes].some((type) => line.trimStart().startsWith(`${type} `))).join("\n");
const chain = [coreContract, ...fullChain.slice(1)];

const banner =
  "// Generated by scripts/build-prompts.mjs — do not edit.\n" +
  "// Source of truth: supabase/functions/generate/prompts/*.md\n" +
  `// Assembly order: ${BUILD_CHAIN.join(" -> ")}\n`;

writeFileSync(
  outPath,
  `${banner}
export const SYSTEM_PROMPT = ${JSON.stringify(chain.join("\n\n"))}

export const DOMAIN_COMPONENT_PROMPTS: Record<string, string> = ${JSON.stringify(domainComponentPrompts)}

export const PLAN_PROMPT = ${JSON.stringify(planPrompt)}
`,
  "utf8",
);

const estimate = (text) => Math.round(text.length / 3.6);
const systemTokens = estimate(chain.join("\n\n"));
const planTokens = estimate(planPrompt);
const largestDomainPackTokens = Math.max(...Object.values(domainComponentPrompts).map(estimate));

console.log(`prompts.generated.ts written`);
console.log(`  chain     ${BUILD_CHAIN.join(" -> ")}`);
console.log(`  system    ~${systemTokens} tokens`);
console.log(`  domain    ~${largestDomainPackTokens} tokens max (selected only)`);
console.log(`  plan      ~${planTokens} tokens`);
console.log(`  registry  ${registrySize} component types, no drift`);

// Active provider is Cerebras (30k TPM). Keep meaningful headroom for retries.
const budget = planTokens + 1400 + systemTokens + largestDomainPackTokens + 300 + 12000;
if (budget > 27000) {
  console.warn(
    `\n  WARNING: estimated minute budget ${budget} tokens is close to the 30000 TPM\n` +
      `  ceiling. Trim a prompt file or lower BUILD_TOKENS in index.ts.`,
  );
} else {
  console.log(`  budget    ~${budget} / 30000 TPM`);
}
