# rupiah-bench

**Open benchmark for parsing Indonesian casual finance chat into structured Rupiah transactions.**

Real users don't type `{"amount": 50000}`. They send WhatsApp-style messages: slang, typos, voice corrections, patungan, `ceban`, `td malem`, `12rb 2 2 nya`. This repo measures how well LLMs extract `pemasukan` / `pengeluaran` entries from that mess.

> **Name:** `rupiah-bench` — short, memorable, domain-specific.  
> Other names we considered: `indo-finance-parse-bench`, `chat-keuangan-eval`, `wa-rupiah-parser`, `parserupiah`. Happy to take PRs if you prefer a rename before npm publish.

## What it tests

| Suite | Scenarios | Purpose |
|-------|-----------|---------|
| **base** (~28) | Everyday ID chat styles | Regression breadth |
| **stress** (12) | Income direction, bulk lists, corrections | Known failure modes |
| **hard-12** | 12 extreme edge cases | Cross-model torture test |
| **hard-25** | 12 rewrites + 13 new angles | Harder, more varied torture test |
| **prompt-tune** | 4 failure scenarios × prompt variants | Legitimate prompt optimization (use sparingly — costs API $) |

Scoring goes beyond pass/fail: **quality tiers** (`excellent` → `broken`), composite scores, alt-strict layouts (merged qty totals), hallucination / price-copy detection.

## Quick start

```bash
git clone https://github.com/volfadar/rupiah-bench.git
cd rupiah-bench
cp .env.example .env   # add OPENROUTER_API_KEY
bun install

# Full base suite (default model: gemma-4-31b-it)
bun run eval

# Compare models
bun run eval -- --compare
bun run eval -- --models google/gemini-3.1-flash-lite,google/gemini-3-flash-preview

# Hard suites (recommended for model selection)
bun run eval:hard-25
bun run eval:hard-12

# Dry-run scenarios without API calls
bun run eval:hard-25 -- --dry-run
```

Requires [Bun](https://bun.sh) and an [OpenRouter](https://openrouter.ai) API key.

## Research findings (Jun 2026)

Full write-up: [`docs/FINDINGS.md`](docs/FINDINGS.md). Sample reports: [`docs/results/`](docs/results/).

### Model picks (hard-25, top tier)

| Rank | Model | Strict | Latency | Notes |
|------|-------|--------|---------|-------|
| 1 | `google/gemini-3.1-flash-lite` | 24/25 | ~2s | **Recommended** — best speed/accuracy |
| 2 | `google/gemini-3-flash-preview` | 24/25 | ~3.3s | Same score, slightly slower |
| 3 | `google/gemma-4-31b-it` | 24/25 | ~6.8s | Strong but slow; weak on qty×unit edge |
| 4–5 | `z-ai/glm-4.5` / `4.7` | 22/25 | 3.6–5s | Slang + relative-date quirks |

The 9 failing cells across all models are **4 scenarios** — mostly date-label semantics (`tadi malam` → `kemarin` vs `hari_ini`) where **amounts are already correct**. Production should use a confirm UI, not infinite prompt A/B.

### Legitimate production wins (no benchmark hacking)

1. **Datetime anchor** in system prompt (`Sekarang: {date} WIB`) — fixes most relative-date misses.
2. **Confirm UI** — user taps to fix date/amount; don't chase 100/25 via API eval spend.
3. **Optional slang glossary** (`ceban`=10rb, `goceng`=5rb) — helps GLM; use with date rules together.

## Architecture

```
src/core/eval-core.ts   # Schema, system prompt, parser, scoring, base+stress scenarios
scripts/eval-hard-*.ts  # Hard suite runners + quality analysis
scripts/eval-prompt-tune.ts  # Prompt variant experiments (optional)
src/index.ts            # Library exports
```

### Output schema

```json
{
  "entries": [{
    "type": "pengeluaran | pemasukan",
    "tanggal_hint": "hari_ini | kemarin | ...",
    "deskripsi": "string",
    "jumlah": 50000,
    "ambigu": false,
    "catatan_ambigu": null
  }],
  "bukan_transaksi": false,
  "ringkasan": null
}
```

## CLI reference

### Main eval (`bun run eval`)

| Flag | Description |
|------|-------------|
| `--model <id>` | Single OpenRouter model |
| `--models a,b` | Compare comma-separated models |
| `--compare` | Default 2-model compare |
| `--battle` | 4-model roster |
| `--suite base\|stress\|all` | Scenario set |
| `--limit N` | First N scenarios only |
| `--dry-run` | Print scenarios, no API |

### Hard suites

| Flag | Description |
|------|-------------|
| `--model <id>` | Run one model only |
| `--dry-run` | List scenarios |

### Prompt tune (⚠️ API-heavy)

```bash
bun run eval:prompt-tune -- --variant anchor-system --dry-run
```

Runs only the 4 scenarios that failed strict in hard-25. **Don't run all 10 variants × 5 models unless you have budget** — see FINDINGS.

## Contributing

PRs welcome: new scenarios (realistic Indonesian chat only), scoring improvements, additional models in presets. Please **don't** add scenarios that mirror few-shot examples in the system prompt.

## License

MIT — see [LICENSE](LICENSE).

## Attribution

Originally developed while building finance chat parsing for an Indonesian pesantren/e-commerce platform. Extracted as a standalone open benchmark so others can reproduce and extend without coupling to any private app.
