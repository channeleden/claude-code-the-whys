---
title: "Claude Code — Context & Sessions Diagrams"
description: "Context zones, memory hierarchy, session management, and fresh context patterns"
tags: [context, sessions, memory, optimization]
---

# Context & Sessions

How Claude Code manages context, memory, and sessions across your work.

---

### Context Management Zones

Your context window has 4 distinct zones, each requiring different strategies. Knowing which zone you're in prevents context bloat and maintains response quality throughout long sessions.

```mermaid
flowchart LR
    subgraph GREEN["🟢 0–50% — Comfortable"]
        G1(Full capabilities\navailable)
        G2(All tools active)
        G3(Rich responses)
    end

    subgraph BLUE["🔵 50–75% — Normal"]
        B1(Monitor usage)
        B2(Consider /compact\nfor old threads)
        B3(Normal operation)
    end

    subgraph ORANGE["🟠 75–85% — Caution"]
        O1(Suggest /compact\nproactively)
        O2(Reduce verbosity)
        O3(Defer non-critical\noperations)
    end

    subgraph RED["🔴 85–100% — Critical"]
        R1(Auto-compact\ntriggered at 80%)
        R2(Essential ops only)
        R3(Start new session\nfor new tasks)
    end

    GREEN --> BLUE --> ORANGE --> RED

    style G1 fill:#7BC47F,color:#333
    style G2 fill:#7BC47F,color:#333
    style G3 fill:#7BC47F,color:#333
    style B1 fill:#6DB3F2,color:#fff
    style B2 fill:#6DB3F2,color:#fff
    style B3 fill:#6DB3F2,color:#fff
    style O1 fill:#E87E2F,color:#fff
    style O2 fill:#E87E2F,color:#fff
    style O3 fill:#E87E2F,color:#fff
    style R1 fill:#E85D5D,color:#fff
    style R2 fill:#E85D5D,color:#fff
    style R3 fill:#E85D5D,color:#fff
```

<details>
<summary>ASCII version</summary>

```
0%──────50%──────75%──85%──100%
│  Green  │  Blue  │ Orange│ Red│
│ Full    │ Normal │Suggest│Auto│
│ access  │Monitor │compact│cmp │
│         │        │Reduce │Ess.│
│         │        │verbos.│only│
```

</details>

