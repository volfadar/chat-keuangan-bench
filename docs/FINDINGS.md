# Research findings (June 2026)

Summary of the model-selection study that produced **chat-keuangan-bench** (formerly `rupiah-bench`). Reproducible via `bun run eval:hard-25` (costs OpenRouter credits).

## Goal

Pick an LLM that parses Indonesian casual finance messages (WhatsApp / voice transcription style) into structured `pemasukan` / `pengeluaran` JSON — without hallucinating transactions, copying adjacent prices, or flipping income/expense direction.

## Methodology

1. **Base + stress suite** (~40 scenarios) — breadth across slang, income, multi-entry, pesantren context.
2. **Hard-12** — 12 extreme edge cases targeting known failures (qty ambiguity, COD phantom income, price copy, patungan, curhat).
3. **Hard-25** — rewrote all 12 + added 13 new angles (typos, `k` suffix, future intent, slang, emoji noise, 5-line rekap).
4. **Quality scoring** — strict pass + composite tier (`excellent` … `broken`), not binary pass/fail.
5. **Jun 27 supplement** — MiMo v2.5 Pro, Nemotron 3 Nano, DeepSeek v4 Pro (direct + OpenRouter).

## Top models (hard-25, 12-model roster)

| Model | Strict | Composite | Latency | IDR/25-run |
|-------|--------|-----------|---------|------------|
| `google/gemini-3.1-flash-lite` | 24/25 | 99 | ~2.0s | Rp 325 |
| `google/gemini-3-flash-preview` | 24/25 | 99 | ~6.9s | Rp 570 |
| `google/gemma-4-31b-it` | 24/25 | 98 | ~6.0s | **Rp 114** |
| `xiaomi/mimo-v2.5-pro` | 22/25 | 97 | ~6.0s | Rp 101 |
| `deepseek/deepseek-v4-pro` (direct) | 22/25 | 97 | ~2.4s | Rp 291 |
| `z-ai/glm-4.5` / `4.7` | 22/25 | 97–98 | ~3.7–4.4s | Rp 165–187 |
| `deepseek/deepseek-v4-flash` | 21/25 | 97 | ~2.4s | **Rp 50** |
| `nvidia/nemotron-3-nano-30b-a3b` | 15/25 | 90 | ~2.8s | Rp 46 |

**Recommendation:** **`google/gemma-4-31b-it`** for production — 24/25 strict, lowest cost among top tier, multimodal for receipt OCR. Use **`gemini-3.1-flash-lite`** when latency matters more than cost.

**DeepSeek v4 Pro:** route via **`api.deepseek.com`**, not OpenRouter (Baidu fallback scored 19/25).

## The only 4 scenarios anyone failed (original 8-model run)

| ID | Issue | Real defect? |
|----|-------|--------------|
| `hard-sep-wifi-token` | `td malem` → models said `kemarin`, rubric expects `hari_ini` | **Debatable** — amounts correct |
| `hard-voice-ojek-correct` | GLM: `tadi pagi` → `kemarin` | Date label only |
| `hard-slang-ceban-goceng` | GLM: slang decode | **Yes** |
| `hard-cilok-qty-44` | Gemma: qty collapse | **Yes** — alt layout 1×20rb accepted |

## Qty-split cluster (22/25 ceiling)

MiMo, DeepSeek v4 Pro, GLM, Ling share failures on:

- `hard-cilok-qty-44`
- `hard-td-spp-3anak`
- `hard-daging-2kg`

Models merge N×unit price into one line instead of N entries.

## Prompt optimization (what worked / didn't)

| Variant | Effect |
|---------|--------|
| **Datetime anchor** (`Sekarang: {date} WIB`) | Fixed wifi-token + ojek date — **best ROI** |
| **Slang glossary** | Fixed GLM ceban/goceng but broke dates when used alone |
| **Qty rules + few-shot** | Marginal on cilok |

## Production checklist

- [ ] Model: `google/gemma-4-31b-it` (value) or `gemini-3.1-flash-lite` (speed)
- [ ] DeepSeek v4 Pro: `DEEPSEEK_API_KEY` + direct API only
- [ ] Append dynamic datetime anchor each request
- [ ] Confirm UI for amount + date before save
- [ ] Accept merged qty totals (1×20rb) as valid UX

## Files

- `docs/results/scorecard.json` — merged 12-model scorecard
- `docs/results/hard-25-supplement-jun27.md` — Jun 27 eval notes
- `docs/results/runs/*.json` — raw supplemental eval logs
- `docs/REPORT.md` — charts + master table
