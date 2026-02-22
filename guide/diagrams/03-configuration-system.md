---
title: "Claude Code — Configuration System Diagrams"
description: "Config precedence, skills vs commands vs agents, agent lifecycle, hooks pipeline"
tags: [configuration, hooks, agents, skills, commands]
---

# Configuration System

How Claude Code loads settings, resolves conflicts, and orchestrates extensibility.

---

### Configuration Precedence (5 Levels)

Claude Code resolves settings through a strict priority hierarchy. Higher layers override lower ones. Knowing this prevents "why isn't my config working?" bugs.

```mermaid
flowchart TD
    A["1️⃣ CLI Flags\n--model, --dangerously-skip-permissions\n--max-turns, --system-prompt"] --> B["2️⃣ Environment Variables\nANTHROPIC_API_KEY\nCLAUDE_MODEL, CLAUDE_CONFIG"]
    B --> C["3️⃣ Project Config\n.claude/settings.json\n.claude/settings.local.json"]
    C --> D["4️⃣ Global Config\n~/.claude/settings.json\n~/.claude/CLAUDE.md"]
    D --> E["5️⃣ Built-in Defaults\nHardcoded in Claude Code binary"]

    A1["Highest priority\nOverrides everything\nUse: automation, CI/CD"] --> A
    E1["Lowest priority\nFallback values\nUse: baseline behavior"] --> E

    style A fill:#E87E2F,color:#fff
    style B fill:#6DB3F2,color:#fff
    style C fill:#6DB3F2,color:#fff
    style D fill:#F5E6D3,color:#333
    style E fill:#B8B8B8,color:#333
    style A1 fill:#B8B8B8,color:#333
    style E1 fill:#B8B8B8,color:#333
```

<details>
<summary>ASCII version</summary>

```
PRIORITY (highest to lowest)
═══════════════════════════
1. CLI Flags            ← --model, --system-prompt
2. Environment Vars     ← ANTHROPIC_API_KEY
3. Project .claude/     ← settings.json, settings.local.json
4. Global ~/.claude/    ← settings.json, CLAUDE.md
5. Built-in defaults    ← hardcoded fallbacks
```

</details>

> **Source**: [Configuration System](../ultimate-guide.md#configuration) — Line ~3686

---

### Skills vs. Commands vs. Agents — When to Use Each

Three extensibility mechanisms with different purposes and tradeoffs. Choosing the wrong abstraction leads to over-engineering or under-powered automation.

```mermaid
flowchart LR
    subgraph SKILLS["📦 Skills (.claude/skills/)"]
        S1[Bundled capability\nwith resources]
        S2[Invoked via /skillname]
        S3[Portable across projects]
        S4["Use for: reusable\ncross-project capabilities"]
    end

    subgraph COMMANDS["⚡ Commands (.claude/commands/)"]
        C1[Simple template\nor script]
        C2[Project slash command]
        C3[Project-specific only]
        C4["Use for: project\nautomation, shortcuts"]
    end

    subgraph AGENTS["🤖 Agents (.claude/agents/)"]
        A1[Full autonomous agent]
        A2[Own tool set & CLAUDE.md]
        A3[Spawned via Task tool]
        A4["Use for: complex\ndelegated tasks"]
    end

    Q{What are\nyou building?} --> |Reusable feature| SKILLS
    Q --> |Project shortcut| COMMANDS
    Q --> |Complex sub-task| AGENTS

    style S1 fill:#6DB3F2,color:#fff
    style S4 fill:#7BC47F,color:#333
    style C1 fill:#F5E6D3,color:#333
    style C4 fill:#7BC47F,color:#333
    style A1 fill:#E87E2F,color:#fff
    style A4 fill:#7BC47F,color:#333
    style Q fill:#E87E2F,color:#fff
```

<details>
<summary>ASCII version</summary>

```
                    Skills              Commands           Agents
Location:      .claude/skills/     .claude/commands/  .claude/agents/
Trigger:       /skillname          /commandname       Task tool
Scope:         Cross-project       This project       Any context
Complexity:    Medium (bundled)    Low (template)     High (autonomous)
Use when:      Reusable caps       Quick shortcuts    Complex tasks
```

</details>

> **Source**: [Extensibility System](../ultimate-guide.md#extensibility) — Line ~4420, ~4950, ~3827

---

### Agent Lifecycle & Scope Isolation

Sub-agents run in complete isolation from the parent. They receive a copy of context but share no state. Understanding this prevents "why can't my sub-agent see X?" confusion.

```mermaid
sequenceDiagram
    participant P as Parent Claude
    participant T as Task Tool
    participant S as Sub-Agent
    participant FS as File System

    P->>T: Task(prompt, tools_allowed)
    T->>S: Spawn new Claude instance
    Note over S: Gets: prompt + tool grants\nDoes NOT get: parent conversation

    S->>FS: Read files (if granted)
    S->>FS: Edit files (if granted)
    S->>S: Independent reasoning

    Note over S,FS: Fully isolated execution
    Note over S: No access to parent state

    S->>T: Return: text result only
    T->>P: Result string
    P->>P: Continues with result

    Note over P,T: Parent sees only final text\nNo side-effects leaked back
```

<details>
<summary>ASCII version</summary>

```
Parent ──Task(prompt, tools)──► Sub-Agent
                                    │
                               [isolated exec]
                               - read files
                               - edit files
                               - bash (if allowed)
                                    │
Parent ◄───── text result ──────────┘
(no state sharing, no side effects back)
```

</details>

> **Source**: [Sub-Agents](../ultimate-guide.md#sub-agents) — Line ~3827

---

### Hooks Event Pipeline

Hooks let you run custom code at key points in Claude Code's lifecycle — for security scanning, logging, enforcement, or notifications. The execution order matters.

```mermaid
flowchart TD
    A([User sends message]) --> B{PreToolUse Hook}
    B -->|Exit 0: allow| C[Tool executes]
    B -->|Exit 1: block| D([Tool blocked\nClause stops])
    C --> E{PostToolUse Hook}
    E --> F[Next tool or response]
    F --> G{More tool calls?}
    G -->|Yes| B
    G -->|No| H([Session ends])
    H --> I{Stop Hook}
    I --> J([Complete])

    K{PreCompact Hook} -.->|Before /compact| L[/compact runs]
    L --> M{PostCompact Hook}

    style B fill:#E87E2F,color:#fff
    style D fill:#E85D5D,color:#fff
    style E fill:#E87E2F,color:#fff
    style I fill:#E87E2F,color:#fff
    style K fill:#6DB3F2,color:#fff
    style M fill:#6DB3F2,color:#fff
    style C fill:#7BC47F,color:#333
    style J fill:#7BC47F,color:#333
```

<details>
<summary>ASCII version</summary>

```
User message
     │
 PreToolUse ──exit 1──► BLOCKED
     │ exit 0
     ▼
Tool executes
     │
PostToolUse
     │
More tools? ──yes──► PreToolUse (loop)
     │ no
Session ends
     │
  Stop Hook
     │
 Complete

Separately: PreCompact ──► /compact ──► PostCompact
```

</details>

> **Source**: [Hooks System](../ultimate-guide.md#hooks) — Line ~5273
