# Sprint 04 — RenderPlan & Composition Core

## Amaç

Semantic DesignSpec ile DOM arasına gerçek visual planning katmanı eklemek.

## Sprint sonucu

Bu sprint sonunda sistemin kazanması gereken kabiliyet:

ScreenRenderPlan ve RenderSection production contract olur.

## Etkilenecek / yeni dosyalar

- `render-plan.ts`
- `composition/composeScreen.ts`
- `composition/shared.ts`

## İş paketleri

- [ ] RenderPlan type
- [ ] semantic node classification
- [ ] section role assignment
- [ ] emphasis rules
- [ ] preset composition modifiers API

## Test planı

- [ ] RenderPlan validation
- [ ] unknown node handling
- [ ] stable ordering

## Kabul kriterleri

- [ ] semantic node order görsel order olmak zorunda değil
- [ ] RenderPlan serializable/deterministic
- [ ] invalid plan explicit error

## Kapsam dışı

Archetype-specific full recipes sonraki sprint.

## Riskler

Semantic information yanlış sınıflandırılabilir.

## Exit gate

Tüm kabul kriterleri PASS olmadan sonraki bağımlı sprint başlayamaz.
