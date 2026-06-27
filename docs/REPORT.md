# Model comparison report

Generated from hard-25 eval + OpenRouter activity CSV.
**FX:** 1 USD = **17.905 IDR** (27 Jun 2026, ~12:50 WIB)

## Visual summary

Charts render at **960px** width — scroll horizontally on narrow screens if needed.

#### Strict pass rate
Hard-25 scenarios passed with exact structured match.


<p align="center">
  <img src="./charts/strict-pass.svg" alt="Strict pass rate" width="960" />
</p>

#### Cost per 25-scenario eval run (IDR)
FX: 1 USD = 17.905 IDR


<p align="center">
  <img src="./charts/cost-25-idr.svg" alt="Cost per 25-scenario eval run (IDR)" width="960" />
</p>

#### Mean eval latency per scenario

<p align="center">
  <img src="./charts/latency.svg" alt="Mean eval latency per scenario" width="960" />
</p>

#### Quality vs price trade-off
Ideal quadrant: **top-right** (high composite, cheapest → right). Y-axis zoomed to 90–100.


<p align="center">
  <img src="./charts/quality-vs-price.svg" alt="Quality vs price trade-off" width="960" />
</p>

#### OpenRouter throughput (tokens/sec)

<p align="center">
  <img src="./charts/throughput.svg" alt="OpenRouter throughput (tokens/sec)" width="960" />
</p>

## Master table (USD + IDR)

| Model | Strict | Composite | Latency | $/25-run | IDR/25-run | $/request | IDR/request |
|-------|--------|-----------|---------|----------|------------|-----------|-------------|
| gemini-3.1-flash-lite | 24/25 | 99 | 1955ms | $0.0181 | Rp 325 | $0.00073 | Rp 13 |
| gemini-3-flash-preview | 24/25 | 99 | 6913ms | $0.0318 | Rp 569 | $0.00127 | Rp 23 |
| gemma-4-31b-it | 24/25 | 98 | 5959ms | $0.0064 | Rp 114 | $0.00025 | Rp 5 |
| glm-4.5 | 22/25 | 98 | 3733ms | $0.0105 | Rp 187 | $0.00042 | Rp 7 |
| glm-4.7 | 22/25 | 97 | 4387ms | $0.0092 | Rp 165 | $0.00037 | Rp 7 |
| ling-2.6-1t | 22/25 | 94 | 3196ms | $0.0065 | Rp 116 | $0.00026 | Rp 5 |
| mimo-v2.5-pro | 22/25 | 97 | 5983ms | $0.0057 | Rp 101 | $0.00023 | Rp 4 |
| deepseek-v4-pro | 22/25 | 97 | 2404ms | $0.0162 | Rp 291 | $0.00065 | Rp 12 |
| gpt-oss-120b | 21/25 | 96 | 1253ms | $0.0070 | Rp 126 | $0.00028 | Rp 5 |
| deepseek-v4-flash | 21/25 | 97 | 2385ms | $0.0028 | Rp 50 | $0.00011 | Rp 2 |
| deepseek-v4-pro@openrouter | 19/25 | 94 | 2828ms | $0.0217 | Rp 388 | $0.00087 | Rp 16 |
| nemotron-3-nano-30b-a3b | 15/25 | 90 | 2791ms | $0.0026 | Rp 46 | $0.00010 | Rp 2 |

## Recommendations

| Use case | Model | Why |
|----------|-------|-----|
| **Best quality (24/25)** | `gemini-3.1-flash-lite` | Top strict + composite among evaluated models |
| **Best value (24/25 tier)** | `gemma-4-31b-it` | 24/25 strict at ~Rp 114/25-run — multimodal-ready |
| **Fastest** | `gpt-oss-120b` | ~1253ms/scenario |
| **Cheapest strict-quality** | `deepseek-v4-flash` | ~Rp 46/25-run — 21/25 strict |
| **DeepSeek v4 Pro** | `deepseek-v4-pro` (direct API) | 22/25 — prefer api.deepseek.com over OpenRouter Baidu route (19/25) |
| **Avoid for production** | `nemotron-3-nano-30b-a3b` | 15/25 — cheap but weak on temporal + qty split |

> Per-message inference at scale: multiply **IDR/request** by your daily message volume.