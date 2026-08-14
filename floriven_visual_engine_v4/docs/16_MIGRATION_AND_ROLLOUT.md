# 16 — Migration & Rollout

## Backward compatibility

PresentationSpec 1.0 documents:

```text
compat adapter
  ↓
PresentationSpecV2
```

ile render edilmelidir.

## Strategy identity

Legacy:
- `templateId`

Current:
- `stylePresetId`

read compatibility korunmalı; write path yalnız canonical alan üretmelidir.

## Feature flags

- `visual_engine_v4`
- `presentation_v2`
- `composition_engine_v2`
- `layout_engine_v2`
- `charts_v2`
- `deterministic_v2`
- `runtime_quality_v3`

## Rollout

1. local/internal
2. internal 100%
3. beta 5%
4. beta 25%
5. beta 50%
6. production

## Rollback

Her major subsystem bağımsız rollback edilebilir olmalıdır.

## Data migration rule

Existing documents destructive migration görmemeli.
Runtime compatibility layer tercih edilmelidir.
