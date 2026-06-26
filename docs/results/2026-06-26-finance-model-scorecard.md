# Finance Parse Model Scorecard — 2026-06-26T17:56:36.810Z

Merged eval runs + OpenRouter CSV. **8/8** models in eval JSON.

## Executive summary

- **Best quality (hard-25):** `google/gemini-3.1-flash-lite` — 24/25 strict, composite 99
- **Best value (quality ÷ cost):** `deepseek/deepseek-v4-flash` — value index 65176.6
- **Fastest eval latency:** `openai/gpt-oss-120b` — ~1253ms/scenario
- **Cheapest 25-run est.:** `deepseek/deepseek-v4-flash` — ~$0.0028

## Master scorecard

| Model | Strict | Comp | Eval ms | CSV gen ms | TTFT ms | $/req | $/25-run | tok/s | Value† | CSV reqs |
|-------|--------|------|---------|------------|---------|-------|----------|-------|--------|----------|
| deepseek/deepseek-v4-flash | 21/25 | 97 | 2385 | 1943 | 560 | $0.00011 | $0.0028 | 75.0 | 65176.6 | 73 |
| google/gemma-4-31b-it | 24/25 | 98 | 5959 | 10515 | 893 | $0.00025 | $0.0064 | 40.1 | 30507.4 | 88 |
| inclusionai/ling-2.6-1t | 22/25 | 94 | 3196 | 2586 | 2513 | $0.00026 | $0.0065 | 77.5 | 28254.0 | 52 |
| openai/gpt-oss-120b | 21/25 | 96 | 1253 | 954 | 949 | $0.00028 | $0.0070 | 282.3 | 25640.4 | 85 |
| z-ai/glm-4.7 | 22/25 | 97 | 4387 | 6677 | 902 | $0.00037 | $0.0092 | 25.4 | 20018.9 | 158 |
| z-ai/glm-4.5 | 22/25 | 98 | 3733 | 2972 | 2046 | $0.00042 | $0.0105 | 43.7 | 17756.6 | 172 |
| google/gemini-3.1-flash-lite | 24/25 | 99 | 1955 | 1424 | 890 | $0.00073 | $0.0181 | 135.7 | 10748.0 | 98 |
| google/gemini-3-flash-preview | 24/25 | 99 | 6913 | 2375 | 1619 | $0.0013 | $0.0318 | 66.2 | 6135.5 | 98 |

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

### openai/gpt-oss-120b
- Strict: **21/25**, composite **96.3**
- Failed: hard-bonus-cair-gopay, hard-hp-2juta, hard-slang-ceban-goceng, hard-spelled-setengah-juta

### deepseek/deepseek-v4-flash
- Strict: **21/25**, composite **97.2**
- Failed: hard-alfamart-price-copy, hard-listrik-cashback-mixed, hard-atk-3line, hard-rekap-5line
