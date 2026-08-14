# 11 — Auto Design Director

## Problem

Auto mode birkaç bağımsız enum seçerek coherent visual system garanti edemez.

## Hedef

Auto mode bir görsel yön seçmeli ve resolver bunu coherent grammar'a dönüştürmelidir.

## Decision contract

```ts
interface AutoDesignDecision {
  mood: "technical" | "calm" | "tactile" | "energetic" | "editorial";
  informationDensity: "compact" | "balanced" | "spacious";
  hierarchyStyle: "metric-led" | "content-led" | "progress-led" | "type-led";
  surfaceLanguage: SurfaceStyle;
  chartLanguage: ChartLanguage;
  typographyLanguage: TypographyLanguage;
  interactionLanguage: InteractionStyle;
  compositionLanguage: LayoutPattern[];
}
```

## Coherence validation

Aşağıdaki tür Frankenstein combinations explicit rationale olmadan reddedilir:

- editorial typography + neon gaming surfaces
- dense operational charts + wellness spacing
- minimal navigation + floating action-heavy interaction

## Domain safety

Auto visual direction:
- product vocabulary üretmez,
- domain component seçmez,
- screen jobs değiştirmez.

## Scoring

Auto candidate:
- domain fit
- density fit
- usage-context fit
- coherence
- accessibility

üzerinden değerlendirilir.
