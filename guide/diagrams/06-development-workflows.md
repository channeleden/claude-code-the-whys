---
title: "Claude Code — Development Workflows Diagrams"
description: "TDD cycle, spec-first pipeline, plan-driven workflow, iterative refinement loop"
tags: [workflows, tdd, spec-first, plan-driven, iterative]
---

# Development Workflows

Proven patterns for structuring AI-assisted development sessions.

---

### TDD Red-Green-Refactor with Claude

Test-Driven Development adapted for Claude Code: write the failing test first, then ask Claude to implement only what's needed to pass it. This prevents over-engineering and ensures tests actually verify behavior.

```mermaid
flowchart TD
    A([Start: New feature needed]) --> B(Write failing test\nwith human)
    B --> C(Run tests)
    C --> D{Tests fail\nas expected?}
    D -->|No: tests pass\nbefore impl!| E(Fix test — it's too weak)
    E --> B
    D -->|Yes: RED ✓| F(Ask Claude to implement\nminimal code to pass)
    F --> G(Run tests again)
    G --> H{Tests pass?}
    H -->|No| I(Diagnose with Claude\nfix implementation)
    I --> G
    H -->|Yes: GREEN ✓| J{Code needs\nrefactoring?}
    J -->|Yes| K(Refactor with Claude)
    K --> L(Run tests: still green?)
    L -->|No| I
    L -->|Yes: REFACTOR ✓| M{More features\nneeded?}
    J -->|No| M
    M -->|Yes| B
    M -->|No| N([Feature complete ✓])

    style B fill:#E85D5D,color:#fff
    style F fill:#E85D5D,color:#fff
    style D fill:#E87E2F,color:#fff
    style H fill:#E87E2F,color:#fff
    style J fill:#E87E2F,color:#fff
    style G fill:#7BC47F,color:#333
    style K fill:#6DB3F2,color:#fff
    style N fill:#7BC47F,color:#333
```

<details>
<summary>ASCII version</summary>

```
Write failing test (RED)
        │
    Run tests
        │
  Fail as expected?
  ├─ No  → Fix test (too weak)
  └─ Yes → Ask Claude: implement minimal code
                │
           Run tests
                │
           Pass? (GREEN)
           ├─ No  → Diagnose + fix
           └─ Yes → Refactor?
                    ├─ Yes → Refactor (REFACTOR) → re-run tests
                    └─ No  → Next feature
```

</details>

> **Source**: [TDD with Claude](../workflows/tdd-with-claude.md)

---

### Spec-First Development Pipeline

Write the specification before the code. Claude uses the spec as the single source of truth — preventing drift between what was planned and what was built.

```mermaid
flowchart LR
    A([Idea / Requirement]) --> B(Write spec.md\nin natural language)
    B --> C(Claude reviews spec\nfor clarity + completeness)
    C --> D{Spec approved\n by human?}
    D -->|No: gaps found| E(Refine spec\naddress gaps)
    E --> C
    D -->|Yes| F(Generate tests\nfrom spec)
    F --> G(Generate implementation\nfrom spec + tests)
    G --> H(Run test suite)
    H --> I{All tests\npass?}
    I -->|No| J(Claude fixes\nimplementation)
    J --> H
    I -->|Yes| K(Human review\nspec vs output)
    K --> L{Matches\nspec?}
    L -->|No| M(Update spec\nor implementation)
    M --> K
    L -->|Yes| N([Merge ✓])

    style A fill:#F5E6D3,color:#333
    style B fill:#6DB3F2,color:#fff
    style D fill:#E87E2F,color:#fff
    style I fill:#E87E2F,color:#fff
    style L fill:#E87E2F,color:#fff
    style N fill:#7BC47F,color:#333
```

<details>
<summary>ASCII version</summary>

```
Idea → Write spec.md → Claude reviews
                             │
                       Approved? ─No→ Refine spec
                             │ Yes
                       Generate tests from spec
                             │
                       Generate implementation
                             │
                       Run tests → Pass? ─No→ Claude fixes
                             │ Yes
                       Human review → Matches spec? ─No→ Fix
                             │ Yes
                           Merge ✓
```

