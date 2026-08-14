from pathlib import Path
from PIL import Image, ImageOps, ImageDraw
import json, math, itertools

ROOT = Path(__file__).parent
MODES = ["obsidian", "serene", "terracotta", "electric", "editorial", "auto", "deterministic"]
NAMED = MODES[:5]
ARCHETYPES = ["dashboard", "management-list", "detail", "form", "analytics", "settings"]

def load_image(mode, archetype):
    return Image.open(ROOT / "screenshots" / mode / f"{archetype}.png").convert("RGB")

def sheet(images, labels, columns, target):
    thumb_w, thumb_h, label_h = 390, 844, 34
    rows = math.ceil(len(images) / columns)
    canvas = Image.new("RGB", (columns * thumb_w, rows * (thumb_h + label_h)), "#101010")
    draw = ImageDraw.Draw(canvas)
    for index, (image, label) in enumerate(zip(images, labels)):
        x, y = index % columns * thumb_w, index // columns * (thumb_h + label_h)
        canvas.paste(image.resize((thumb_w, thumb_h)), (x, y + label_h))
        draw.text((x + 8, y + 9), label, fill="white")
    target.parent.mkdir(parents=True, exist_ok=True)
    canvas.save(target)

for mode in MODES:
    sheet([load_image(mode, a) for a in ARCHETYPES], ARCHETYPES, 3, ROOT / "contact-sheets" / f"mode-{mode}.png")
for archetype in ARCHETYPES:
    sheet([load_image(m, archetype) for m in MODES], MODES, 4, ROOT / "contact-sheets" / f"archetype-{archetype}.png")
for mode in NAMED:
    for archetype in ARCHETYPES:
        target = ROOT / "grayscale" / mode / f"{archetype}.png"
        target.parent.mkdir(parents=True, exist_ok=True)
        ImageOps.grayscale(load_image(mode, archetype)).save(target)
    sheet([Image.open(ROOT / "grayscale" / mode / f"{a}.png").convert("RGB") for a in ARCHETYPES], ARCHETYPES, 3, ROOT / "contact-sheets" / f"grayscale-{mode}.png")

def geom(mode, archetype):
    return json.loads((ROOT / "geometry" / mode / f"{archetype}.json").read_text(encoding="utf-8"))

def signature(g):
    nodes = g["nodes"]
    sections = g.get("sections", [])
    roles = [(s.get("role"), s.get("order"), s.get("span"), s.get("emphasis"), s.get("family")) for s in sections]
    components = sorted(n.get("component") or "none" for n in nodes)
    boxes = [(round(s["x"] / 390, 2), round(s["y"] / 844, 2), round(s["width"] / 390, 2), round(s["height"] / 844, 2)) for s in sections]
    dominant = sum(1 for s in sections if s.get("emphasis") == "primary")
    fields = sum(1 for n in nodes if n.get("sectionRole") == "field-group")
    charts = sorted(s.get("family") for s in sections if s.get("role") in ("dominant-chart", "breakdown", "trend-progress"))
    navigation = any(n.get("component") == "nav" for n in nodes)
    return {"pattern": g.get("layoutPattern"), "roles": roles, "components": components, "boxes": boxes, "dominant": dominant, "fields": fields, "charts": charts, "navigation": navigation}

def distance(a, b):
    sa, sb = signature(a), signature(b)
    role_a, role_b = set(sa["roles"]), set(sb["roles"])
    role_distance = 1 - len(role_a & role_b) / max(len(role_a | role_b), 1)
    component_distance = 1 - len(set(sa["components"]) & set(sb["components"])) / max(len(set(sa["components"]) | set(sb["components"])), 1)
    pattern_distance = 0 if sa["pattern"] == sb["pattern"] else 1
    n = max(len(sa["boxes"]), len(sb["boxes"]), 1)
    box_distance = abs(len(sa["boxes"]) - len(sb["boxes"])) / n
    for left, right in zip(sa["boxes"], sb["boxes"]): box_distance += sum(abs(x-y) for x,y in zip(left,right)) / (4*n)
    semantic_distance = (abs(sa["dominant"] - sb["dominant"]) + abs(sa["fields"] - sb["fields"]) + (0 if sa["charts"] == sb["charts"] else 1) + (0 if sa["navigation"] == sb["navigation"] else 1)) / 4
    return round(min(1, .35*role_distance + .15*component_distance + .20*pattern_distance + .20*box_distance + .10*semantic_distance), 4)

cross_archetype, cross_preset = [], []
for mode in MODES:
    for a,b in itertools.combinations(ARCHETYPES,2): cross_archetype.append({"mode":mode,"left":a,"right":b,"distance":distance(geom(mode,a),geom(mode,b)),"threshold":.45})
for archetype in ARCHETYPES:
    for a,b in itertools.combinations(NAMED,2): cross_preset.append({"archetype":archetype,"left":a,"right":b,"distance":distance(geom(a,archetype),geom(b,archetype)),"threshold":.40})
for item in cross_archetype: item["verdict"] = "PASS" if item["distance"] >= item["threshold"] else "CROSS_ARCHETYPE_COLLISION"
for item in cross_preset: item["verdict"] = "PASS" if item["distance"] >= item["threshold"] else "PRESET_COLLISION"
(ROOT / "structural-distance.json").write_text(json.dumps({"crossArchetype":cross_archetype,"crossPreset":cross_preset,"crossArchetypePassed":all(x["verdict"]=="PASS" for x in cross_archetype),"crossPresetPassed":all(x["verdict"]=="PASS" for x in cross_preset)},indent=2),encoding="utf-8")

a11y = []
for mode in MODES:
    for archetype in ARCHETYPES:
        g=geom(mode,archetype); issues=[]; warnings=[]
        if g["horizontalOverflow"]: issues.append("HORIZONTAL_OVERFLOW")
        if not g["navigationInside"]: issues.append("NAVIGATION_COLLISION")
        target=g.get("minimumTouchTarget")
        if target is not None and target < 44: warnings.append(f"TOUCH_TARGET_BELOW_44:{target:.2f}")
        small=[n["nodeId"] for n in g["nodes"] if n.get("fontSize") and float(n["fontSize"].replace("px","")) < 11]
        if small: warnings.append(f"SMALL_TEXT:{len(small)}")
        a11y.append({"mode":mode,"archetype":archetype,"criticalIssues":issues,"warnings":warnings,"passed":not issues})
(ROOT / "accessibility.json").write_text(json.dumps({"screens":a11y,"criticalIssueCount":sum(len(x["criticalIssues"]) for x in a11y),"passed":all(x["passed"] for x in a11y)},indent=2),encoding="utf-8")
print(json.dumps({"screenshots":42,"grayscale":30,"contactSheets":13,"crossArchetypeCollisions":sum(x["verdict"]!="PASS" for x in cross_archetype),"crossPresetCollisions":sum(x["verdict"]!="PASS" for x in cross_preset),"a11yCritical":sum(len(x["criticalIssues"]) for x in a11y)}))
