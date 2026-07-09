# Agentic Hard-20 Design (chat-keuangan-bench)

**Goal:** Multi-turn agentic eval for Indonesian pencatatan keuangan — tools + compressed prompt + Mastra LLM-as-judge.

**Architecture:** Mastra Agent (model under test) with Firecrawl/SQLite/CSV/PDF/OCR tools; per-scenario sandbox; score = 40% deterministic + 30% rubric + 30% GLM-5.2@Novita step judge.

**Suite:** `agentic-hard-20` — 20 multi-turn edge/anomaly scenarios.

**CLI:** `bun run eval:agentic --model <slug>`
