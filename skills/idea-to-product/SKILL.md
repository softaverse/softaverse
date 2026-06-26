---
name: idea-to-product
description: "Concise end-to-end skill for turning product ideas into an actionable plan and implementation path. Trigger: user describes a product/feature, asks for planning, or requests an implementation-ready plan."
---

# Idea → Product (concise)

Purpose: Guide discovery, produce a practical planning document, and deliver an implementation roadmap. Keep long examples and templates in references and open them only when needed.

## Core rule
Keep SKILL.md short: discovery metadata, essential workflow, routing map. Move templates and long examples to references/output-templates.md.

## Quick flow
Discovery → Planning → Review → Build
- Discovery: 3–5 focused questions per round (Why → What → How).
- Planning: produce a single actionable document (use references/output-templates.md to pick a template).
- Review: iterate until scope is agreed.
- Build: implement in P0→P1→P2 order, check in after each module.

## Phase transition (short)
Move from Discovery → Planning when core user roles, main flows, and MVP scope are clear and major constraints are identified.

## Routing map (when to read references)
- Phase 2 document output: read `references/output-templates.md` (choose Feature List / PRD / Tech Spec based on project scale).
- For deep technical specs, open `references/technical-spec.md` if available (fallback to PRD+Tech sections in output-templates).

Fallback: If a topic is not covered locally, cite official docs (link briefly) and keep external instructions minimal.

## Minimal quality checks
- SKILL.md fits in memory and only routes to references.
- Planning output includes: one-liner, roles, prioritized feature list, 1–2 user flows, data model sketch, tech recommendation, MVP scope, open questions, risk register.
- Documents must be actionable: an engineer can start implementation from them.

## Communication & guardrails (short)
- Use user's language; keep technical terms in English.
- Ask opinionated, direct questions; offer clear recommendations.
- If user wants to skip discovery, ask 3 key questions before starting.

## References
- `references/output-templates.md` — templates for Feature List, PRD, Tech Spec, User Stories, Decision Log, API Requirements.

---

(For long examples, data models, and templates see references/output-templates.md — open only when producing Phase 2 artifacts.)
