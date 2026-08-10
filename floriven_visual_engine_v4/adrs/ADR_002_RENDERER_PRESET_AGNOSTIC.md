# ADR-002 — Renderer Must Be Preset-Agnostic

Status: Accepted

## Decision

Renderer `obsidian`, `editorial`, `serene` gibi preset identity'lerine branch etmeyecek.

Preset resolver:
- family
- tokens
- layout
- states

üretecek.

Renderer yalnız bu resolved values'ı uygulayacak.

## Rationale

Preset sayısı arttıkça renderer if/else ağacı ölçeklenemez ve visual grammar logic'i dağılır.