</details>

> **Source**: [Spec-First Development](../workflows/spec-first.md)

---

### Plan-Driven Workflow with Annotation

Complex tasks benefit from plan mode: Claude explores the codebase, proposes a plan, you annotate it, then Claude executes only what was approved. Prevents surprises on large refactors.

```mermaid
flowchart TD
    A([Complex task given]) --> B(Enter Plan Mode\nShift+Tab × 2)
    B --> C(Claude explores\ncodebase structure)
    C --> D(Claude proposes plan\nwith file list)
    D --> E(Human reviews plan)
    E --> F{Plan\nacceptable?}
    F -->|No: issues found| G(Human annotates plan\nmarks corrections)
    G --> H(Claude revises plan)
    H --> E
    F -->|Yes| I(Approve plan\nExit Plan Mode)
    I --> J(Claude executes\nstep by step)
    J --> K(Claude reports\nprogress)
    K --> L{Unexpected\nissue?}
    L -->|Yes| M(Claude flags issue\nasks for guidance)
    M --> F
    L -->|No| N{All steps\ncomplete?}
    N -->|No| J
    N -->|Yes| O([Task done ✓])

    style A fill:#F5E6D3,color:#333
    style B fill:#6DB3F2,color:#fff
    style F fill:#E87E2F,color:#fff
    style L fill:#E87E2F,color:#fff
    style N fill:#E87E2F,color:#fff
    style G fill:#F5E6D3,color:#333
    style O fill:#7BC47F,color:#333
```

<details>
<summary>ASCII version</summary>

```
Complex task
     │
Plan Mode (Shift+Tab×2)
     │
Claude explores codebase
     │
Claude proposes plan
     │
Human reviews ──No──► Annotate + Claude revises ──► re-review
     │ Yes
Approve + exit plan mode
     │
Claude executes step by step
     │
Unexpected? ──Yes──► Flag + ask guidance
     │ No
Done? ──No──► continue
     │ Yes
Complete ✓
```

</details>

> **Source**: [Plan-Driven Workflow](../workflows/plan-driven.md)

---

### Iterative Refinement Loop

Output rarely hits the mark on the first try. This loop gives you a systematic way to improve results through targeted feedback rather than "make it better" vague instructions.

```mermaid
flowchart TD
    A([Initial prompt]) --> B(Claude generates output)
    B --> C(Evaluate output quality)
    C --> D{Good\nenough?}
    D -->|Yes| E([Done ✓])
    D -->|No| F(Identify specific issue\nWhat exactly is wrong?)
    F --> G{Issue type?}
    G -->|Style/tone| H(Add: style constraints)
    G -->|Missing info| I(Add: provide missing context)
    G -->|Wrong approach| J(Add: redirect approach)
    G -->|Too verbose/brief| K(Add: length constraint)
    H --> L(Refine instruction)
    I --> L
    J --> L
    K --> L
    L --> M(Claude refines output)
    M --> N(Compare before/after)
    N --> O{Improvement\ndetected?}
    O -->|Yes| C
    O -->|No| P(Different\napproach needed)
    P --> F

    style A fill:#F5E6D3,color:#333
    style D fill:#E87E2F,color:#fff
    style G fill:#E87E2F,color:#fff
    style O fill:#E87E2F,color:#fff
    style E fill:#7BC47F,color:#333
    style L fill:#6DB3F2,color:#fff
    style P fill:#E85D5D,color:#fff
```

<details>
<summary>ASCII version</summary>

```
Prompt → Output → Evaluate → Good? ──Yes──► Done
                                 │ No
                          Identify specific issue
                                 │
                          ┌──────┴──────────────┐
                         Style  Missing  Wrong  Length
                          └──────┬──────────────┘
                          Refine instruction
                                 │
                          Claude refines
                                 │
                          Better? ──Yes──► Evaluate again
                                 │ No
                          Different approach
```

</details>

> **Source**: [Iterative Refinement](../workflows/iterative-refinement.md) — Line ~347
