# Refactor / Rewrite Checklist

Use this checklist when refactoring a Skill into a concise SKILL.md plus reference files.

1. Inspect current structure
   - Files: SKILL.md, references/, assets, scripts
   - Note duplicated sections, long examples, and large lookup tables

2. Identify content categories
   - Trigger metadata (when to run the skill)
   - Essential workflow (discovery → planning → review → build)
   - Routing decisions (which references to open for which tasks)
   - Examples, templates, long checklists, lookup material

3. Keep only in SKILL.md
   - Discovery metadata, essential workflow, routing map, fallback rule, minimal quality checks

4. Move to references/
   - Templates, long examples, step-by-step technical guides, QA/checklists, large lookups
   - Split by topic (e.g., output-templates.md, technical-spec.md, qa-checks.md)

5. Update routing map
   - Add clear link and "when to open" guidance for each reference file
   - Use one-hop references (SKILL.md -> references/file.md)

6. Remove duplicates
   - Ensure each rule/example/source list lives in one file only

7. Add fallback guidance
   - If a topic isn't covered locally, cite official docs and keep external-step instructions minimal

8. Quality gate before commit
   - SKILL.md < 1 screen (loads quickly)
   - Each reference has one clear purpose and filename matches intent
   - Update references/README.md if files added/removed/renamed

9. After refactor
   - Spot-check common user flows to ensure agent can find needed reference quickly
   - Run a short usability pass: ask the agent to produce Phase 2 output for a sample idea and time how long it takes to locate templates
