---
title: "Claude Code — Foundations Diagrams"
description: "Core concepts: 4-layer model, workflow pipeline, decision tree, permission modes"
tags: [foundations, architecture, getting-started]
---

# Foundations

Core concepts that explain what Claude Code is and how it fundamentally operates.

---

### "Chatbot to Context System" — 4-Layer Model

Claude Code isn't a chatbot — it's a context system that transforms your message into a rich multi-layer prompt before calling the API. This diagram shows the 4-layer augmentation that happens invisibly with every request.

```mermaid
flowchart TD
    A([User Message]) --> B[[Layer 1: System Prompt]]
    B --> C[[Layer 2: Context Injection]]
    C --> D[[Layer 3: Tool Definitions]]
    D --> E[[Layer 4: Conversation History]]
    E --> F{{Claude API}}
    F --> G([Claude Response])

    B1[CLAUDE.md files\nglobal + project + subdir] --> B
    C1[Working directory\nGit status\nProject files] --> C
    D1[Glob, Grep, Read,\nBash, Task, MCP tools] --> D
    E1[Previous messages\n+ tool results] --> E

    style A fill:#F5E6D3,color:#333
    style B fill:#6DB3F2,color:#fff
    style C fill:#6DB3F2,color:#fff
    style D fill:#6DB3F2,color:#fff
    style E fill:#6DB3F2,color:#fff
    style F fill:#E87E2F,color:#fff
    style G fill:#7BC47F,color:#333
    style B1 fill:#B8B8B8,color:#333
    style C1 fill:#B8B8B8,color:#333
    style D1 fill:#B8B8B8,color:#333
    style E1 fill:#B8B8B8,color:#333
```

<details>
<summary>ASCII version</summary>

```
User Message
     │
     ▼
┌─────────────────────────────────┐
│ Layer 1: System Prompt          │ ← CLAUDE.md files
│ Layer 2: Context Injection      │ ← Working dir, git status
│ Layer 3: Tool Definitions       │ ← All available tools
│ Layer 4: Conversation History   │ ← Previous messages
└─────────────────┬───────────────┘
                  │
                  ▼
           Claude API Call
                  │
                  ▼
           Claude Response
```

</details>

