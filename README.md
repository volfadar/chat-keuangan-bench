# chat-keuangan-bench

**Open benchmark for parsing Indonesian casual finance chat into structured Rupiah transactions.**

Real users don't type `{"amount": 50000}`. They send WhatsApp-style messages: slang, typos, voice corrections, patungan, `ceban`, `td malem`, `12rb 2 2 nya`. This repo measures how well LLMs extract `pemasukan` / `pengeluaran` entries from that mess — with quality scoring beyond pass/fail.

> **Repo:** [github.com/volfadar/chat-keuangan-bench](https://github.com/volfadar/chat-keuangan-bench)  
> Former name: `rupiah-bench` (renamed for clarity — *chat keuangan* = finance chat).

---

## Executive report (Jun 2026)

**Thirteen models** evaluated on **25 extreme Indonesian finance-parse scenarios** (hard-25), merged with **OpenRouter activity CSV** for real cost and throughput (where available). Supplement models (Jun 27) use **eval-run costs** from live hard-25 runs.

**FX rate used:** 1 USD = **17.905 IDR** (27 Jun 2026, ~12:50 WIB)

### Visual scorecard

Thirteen models · hard-25 eval · charts at full width (not squeezed into one row).

#### Strict pass rate

<p align="center">
  <img src="./docs/charts/strict-pass.svg" alt="Hard-25 strict pass rate by model" width="960" />
</p>

#### Cost per 25-scenario eval run (IDR)

<p align="center">
  <img src="./docs/charts/cost-25-idr.svg" alt="Estimated cost per full hard-25 run in Indonesian Rupiah" width="960" />
</p>

#### Mean latency per scenario

<p align="center">
  <img src="./docs/charts/latency.svg" alt="Mean eval latency in milliseconds" width="960" />
</p>

#### Quality vs price

Ideal quadrant: **top-right** (highest composite, cheapest models on the right). Y-axis zoomed to 90–100.

<p align="center">
  <img src="./docs/charts/quality-vs-price.svg" alt="Composite quality score vs price — cheaper to the right" width="960" />
</p>

#### Throughput (OpenRouter)

<p align="center">
  <img src="./docs/charts/throughput.svg" alt="Completion tokens per second from OpenRouter CSV" width="960" />
</p>

Full tables + notes: **[`docs/REPORT.md`](docs/REPORT.md)**

### Model ranking (hard-25)

| Rank | Model | Strict | Composite | Latency | $/25-run | **IDR/25-run** | Production fit |
|------|-------|--------|-----------|---------|----------|----------------|----------------|
| 🥇 | `google/gemini-3.1-flash-lite` | **24/25** | 99 | ~2.0s | $0.0181 | **Rp 325** | Best speed among 24/25 tier |
| 🥈 | `google/gemini-3-flash-preview` | **24/25** | 99 | ~6.9s | $0.0318 | **Rp 570** | Same quality, slower & pricier |
| 🥉 | `google/gemma-4-31b-it` | **24/25** | 98 | ~6.0s | $0.0064 | **Rp 114** | **Recommended** — best value; multimodal |
| 4 | `z-ai/glm-4.5` | 22/25 | 98 | ~3.7s | $0.0105 | **Rp 187** | Slang + date quirks |
| 5 | `xiaomi/mimo-v2.5-pro` | 22/25 | 97 | ~6.0s | $0.0057 | **Rp 101** | Xiaomi OR provider; qty-split weak |
| 6 | `deepseek/deepseek-v4-pro` | 22/25 | 97 | ~2.4s | $0.0162 | **Rp 291** | Direct API (not OpenRouter) |
| 7 | `z-ai/glm-4.7` | 22/25 | 97 | ~4.4s | $0.0092 | **Rp 165** | Same failure pattern as 4.5 |
| 8 | `z-ai/glm-4.7-flash` | **17/25** | 92 | ~2.7s | $0.0022 | **Rp 39** | Fast + cheap but weaker than glm-4.7 |
| 9 | `inclusionai/ling-2.6-1t` | 22/25 | 94 | ~3.2s | $0.0065 | **Rp 116** | Lower composite |
| 10 | `openai/gpt-oss-120b` | 21/25 | 96 | **~1.3s** | $0.0070 | **Rp 126** | Fastest; 21/25 strict |
| 11 | `deepseek/deepseek-v4-flash` | 21/25 | 97 | ~2.4s | **$0.0028** | **Rp 50** | Cheapest useful model |
| 12 | `deepseek/deepseek-v4-pro@openrouter` | 19/25 | 94 | ~2.8s | $0.0217 | **Rp 388** | OR → Baidu; worse than direct |
| 13 | `nvidia/nemotron-3-nano-30b-a3b` | 15/25 | 90 | ~2.8s | $0.0026 | **Rp 46** | Cheap probe only |

### Cost at production scale (IDR)

Per **single parse request** (OpenRouter CSV where available; Jun 27 models from eval-run):

| Model | $/request | **IDR/request** | 1.000 msg/day | 30.000 msg/month |
|-------|-----------|-----------------|---------------|------------------|
| `gemini-3.1-flash-lite` | $0.00073 | **Rp 13** | Rp 13rb | Rp 391rb |
| `gemini-3-flash-preview` | $0.00127 | **Rp 23** | Rp 23rb | Rp 690rb |
| `gemma-4-31b-it` | $0.00025 | **Rp 5** | Rp 5rb | Rp 114rb |
| `glm-4.5` | $0.00042 | **Rp 7** | Rp 7rb | Rp 224rb |
| `glm-4.7` | $0.00037 | **Rp 7** | Rp 7rb | Rp 198rb |
| `glm-4.7-flash` | $0.00009 | **Rp 2** | Rp 2rb | Rp 51rb |
| `ling-2.6-1t` | $0.00026 | **Rp 5** | Rp 5rb | Rp 139rb |
| `mimo-v2.5-pro` | $0.00023 | **Rp 4** | Rp 4rb | Rp 121rb |
| `deepseek-v4-pro` (direct) | $0.00065 | **Rp 12** | Rp 12rb | Rp 349rb |
| `gpt-oss-120b` | $0.00028 | **Rp 5** | Rp 5rb | Rp 151rb |
| `deepseek-v4-flash` | $0.00011 | **Rp 2** | Rp 2rb | Rp 60rb |
| `deepseek-v4-pro@openrouter` | $0.00087 | **Rp 16** | Rp 16rb | Rp 466rb |
| `nemotron-3-nano-30b-a3b` | $0.00010 | **Rp 2** | Rp 2rb | Rp 56rb |

> **Gemma** is ~**2.6× cheaper** per parse than gemini-3.1 at the same 24/25 tier. **Deepseek v4 Pro**: use **direct API** (22/25), not OpenRouter Baidu fallback (19/25). **Nemotron** is cheapest but only 15/25.

### Key findings

1. **Three models tie at 24/25** — **`gemma-4-31b-it`** wins on **value + multimodal**; `gemini-3.1-flash-lite` wins on **latency** among the top tier.
2. **Jun 27 supplements:** MiMo v2.5 Pro (22/25), DeepSeek v4 Pro direct (22/25), **glm-4.7-flash (17/25 — not a glm-4.7 replacement)**, Nemotron Nano (15/25).
3. **DeepSeek v4 Pro:** direct `api.deepseek.com` beats OpenRouter default routing (Baidu host, 19/25). Official OR `deepseek` provider blocked on our account privacy policy.
4. **Shared failure mode at 22/25:** qty×unit line-split (`cilok`, `SPP 3 anak`, `daging 2kg`) — models collapse multiple units into one entry.
5. **Don't chase 25/25 via prompt A/B** — confirm UI beats benchmark hacking.

Details: [`docs/FINDINGS.md`](docs/FINDINGS.md) · [`docs/results/hard-25-analysis.md`](docs/results/hard-25-analysis.md) · [`docs/results/hard-25-supplement-jun27.md`](docs/results/hard-25-supplement-jun27.md) · [legacy 8-model analysis](docs/results/hard-25-analysis-8models.md)

### SaaS pricing hint

Building AI **pencatatan keuangan**? Plan **~Rp 8/parse** on gemma-4 (or **~Rp 20** on gemini-3.1 + retry buffer). Keep **core manual** at Rp 49–79rb/mo; sell **AI chat as add-on** Rp 49–99rb/mo with parse caps (e.g. 100/mo), not unlimited in base. Target **AI COGS ≤ 15–20% of ARPU**. Example: 1k users × 80 parses/mo on gemma ≈ **Rp 640rb** AI COGS (vs **Rp 1,6jt** on gemini-3.1).

---

## What it tests

| Suite | Scenarios | Purpose |
|-------|-----------|---------|
| **base** (~28) | Everyday ID chat styles | Regression breadth |
| **stress** (12) | Income direction, bulk lists, corrections | Known failure modes |
| **hard-12** | 12 extreme edge cases | Cross-model torture test |
| **hard-25** | 12 rewrites + 13 new angles | Primary model-selection suite |
| **prompt-tune** | 4 failures × prompt variants | Optional — API-heavy |

Scoring: **quality tiers** (`excellent` → `broken`), composite scores, alt-strict layouts, hallucination / price-copy detection.

### Sample inputs (what users actually type)

Real messages from the suites — not clean JSON.

**Base — everyday chat**

`td abis jajan martabak 15 rebu di depan pesantren`

`makan siang bareng 120rb dibagi 4, punyaku 30rb`

`alhamdulillah thr cair 1,8 juta masuk rekening`

`cod shopee dateng td, case hp 45rb sama kabel type c 25rb`

**Stress — income direction, corrections, bulk**

`barusan gajian cair 5,2 juta masuk rekening BCA, alhamdulillah`

`kemarin refund shopee 127rb masuk gopay bukan keluar ya`

`gojek ke masjid 15rb... eh maksudnya 50rb`

`beli kabel hdmi 7,5... eh maksudnya 75rb bukan 7,5 juta`

Multi-line list:

```
sore tadi:
- indomaret 87.500
- gojek ke kampus 18rb
- kopi 35k
```

**Hard-25 — edge cases models fail on**

`td sore beli pulsa 25rb sama jajan cilok 4 tusuk 5rb 4 4 nya`

`tadi belanja di alfamart 63.700 terus parkir 2rb beli air mineral 6rb`

`tadi jajan es teh ceban sama gorengan goceng`

`bayar wifi 350.000 sama token listrik 102.500 td malem`

`rekap hari ini: sarapan 20rb, bensin 40rb, parkir 5rb, makan siang 30rb, kopi sore 18rb`

`💸 pengeluaran hari ini: bensin 50rb, makan siang 35rb 🙏`

**Not a transaction** (should return `bukan_transaksi: true`):

`gw lagi males banget hari ini pengen tidur aja`

`capek banget hari ini muter2 nyari diskonan tapi ujung2nya ga beli apa2`

---

## Quick start

```bash
git clone https://github.com/volfadar/chat-keuangan-bench.git
cd chat-keuangan-bench
cp .env.example .env   # OPENROUTER_API_KEY (+ DEEPSEEK_API_KEY for v4 Pro direct)
bun install

# Full base suite (default: gemma-4-31b-it)
bun run eval

# Hard-25 — all 13 models (expensive)
bun run eval:hard-25

# Hard-25 — single model / provider
bun run eval:single -- --model xiaomi/mimo-v2.5-pro --provider xiaomi/fp8
bun run eval:single -- --direct-deepseek

# Regenerate scorecard + charts + analysis
bun run bench:refresh
```

Requires [Bun](https://bun.sh), [OpenRouter](https://openrouter.ai) API key, and optionally [DeepSeek](https://platform.deepseek.com) for `deepseek-v4-pro` direct.

### Model roster (12)

| Model | Route | Notes |
|-------|-------|-------|
| `google/gemma-4-31b-it` | OpenRouter | **Recommended** — 24/25, multimodal |
| `google/gemini-3.1-flash-lite` | OpenRouter | 24/25, fastest top tier |
| `google/gemini-3-flash-preview` | OpenRouter | 24/25, pricier |
| `z-ai/glm-4.5` / `4.7` | OpenRouter | 22/25 |
| `z-ai/glm-4.7-flash` | OpenRouter | **17/25** — faster/cheaper but weaker than 4.7 |
| `inclusionai/ling-2.6-1t` | OpenRouter | 22/25 |
| `openai/gpt-oss-120b` | OpenRouter → Groq | 21/25, fastest |
| `deepseek/deepseek-v4-flash` | OpenRouter | 21/25, cheapest useful |
| `xiaomi/mimo-v2.5-pro` | OpenRouter → `xiaomi/fp8` | 22/25 |
| `deepseek/deepseek-v4-pro` | **Direct API** | 22/25 — use `DEEPSEEK_API_KEY` |
| `deepseek/deepseek-v4-pro@openrouter` | OR → Baidu | 19/25 — not recommended |
| `nvidia/nemotron-3-nano-30b-a3b` | OpenRouter | 15/25 — probe only |

Canonical list: `src/core/model-roster.ts`

---

## Architecture

```
src/core/
  eval-core.ts                 # Schema, prompt, parser, scoring, base+stress scenarios
  model-roster.ts              # Canonical 13-model list + USD_TO_IDR
scripts/
  eval-hard-*.ts               # Hard suite runners
  eval-hard-25-single.ts       # Single-model hard-25 (OR provider / DeepSeek direct)
  build-finance-model-scorecard.ts
  generate-report-assets.ts    # SVG charts + docs/REPORT.md
  generate-hard-25-analysis.ts # docs/results/hard-25-analysis.md
docs/
  charts/                      # Generated visualizations
  results/
    scorecard.json             # Merged 13-model scorecard
    runs/                      # Per-model eval JSON (Jun 27 supplement)
    hard-25-analysis.md
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

---

## CLI reference

### Main eval (`bun run eval`)

| Flag | Description |
|------|-------------|
| `--model <id>` | Single OpenRouter model |
| `--models a,b` | Compare comma-separated models |
| `--compare` | Default 2-model compare |
| `--suite base\|stress\|all` | Scenario set |
| `--dry-run` | Print scenarios, no API |

### Hard suites

| Flag | Description |
|------|-------------|
| `--model <id>` | Run one model only |
| `--models a,b` | Comma-separated roster |
| `--merge-from <json>` | Merge prior partial run |
| `--dry-run` | List scenarios |

### Single-model hard-25 (`bun run eval:single`)

| Flag | Description |
|------|-------------|
| `--model <id>` | OpenRouter model slug |
| `--provider <slug>` | Lock OpenRouter provider (e.g. `xiaomi/fp8`, `deepseek`) |
| `--direct-deepseek` | Route via `api.deepseek.com` (`DEEPSEEK_API_KEY`) |
| `--label <name>` | Output filename slug under `docs/results/runs/` |

### Report generation

```bash
bun run bench:refresh   # scorecard + charts + analysis markdown
# or individually:
bun run eval:scorecard
bun run report
bun run analysis
```

---

## Contributing

PRs welcome: new scenarios (realistic Indonesian chat only), scoring improvements, additional models. Please **don't** add scenarios that mirror few-shot examples in the system prompt.

## License

MIT — see [LICENSE](LICENSE).

## Attribution

Originally developed while building finance chat parsing for an Indonesian pesantren/e-commerce platform. Extracted as a standalone open benchmark so others can reproduce and extend without coupling to any private app.
