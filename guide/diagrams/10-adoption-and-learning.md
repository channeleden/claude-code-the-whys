---
title: "Claude Code — Adoption & Learning Diagrams"
description: "Onboarding paths, UVAL learning protocol, trust calibration matrix"
tags: [adoption, learning, onboarding, teams, trust]
---

# Adoption & Learning

How individuals and teams successfully adopt Claude Code without losing skills or control.

---

### Onboarding Adaptive Learning Paths

Different backgrounds require different onboarding approaches. Forcing developers through a beginner path wastes time; dropping non-technical users into advanced features causes frustration.

```mermaid
flowchart TD
    A([Start: New to Claude Code]) --> B{Your background?}

    B -->|Developer| C["🧑‍💻 Developer Path\n~2 days to productivity"]
    C --> C1(Quick Start: first session)
    C1 --> C2(Workflows: TDD, spec-first, plan-driven)
    C2 --> C3(Advanced: agents, hooks, MCP servers)
    C3 --> C4([Productive developer ✓])

    B -->|Non-technical| D["👤 Non-Tech Path\n~1 week to basic usage"]
    D --> D1(What is Claude Code?\nKey concepts only)
    D1 --> D2(Basic usage: editing,\nexplaining, simple tasks)
    D2 --> D3(Limited scope: no\nproduction deployments)
    D3 --> D4([Safe basic user ✓])

    B -->|Team lead| E["👔 Team Lead Path\n~2 weeks to team adoption"]
    E --> E1(ROI assessment\nvalue vs cost analysis)
    E1 --> E2(CLAUDE.md strategy\nteam conventions)
    E2 --> E3(Pilot with 2-3 devs\ncollect feedback)
    E3 --> E4(Gradual rollout\nwith guardrails)
    E4 --> E5([Team adoption ✓])

    style A fill:#F5E6D3,color:#333
    style B fill:#E87E2F,color:#fff
    style C fill:#6DB3F2,color:#fff
    style D fill:#6DB3F2,color:#fff
    style E fill:#6DB3F2,color:#fff
    style C4 fill:#7BC47F,color:#333
    style D4 fill:#7BC47F,color:#333
    style E5 fill:#7BC47F,color:#333
```

<details>
<summary>ASCII version</summary>

```
Your background?
├─ Developer (~2 days):
│  Quick Start → Workflows (TDD/spec/plan) → Advanced (agents/hooks/MCP)
│
├─ Non-technical (~1 week):
│  What is CC? → Basic usage → Limited scope (no prod deploys)
│
└─ Team lead (~2 weeks):
   ROI assessment → CLAUDE.md strategy → Pilot 2-3 devs → Gradual rollout
```

</details>

> **Source**: [Adoption Approaches](../adoption-approaches.md)

---

### UVAL Learning Protocol

The UVAL protocol prevents the "copy-paste trap" — where you use Claude Code without understanding what it did. Each cycle builds real competency that survives tool unavailability.

```mermaid
flowchart LR
    U([U — Use It\nTry the feature\nyourself first]) --> V

    V([V — Verify\nUnderstand what\nClaude did and why]) --> A

    A([A — Adapt\nModify the approach,\nexperiment with variants]) --> L

    L([L — Learn\nNote the pattern\nfor future use]) --> NEXT

    NEXT{More tasks\nusing this pattern?} -->|Yes| U
    NEXT -->|No| DONE([Pattern internalized ✓])

    TRAP["❌ Copy-Paste Trap:\nAccept output →\nDeploy → Bug →\n'Claude broke it'"] -.->|avoid| V

    style U fill:#6DB3F2,color:#fff
    style V fill:#E87E2F,color:#fff
    style A fill:#E87E2F,color:#fff
    style L fill:#7BC47F,color:#333
    style NEXT fill:#E87E2F,color:#fff
    style DONE fill:#7BC47F,color:#333
    style TRAP fill:#E85D5D,color:#fff
```

<details>
<summary>ASCII version</summary>

```
USE → VERIFY → ADAPT → LEARN → (repeat with next task)

U: Try the feature yourself first
V: Understand what Claude did and why ← (anti: just copy-paste)
A: Modify the approach, experiment
L: Note pattern for future use

Anti-pattern (AVOID): Accept output → Deploy → Bug → "Claude broke it"
```

</details>

> **Source**: [Learning with AI](../learning-with-ai.md) — Line ~127

---

### Trust Calibration Matrix

Knowing when to trust Claude's output and when to verify is the most important skill in AI-assisted development. Over-trust causes bugs; under-trust eliminates productivity gains.

```mermaid
flowchart TD
    A([Claude produces output]) --> B{Can I test\nthis output?}

    B -->|Yes| C{Do the tests\nactually pass?}
    C -->|Yes| D([Trust with test coverage ✓])
    C -->|No| E([Fix before using])

    B -->|No| F{Do I understand\nwhat it did?}
    F -->|No| G(Ask Claude to explain\nstep by step)
    G --> F

    F -->|Yes| H{Is this\nreversible?}
    H -->|Yes, easily| I([Trust with git safety net ✓])
    H -->|No: hard to undo| J(Extra review required\ncheck before applying)
    J --> K{Is it\nsecurity-critical?}

    K -->|Yes: auth, crypto, perms| L([Human expert review\nnever trust blindly])
    K -->|No| M{Familiar\ndomain?}
    M -->|Yes| I
    M -->|No| N([Pair with domain expert\nor verify by testing])

    style A fill:#F5E6D3,color:#333
    style B fill:#E87E2F,color:#fff
    style C fill:#E87E2F,color:#fff
    style F fill:#E87E2F,color:#fff
    style H fill:#E87E2F,color:#fff
    style K fill:#E87E2F,color:#fff
    style M fill:#E87E2F,color:#fff
    style D fill:#7BC47F,color:#333
    style I fill:#7BC47F,color:#333
    style E fill:#E85D5D,color:#fff
    style L fill:#E85D5D,color:#fff
    style N fill:#6DB3F2,color:#fff
    style J fill:#F5E6D3,color:#333
```

<details>
<summary>ASCII version</summary>

```
Can I test it?
├─ Yes → Tests pass? → Yes → Trust with tests ✓
│                  → No  → Fix before using
└─ No  → Do I understand it?
         ├─ No  → Ask Claude to explain → understand → continue
         └─ Yes → Is it reversible?
                  ├─ Yes     → Trust with git safety net ✓
                  └─ No      → Security-critical?
                               ├─ Yes → Human expert review (never skip)
                               └─ No  → Familiar domain?
                                        ├─ Yes → Trust with care ✓
                                        └─ No  → Pair with expert
```

</details>

> **Source**: [Trust and Verification](../ultimate-guide.md#trust-verification) — Line ~1039

---

*Back to [diagrams/README.md](./README.md) | Next: [Cost Optimization](./09-cost-and-optimization.md)*
