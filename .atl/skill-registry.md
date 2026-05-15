# Skill Registry — hic-native

Generated: 2026-05-12

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
| brainstorming | Before creative work — features, components, behavior changes |
| codebase-to-course | Turn codebase into interactive HTML course |
| copywriting | High-converting marketing copy |
| database | Add Postgres, Redis, MySQL, MongoDB |
| deploy | Push code to Railway |
| deployment | Manage Railway deployments, view logs |
| domain | Add/remove Railway domains |
| environment | View/edit Railway environment config |
| find-skills | Discover installable skills |
| metrics | Resource usage, CPU, memory, service performance |
| new | Setup / deploy to Railway / create service |
| notebooklm | Google NotebookLM API |
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
| central-station | Search Railway community threads |

## Project Stack Context

- **Framework**: React Native + Expo (SDK 54) + Expo Router v6
- **Language**: TypeScript (strict mode)
- **Styling**: NativeWind v4 (Tailwind for RN)
- **State**: Zustand v5
- **DB**: expo-sqlite v16
- **Navigation**: File-based (Expo Router)
- **Testing**: ❌ None detected