> **Source**: [Context Management](../ultimate-guide.md#context-management) — Line ~1335

---

### Memory Hierarchy — 5 Types

Claude Code has 5 distinct memory types with different scopes and persistence. Knowing which memory type to use for each piece of information is key to effective sessions.

```mermaid
flowchart TD
    A["🌍 Global CLAUDE.md\n~/.claude/CLAUDE.md"] --> B["📁 Project CLAUDE.md\n/project-root/CLAUDE.md"]
    B --> C["📂 Subdirectory CLAUDE.md\n/src/CLAUDE.md, /tests/CLAUDE.md"]
    C --> D["💬 In-Conversation Context\nMessages + tool results this session"]
    D --> E["⚡ Ephemeral State\nMCP server state, tool cache"]

    A1["Scope: ALL projects\nPersists: Always\nUse: Global prefs, API keys"] --> A
    B1["Scope: This project\nPersists: Always\nUse: Project conventions"] --> B
    C1["Scope: This directory\nPersists: Always\nUse: Module-specific rules"] --> C
    D1["Scope: This session\nPersists: Session only\nUse: Task context"] --> D
    E1["Scope: This session\nPersists: Session only\nUse: Computed results"] --> E

    style A fill:#E87E2F,color:#fff
    style B fill:#6DB3F2,color:#fff
    style C fill:#6DB3F2,color:#fff
    style D fill:#F5E6D3,color:#333
    style E fill:#B8B8B8,color:#333
    style A1 fill:#B8B8B8,color:#333
    style B1 fill:#B8B8B8,color:#333
    style C1 fill:#B8B8B8,color:#333
    style D1 fill:#B8B8B8,color:#333
    style E1 fill:#B8B8B8,color:#333
```

<details>
<summary>ASCII version</summary>

```
PERMANENT ──────────────────────── SESSION ONLY

~/.claude/CLAUDE.md          In-conversation context
      │                             │
/project/CLAUDE.md          Ephemeral MCP state
      │
/subdir/CLAUDE.md

Higher = broader scope, always persists
Lower = narrower scope, survives restarts
```

</details>

> **Source**: [Memory System](../ultimate-guide.md#memory-system) — Line ~3160 & ~3986

---

### Session Continuity — Saving and Resuming State

Sessions don't automatically persist context between terminals. This diagram shows how to save state and resume it in a new session or terminal, enabling async workflows.

```mermaid
sequenceDiagram
    participant U as User
    participant CC as Claude Code
    participant CM as CLAUDE.md
    participant NI as New Session

    U->>CC: Work on feature X
    CC->>CC: Executes tasks, tools
    U->>CC: Save progress to CLAUDE.md
    CC->>CM: Write: task status, decisions, next steps
    Note over CM: Persists after session ends

    U->>NI: Open new terminal
    U->>NI: claude (new session)
    NI->>CM: Auto-loads CLAUDE.md
    CM->>NI: Injects: saved context
    NI->>U: Ready — context restored ✓

    Note over CC,NI: Conversation history NOT restored\nOnly CLAUDE.md content persists
```

<details>
<summary>ASCII version</summary>

```
Session 1                    CLAUDE.md         Session 2
─────────                    ─────────         ─────────
Work on task                    │               Open terminal
     │                          │                    │
Save progress ──────────────► Write             Load CLAUDE.md
                             status,           ◄── Auto-injected
                             decisions,
                             next steps
```

</details>

> **Source**: [Session Management](../ultimate-guide.md#session-management) — Line ~9477

---

### Fresh Context Anti-Pattern vs. Best Practice

Long sessions accumulate noise that degrades response quality. This diagram shows the degradation pattern and the recommended "focused sessions" approach that maintains performance.

```mermaid
flowchart TD
    subgraph BAD["❌ Anti-Pattern: Monolith Session"]
        B1([Start big session]) --> B2(Add task A)
        B2 --> B3(Add task B)
        B3 --> B4(Add task C)
        B4 --> B5{Context bloated\n>75%}
        B5 --> B6(Response quality\ndegrades)
        B6 --> B7(Force-restart\nloses all context)
        style B1 fill:#E85D5D,color:#fff
        style B5 fill:#E85D5D,color:#fff
        style B6 fill:#E85D5D,color:#fff
        style B7 fill:#E85D5D,color:#fff
    end

    subgraph GOOD["✅ Best Practice: Focused Sessions"]
        G1([Start focused session]) --> G2(Complete task A)
        G2 --> G3{Natural\ncheckpoint?}
        G3 -->|Yes| G4(Save to CLAUDE.md)
        G4 --> G5([New session for task B])
        G3 -->|No| G6{Context >75%?}
        G6 -->|Yes| G7(/compact)
        G7 --> G2
        G6 -->|No| G2
        style G1 fill:#7BC47F,color:#333
        style G4 fill:#7BC47F,color:#333
        style G5 fill:#7BC47F,color:#333
        style G3 fill:#E87E2F,color:#fff
        style G6 fill:#E87E2F,color:#fff
        style G7 fill:#6DB3F2,color:#fff
    end
```

<details>
<summary>ASCII version</summary>

```
BAD: One giant session
Task A → Task B → Task C → Context bloat → Quality drop → Restart → Lost!

GOOD: Focused sessions
Task A ──► Checkpoint? ──Yes──► Save CLAUDE.md ──► New session for B
           │
           No
           │
         Context >75%? ──Yes──► /compact ──► Continue
           │
           No
           │
         Continue task
```

</details>

> **Source**: [Context Best Practices](../ultimate-guide.md#context-best-practices) — Line ~1525
