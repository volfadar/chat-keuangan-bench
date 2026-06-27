# Finance Parse Hard-25 Eval — 2026-06-27

25 extreme-but-realistic scenarios (12 rewrites + 13 new angles) × **13 models**.

## Recommendation

**Production:** `google/gemma-4-31b-it` — 24/25 strict, lowest cost among top tier, multimodal.

**Latency leader (24/25):** `google/gemini-3.1-flash-lite` — ~2s/scenario.

**DeepSeek v4 Pro:** use direct `api.deepseek.com` (22/25), not OpenRouter Baidu route (19/25).

## Models (full roster)

- `google/gemini-3.1-flash-lite`
- `google/gemini-3-flash-preview`
- `google/gemma-4-31b-it`
- `z-ai/glm-4.5`
- `z-ai/glm-4.7`
- `z-ai/glm-4.7-flash`
- `openai/gpt-oss-120b`
- `inclusionai/ling-2.6-1t`
- `deepseek/deepseek-v4-flash`
- `xiaomi/mimo-v2.5-pro`
- `nvidia/nemotron-3-nano-30b-a3b`
- `deepseek/deepseek-v4-pro`
- `deepseek/deepseek-v4-pro@openrouter`

## Scoreboard

| Model | Strict | Composite | Excellent | Errors | Latency | IDR/25-run | IDR/req |
|-------|--------|-----------|-----------|--------|---------|------------|---------|
| google/gemini-3.1-flash-lite | 24/25 | 99 | 24 | 0 | 1955ms | Rp 325 | Rp 13 |
| google/gemini-3-flash-preview | 24/25 | 99 | 24 | 0 | 6913ms | Rp 569 | Rp 23 |
| google/gemma-4-31b-it | 24/25 | 98 | 24 | 0 | 5959ms | Rp 114 | Rp 5 |
| z-ai/glm-4.5 | 22/25 | 98 | 22 | 0 | 3733ms | Rp 187 | Rp 7 |
| xiaomi/mimo-v2.5-pro | 22/25 | 97 | 22 | 0 | 5983ms | Rp 101 | Rp 4 |
| deepseek/deepseek-v4-pro | 22/25 | 97 | 22 | 0 | 2404ms | Rp 291 | Rp 12 |
| z-ai/glm-4.7 | 22/25 | 97 | 22 | 0 | 4387ms | Rp 165 | Rp 7 |
| inclusionai/ling-2.6-1t | 22/25 | 94 | 22 | 0 | 3196ms | Rp 116 | Rp 5 |
| deepseek/deepseek-v4-flash | 21/25 | 97 | 21 | 0 | 2385ms | Rp 50 | Rp 2 |
| openai/gpt-oss-120b | 21/25 | 96 | 21 | 0 | 1253ms | Rp 126 | Rp 5 |
| deepseek/deepseek-v4-pro@openrouter | 19/25 | 94 | 19 | 0 | 2828ms | Rp 388 | Rp 16 |
| z-ai/glm-4.7-flash | 17/25 | 92 | 17 | 0 | 2745ms | Rp 39 | Rp 2 |
| nvidia/nemotron-3-nano-30b-a3b | 15/25 | 90 | 15 | 0 | 2791ms | Rp 46 | Rp 2 |

## Per-model failures

### google/gemini-3.1-flash-lite

- **Strict:** 24/25 · **Composite:** 99 · **Latency:** ~1955ms
- **Cost:** Rp 325/25-run · Rp 13/request
- **Failed scenarios:** hard-sep-wifi-token

### google/gemini-3-flash-preview

- **Strict:** 24/25 · **Composite:** 99 · **Latency:** ~6913ms
- **Cost:** Rp 569/25-run · Rp 23/request
- **Failed scenarios:** hard-sep-wifi-token

### google/gemma-4-31b-it

- **Strict:** 24/25 · **Composite:** 98 · **Latency:** ~5959ms
- **Cost:** Rp 114/25-run · Rp 5/request
- **Failed scenarios:** hard-cilok-qty-44

### z-ai/glm-4.5

- **Strict:** 22/25 · **Composite:** 98 · **Latency:** ~3733ms
- **Cost:** Rp 187/25-run · Rp 7/request
- **Failed scenarios:** hard-voice-ojek-correct, hard-sep-wifi-token, hard-slang-ceban-goceng

