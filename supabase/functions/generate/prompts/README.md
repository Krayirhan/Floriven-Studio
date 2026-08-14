# The prompt layer

Four markdown files that become the two system prompts the generator sends to the
model. **Edit the markdown, never `prompts.generated.ts`.**

```bash
pnpm prompts:build      # compile + drift check
pnpm functions:deploy   # compile + drift check + deploy
```

## Why a layer at all

The model never changed across this system's development — `llama-3.3-70b` from
the first version to now. Output went from 2 components per screen to 16. Every
point of that gain came from constraints in this folder, not from the model.

That is also the answer to "why not just use a better model": a stronger model
raises the ceiling but does not remove the need for the layer. Validation, repair
and a contract that matches the renderer are required at any model size.

## Files

| File | One reason to change | Churn |
| --- | --- | --- |
| `contract.md` | the renderer's component vocabulary changed | low |
| `composition.md` | the screen skeleton changed | medium |
| `content.md` | a bad output was observed | **high** |
| `planning.md` | phase 1 behaviour changed | low |

Three of them are concatenated in order — `contract → composition → content` —
into `SYSTEM_PROMPT`. `planning.md` becomes `PLAN_PROMPT` for the separate phase-1
call and does not join the chain.

The order is not cosmetic. The model reads the vocabulary before the skeleton, and
the skeleton before the copy discipline. Rules referring to types the model has not
seen yet land worse.

### Why not five files

The composition recipe, the worked example and the banned-phrase list look like
three concerns and are one. The example demonstrates the recipe, so changing the
recipe invalidates the example. The banned list is derived from the example's own
wording, so changing the example leaves the list guarding strings that no longer
exist while the new example's phrases leak unguarded. They live together in
`composition.md`.

The split becomes five only if you start keeping example sets per vertical — then
`examples/` becomes a folder and each set carries its own banned list.

## How the markdown becomes a prompt

Only text between `<!-- prompt:start -->` and `<!-- prompt:end -->` is compiled.
Everything else — the tables, the rationale, this README — is for humans and never
costs a token.

That separation is what makes the files worth reading. The reasoning behind a rule
is usually longer than the rule, and it is what you need six months later when you
are deciding whether to change it.

## The drift check

`scripts/build-prompts.mjs` fails the build when `contract.md` names a type that
`componentRegistry.ts` does not declare, or that `PhoneScreen.tsx` has no `case`
for.

This is guarded at build time rather than left to a test because the runtime
failure is silent: the model emits the unknown type, `validateScreen()` sees a
structurally valid node, `DesignNodeRenderer` returns `null`, and the node
disappears. No exception, no log line, just a screen with less on it than the model
produced.

The check does **not** catch prop-name drift. If `PhoneScreen.tsx` starts reading
`ListItem.leading`, the table in `contract.md` has to be updated by hand.

## Token budget

A generation costs ~10.200 tokens, measured. Free-tier ceilings, and what that
buys per day:

| Provider | Model | TPM | TPD | generations/day |
| --- | --- | --- | --- | --- |
| Groq | llama-3.3-70b | 12.000 | 100.000 | ~9 |
| **Cerebras** (active) | **gpt-oss-120b** | 30.000 | 1.000.000 | **~98** |

Groq's daily cap is the reason the provider moved. It applies across all users,
not per user, and was discovered the hard way: a day's allowance disappeared into
a single afternoon of prompt iteration.

Switching providers is one constant in [`index.ts`](../index.ts):

```ts
const PROVIDER = PROVIDERS.cerebras   // or PROVIDERS.groq
```

### gpt-oss reasons before it answers

Reasoning tokens are drawn from the same allowance as the answer. At the default
effort a 700-token plan call spent **423 of them on reasoning** and truncated its
own JSON — the function failed with `Unexpected end of JSON input`. At
`reasoning_effort: "low"` it spends ~31 and returns more content, because filling
a rigid schema is not a task that rewards deliberation.

That setting lives in the provider's `extra` block, since Groq's model does not
take it.

`groq()` distinguishes the two in its error message. A per-minute throttle says to
retry shortly; a daily exhaustion says the quota returns tomorrow. Telling a user
to "try again in a minute" when the daily budget is gone sends them into a retry
loop that cannot succeed.

**Anything resembling real usage needs Groq's Dev Tier.** The free tier is a
development budget, and prompt iteration consumes it quickly — each test of a
prompt change costs a full generation.

`max_tokens` counts toward the request size, so a request is rejected with `413`
before it runs if the total would exceed what is left in the window.

| | prompt | `max_tokens` | total |
| --- | --- | --- | --- |
| plan call | ~195 | 700 | ~895 |
| build call | ~2.190 | 7.000 | ~9.190 |
| | | | **~10.085 / 12.000** |

The build prints this and warns past 11.500. If you add enough rules to trip the
warning, lower `BUILD_TOKENS` in [`index.ts`](../index.ts) — 7.000 is roughly
double what three screens actually need, so there is room to give back.

This ceiling is also why the pipeline repairs instead of retrying. A retry is a
second full request; on a 12k budget it is most of a minute.

## What the code enforces, and what only the prompt does

`validateScreen()` and `repairStructure()` in [`index.ts`](../index.ts) cover
structure: node counts, required types, unique ids, `BottomNavigation` last,
one `title`, `a11y` present. A missing `TopAppBar` is injected rather than rejected.

Nothing in the code checks any rule in `content.md`. A screen reading
`Kahvaltı | 2 saat | 10:00` passes validation cleanly. Those rules bind only
because they are written to be checkable by a reader — which, empirically, is the
same property that makes a model follow them.
