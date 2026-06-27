# Hard-25 supplement — Jun 27, 2026

Four additional models evaluated on the same **25-scenario hard-25 suite**. Raw JSON in `docs/results/runs/`.

**FX:** 1 USD = 17.905 IDR

## Summary

| Model | Route | Strict | IDR/25-run | IDR/req | Notes |
|-------|-------|--------|------------|---------|-------|
| `xiaomi/mimo-v2.5-pro` | OpenRouter `xiaomi/fp8` | **22/25** | Rp 101 | Rp 4 | Same qty-split failures as GLM |
| `deepseek/deepseek-v4-pro` | **Direct API** (`api.deepseek.com`) | **22/25** | Rp 291 | Rp 12 | Preferred for v4 Pro |
| `deepseek/deepseek-v4-pro@openrouter` | OR default → **Baidu** | **19/25** | Rp 388 | Rp 16 | Reasoning leakage; extra failures |
| `nvidia/nemotron-3-nano-30b-a3b` | OpenRouter default | **15/25** | Rp 46 | Rp 2 | Not production-ready |

## OpenRouter DeepSeek provider

`provider: { only: ["deepseek"] }` returned **404** (account privacy guardrails). OpenRouter fell back to Baidu for `deepseek/deepseek-v4-pro` when no provider lock was set. Use **direct DeepSeek API** for v4 Pro instead.

## Shared failures at 22/25

MiMo, DeepSeek v4 Pro direct, and several GLM-class models fail the same three **qty×unit split** scenarios:

- `hard-cilok-qty-44` — 4 tusuk @ 5rb each
- `hard-td-spp-3anak` — 3× SPP @ 250rb
- `hard-daging-2kg` — 2× daging @ 135rb

## Nemotron failures (15/25)

Additional weak areas beyond qty-split:

- `hard-future-kulkas`, `hard-cancelled-jaket` — future/cancelled → should be `bukan_transaksi`
- `hard-past-future-dp`, `hard-refund-tokopedia` — temporal / refund logic
- `hard-slang-ceban-goceng` — slang decode
- `hard-cod-jnt-tip`, `hard-patungan-tim` — multi-entry parsing

## Reproduce

From the upstream eval harness (Menara Sunnah `apps/ai`):

```bash
# MiMo via Xiaomi provider
bun run scripts/eval-mimo-hard-25.ts

# Generic single-model runner
bun run scripts/eval-hard-25-single.ts --model nvidia/nemotron-3-nano-30b-a3b
bun run scripts/eval-hard-25-single.ts --direct-deepseek
bun run scripts/eval-hard-25-single.ts --model deepseek/deepseek-v4-pro
```

Rebuild bench scorecard:

```bash
bun run eval:scorecard
bun run report
```
