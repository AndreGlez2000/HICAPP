# Skill Registry — HICAPP

**Delegator use only.** Any agent that launches sub-agents reads this registry to resolve compact rules, then injects them directly into sub-agent prompts. Sub-agents do NOT read this registry or individual SKILL.md files.

Generated: 2026-05-19

See `_shared/skill-resolver.md` for the full resolution protocol.

## User Skills

| Trigger | Skill | Path |
|---------|-------|------|
| When creating a pull request, opening a PR, or preparing changes for review. | branch-pr | /home/andre/.config/opencode/skills/branch-pr/SKILL.md |
| When creating a GitHub issue, reporting a bug, or requesting a feature. | issue-creation | /home/andre/.config/opencode/skills/issue-creation/SKILL.md |
| When user asks to create a new skill, add agent instructions, or document patterns for AI. | skill-creator | /home/andre/.config/opencode/skills/skill-creator/SKILL.md |
| When writing Go tests, using teatest, or adding test coverage. | go-testing | /home/andre/.config/opencode/skills/go-testing/SKILL.md |
| When user says judgment day/judgment-day/review adversarial/dual review/doble review/juzgar/que lo juzguen. | judgment-day | /home/andre/.config/opencode/skills/judgment-day/SKILL.md |
| When user wants an interactive course/tutorial/walkthrough from a codebase. | codebase-to-course | /home/andre/.config/opencode/skills/codebase-to-course/SKILL.md |
| Explicit /notebooklm or intent like create a podcast/quiz/summary from sources. | notebooklm | /home/andre/.claude/skills/notebooklm/SKILL.md |
| When writing/reviewing/optimizing Postgres queries, schema, or DB config. | supabase-postgres-best-practices | /home/andre/.agents/skills/supabase-postgres-best-practices/SKILL.md |

## Compact Rules

Pre-digested rules per skill. Delegators copy matching blocks into sub-agent prompts as `## Project Standards (auto-resolved)`.

### branch-pr
- PRs MUST link an approved issue with status:approved.
- PRs MUST have exactly one `type:*` label matching the PR template checkbox.
- Follow branch naming regex: `^(feat|fix|chore|docs|style|refactor|perf|test|build|ci|revert)/[a-z0-9._-]+$`.
- Use conventional commits: `type(scope): description` (scope optional).
- Run shellcheck on modified scripts before PR.
- PR body must include linked issue, summary, changes table, and test plan.
- No blank PRs; GitHub checks will block missing issue linkage.

### issue-creation
- Blank issues disabled — MUST use bug or feature template.
- New issues auto-label `status:needs-review`; maintainer must add `status:approved` before any PR.
- Questions go to Discussions, not issues.
- Fill all required fields in templates (steps, expected/actual, environment, etc.).
- Search for duplicates before filing.

### skill-creator
- Create a skill only for reusable patterns (not one-offs).
- Use `skills/{skill-name}/SKILL.md` with complete frontmatter.
- `license` must be Apache-2.0; `metadata.author` must be gentleman-programming.
- Description must include a Trigger sentence.
- Keep critical patterns concise; minimal code examples only.
- Use naming conventions (technology or project-component).
- Add the new skill to AGENTS.md.

### go-testing
- Prefer table-driven tests for multiple cases.
- Test Bubbletea models via `Model.Update()` state transitions.
- Use `teatest.NewTestModel()` for interactive flows.
- Use golden files for view rendering output.
- Use `t.TempDir()` for file ops; avoid global state.
- Use `go test -cover` for coverage when needed.

### judgment-day
- Resolve skills from registry BEFORE launching judges.
- Launch two blind judges in parallel via delegate; never review yourself.
- Classify warnings as real vs theoretical (only real blocks).
- Round 1: present verdict and ask user before fixes.
- After fixes, re-judge; after 2 iterations, ask user to continue or escalate.
- APPROVED only when 0 CRITICAL and 0 real WARNINGs (theoretical/suggestions may remain).
- Do not commit/push after fixes until re-judgment completes.

### codebase-to-course
- Output is a directory with `styles.css`, `main.js`, per-module HTML, and `index.html` built by `build.sh`.
- Copy `styles.css`, `main.js`, `_footer.html`, `build.sh` from references verbatim.
- `_base.html` only changes title, accent palette, and nav dots.
- Module files contain ONLY `<section class="module" ...>` content (no boilerplate).
- Every module must include code↔English translation + quiz + glossary tooltips.
- Include at least one group chat animation and one data-flow animation across the course.
- Never regenerate CSS/JS; wire interactions with `data-*` attributes.

### notebooklm
- Authenticate first (`notebooklm login`) and verify with `notebooklm status`.
- Ask before destructive or write-to-disk operations (delete/generate/download).
- Use explicit notebook IDs in parallel workflows; avoid `use` when parallel.
- Prefer `--json` outputs to parse IDs reliably.
- Expect rate limits on generation; retry after delay if needed.
- Sources must be READY before generation.

### supabase-postgres-best-practices
- Apply when writing/reviewing SQL, schema, or DB configuration.
- Prioritize query performance, connection management, and RLS security rules.
- Use rule references for concrete patterns (indexes, partial indexes, locking).
- Favor Postgres-native features with measured impact.
- Validate changes with EXPLAIN/metrics when optimizing.

## Project Conventions

| File | Path | Notes |
|------|------|-------|
| None | — | No AGENTS.md / CLAUDE.md / GEMINI.md / .cursorrules / copilot-instructions.md in project root. |