### xiaomi/mimo-v2.5-pro

- **Strict:** 22/25 · **Composite:** 97 · **Latency:** ~5983ms
- **Cost:** Rp 101/25-run · Rp 4/request
- **Failed scenarios:** hard-cilok-qty-44, hard-td-spp-3anak, hard-daging-2kg

### deepseek/deepseek-v4-pro

- **Strict:** 22/25 · **Composite:** 97 · **Latency:** ~2404ms
- **Cost:** Rp 291/25-run · Rp 12/request
- **Failed scenarios:** hard-cilok-qty-44, hard-td-spp-3anak, hard-daging-2kg

### z-ai/glm-4.7

- **Strict:** 22/25 · **Composite:** 97 · **Latency:** ~4387ms
- **Cost:** Rp 165/25-run · Rp 7/request
- **Failed scenarios:** hard-voice-ojek-correct, hard-sep-wifi-token, hard-slang-ceban-goceng

### inclusionai/ling-2.6-1t

- **Strict:** 22/25 · **Composite:** 94 · **Latency:** ~3196ms
- **Cost:** Rp 116/25-run · Rp 5/request
- **Failed scenarios:** hard-td-spp-3anak, hard-past-future-dp, hard-slang-ceban-goceng

### deepseek/deepseek-v4-flash

- **Strict:** 21/25 · **Composite:** 97 · **Latency:** ~2385ms
- **Cost:** Rp 50/25-run · Rp 2/request
- **Failed scenarios:** hard-alfamart-price-copy, hard-listrik-cashback-mixed, hard-atk-3line, hard-rekap-5line

### openai/gpt-oss-120b

- **Strict:** 21/25 · **Composite:** 96 · **Latency:** ~1253ms
- **Cost:** Rp 126/25-run · Rp 5/request
- **Failed scenarios:** hard-bonus-cair-gopay, hard-hp-2juta, hard-slang-ceban-goceng, hard-spelled-setengah-juta

### deepseek/deepseek-v4-pro@openrouter

- **Strict:** 19/25 · **Composite:** 94 · **Latency:** ~2828ms
- **Cost:** Rp 388/25-run · Rp 16/request
- **Failed scenarios:** hard-cilok-qty-44, hard-cod-jnt-tip, hard-alfamart-price-copy, hard-td-spp-3anak, hard-listrik-cashback-mixed, hard-daging-2kg

### z-ai/glm-4.7-flash

- **Strict:** 17/25 · **Composite:** 92 · **Latency:** ~2745ms
- **Cost:** Rp 39/25-run · Rp 2/request
- **Failed scenarios:** hard-cilok-qty-44, hard-bonus-cair-gopay, hard-td-spp-3anak, hard-sep-wifi-token, hard-refund-tokopedia, hard-slang-ceban-goceng, hard-spelled-setengah-juta, hard-daging-2kg

### nvidia/nemotron-3-nano-30b-a3b

- **Strict:** 15/25 · **Composite:** 90 · **Latency:** ~2791ms
- **Cost:** Rp 46/25-run · Rp 2/request
- **Failed scenarios:** hard-cilok-qty-44, hard-cod-jnt-tip, hard-td-spp-3anak, hard-patungan-tim, hard-future-kulkas, hard-past-future-dp, hard-refund-tokopedia, hard-slang-ceban-goceng, hard-cancelled-jaket, hard-daging-2kg

## Failure clusters

### Qty×unit line-split (22/25 ceiling)

Models at 22/25 often fail: `hard-cilok-qty-44`, `hard-td-spp-3anak`, `hard-daging-2kg`.

### Date-label semantics (24/25 models)

`hard-sep-wifi-token`, `hard-voice-ojek-correct` — amounts correct; `tadi malam` vs `hari_ini` debatable.

### Nemotron-only (15/25)

Additional failures: future intent, cancelled orders, slang, patungan, COD tip.

## Data sources

- `docs/results/2026-06-26-finance-hard-25-results.json` — original 8-model run
- `docs/results/runs/2026-06-27-*.json` — Jun 27 supplement
- `docs/results/scorecard.json` — merged scorecard

Regenerate: `bun run eval:scorecard && bun run report && bun run analysis`
