---
title: "Claude Code — Multi-Agent Patterns Diagrams"
description: "Agent topologies, worktrees, dual-instance planning, horizontal scaling, decision matrix"
tags: [multi-agent, patterns, worktrees, orchestration, scaling]
---

# Multi-Agent Patterns

Patterns for coordinating multiple Claude instances for parallel and complex work.

---

### Agent Teams — 3 Orchestration Topologies

Three proven topologies for multi-agent coordination. Choose based on task independence, ordering requirements, and specialization needs.

```mermaid
flowchart TD
    subgraph ORCH["Pattern 1: Orchestrator + Workers"]
        OL[Lead Orchestrator] --> OW1[Worker 1\nFrontend]
        OL --> OW2[Worker 2\nBackend]
        OL --> OW3[Worker 3\nTests]
        OW1 & OW2 & OW3 --> OR([Results aggregated])
    end

    subgraph PIPE["Pattern 2: Pipeline"]
        PA[Agent A\nRequirements] --> PB[Agent B\nImplementation]
        PB --> PC[Agent C\nReview]
        PC --> PD([Final output])
    end

    subgraph ROUTE["Pattern 3: Specialist Router"]
        RR{Router Agent\nanalyzes task} --> RC[Code Agent]
        RR --> RT[Test Agent]
        RR --> RD[Docs Agent]
        RC & RT & RD --> RO([Specialized result])
    end

    style OL fill:#E87E2F,color:#fff
    style OW1 fill:#6DB3F2,color:#fff
    style OW2 fill:#6DB3F2,color:#fff
    style OW3 fill:#6DB3F2,color:#fff
    style OR fill:#7BC47F,color:#333
    style PA fill:#F5E6D3,color:#333
    style PB fill:#F5E6D3,color:#333
    style PC fill:#F5E6D3,color:#333
    style PD fill:#7BC47F,color:#333
    style RR fill:#E87E2F,color:#fff
    style RC fill:#6DB3F2,color:#fff
    style RT fill:#6DB3F2,color:#fff
    style RD fill:#6DB3F2,color:#fff
    style RO fill:#7BC47F,color:#333
```

<details>
<summary>ASCII version</summary>

```
ORCHESTRATOR + WORKERS:      PIPELINE:               ROUTER:

   Lead Agent                Agent A (requirements)   Router
  /    |     \                    │                  /  |  \
W1    W2     W3              Agent B (implement)   Code Test Docs
  \   |     /                    │                  \  |  /
   Aggregate                Agent C (review)        Result
                                 │
                             Final output
```

</details>

> **Source**: [Agent Teams](../workflows/agent-teams.md) — Line ~59

---

### Git Worktree Multi-Instance Pattern

Git worktrees enable true parallel development: each Claude instance works in an isolated branch with its own working tree. No conflicts, no context mixing.

```mermaid
flowchart LR
    MB[(Main Branch\ngit repository)] --> WA[git worktree add\nfeature-A]
    MB --> WB[git worktree add\nfeature-B]
    MB --> WC[git worktree add\nbugfix-C]

    WA --> CA[Claude Instance 1\n/worktrees/feature-A]
    WB --> CB[Claude Instance 2\n/worktrees/feature-B]
    WC --> CC[Claude Instance 3\n/worktrees/bugfix-C]

    CA --> CA1([Commits to feature-A])
    CB --> CB1([Commits to feature-B])
    CC --> CC1([Commits to bugfix-C])

    CA1 & CB1 & CC1 --> MERGE([Merge to main\nwhen ready])

    style MB fill:#E87E2F,color:#fff
    style CA fill:#6DB3F2,color:#fff
    style CB fill:#6DB3F2,color:#fff
    style CC fill:#6DB3F2,color:#fff
    style CA1 fill:#7BC47F,color:#333
    style CB1 fill:#7BC47F,color:#333
    style CC1 fill:#7BC47F,color:#333
    style MERGE fill:#7BC47F,color:#333
    style WA fill:#F5E6D3,color:#333
    style WB fill:#F5E6D3,color:#333
    style WC fill:#F5E6D3,color:#333
```

<details>
<summary>ASCII version</summary>

```
Main repo
├── git worktree add feature-A → Claude 1 → commits to feature-A
├── git worktree add feature-B → Claude 2 → commits to feature-B
└── git worktree add bugfix-C  → Claude 3 → commits to bugfix-C

No conflicts: separate working trees, separate branches
All merge back to main when done
```

</details>