> **Source**: [How Claude Code Works](../ultimate-guide.md#how-claude-code-works) — Line ~2360

---

### 9-Step Workflow Pipeline

Every request to Claude Code goes through this pipeline — from parsing your intent to displaying the final response. Understanding this loop helps you write better instructions and diagnose issues faster.

```mermaid
flowchart LR
    A([User Message]) --> B(Parse Intent)
    B --> C(Load Context)
    C --> D(Plan Actions)
    D --> E(Execute Tools)
    E --> F{More tools\nneeded?}
    F -->|Yes| G(Collect Results)
    G --> E
    F -->|No| H(Update Context)
    H --> I(Generate Response)
    I --> J([Display to User])

    style A fill:#F5E6D3,color:#333
    style B fill:#6DB3F2,color:#fff
    style C fill:#6DB3F2,color:#fff
    style D fill:#E87E2F,color:#fff
    style E fill:#E87E2F,color:#fff
    style F fill:#E87E2F,color:#fff
    style G fill:#B8B8B8,color:#333
    style H fill:#B8B8B8,color:#333
    style I fill:#6DB3F2,color:#fff
    style J fill:#7BC47F,color:#333
```

<details>
<summary>ASCII version</summary>

```
User Message → Parse Intent → Load Context → Plan Actions
                                                   │
                          ┌────────────────────────┘
                          ▼
                    Execute Tools ◄─────────────────┐
                          │                          │
                    More tools?  ──── Yes ─── Collect Results
                          │ No
                          ▼
                   Update Context → Generate Response → Display
```

</details>

> **Source**: [Getting Started](../ultimate-guide.md#getting-started) — Line ~277

---

### Quick Decision Tree — "Should I use Claude Code?"

Not every task needs Claude Code. This decision tree helps you route the right tasks to the right tool — Claude Code CLI vs Claude.ai vs clipboard-based approaches.

```mermaid
flowchart TD
    A([Start: I have a task]) --> B{Involves\ncodebase?}
    B -->|No| C{Pure writing\nor analysis?}
    B -->|Yes| D{Repetitive or\n>30 min manual?}

    C -->|Yes| E([Use Claude.ai\nor API])
    C -->|No| F([Clipboard +\nClaude.ai])

    D -->|No| G{Single file,\nsimple change?}
    D -->|Yes| H([Claude Code\n✓ Best choice])

    G -->|Yes| I{Need file\naccess?}
    G -->|No| H

    I -->|No| F
    I -->|Yes| H

    style A fill:#F5E6D3,color:#333
    style B fill:#E87E2F,color:#fff
    style C fill:#E87E2F,color:#fff
    style D fill:#E87E2F,color:#fff
    style G fill:#E87E2F,color:#fff
    style I fill:#E87E2F,color:#fff
    style E fill:#6DB3F2,color:#fff
    style F fill:#6DB3F2,color:#fff
    style H fill:#7BC47F,color:#333
```

<details>
<summary>ASCII version</summary>

```
Task involves codebase?
├── No → Pure writing/analysis? → Yes → Claude.ai
│                              → No  → Clipboard + Claude.ai
└── Yes → Repetitive or >30min?
          ├── Yes → ✓ Claude Code
          └── No  → Single file, simple?
                    ├── Yes → Need file access? → No → Clipboard
                    │                            → Yes → Claude Code
                    └── No  → ✓ Claude Code
```

</details>

> **Source**: [Quick Start Decision](../ultimate-guide.md#quick-start) — See also `machine-readable/reference.yaml` (decide section)

---

### Permission Modes Comparison

Claude Code has 3 permission modes that control what it can do automatically vs. what requires your approval. Choosing the wrong mode is the #1 safety mistake.

```mermaid
flowchart TD
    subgraph DEFAULT["🔒 Default Mode (Recommended)"]
        D1(File reads) --> D2([Auto-approved])
        D3(File writes) --> D4([Prompt required])
        D5(Shell commands) --> D6([Prompt required])
        D7(Risky ops) --> D8([Prompt required])
    end

    subgraph ACCEPT["✏️ acceptEdits Mode"]
        A1(File reads) --> A2([Auto-approved])
        A3(File writes) --> A4([Auto-approved])
        A5(Shell commands) --> A6([Prompt required])
        A7(Risky ops) --> A8([Prompt required])
    end

    subgraph BYPASS["⚠️ bypassPermissions Mode"]
        B1(ALL operations) --> B2([Auto-approved])
        B3["Use only in:\nCI/CD, sandboxed\nenvironments"] --> B2
    end

    style D2 fill:#7BC47F,color:#333
    style D4 fill:#E87E2F,color:#fff
    style D6 fill:#E87E2F,color:#fff
    style D8 fill:#E87E2F,color:#fff
    style A2 fill:#7BC47F,color:#333
    style A4 fill:#7BC47F,color:#333
    style A6 fill:#E87E2F,color:#fff
    style A8 fill:#E87E2F,color:#fff
    style B2 fill:#E85D5D,color:#fff
    style B3 fill:#F5E6D3,color:#333
```

<details>
<summary>ASCII version</summary>

```
DEFAULT (Recommended)        acceptEdits               bypassPermissions
─────────────────────        ───────────               ─────────────────
File reads    → AUTO ✓       File reads    → AUTO ✓    ALL ops → AUTO ⚠️
File writes   → PROMPT       File writes   → AUTO ✓
Shell cmds    → PROMPT       Shell cmds    → PROMPT    Use: CI/CD only,
Risky ops     → PROMPT       Risky ops     → PROMPT    sandboxed env
```

</details>

> **Source**: [Permission System](../ultimate-guide.md#permission-system) — Line ~760
