---
title: "Context Engineering: Tools & Ecosystem"
description: "A practical map of the tools that compress, optimize, route, and observe LLM context — from CLI output filters to AI gateways to LLMOps platforms"
tags: [context, tokens, optimization, ecosystem, tools, advanced]
---

# Context Engineering: Tools & Ecosystem

> **Confidence**: Tier 1/2 — Core concepts based on published research and production data. Third-party tool details based on public documentation (March 2026).
>
> **Related**: [Context Engineering (configuration guide)](./context-engineering.md) | [Third-Party Tools](./third-party-tools.md) | [MCP Servers Ecosystem](./mcp-servers-ecosystem.md)

This page maps the ecosystem of tools that help you manage what enters the context window and what doesn't. It complements the [configuration-focused context engineering guide](./context-engineering.md), which covers CLAUDE.md structure and path-scoping. Here the focus is on the broader tooling landscape: output compression, prompt compression, AI gateways, RAG optimization, observability, and inference infrastructure.

---

## Table of Contents

1. [The Mental Model](#1-the-mental-model)
2. [Core Concepts](#2-core-concepts)
3. [Output Compression: CLI & Tool Output](#3-output-compression-cli--tool-output)
4. [Prompt Compression](#4-prompt-compression)
5. [AI Gateways](#5-ai-gateways)
6. [RAG Optimization](#6-rag-optimization)
7. [Memory Systems](#7-memory-systems)
8. [KV Cache Infrastructure](#8-kv-cache-infrastructure)
9. [LLMOps & Observability](#9-llmops--observability)
10. [Tool Selection by Use Case](#10-tool-selection-by-use-case)
11. [Research Landscape](#11-research-landscape)

---

## 1. The Mental Model

The framing that makes everything else click: **the context window is RAM, not disk**.

RAM is fast, expensive, and finite. You don't load everything you own into RAM before running a program. You load exactly what the program needs, right when it needs it. The same applies to LLM context: every token you put there displaces something else, costs money, and competes for the model's attention.

This reframes the engineering challenge. It's not "how do I give the model more information?" but "what is the minimum viable set of information the model needs to succeed?" Every technique in this page is an answer to that second question.

The parallel with system architecture holds further. A CPU without good memory management stalls. An LLM without good context management hallucinates, loses coherence, and drifts toward generic outputs. Optimizing context is not a cost-cutting exercise — it's a reliability investment.

---

## 2. Core Concepts

### Minimum Viable Context (MVC)

MVC is the principle of providing exactly the information needed for the task, nothing more. It has two failure modes that look opposite but stem from the same cause:

- **Under-context**: the model lacks necessary information, hallucinates or produces generic output
- **Over-context**: the model is overwhelmed with irrelevant information, attention diffuses, adherence degrades

The research on adherence degradation (see [context engineering guide, section 2](./context-engineering.md#2-the-context-budget)) quantifies the over-context failure: a CLAUDE.md over 400 lines typically drops adherence to ~60%. The cause is attention diffusion — too many potentially relevant signals compete for the model's limited attention budget.

MVC is not about minimalism for its own sake. It's about precision. A 300-token system prompt that covers exactly what the model needs beats a 3,000-token prompt that buries the critical instruction on page five.

### Context Rot

Context rot describes the degradation in model behavior as context length grows during a session. The most studied form is the "lost-in-the-middle" phenomenon: models consistently underweight information placed in the middle of a long context, attending primarily to the beginning and end.

Empirical consequences in practice:

- Instructions near the top of a CLAUDE.md file are followed more consistently than instructions at the bottom
- In long agentic sessions, earlier constraints lose salience as new content pushes them toward the middle
- Tool outputs from the start of a session are often effectively "forgotten" after several rounds of interaction

Mitigation: `/compact` at 70% context usage (not 90%), structured note-taking hooks, and session restarts for fundamentally new task contexts. The `/compact` command summarizes conversation history, moving stale content out of the active attention window while preserving continuity.

### Semantic Priming Hypothesis

An observation from compression research with practical implications: when you ultra-compress a context (removing most tokens), the model does not recall the removed information verbatim. Instead, the compressed context acts as a *semantic prime* — it activates relevant latent knowledge that was already present in the model's weights from training.

This matters because it means heavily compressed context can perform better than its information density suggests. The model is not reconstructing facts from the context; it's being pointed toward relevant knowledge it already has. For well-trained domains, a 10-token hint may activate more relevant knowledge than a 100-token verbatim extract.

The practical implication: prefer keywords and structural cues over prose when context is tight. "Use OpenAPI 3.1, strict mode, no nullable" retrieves more precise behavior than two paragraphs explaining the same thing.

### Context Rot vs. Token Cost: The Two Pressures

Context management operates under two simultaneous pressures that pull in opposite directions:

| Pressure | Cause | Effect | Mitigation |
|----------|-------|--------|------------|
| **Context Rot** | Too much content | Attention diffusion, lost-in-middle | Prune, compact, scope |
| **Token Cost** | Every token billed | Budget overrun, latency increase | Compress, filter, cache |

Compression addresses cost. Pruning addresses rot. Good context engineering does both.

---

## 3. Output Compression: CLI & Tool Output

Tool outputs, shell command results, test logs, and database query responses share a structural problem: they contain 70–95% boilerplate. A passing test suite logs hundreds of success lines for the one failure you care about. A `git log` dumps metadata for every commit when you need three fields. This noise enters the context window verbatim unless intercepted.

### RTK (Rust Token Killer)

RTK is a CLI proxy that intercepts command output before it reaches Claude's context, applying purpose-built filters that surface signal and discard noise. It integrates via a Claude Code hook, so standard commands are transparently rewritten.

| Attribute | Details |
|-----------|---------|
| **Source** | [github.com/rtk-ai/rtk](https://github.com/rtk-ai/rtk) |
| **Install** | `brew install rtk-ai/tap/rtk` or `cargo install rtk` |
| **Stars** | 446 (March 2026) |
| **Integration** | Claude Code hook via `rtk init --global` |

Measured savings across command categories:

| Command | Reduction |
|---------|-----------|
| `rtk git log` | 92% |
| `rtk git status` | 76% |
| `rtk vitest run` | 99%+ |
| `rtk cargo test` | 89% avg |
| `rtk pnpm outdated` | 70–85% |

The design philosophy: suppress successful output, surface failures. A test suite that passes 300 tests and fails 2 should show 2 lines, not 302. This matches how a developer reads output — context should match that cognitive model.

RTK supports custom filters via TOML DSL (`.rtk/filters.toml`) for project-specific output patterns without writing Rust. See [Third-Party Tools: RTK](./third-party-tools.md#rtk-rust-token-killer) for the complete feature reference.

### Headroom

Headroom targets a different problem: structured data returned by tools (JSON payloads, database results, API responses) that is large but not entirely droppable.

The key difference from RTK: Headroom is **lossless**. Rather than discarding content, it replaces verbose data with a compressed summary and registers the original with a retrieval handle. If the model determines it needs the full data, it can call a tool to fetch it. This preserves the agent's ability to access detail on demand without loading everything upfront.

| Attribute | Details |
|-----------|---------|
| **Source** | [headroom.ai](https://headroom.ai) |
| **Compression** | 70–95% on structured tool output |
| **Architecture** | Lossless — original accessible via retrieval handle |
| **Compression models** | SmartCrusher (fast), Kompress (high fidelity) |

When to choose Headroom over RTK:

- Tool outputs contain structured data the model may need partially (database results, API responses)
- You cannot predict which parts of the output the model will need
- Lossless retrieval is a requirement (compliance, debugging, audit trails)

When RTK is sufficient:

- Output is unstructured command-line text
- Successful runs produce noise you definitively do not need
- Simplicity and zero infrastructure is preferred

---

## 4. Prompt Compression

Prompt compression operates at the model-input level: reducing the token count of the prompt itself before it is sent to the LLM. This differs from output compression (which intercepts tool responses) and context pruning (which manages session history).

### LLMLingua / LLMLingua-2

LLMLingua (Microsoft Research) is the most studied prompt compression framework. It uses a small language model to evaluate the "importance" of each token in a prompt, then removes the least important tokens up to a target compression ratio.

| Attribute | Details |
|-----------|---------|
| **Source** | [github.com/microsoft/LLMLingua](https://github.com/microsoft/LLMLingua) |
| **Max compression** | 20x |
| **Performance loss** | ~1.5% on GSM8K and BBH benchmarks |
| **Approach (v1)** | Perplexity-based token scoring via small LM |
| **Approach (v2)** | Data distillation from GPT-4, token classification |

LLMLingua-2 improves on the original by treating compression as a classification problem (keep vs. drop) rather than a ranking problem. The classifier is trained via distillation from GPT-4 annotations, making it faster and more generalizable across domains.

The Semantic Priming Hypothesis (see section 2) explains why 20x compression can retain 98.5% of task performance: the model is not recalling compressed text literally. It's using the compressed tokens as semantic anchors into its own pre-trained knowledge. High-frequency tokens (function words, connectives) are often dropped; domain keywords and structural markers are preserved.

**When to use**: Long system prompts, repetitive RAG contexts, few-shot examples where the examples are verbose. Not suitable for code (syntax is load-bearing) or numerical data (every digit matters).

### AttnComp (Research Direction)

AttnComp (not yet a shipping product as of March 2026) proposes replacing perplexity scoring with cross-attention patterns as the compression metric. The argument: perplexity measures how "surprising" a token is given its predecessors — useful for language modeling, but only loosely correlated with task relevance. Cross-attention patterns directly show which tokens the model attends to for a given output, making it a more principled importance metric.

Published results show AttnComp outperforms LLMLingua at equivalent compression ratios. Monitor for OSS release.

---

## 5. AI Gateways

AI gateways sit between your application and the LLM provider. They handle routing, rate limiting, cost management, and increasingly, active context transformation. The gateway category is where infrastructure and context engineering overlap.

### Edgee

Edgee positions as a "composable edge layer" for AI applications. Its context engineering features operate transparently at the HTTP layer: the application sends a standard API call, Edgee intercepts it, applies compression and routing policies, and forwards the optimized request to the model.

| Attribute | Details |
|-----------|---------|
| **Source** | [edgee.cloud](https://www.edgee.cloud) |
| **Context compression** | Up to 50% active compression |
| **Deployment** | Edge (close to user, low latency) |
| **Features** | Routing, guardrails, compression, cost policies |

The "edge" positioning is deliberate: by running close to the user rather than in a centralized server, Edgee reduces round-trip latency while still intercepting the full request/response cycle. This matters in interactive applications where token compression and latency are both constraints.

Guardrails are applied at the gateway level, meaning they are enforced regardless of which application or client initiates the request. In multi-tenant environments, this separates the concern of "what context reaches the model" from the application code that generates it.

### Portkey

Portkey is the more established player in the AI gateway category, with a broader feature set centered on unified routing across multiple LLM providers.

| Attribute | Details |
|-----------|---------|
| **Source** | [portkey.ai](https://portkey.ai) |
| **Model support** | 250+ LLMs via unified API |
| **Features** | Routing, fallbacks, load balancing, caching, guardrails |
| **Observability** | Built-in tracing and cost tracking |

Portkey's semantic caching layer is particularly relevant for context optimization: identical or near-identical requests are cached and returned without an LLM call. In applications with repetitive query patterns (helpdesks, code review bots, internal search), cache hit rates can reduce total LLM calls by 30–60%.

**Gateway vs. Output Compression**: these categories complement each other. RTK/Headroom compress what goes into the context from tool outputs. Gateways compress or route the assembled prompt before it hits the model. Both reduce total token spend, but they intercept at different points in the pipeline.

---

## 6. RAG Optimization

Retrieval-Augmented Generation has a well-documented failure mode: the retrieval step returns chunks that are semantically relevant in isolation but lack the context to be useful. A fragment mentioning "Q3 revenue grew 3%" is meaningless without the company name and year — both of which may have been in the same document but in a different chunk.

### Anthropic Contextual Retrieval

Anthropic's contextual retrieval method addresses chunk isolation by pre-contextualizing each fragment before indexing. A short LLM-generated preamble is prepended to each chunk, situating it within the document it came from.

```
Before: "Revenue grew 3% in Q3."

After: "From Acme Corp Q3 2024 earnings report: Revenue grew 3% in Q3."
```

The preamble is generated once per chunk at indexing time, not at retrieval time. With prompt caching, the cost of generating preambles for a large document corpus is reduced by ~90% (the document is cached; only the per-chunk instruction varies).

Published results from Anthropic's evaluation:

| Method | Failure Rate Reduction |
|--------|----------------------|
| Contextual embeddings only | 35% |
| Contextual BM25 (keyword + semantic) | 49% |
| Contextual embeddings + BM25 + reranking | 67% |

The combination of semantic search (embeddings), keyword search (BM25), and a reranking step that re-orders results by relevance to the actual query produces the best outcomes. Reranking providers include Cohere and Voyage AI.

Cost at scale: generating contextual preambles for 1M document tokens costs approximately $1.02 after prompt caching. For most production corpora, this is a one-time indexing cost.

### JIT / Agentic Search

Traditional RAG loads the retrieval results at the start of the request. JIT (Just-in-Time) retrieval defers this: the agent starts with minimal context and retrieves information on-demand as the task reveals what it actually needs.

This matters for agent workflows with unpredictable information requirements. A code debugging agent may need one set of docs for a Python error and a completely different set for the database error encountered two steps later. Loading both upfront wastes context; loading neither forces hallucination. JIT retrieval threads the needle.

In Claude Code terms: this is what the agent does naturally when it uses tools (`list_directory`, `read_file`, `grep`) rather than receiving a pre-assembled context. The "search when needed" pattern is a design principle, not just a Claude capability.

### RAG Triad Evaluation

The RAG Triad is a framework for evaluating RAG output quality across three dimensions:

| Dimension | Question | What it catches |
|-----------|----------|----------------|
| **Context Relevance** | Is the retrieved context relevant to the question? | Retrieval failures |
| **Answer Relevance** | Is the answer relevant to the question? | Generation drift |
| **Groundedness** | Is the answer supported by the retrieved context? | Hallucination |

All three can fail independently. A system can retrieve perfectly relevant context and still hallucinate (groundedness failure). It can generate a relevant answer not supported by what was retrieved. Evaluating all three simultaneously identifies which part of the RAG pipeline is the weak link.

Arize Phoenix implements the RAG Triad as a production evaluation framework (see section 9).

---

## 7. Memory Systems

Long-running agents face a variant of the context rot problem: session history grows until it exceeds the context window, or until early context is effectively ignored. Memory systems solve this by moving information out of the context window and into persistent storage, retrieving it on demand.

### Short-Term: Compaction and Structured Note-Taking

For Claude Code specifically, two mechanisms handle session-level memory:

**`/compact`** summarizes the conversation history, replacing the raw exchange with a dense summary. The model retains continuity but the token count resets substantially. Use at 70% context usage, not 90% — waiting until the context is nearly full leaves insufficient headroom for the compaction itself to work well.

**Structured note-taking via hooks** is the agentic version: a PostToolUse hook writes key decisions, discovered facts, and task state to a notes file. The agent loads this file at the start of the next session. This sidesteps context rot entirely for multi-session work, because the notes file is always at the start of the context (maximum attention) and contains only curated information.

### Long-Term: External Memory Systems

For multi-session and multi-agent workflows, persistent memory systems store information outside the context window and retrieve it selectively.

**ICM (Infinite Context Memory)** implements this as a Rust binary with a dual architecture:

- **Short-term layer**: recency-weighted, decays over time (recent sessions have higher weight)
- **Long-term layer**: importance-weighted, persists indefinitely (architectural decisions, resolved bugs)

See [Third-Party Tools: ICM](./third-party-tools.md) and the memory section in the [ultimate guide](.#memory-hierarchy) for installation and usage details.

**The RAG-vs-Memory distinction**: RAG is the model's access to external world knowledge (documentation, codebase, web). Memory is its access to user-specific and session-specific knowledge (preferences, past decisions, conversation continuity). Both are retrieval systems, but they serve different parts of the information architecture. A well-designed agent uses both.

---

## 8. KV Cache Infrastructure

This section applies to teams deploying or self-hosting LLMs. If you are using Claude via Anthropic's API, Anthropic manages KV cache infrastructure on your behalf — this section covers what that means and the equivalent for other deployment contexts.

### What is the KV Cache?

During the prefill phase (processing the input), the transformer computes Key-Value pairs for every token in the context. These pairs are stored in GPU memory. For subsequent requests that share a prefix (e.g., the same system prompt), these values can be reused rather than recomputed. This is KV cache reuse.

Without KV cache reuse, every request processes the full context from scratch — wasteful for long, stable system prompts. With effective caching, only the unique portion of each request (the user message, new tool results) requires fresh computation.

Anthropic's prompt caching reduces both latency and cost: cached tokens are billed at a lower rate and the model returns the first token faster. Cache hits require the shared prefix to be long enough (typically 1,024+ tokens) and recent enough (cache expires after ~5 minutes without access, or longer for explicit cache control).

### vLLM (PagedAttention)

vLLM is the dominant open-source inference engine for self-hosted LLMs. Its key innovation is PagedAttention: KV cache memory is allocated in fixed-size pages (analogous to OS virtual memory pages) rather than contiguous blocks.

Traditional KV cache allocation wastes 60–80% of GPU memory through fragmentation (allocating worst-case space per sequence). PagedAttention reduces this waste to under 4% by sharing pages across requests and allocating on demand.

| Attribute | Details |
|-----------|---------|
| **Source** | [github.com/vllm-project/vllm](https://github.com/vllm-project/vllm) |
| **Key innovation** | PagedAttention (non-contiguous KV cache) |
| **Memory waste** | Reduced from 60–80% to <4% |

### SGLang (RadixAttention)

SGLang introduces RadixAttention: KV cache entries are organized as a radix tree (trie structure) keyed on the token sequence. When two requests share a prefix, their shared prefix's KV entries are reused automatically.

This is particularly powerful for:

- Multiple requests sharing the same system prompt (the trie stores it once)
- RAG pipelines where the retrieved document is constant across many queries
- Multi-agent systems where a base context is shared across subagents

| Attribute | Details |
|-----------|---------|
| **Source** | [github.com/sgl-project/sglang](https://github.com/sgl-project/sglang) |
| **Key innovation** | RadixAttention (trie-based automatic cache reuse) |
| **Best for** | Shared-prefix workloads, multi-agent systems |

### Semantic Caching

Semantic caching operates above the model layer: instead of caching KV activations, it caches complete LLM responses keyed on semantic similarity of the request. A new request that is semantically close to a cached request returns the cached response without an LLM call.

Redis, with vector search extensions, is the most common implementation. In high-repetition workloads (FAQ bots, internal search, code review pipelines with similar patterns), semantic cache hit rates of 30–60% are achievable, with some production deployments reporting 73% cost reduction.

The risk: cached responses become stale. Semantic caching requires TTL policies aligned with how frequently the underlying knowledge changes.

---

## 9. LLMOps & Observability

You cannot optimize what you do not measure. The LLMOps tooling category provides the instrumentation layer: tracing, cost tracking, quality evaluation, and drift detection for LLM-powered systems.

### Langfuse

The leading open-source option. Langfuse traces LLM calls across complex multi-step agent workflows, capturing input/output at each step, latency, cost per call, and the full execution tree.

| Attribute | Details |
|-----------|---------|
| **Source** | [github.com/langfuse/langfuse](https://github.com/langfuse/langfuse) |
| **License** | Open-source (MIT) |
| **Deployment** | Self-hosted or cloud |
| **Best for** | Self-hosting requirements, cost analysis, trace debugging |

Key features for context optimization: per-session token cost breakdowns, trace comparison (which prompt variant is cheaper?), and custom evaluation metrics you can run on stored traces without rerunning the agent.

### LangSmith

LangSmith is Anthropic-adjacent (LangChain ecosystem) and the standard choice if you are building on LangChain or LangGraph. It excels at debugging chained operations where understanding the execution graph is as important as the individual LLM calls.

| Attribute | Details |
|-----------|---------|
| **Source** | [smith.langchain.com](https://smith.langchain.com) |
| **Best for** | LangChain/LangGraph workloads, chain debugging, A/B testing |
| **Features** | Dataset management, automated evaluation, regression testing |

### Arize Phoenix

Phoenix specializes in RAG quality evaluation, implementing the RAG Triad natively. It traces retrieval operations alongside generation, so you can correlate retrieval quality with final answer quality.

| Attribute | Details |
|-----------|---------|
| **Source** | [github.com/Arize-ai/phoenix](https://github.com/Arize-ai/phoenix) |
| **License** | Open-source |
| **Specialty** | RAG evaluation, LLM-as-judge metrics, embedding drift |

Particularly useful for: identifying when retrieval is the bottleneck (context relevance failures) versus generation (groundedness failures). This distinction determines whether you fix the retriever or the prompt.

### Maxim AI

Maxim AI focuses on continuous evaluation: running automated evals against every production trace, not just offline test sets. It supports LLM-as-a-judge workflows (using an LLM to score another LLM's output) and A/B testing of prompt variants against production traffic.

| Attribute | Details |
|-----------|---------|
| **Source** | [getmaxim.ai](https://www.getmaxim.ai) |
| **Best for** | Continuous eval, A/B testing in production, regression detection |

### TruLens

TruLens implements the RAG Triad evaluation framework as an open-source library. It can be embedded directly in your application code, running evaluations inline as part of the application rather than in a separate observability platform.

| Attribute | Details |
|-----------|---------|
| **Source** | [github.com/truera/trulens](https://github.com/truera/trulens) |
| **License** | Open-source |
| **Best for** | Inline RAG evaluation, library integration, RAG Triad scoring |

### Choosing an Observability Tool

| Need | Recommended |
|------|------------|
| Self-host everything, cost analysis | Langfuse |
| LangChain ecosystem, chain debugging | LangSmith |
| RAG quality evaluation specifically | Arize Phoenix |
| Continuous prod eval, A/B testing | Maxim AI |
| Embed RAG Triad in app code | TruLens |

These tools are not mutually exclusive. Langfuse for tracing plus Phoenix for RAG evaluation is a common combination.

---

## 10. Tool Selection by Use Case

### You are a Claude Code user (individual developer)

| Problem | Tool |
|---------|------|
| Command outputs flooding context | RTK |
| Monitoring token spend | ccusage (see [Third-Party Tools](./third-party-tools.md)) |
| Context growing too long in a session | `/compact` at 70% usage |
| Forgetting past session decisions | ICM memory system |
| Claude ignoring rules from long CLAUDE.md | Path-scoping (see [context engineering guide](./context-engineering.md)) |

### You are building an AI application

| Problem | Tool |
|---------|------|
| Tool output JSON too verbose | Headroom |
| Prompts too long, need compression | LLMLingua |
| Routing across multiple LLM providers | Portkey |
| Compression + guardrails at the edge | Edgee |
| RAG chunks losing context | Anthropic Contextual Retrieval |
| Tracing agent execution | Langfuse or LangSmith |
| RAG quality measurement | Arize Phoenix |
| Continuous evaluation | Maxim AI |

### You are deploying a self-hosted LLM

| Problem | Tool |
|---------|------|
| GPU memory efficiency | vLLM (PagedAttention) |
| Shared-prefix caching (multi-agent, RAG) | SGLang (RadixAttention) |
| Caching repeated queries semantically | Redis with vector search |

---

## 11. Research Landscape

Active research areas that have not yet shipped as production tools (March 2026):

### SlimInfer (Dynamic Token Pruning)

SlimInfer identifies redundant token representations in intermediate transformer layers and prunes them during inference. Published results: 2.53x speedup on Time-to-First-Token for LLaMA 3.1 without measurable quality degradation. The mechanism: mid-layer representations for many tokens converge to near-identical values; pruning these redundant representations saves computation without losing information.

### TopV (Visual Token Pruning)

For multimodal models (vision-language models), image tokens dominate context usage. A 1024x1024 image can generate thousands of visual tokens, most of which encode uninformative patches (backgrounds, margins). TopV formulates patch selection as an optimization problem (Sinkhorn algorithm), retaining only the visual regions relevant to the reasoning task. Published results show significant TTFT reduction on VLM inference with maintained task performance.

### The Token Reduction Effect on Hallucination

A finding that cuts across multiple research directions: token reduction in generative models does not just reduce cost — it measurably reduces hallucination and "overthinking" on simple queries. The mechanism is not fully understood, but the correlation is consistent across studies. Shorter, more precise contexts yield more grounded, less verbose outputs. This strengthens the case for MVC as a reliability principle, not just a cost principle.

---

> **Cross-references**
>
> - [Context Engineering (configuration guide)](./context-engineering.md) — CLAUDE.md hierarchy, path-scoping, budget management
> - [Third-Party Tools](./third-party-tools.md) — RTK full reference, ccusage, ICM, and other CC-specific tools
> - [MCP Servers Ecosystem](./mcp-servers-ecosystem.md) — MCP as dynamic context injection
> - [Observability](../ops/observability.md) — Monitoring Claude Code in production
> - [Ultimate Guide: Memory Systems](.#memory-hierarchy) — Complete memory architecture for Claude Code
