# Skill Registry — HICAPP (hic-native)

Generated: 2026-05-18

## Project Conventions

- **Agent config**: `C:\Users\andre\.config\opencode\AGENTS.md` (user-level)
- No project-level AGENTS.md / CLAUDE.md found

## Available Skills

### SDD Workflow Skills (user-level: ~/.config/opencode/skills/)

| Skill | Trigger |
|-------|---------|
| sdd-init | Initialize SDD context in project |
| sdd-explore | Explore and investigate ideas before committing to a change |
| sdd-propose | Create a change proposal with intent, scope, and approach |
| sdd-spec | Write specifications with requirements and scenarios |
| sdd-design | Create technical design document |
| sdd-tasks | Break down a change into implementation task checklist |
| sdd-apply | Implement tasks from the change |
| sdd-verify | Validate implementation matches specs |
| sdd-archive | Sync delta specs and archive completed change |
| sdd-onboard | Guided end-to-end SDD walkthrough |
| branch-pr | PR creation workflow |
| issue-creation | GitHub issue creation workflow |
| judgment-day | Parallel adversarial review protocol |
| go-testing | Go testing patterns (Bubbletea TUI) |
| skill-creator | Creates new AI agent skills |
| skill-registry | Create or update skill registry |

### Extended Skills (user-level: ~/.claude/skills/)

| Skill | Trigger |
|-------|---------|
| codebase-to-course | Turn codebase into interactive HTML course |
| notebooklm | Google NotebookLM API |

### Agent Skills (user-level: ~/.agents/skills/)

| Skill | Trigger |
|-------|---------|
| brainstorming | Before creative work — features, components, behavior changes |
| central-station | Search Railway community threads |
| copywriting | High-converting marketing copy |
| database | Add Postgres, Redis, MySQL, MongoDB |
| deploy | Push code to Railway |
| deployment | Manage Railway deployments, view logs |
| domain | Add/remove Railway domains |
| environment | View/edit Railway environment config |
| find-skills | Discover installable skills |
| metrics | Resource usage, CPU, memory, service performance |
| new | Setup / deploy to Railway / create service |
| obsidian-bases | Create/edit Obsidian Bases (.base files) |
| obsidian-cli | Interact with Obsidian vault via CLI |
| obsidian-markdown | Obsidian Flavored Markdown |
| obsidian-vault | Search/create/manage Obsidian notes |
| projects | List/switch/rename Railway projects |
| railway-docs | Fetch Railway docs |
| service | Railway service status/rename/icons |
| social-content | Social media content creation |
| status | Railway deployment status |
| templates | Deploy services from Railway templates |

### Superpowers Skills (cache: ~/.cache/opencode/packages/superpowers/)

| Skill | Trigger |
|-------|---------|
| brainstorming | Before creative work — features, components, behavior changes |
| dispatching-parallel-agents | 2+ independent tasks that can run in parallel |
| executing-plans | Execute written implementation plan with review checkpoints |
| finishing-a-development-branch | Work complete, deciding how to integrate |
| receiving-code-review | When receiving code review feedback |
| requesting-code-review | Completing tasks / before merging |
| subagent-driven-development | Execute implementation plans with independent tasks |
| systematic-debugging | Any bug, test failure, or unexpected behavior |
| test-driven-development | Implementing feature or bugfix |
| using-git-worktrees | Feature work needing isolation from current workspace |
| using-superpowers | Starting any conversation |
| verification-before-completion | Before claiming work is complete |
| writing-plans | Have spec or requirements for a multi-step task |
| writing-skills | Creating or editing skills |

## Project Stack Context

- **Framework**: React Native 0.81.5 + Expo SDK 54 + Expo Router v6
- **Language**: TypeScript 5.9 (strict mode, nativewind types)
- **Styling**: NativeWind v4 (Tailwind CSS for RN) — custom design tokens in tailwind.config.js
- **State**: Zustand v5 (flat store, SQLite-hydrated)
- **DB**: expo-sqlite v16 (schema: user, goals, mi_dia_log, photos)
- **Navigation**: File-based routing (Expo Router) — tabs: metas, dia, fotos, perfil
- **Architecture**: New Architecture enabled (newArchEnabled: true)
- **Package**: mx.hospitalinfantil.hic
- **Testing**: ❌ None detected — no jest/vitest/mocha in devDependencies
- **Linter**: ❌ None detected
- **Type Checker**: ✅ tsc --noEmit (tsconfig strict mode)
- **Formatter**: ❌ None detected

## Component Structure

```
components/
  chrome/        — App-chrome: ScreenHeader, TabBar
  primitives/    — Atomic UI: Badge, Button, Card, Chip, Icon, Input, ProgressBar, Stepper
  screens/       — Feature UI: GoalCard, MiDiaCard, MiniGrid, SVGRing
```

## Route Structure

```
app/
  _layout.tsx         — Root layout (fonts + DB init + SafeAreaProvider)
  index.tsx           — Auth guard (redirect to /onboarding or /(tabs)/metas)
  (tabs)/             — Tab navigator (metas, dia, fotos, perfil)
  onboarding/         — Onboarding flow
  goal-detail/        — Goal detail screen
  goal-renewal/       — Goal renewal flow
  edit-profile/       — Edit profile screen
  modals/             — Modal screens
  reporte-mensual/    — Monthly report screen
```