> **Source**: [Git Worktrees](../ultimate-guide.md#git-worktrees) — Line ~10634

---

### Dual-Instance Planning Pattern (Jon Williams)

Separating planning from execution using two Claude instances prevents costly mistakes: the planner Claude has no tools, so it can't accidentally execute anything during analysis.

```mermaid
sequenceDiagram
    participant U as User
    participant PL as Planner Claude\n(no tools)
    participant EX as Executor Claude\n(full tools)

    U->>PL: "Plan how to refactor auth module"
    Note over PL: Reads docs, analyzes requirements\nNo execution risk — no tools

    PL->>U: Detailed plan:\n1. Files to change\n2. Order of operations\n3. Risk points\n4. Rollback strategy

    U->>U: Review plan carefully
    Note over U: Human checkpoint:\napprove or adjust

    U->>EX: "Execute this plan: [plan text]"
    EX->>EX: Implements step by step
    EX->>U: Progress updates + results

    Note over PL,EX: Key insight: planner can be\nmore thorough without execution anxiety
```

<details>
<summary>ASCII version</summary>

```
User → Planner (no tools): "Plan X"
         │
    [safe analysis, no execution risk]
         │
Planner → User: detailed plan
         │
User reviews + approves
         │
User → Executor (full tools): "Execute: [plan]"
         │
    [implements with full context]
         │
Executor → User: results
```

</details>

> **Source**: [Dual-Instance Planning](../workflows/dual-instance-planning.md)

---

### Boris Cherny Horizontal Scaling Pattern

When tasks can be parallelized, spawn N Claude instances simultaneously instead of running them sequentially. The speedup is proportional to task independence.

```mermaid
flowchart LR
    BT([Large Task:\nRefactor 50 files]) --> DEC{Decompose\ninto N subtasks}

    DEC --> T1["Subtask 1\nFiles 1-10"]
    DEC --> T2["Subtask 2\nFiles 11-20"]
    DEC --> T3["Subtask 3\nFiles 21-30"]
    DEC --> TN["Subtask N\n..."]

    T1 --> CI1[Claude\nInstance 1]
    T2 --> CI2[Claude\nInstance 2]
    T3 --> CI3[Claude\nInstance 3]
    TN --> CIN[Claude\nInstance N]

    CI1 & CI2 & CI3 & CIN --> AGG(Aggregate\nresults)
    AGG --> REV([Integration review\n~10x faster than sequential])

    style BT fill:#F5E6D3,color:#333
    style DEC fill:#E87E2F,color:#fff
    style CI1 fill:#6DB3F2,color:#fff
    style CI2 fill:#6DB3F2,color:#fff
    style CI3 fill:#6DB3F2,color:#fff
    style CIN fill:#6DB3F2,color:#fff
    style AGG fill:#B8B8B8,color:#333
    style REV fill:#7BC47F,color:#333
```

<details>
<summary>ASCII version</summary>

```
Large task
     │
Decompose into N independent subtasks
     │
┌────┼────┐
│    │    │
I1  I2  I3... (parallel)
│    │    │
└────┼────┘
     │
Aggregate → Integration review
(~10x faster than sequential)
```

</details>

> **Source**: [Horizontal Scaling](../ultimate-guide.md#horizontal-scaling) — Line ~9617

---

### Multi-Instance Decision Matrix

Not every task needs multiple instances. This decision tree guides you to the right pattern based on task characteristics.

```mermaid
flowchart TD
    A([Task to complete]) --> B{Need multiple\nClaude instances?}
    B -->|No| C([Single session\nStandard usage])
    B -->|Yes| D{How many\ninstances?}

    D -->|2-3| E{Need branch\nisolation?}
    E -->|Yes| F([Git worktrees\nSeparate branches])
    E -->|No| G([Multiple terminals\nSame repo])

    D -->|4+| H{Task structure?}
    H -->|Independent tasks| I([Task tool\nSub-agents in parallel])
    H -->|Sequential pipeline| J([Agent pipeline\nA → B → C])
    H -->|Mixed expertise| K([Specialist router\nRoute by task type])

    B2{Need planning\nseparation?} --> L([Dual-instance\nPlanner + Executor])

    style A fill:#F5E6D3,color:#333
    style B fill:#E87E2F,color:#fff
    style D fill:#E87E2F,color:#fff
    style E fill:#E87E2F,color:#fff
    style H fill:#E87E2F,color:#fff
    style B2 fill:#E87E2F,color:#fff
    style C fill:#B8B8B8,color:#333
    style F fill:#7BC47F,color:#333
    style G fill:#7BC47F,color:#333
    style I fill:#7BC47F,color:#333
    style J fill:#7BC47F,color:#333
    style K fill:#7BC47F,color:#333
    style L fill:#6DB3F2,color:#fff
```

<details>
<summary>ASCII version</summary>

```
Need multiple instances?
├─ No → Single session
└─ Yes → How many?
         ├─ 2-3 → Need branch isolation?
         │        ├─ Yes → Git worktrees
         │        └─ No  → Multiple terminals
         └─ 4+  → Task structure?
                  ├─ Independent → Task tool (parallel sub-agents)
                  ├─ Sequential  → Agent pipeline A→B→C
                  └─ Mixed       → Specialist router

Special case: Need planning separation? → Dual-instance (Planner + Executor)
```

</details>

> **Source**: [Multi-Instance Patterns](../ultimate-guide.md#multi-instance-patterns) — Line ~11176
