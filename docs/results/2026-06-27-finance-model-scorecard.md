# Finance Parse Model Scorecard — 2026-06-27T15:55:32.618Z

Merged eval runs + OpenRouter CSV. **12/12** models in eval JSON.

## Executive summary

- **Best quality (hard-25):** `google/gemini-3.1-flash-lite` — 24/25 strict, composite 99
- **Best value (quality ÷ cost):** `deepseek/deepseek-v4-flash` — value index 65176.6
- **Fastest eval latency:** `openai/gpt-oss-120b` — ~1253ms/scenario
- **Cheapest 25-run est.:** `nvidia/nemotron-3-nano-30b-a3b` — ~$0.0026 (Rp 46)
- **FX rate:** 1 USD = 17.905 IDR (27 Jun 2026)

## Master scorecard

| Model | Strict | Comp | Eval ms | $/req | IDR/req | $/25-run | IDR/25-run | tok/s | Value† |
|-------|--------|------|---------|-------|---------|----------|------------|-------|--------|
| deepseek/deepseek-v4-flash | 21/25 | 97 | 2385 | $0.00011 | Rp 2 | $0.0028 | Rp 50 | 75.0 | 65176.6 |
| nvidia/nemotron-3-nano-30b-a3b | 15/25 | 90 | 2791 | $0.00010 | Rp 2 | $0.0026 | Rp 46 | — | 57773.2 |
| xiaomi/mimo-v2.5-pro | 22/25 | 97 | 5983 | $0.00023 | Rp 4 | $0.0057 | Rp 101 | — | 32729.3 |
| google/gemma-4-31b-it | 24/25 | 98 | 5959 | $0.00025 | Rp 5 | $0.0064 | Rp 114 | 40.1 | 30507.4 |
| inclusionai/ling-2.6-1t | 22/25 | 94 | 3196 | $0.00026 | Rp 5 | $0.0065 | Rp 116 | 77.5 | 28254.0 |
| openai/gpt-oss-120b | 21/25 | 96 | 1253 | $0.00028 | Rp 5 | $0.0070 | Rp 126 | 282.3 | 25640.4 |
| z-ai/glm-4.7 | 22/25 | 97 | 4387 | $0.00037 | Rp 7 | $0.0092 | Rp 165 | 25.4 | 20018.9 |
| z-ai/glm-4.5 | 22/25 | 98 | 3733 | $0.00042 | Rp 7 | $0.0105 | Rp 187 | 43.7 | 17756.6 |
| deepseek/deepseek-v4-pro | 22/25 | 97 | 2404 | $0.00065 | Rp 12 | $0.0162 | Rp 291 | — | 11391.4 |
| google/gemini-3.1-flash-lite | 24/25 | 99 | 1955 | $0.00073 | Rp 13 | $0.0181 | Rp 325 | 135.7 | 10748.0 |
| deepseek/deepseek-v4-pro@openrouter | 19/25 | 94 | 2828 | $0.00087 | Rp 16 | $0.0217 | Rp 388 | — | 7852.1 |
| google/gemini-3-flash-preview | 24/25 | 99 | 6913 | $0.0013 | Rp 23 | $0.0318 | Rp 569 | 66.2 | 6135.5 |

† **Value index** = `(strict% + composite) / est_cost_25_run_usd` — higher = more quality per dollar.

## Models missing from eval JSON

_All roster models present._

## OpenRouter CSV notes

- Stats aggregated from all CSV rows matching each model slug (Jun 26 eval day).
- Includes `finance-parse-eval` and general `menara-sunnah` traffic for those models.
- `est_cost_25_run` = avg cost per request × 25 scenarios.

## Per-model eval failures

### google/gemma-4-31b-it
- Strict: **24/25**, composite **97.8**
- Failed: hard-cilok-qty-44

### google/gemini-3.1-flash-lite
- Strict: **24/25**, composite **98.8**
- Failed: hard-sep-wifi-token

### google/gemini-3-flash-preview
- Strict: **24/25**, composite **98.8**
- Failed: hard-sep-wifi-token

### inclusionai/ling-2.6-1t
- Strict: **22/25**, composite **94.3**
- Failed: hard-td-spp-3anak, hard-past-future-dp, hard-slang-ceban-goceng

### z-ai/glm-4.5
- Strict: **22/25**, composite **97.7**
- Failed: hard-voice-ojek-correct, hard-sep-wifi-token, hard-slang-ceban-goceng

### z-ai/glm-4.7
- Strict: **22/25**, composite **96.8**
- Failed: hard-voice-ojek-correct, hard-sep-wifi-token, hard-slang-ceban-goceng

### xiaomi/mimo-v2.5-pro
- Strict: **22/25**, composite **97.0**
- Failed: hard-cilok-qty-44, hard-td-spp-3anak, hard-daging-2kg

### deepseek/deepseek-v4-pro
- Strict: **22/25**, composite **97.0**
- Failed: hard-cilok-qty-44, hard-td-spp-3anak, hard-daging-2kg

### openai/gpt-oss-120b
- Strict: **21/25**, composite **96.3**
- Failed: hard-bonus-cair-gopay, hard-hp-2juta, hard-slang-ceban-goceng, hard-spelled-setengah-juta

### deepseek/deepseek-v4-flash
- Strict: **21/25**, composite **97.2**
- Failed: hard-alfamart-price-copy, hard-listrik-cashback-mixed, hard-atk-3line, hard-rekap-5line

### deepseek/deepseek-v4-pro@openrouter
- Strict: **19/25**, composite **94.0**
- Failed: hard-cilok-qty-44, hard-cod-jnt-tip, hard-alfamart-price-copy, hard-td-spp-3anak, hard-listrik-cashback-mixed, hard-daging-2kg

### nvidia/nemotron-3-nano-30b-a3b
- Strict: **15/25**, composite **90.0**
- Failed: hard-cilok-qty-44, hard-cod-jnt-tip, hard-td-spp-3anak, hard-patungan-tim, hard-future-kulkas, hard-past-future-dp, hard-refund-tokopedia, hard-slang-ceban-goceng, hard-cancelled-jaket, hard-daging-2kg
