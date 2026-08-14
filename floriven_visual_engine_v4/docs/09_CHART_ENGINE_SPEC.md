# 09 — Chart Engine V2

## Amaç

Generic polyline yaklaşımını gerçek chart family engine'e çevirmek.

## Required families

- LineChart
- AreaChart
- BarChart
- DonutChart
- RadialProgress
- Sparkline
- Heatmap
- SegmentedBar

## Contract

```ts
interface ChartSpec {
  type: ChartType;

  series: {
    id: string;
    label: string;
    values: number[];
  }[];

  xAxis?: AxisSpec;
  yAxis?: AxisSpec;

  target?: number;
  targetRange?: [number, number];

  annotations?: ChartAnnotation[];
  comparison?: ChartComparison;
}
```

## Minimum information quality

Bir chart aşağıdakilerden uygun olanları taşımalıdır:

- label
- time window / domain
- unit
- baseline
- target
- delta
- annotation
- legend
- semantic status

## Preset family mapping

### Obsidian
- line
- bar
- sparkline
- heatmap

### Serene
- area
- radial
- line
- donut

### Terracotta
- bar
- area
- segmented

### Electric
- radial
- bar
- donut
- sparkline

### Editorial
- line
- sparkline
- segmented

## Hard rule

Chart type ismi ile gerçek renderer family aynı olmalıdır.

`radial` seçilip polyline render edilemez.

## Testing

Her family için:
- empty
- one value
- multiple values
- negative
- target
- target range
- narrow viewport
- reduced motion
- high contrast

fixture'ları bulunmalıdır.
