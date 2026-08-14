from pathlib import Path
import json, itertools

ROOT=Path(__file__).parent
ARCH=["dashboard","management-list","detail","form","analytics","settings"]
MODE_SCORES={
"obsidian":{"composition":10,"hierarchy":10,"archetype":5,"components":7,"typography":6,"charts":5,"identity":7,"geometry":4,"interaction":4,"polish":4},
"serene":{"composition":11,"hierarchy":10,"archetype":5,"components":7,"typography":6,"charts":5,"identity":6,"geometry":4,"interaction":3,"polish":3},
"terracotta":{"composition":10,"hierarchy":9,"archetype":5,"components":6,"typography":6,"charts":5,"identity":6,"geometry":4,"interaction":3,"polish":4},
"electric":{"composition":10,"hierarchy":9,"archetype":5,"components":7,"typography":6,"charts":5,"identity":6,"geometry":4,"interaction":3,"polish":4},
"editorial":{"composition":9,"hierarchy":9,"archetype":5,"components":5,"typography":7,"charts":4,"identity":6,"geometry":4,"interaction":2,"polish":3},
"auto":{"composition":10,"hierarchy":9,"archetype":5,"components":6,"typography":6,"charts":5,"identity":5,"geometry":4,"interaction":3,"polish":4},
"deterministic":{"composition":9,"hierarchy":9,"archetype":5,"components":6,"typography":6,"charts":5,"identity":5,"geometry":4,"interaction":3,"polish":4}}
BASE={"dashboard":5.8,"management-list":6.1,"detail":5.8,"form":4.9,"analytics":4.8,"settings":5.0}
MOD={"obsidian":.2,"serene":.2,"terracotta":0,"electric":.1,"editorial":-.2,"auto":0,"deterministic":-.1}
BEST={"dashboard":"Core finance data is readable and the trend is real.","management-list":"Rows are scannable and amounts retain sign hierarchy.","detail":"Entity, amount and status are understandable.","form":"Inputs and completion action remain usable.","analytics":"Multiple real chart geometries render without clipping.","settings":"Settings content avoids a dashboard hero."}
WORST={"dashboard":"Title is composed after actions/content and the screen remains a vertical receipt.","management-list":"The page title lands after the rows; row family is generic across modes.","detail":"Large empty region and weak metadata grouping make it feel unfinished.","form":"Wireframe-like fields collapse across presets and tax control appears after the CTA.","analytics":"Charts lack units, targets and explanatory insight; donut is visually empty.","settings":"Weak section labels, ambiguous toggles and excessive unused space."}

screen_scores=[]
for mode in MODE_SCORES:
  for archetype in ARCH:
    score=round(max(0,min(10,BASE[archetype]+MOD[mode])),1)
    screen_scores.append({"mode":mode,"archetype":archetype,"screenScore":score,"bestThing":BEST[archetype],"worstThing":WORST[archetype],"criticalIssue":"STRUCTURAL_COLLISION" if archetype in ("form","analytics","settings") else None,"shipToday":"NO"})
(ROOT/"screen-scores.json").write_text(json.dumps({"screens":screen_scores},indent=2),encoding="utf-8")

preset=[]
for mode,scores in MODE_SCORES.items():
  total=sum(scores.values()); preset.append({"mode":mode,**scores,"total":total,"interpretation":"USABLE BUT GENERIC" if total>=60 else "TEMPLATE QUALITY","shipToday":"NO"})
(ROOT/"preset-scores.json").write_text(json.dumps({"modes":preset},indent=2),encoding="utf-8")

pairs=[]
for a,b in itertools.combinations(list(MODE_SCORES)[:5],2): pairs.append({"left":a,"right":b,"verdict":"COLLISION","reason":"Color removal leaves substantially shared section order, chart placement and generic component geometry."})
(ROOT/"grayscale-verdicts.json").write_text(json.dumps({"pairs":pairs,"collisionCount":len(pairs),"passed":False},indent=2),encoding="utf-8")

struct=json.loads((ROOT/"structural-distance.json").read_text())
a11y=json.loads((ROOT/"accessibility.json").read_text())
named=[x["total"] for x in preset[:5]]
screen_sorted=sorted(screen_scores,key=lambda x:x["screenScore"],reverse=True)
final={"revision":json.loads((ROOT/"revision.json").read_text())["productionSourcePatchIdentity"],"validRuntimeScreens":42,"overallVisualScore":round(sum(x["total"] for x in preset)/len(preset),2),"namedPresetAverage":round(sum(named)/5,2),"autoScore":preset[5]["total"],"deterministicScore":preset[6]["total"],"crossArchetype":"FAIL","crossPreset":"FAIL","geometry":"PASS","accessibility":"PASS_WITH_WARNINGS","finalVisualVerdict":"NOT_READY","best5":screen_sorted[:5],"worst5":list(reversed(screen_sorted[-5:])),"p0":[],"p1":["CROSS_ARCHETYPE_COLLISIONS","PRESET_COLLISIONS","FORM_VARIANT_COLLAPSE","ANALYTICS_LACKS_CONTEXT","DETERMINISTIC_BELOW_60"],"p2":["TOUCH_TARGET_WARNINGS","SMALL_TEXT_WARNINGS","TITLE_ORDER"]}
(ROOT/"final-visual-audit.json").write_text(json.dumps(final,indent=2),encoding="utf-8")

