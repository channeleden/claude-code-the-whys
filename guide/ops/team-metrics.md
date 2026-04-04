---
title: "Team Metrics for AI-Augmented Engineering"
description: "How to measure and pilot a tech-product team using AI. DORA, SPACE, and the metrics that matter when AI writes 70%+ of your code."
tags: [guide, metrics, dora, space, team, observability, ai-augmented]
---

# Team Metrics for AI-Augmented Engineering

> Velocity is easy to measure and easy to misread. AI raises the bar for what "moving fast" even means.

## Table of Contents

1. [The Measurement Problem](#the-measurement-problem)
2. [The DORA Foundation](#the-dora-foundation)
3. [DORA in an AI-Augmented Context](#dora-in-an-ai-augmented-context)
4. [Beyond DORA: The SPACE Framework](#beyond-dora-the-space-framework)
5. [AI-Specific Metrics](#ai-specific-metrics)
6. [Product Metrics (the often-missing layer)](#product-metrics-the-often-missing-layer)
7. [By Team Size](#by-team-size)
8. [Vanity Metrics to Drop](#vanity-metrics-to-drop)
9. [The 4-Question Test](#the-4-question-test)
10. [Tooling](#tooling)
11. [Implementation Roadmap](#implementation-roadmap)
12. [See Also](#see-also)

---

## The Measurement Problem

AI-assisted development changes delivery speed fast enough to break most existing benchmarks. A team shipping 2 features per sprint in 2022 might now ship 6, with AI generating 70-90% of the code. That looks like a win on every traditional scorecard, and it might genuinely be one — or the velocity is hiding shallow reviews, skill atrophy, and a growing pile of AI-generated technical debt that nobody fully understands.

The core tension: activity metrics spike immediately when you adopt AI tools, but quality and long-term maintainability signals are slower and harder to track. Sprint velocity, commits per day, and lines written all go up. Bug escape rate, time-to-understand a PR, and developer confidence are harder to wire up but far more informative.

This page gives engineering managers, tech leads, and CTOs a practical measurement stack — starting from the DORA foundation, layering in human factors via SPACE, then adding the AI-specific signals that the standard frameworks don't cover.

---

## The DORA Foundation

DORA (DevOps Research and Assessment) measures the health of your delivery system, not individual contributors. That distinction matters: it keeps metrics conversations focused on process improvement rather than surveillance. It's also the most validated framework in the field, backed by years of research across thousands of organizations.

The four core metrics:

### Deployment Frequency

**What it measures**: How often you deploy to production (or release to end users).

**How to measure**: Count production deployments per day, week, or month. Most CI/CD tools expose this directly (GitHub Actions, CircleCI, Vercel, etc.).

**2024 benchmarks**:

| Tier | Frequency |
|------|-----------|
| Elite | Multiple times per day |
| High | Once per day to once per week |
| Medium | Once per week to once per month |
| Low | Less than once per month |

**Common pitfall**: Teams conflate "deployment" with "release." If you deploy to prod but hide behind feature flags, the metric looks good but customer value isn't delivered. Track both deployment frequency and feature flag rollout cadence if your team uses flags heavily.

---

### Lead Time for Changes

**What it measures**: Time from a code commit to that code running in production.

**How to measure**: Timestamp at commit, timestamp at deployment. The delta is your lead time. Tools like LinearB and Faros.ai automate this from your CI/CD pipeline.

**2024 benchmarks**:

| Tier | Lead Time |
|------|-----------|
| Elite | Less than 1 hour |
| High | 1 hour to 1 week |
| Medium | 1 week to 1 month |
| Low | More than 6 months |

**Common pitfall**: Lead time measures calendar time, not active work time. A PR that sits in review for 3 days has 3 days of lead time even if the actual coding took 20 minutes. If your lead time is long, check where it's accumulating: is it in review queues, staging environments, or deployment pipelines?

---

### Change Failure Rate

**What it measures**: Percentage of deployments that cause a production incident or require a rollback.

**How to measure**: (Number of failed deployments) / (Total deployments). "Failed" means requiring a hotfix, rollback, or incident response. Define this clearly before measuring or you'll argue over what counts.

**2024 benchmarks**:

| Tier | Rate |
|------|------|
| Elite | 0-5% |
| High | 5-10% |
| Medium | 10-15% |
| Low | More than 15% |

**Common pitfall**: If you're not tracking incidents formally, this metric defaults to zero — which looks great but means nothing. Invest in an on-call system (PagerDuty, OpsGenie, even a Slack channel with a naming convention) before tracking CFR.

---

### Mean Time to Recovery (MTTR)

**What it measures**: How long it takes to restore service after a production failure.

**How to measure**: Time from incident alert to service restored. Track in your incident management system. Even a spreadsheet works if your incident volume is low.

**2024 benchmarks**:

| Tier | MTTR |
|------|------|
| Elite | Less than 1 hour |
| High | Less than 1 day |
| Medium | 1 day to 1 week |
| Low | More than 1 week |

**Common pitfall**: MTTR only tells you recovery speed, not root cause distribution. Combine with a lightweight post-mortem process so you know whether you're improving resilience or just getting faster at firefighting the same classes of issues.

---

### On the 2025 DORA Evolution

The 2025 DORA report made a significant methodological shift: the four-tier model (Elite/High/Medium/Low) was retired. DORA now identifies **7 organizational archetypes** measured across **8 dimensions** — throughput, stability, team performance, product performance, individual effectiveness, time on valuable work, friction, and burnout.

The implication for teams: stop chasing "Elite" as an endpoint. "Elite" on deployment frequency can coexist with burnout and high friction. The new model pushes you to identify your archetype (e.g., "Thriving Achievers," "Struggling Strugglers," "Balanced Performers") and improve your weakest dimensions rather than optimizing the metrics you're already good at. The four classic metrics remain valid input signals; they're just no longer the whole story.

---

## DORA in an AI-Augmented Context

Each DORA metric reacts differently when AI enters the development workflow. Understanding those effects helps you set the right targets and spot the right warning signs.

### Deployment Frequency

AI accelerates feature development, so your deployment cadence should increase — provided your pipeline can keep up. If deployment frequency stays flat after widespread AI adoption, the bottleneck is downstream: staging environments, manual QA gates, or review throughput, not coding speed. AI gives you more PRs to merge; it doesn't automatically improve the rest of the pipeline.

Watch for: deployment frequency climbing while change failure rate also climbs. That's AI-accelerated code that isn't being reviewed carefully.

### Lead Time for Changes

AI cuts coding time but has limited effect on the non-coding segments of lead time. PR review, staging validation, context-switching delays, and deployment windows are largely unchanged by AI assistance. If your lead time isn't improving alongside AI adoption, the constraint is in review velocity or pipeline automation, not coding. Map your lead time stages explicitly — code time, review wait, staging wait, deploy window — to know where the leverage is.

### Change Failure Rate

This is the metric most at risk when AI adoption outpaces review discipline. AI generates syntactically correct, structurally plausible code that can still have subtle behavioral errors. Teams that treat AI-generated PRs as "lower risk" and rubber-stamp reviews tend to see CFR creep up over 6-12 months. The failure mode is gradual: each individual AI PR looks fine, but the cumulative effect of reduced scrutiny shows up in production.

Track CFR separately for AI-generated code versus manually written code (most AI coding tools can tag commits). If AI-generated CFR is materially higher, your review process needs reinforcement, not your AI tooling.

### MTTR

AI genuinely helps here — if observability is already in place. AI-assisted diagnosis can cut time-to-root-cause significantly when the model has access to error logs, stack traces, and codebase context. But AI diagnosis is only as good as the signals it can read. A team without structured logging, without request tracing, and without alerting won't get a meaningful MTTR improvement from AI. The sequencing matters: instrument first, then expect AI to accelerate incident response.

### Raising the Baseline

The practical consequence of AI assistance at scale: "Medium" DORA is no longer a credible target. Anthropic's internal engineering data from January 2026 shows +67% PRs per engineer per day, with 70-90% of shipped code AI-assisted. If your team is operating at AI-assisted development and still sitting in Medium tier on deployment frequency or lead time, the constraint is in your processes and pipeline — not in your developers' output. Adjust your targets accordingly.

---

## Beyond DORA: The SPACE Framework

DORA measures the delivery system. SPACE measures the people inside it. Both are necessary; neither is sufficient alone.

SPACE was developed by researchers at GitHub, Microsoft, and the University of Victoria (published 2021). It covers five dimensions:

### Satisfaction and Well-being

Are developers satisfied with their work, tools, and processes? Are they experiencing burnout signals?

Measure with: quarterly developer experience survey (5-8 questions, anonymous). Track trend over time, not absolute score. A team scoring 3.2/5 that improves to 3.8/5 over 6 months is in a better position than one stuck at 4.0/5.

### Performance

Is the work being delivered actually working as intended? Does it meet quality and reliability expectations?

Measure with: Change Failure Rate (overlaps with DORA), Bug Escape Rate (bugs that reach production divided by total bugs), and customer satisfaction on specific features.

### Activity

What volume of work is being produced?

Measure with: Deployment Frequency, throughput (features shipped per cycle), PR merge rate.

Critical note: Activity is the easiest dimension to measure and the easiest to game. High commit count, high PR volume, high deployment frequency can all coexist with low actual value delivered. Activity metrics are inputs, not outcomes.

### Communication and Collaboration

Is knowledge flowing? Are teams unblocked and connected?

Measure with: PR review latency (time from PR open to first review), cross-team dependency resolution time, onboarding time for new contributors.

### Efficiency and Flow

Are developers able to do deep work without constant interruption? How much friction exists in the development process?

Measure with: self-reported flow state frequency (in your developer survey), context-switching frequency, ratio of unplanned work to planned work.

### The Velocity Trap

Teams can hit "High" on DORA deployment frequency while simultaneously scoring poorly on satisfaction, well-being, and efficiency. More deployments, but developers working nights to hit sprint commitments, skipping design discussions because AI makes coding fast enough to skip planning, accumulating cognitive debt from reviewing AI code they don't fully understand. SPACE catches this. DORA doesn't. Running both frameworks gives you the full picture.

### SPACE + DORA Together

Use DORA for your monthly leadership review: system health, delivery system performance. Use SPACE (specifically the satisfaction and efficiency dimensions) quarterly: human health, sustainable pace, skill development. Treat a divergence — strong DORA, weak SPACE — as a leading indicator of future DORA degradation. Burnt-out teams ship slower.

---

## AI-Specific Metrics

Standard frameworks weren't designed with AI-assisted development in mind. These metrics fill the gap.

### % AI-Assisted Code

The proportion of committed code that was AI-generated or AI-assisted. Available in Anthropic Contribution Metrics (Team and Enterprise plans), GitHub Copilot metrics dashboard, and similar tools for other AI coding assistants.

**Why it matters**: Provides context for everything else. A 5% increase in CFR is a different signal if AI assists 10% of your code versus 80%. Track this as denominator for all quality metrics.

**Watch for**: This number typically climbs over time as adoption increases. Benchmark it quarterly.

### AI Code vs Human Code Quality

Split your Change Failure Rate by code origin: AI-generated commits versus manually written commits. Most enterprise AI coding tools can tag commits or PRs.

If AI-generated CFR is within 2-3 percentage points of manual CFR, your review process is working. If AI-generated CFR is materially higher, review discipline has dropped. If it's lower, AI tooling may genuinely be improving code quality in your domain.

### Review Time: AI PRs vs Manual PRs

Compare average review time (open to merge) for AI-generated PRs versus manually written PRs. If AI PRs are getting merged significantly faster than manual ones, you may have a rubber-stamping problem.

AI-generated code requires at least as much review scrutiny as manually written code — arguably more, because it can be confidently wrong in non-obvious ways. A 30% faster review cycle for AI PRs is a yellow flag worth investigating.

### Developer Code Comprehension

A qualitative, binary signal: during PR review, can the author explain their AI-generated code in their own words — not just what it does, but why it does it that way?

Track this informally through your code review culture. If reviewers start noticing that authors can't explain their AI-generated submissions, that's a skill atrophy signal that will show up in higher CFR and longer MTTR 6-12 months later.

### Time-to-Understand a PR

A rough proxy for code clarity and maintainability: ask reviewers to self-report how long it took them to understand what a PR does (before they could evaluate whether it was correct). Track the median across your team.

Increasing time-to-understand suggests that code is growing more complex or less well-organized over time, regardless of who wrote it. AI-generated code can inflate this metric by producing syntactically dense implementations that are harder to reason about than simpler, more explicit alternatives.

---

## Product Metrics (the often-missing layer)

Engineering metrics measure how code gets built. Product metrics measure whether the code is actually solving the right problems. Most engineering teams track the former and leave the latter entirely to product managers. That creates a gap where a team can be shipping fast, with high DORA scores, while the product drifts away from user needs.

### Time-to-Value

How long does it take a new user to reach their first success with your product? Define "first success" concretely — first completed task, first saved item, first report generated, whatever makes sense in your context.

Track this as a median across your user cohorts, and watch for regressions after major feature releases. AI can accelerate your feature shipping without improving, or even while degrading, the new user experience.

### Feature Adoption Rate

Of users who could use feature X, what percentage actually use it within 14 days of release? A feature shipped on time with clean DORA metrics that nobody uses is still a failed feature.

Segment by user cohort (new vs. returning users, different pricing tiers) to distinguish adoption problems from discoverability problems.

### Bug Escape Rate

Bugs found in production divided by total bugs (pre-production bugs + production bugs). Formula: `bugs_in_prod / (bugs_before_prod + bugs_in_prod)`.

If your Bug Escape Rate exceeds 20%, your QA and review processes are consistently failing to catch issues before they reach users. With AI-assisted development, this metric is worth watching closely: faster code generation combined with looser review can push Bug Escape Rate up even when absolute bug count stays flat.

### Feature CSAT

Customer satisfaction score tied to specific features, not the product as a whole. More actionable than NPS: instead of "how likely are you to recommend us," ask "how useful was feature X in completing task Y" on a 1-5 scale.

NPS is useful for brand-level sentiment but too lagging and too broad to steer development priorities. Feature CSAT gives you signal within 2-4 weeks of a release rather than 6-12 months.

---

## By Team Size

Different team sizes have different measurement overhead tolerances. A 5-person team that spends 20% of its time on metrics infrastructure is making a poor trade-off. A 25-person team without automated DORA tracking is flying blind. Here's a practical baseline for two common scales.

### 5-Person Team

**Metrics to track:**

| Metric | How | Frequency |
|--------|-----|-----------|
| Deployment Frequency | Count deploys manually or from CI | Weekly |
| Cycle Time (commit to prod) | Linear or GitHub timestamp diff | Per-PR, reviewed monthly |
| Time-to-value (product north star) | Analytics tool (Mixpanel, Amplitude, PostHog) | Monthly |
| Bugs in prod per month | Count in your issue tracker | Monthly |
| Developer satisfaction | 5-question anonymous form | Quarterly |

**Tooling**: GitHub Insights plus a shared spreadsheet. No dedicated dashboard needed at this size — the overhead isn't worth it. What matters is having the discipline to review these numbers in a monthly retrospective, not the precision of the tooling.

The instinct at this size is often to skip metrics entirely ("we're too small, we know each other, we talk daily"). Resist it. The value of metrics at 5 people isn't visibility — it's discipline. Naming a north star metric and checking it monthly forces conversations that daily standups don't.

### 25-Person Team

**Metrics to track:**

| Metric | How | Frequency |
|--------|-----|-----------|
| All 4 DORA metrics | LinearB or Faros.ai automated | Weekly (automated) |
| Cycle Time per squad (not global) | Same tooling, segmented | Weekly |
| Bug Escape Rate | Issue tracker + deploy markers | Monthly |
| Feature CSAT | In-app survey on key features | Per-release |
| % AI-assisted code | Anthropic Contribution Metrics | Monthly |
| Developer satisfaction | 8-question survey, anonymous | Quarterly |
| PR review time | GitHub Analytics / LinearB | Weekly |
| Time-to-value | Analytics tool | Monthly |

**Tooling**: LinearB or Faros.ai for DORA automation (connects to GitHub + your CI/CD pipeline, surfaces the four metrics without manual tracking), GitHub Analytics for AI contribution data, PostHog or Amplitude for product metrics.

At 25 people, global averages hide squad-level problems. A team with 3 squads that has 80% of its incidents originating from one squad will show a "Medium" CFR overall and miss the signal entirely. Track DORA per squad, not just per organization. Cycle time per team is especially valuable — it surfaces bottlenecks in specific parts of your codebase or process.

PR review time is a friction metric worth watching closely at this scale. When median PR review exceeds 24 hours, it creates context-switching overhead: developers move to other tasks while waiting, then need to re-load context when the review comes back. That re-loading cost doesn't appear in any standard metric, but it compounds across dozens of PRs per week.

---

## Vanity Metrics to Drop

| Drop This | Replace With | Why |
|-----------|-------------|-----|
| Sprint velocity | Cycle Time + Deployment Frequency | Velocity is gameable within 2 sprints by changing estimation practices. Cycle time is harder to fake. |
| Lines of code | Bug Escape Rate | LOC measures output volume. With AI, LOC goes up automatically. Bug Escape Rate measures output quality. |
| NPS alone | CSAT + Time-to-value | NPS is a lagging brand signal, not an engineering steering metric. CSAT on specific features is actionable within weeks. |
| Commits per day | Lead Time for Changes | Commit frequency measures activity. Lead time measures whether that activity actually ships value. |
| Story points | Throughput (features shipped) | Points are defined relative to the team's own baseline and gameable by re-pointing. Throughput counts real deliverables. |
| Code coverage % | Mutation testing score + Bug Escape Rate | Coverage tells you tests exist. Mutation testing tells you whether those tests would catch real bugs. |

Story points deserve a specific note in an AI context: if AI is generating boilerplate and scaffolding automatically, the effort to implement a "3-point story" has dropped significantly. Teams that haven't recalibrated their pointing will show velocity increases that reflect tool efficiency, not team capacity. Lead Time and Deployment Frequency are tool-agnostic — they measure output regardless of who or what did the work.

---

## The 4-Question Test

Before adding any metric to your tracking stack, run it through these four questions:

**1. Can you act on it within 2 weeks?**

If the answer is no, it's a reporting metric, not a steering metric. Reporting metrics belong in quarterly board decks, not in weekly team reviews. "Total API calls since launch" is a reporting metric. "API error rate last 7 days" is a steering metric.

**2. Does it explain why, not just what?**

"Churn is 5%" tells you nothing. "80% of churned users never completed their first workflow" tells you where to look. When evaluating a metric, ask: if this number moves, do I know what to investigate?

**3. Is it correlated to a business outcome?**

This is the tightest filter. Deployment frequency is correlated to revenue in high-iteration SaaS products. PR review time is correlated to developer satisfaction and retention. Feature CSAT is correlated to expansion revenue. Lines of code is correlated to nothing that matters.

**4. Can it be measured automatically?**

If collecting the metric requires manual work — someone pulling numbers from a spreadsheet, someone remembering to log an incident — it will be abandoned within 3 months when workload increases. Automate or drop.

**The rule**: fewer than 3 "yes" answers, drop the metric. A measurement stack with 5 rigorous metrics is more useful than one with 20 loosely defined ones. Most teams that fail at metrics fail by tracking too many things with too little precision, not by tracking too few.

---

## Tooling

| Tool | What It Does | Best For | Notes |
|------|-------------|---------|-------|
| LinearB | DORA automation + cycle time, connects to GitHub + Jira | 25+ people | Good out-of-box DORA dashboards, solid PR analytics |
| Faros.ai | DORA + custom engineering dashboards, open-source core | 25+ people | More configurable than LinearB, steeper setup |
| GitHub Analytics (Anthropic) | AI contribution metrics (% AI-assisted code, PR-level attribution) | Any Claude Code team | Enterprise/Team plan required |
| Sleuth | Deploy tracking + change failure rate, DORA-focused | 10+ people | Lightweight, CI/CD focused, no bloat |
| Axify | Full engineering metrics suite, DORA + flow + team health | 15+ people | Canadian startup, strong SPACE coverage |
| GitHub Insights | Basic activity metrics, free, built-in | Any size | Good enough for 5-10 person teams, not sufficient at scale |
| Spreadsheet | Manual tracking, always works, zero setup | Under 10 people | The right tool if automated setup overhead isn't justified yet |

No tool automatically surfaces the AI-specific metrics described earlier (CFR by code origin, review time comparison, comprehension signals). Those require either custom dashboards built on your CI/CD data or manual tracking. GitHub Analytics covers % AI-assisted code; the rest you'll wire up yourself or instrument in your PR template process.

Avoid tool sprawl. A team with LinearB, Jira, GitHub Insights, and two separate analytics tools will spend more time reconciling numbers than acting on them. Pick one DORA tool, one product analytics tool, and use GitHub Analytics for AI-specific data.

---

## Implementation Roadmap

The most common failure mode in metrics programs is trying to instrument everything at once. Three phases:

### Phase 1: Weeks 1-2 — Instrument DORA

Connect your CI/CD pipeline to a metrics tool. For most teams this means connecting GitHub Actions (or equivalent) to LinearB, Faros, or Sleuth. Get Deployment Frequency and Lead Time automated first — they require the least manual work to configure. Change Failure Rate and MTTR require incident tracking to be in place, which takes slightly longer to set up.

Output: a live dashboard showing at minimum Deployment Frequency and Lead Time for Changes. Your first baseline numbers.

### Phase 2: Weeks 3-4 — Baseline and Set Targets

Once you have 2-4 weeks of data, establish your actual baseline. The temptation here is to compare to industry benchmarks immediately. Resist it. Set internal improvement targets first: "reduce Lead Time by 20% over the next quarter" is more actionable than "get to High tier." Your context — tech stack, deployment environment, team size, product type — affects what's achievable more than any benchmark.

Run your first developer satisfaction pulse (5 questions, anonymous, takes 10 minutes to build in Google Forms or Typeform). This is your SPACE baseline.

### Phase 3: Month 2 and Beyond — Layer in Product and AI Metrics

Once DORA is stable and automated, add the product metrics (time-to-value, feature CSAT) and AI-specific signals (% AI-assisted code, CFR by code origin). These require more setup — product analytics instrumentation, PR tagging conventions — but they're worth the investment once your DORA foundation is solid.

Review the full metric stack quarterly and prune ruthlessly. Any metric that hasn't driven a decision in the last 3 months is a reporting metric masquerading as a steering metric. Cut it.

---

## See Also

- [Session Observability & Monitoring](./observability.md) — Claude Code session monitoring, cost tracking, usage patterns
- [AI Traceability](./ai-traceability.md) — Auditing AI-generated code contributions, attribution, and compliance
- [Learning With AI](../roles/learning-with-ai.md) — Individual developer growth in AI-augmented workflows, skill development signals
- [Agent Evaluation](../roles/agent-evaluation.md) — Quality metrics for custom Claude Code agents and automated workflows
