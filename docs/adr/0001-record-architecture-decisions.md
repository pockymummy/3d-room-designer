# 0001. Record architecture decisions

- Status: Accepted
- Date: 2026-10-04

## Context
This is a long-running personal project that will grow in phases (materials, furniture, floor-plan editor, UI framework, model catalog). Early choices are easy to forget and hard to revisit without knowing why they were made.

## Decision
Record significant decisions as lightweight ADRs in `docs/adr/`, using the template in `0000-template.md`.

## Consequences
- Small overhead per decision, but the reasoning is preserved.
- Later reversals (e.g. adopting React) become new ADRs that supersede old ones.