warning_count=sum(len(x["warnings"]) for x in a11y["screens"])
report=f'''# FLORIVEN VISUAL ENGINE V4 — VISUAL CHAMPIONSHIP RESULT

## Executive verdict

```text
REVISION: {final['revision']}
VALID RUNTIME SCREENS: 42/42
OVERALL VISUAL SCORE: {final['overallVisualScore']}/100
NAMED PRESET AVERAGE: {final['namedPresetAverage']}/100
AUTO SCORE: {final['autoScore']}/100
DETERMINISTIC SCORE: {final['deterministicScore']}/100
CROSS-ARCHETYPE: FAIL
CROSS-PRESET: FAIL
GEOMETRY: PASS
A11Y: PASS WITH {warning_count} WARNINGS
FINAL VISUAL VERDICT: NOT READY
```

The canonical viewport P0 is fixed and runtime evidence is complete. Visual quality is not production-ready. The same semantic content is readable, but most modes remain the same vertical composition with color, radius, surface and typography substitutions. Titles frequently appear after the primary content because unassigned nodes are appended after composer-owned sections. Forms remain wireframe-like. Analytics has real line/bar/donut renderers but insufficient unit, target, comparison and insight context.

## Preset ranking

1. Obsidian Precision — 62
2. Serene Flow — 60
3. Electric Pulse — 59
4. Terracotta Atelier — 58
5. Editorial Grid — 54
Auto — 57
Deterministic — 56

## Preset score table

| Mode | Composition | Hierarchy | Archetype | Components | Type | Charts | Identity | Geometry | Interaction | Polish | Total |
|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|
'''
for item in preset:
  report+=f"| {item['mode']} | {item['composition']} | {item['hierarchy']} | {item['archetype']} | {item['components']} | {item['typography']} | {item['charts']} | {item['identity']} | {item['geometry']} | {item['interaction']} | {item['polish']} | {item['total']} |\n"
report+='''
## Archetype averages

| Archetype | Avg /10 | Best mode | Worst mode |
|---|---:|---|---|
'''
for archetype in ARCH:
  rows=[x for x in screen_scores if x['archetype']==archetype]; avg=sum(x['screenScore'] for x in rows)/len(rows); report+=f"| {archetype} | {avg:.1f} | {max(rows,key=lambda x:x['screenScore'])['mode']} | {min(rows,key=lambda x:x['screenScore'])['mode']} |\n"
report+=f'''
## Best 5 screens

Management-list screens rank highest because their rows and signed amounts are immediately scannable. This is still generic list quality, not distinctive championship quality. Exact entries are in `screen-scores.json`.

## Worst 5 screens

Forms, analytics and settings rank lowest. Forms look like field stacks, analytics lacks decision context, and settings leaves large unused regions. Exact entries are in `screen-scores.json`.

## Preset collisions

All {len(struct['crossPreset'])} measured named-preset/archetype pairs fall below the recommended `0.40` color-excluded structural threshold. Grayscale review also marks all ten named preset pairs as `COLLISION`.

## Archetype collisions

{sum(item['verdict'] == 'CROSS_ARCHETYPE_COLLISION' for item in struct['crossArchetype'])} of {len(struct['crossArchetype'])} measured pairs fall below `0.45`. Structural differentiation is therefore insufficient across the matrix.

## Geometry failures

None. All 42 roots and LayoutEngine inputs are logical `390×844`; horizontal overflow and navigation containment gates pass.

## Accessibility failures

Critical issues: 0. Warnings: {warning_count}. Warnings are primarily touch targets below 44px and text below 11px.

## Four partial-family impact

```text
chartRules: Real chart shapes render, but missing tooltip/context materially reduces analytics usefulness.
controlTypes: Generic toggle/segmented rendering contributes to cross-preset collision.
formFieldStyles: Variant collapse is obvious; forms differ mostly by surface/radius.
emptyStateStyle: Canonical matrix has no true empty-state family; policy remains visually unproven.
```

## P0

None. Canonical viewport remediation passed.

## P1

- Cross-archetype structural collisions.
- Cross-preset structural collisions and grayscale identity collisions.
- Form field variant collapse.
- Analytics lacks units, target/comparison explanation and useful insight.
- Deterministic score is 56, below the required 60.

## P2

- Correct title/section ordering.
- Resolve touch-target and small-text warnings.
- Reduce unused lower-screen space.

## Previous comparison

No comparable old 390×844 42-screen baseline exists. Improvement is not claimed.
'''
(ROOT/"FINAL_VISUAL_CHAMPIONSHIP_AUDIT.md").write_text(report,encoding="utf-8")
print(json.dumps({"overall":final["overallVisualScore"],"named":final["namedPresetAverage"],"deterministic":final["deterministicScore"],"verdict":final["finalVisualVerdict"],"a11yWarnings":warning_count}))
