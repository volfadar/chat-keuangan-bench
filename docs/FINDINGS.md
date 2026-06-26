# Research findings (June 2026)

Summary of the model-selection study that produced **rupiah-bench**. Reproducible via `bun run eval:hard-25` (costs OpenRouter credits).

## Goal

Pick an LLM that parses Indonesian casual finance messages (WhatsApp / voice transcription style) into structured `pemasukan` / `pengeluaran` JSON — without hallucinating transactions, copying adjacent prices, or flipping income/expense direction.

## Methodology

1. **Base + stress suite** (~40 scenarios) — breadth across slang, income, multi-entry, pesantren context.
2. **Hard-12** — 12 extreme edge cases targeting known failures (qty ambiguity, COD phantom income, price copy, patungan, curhat).
3. **Hard-25** — rewrote all 12 + added 13 new angles (typos, `k` suffix, future intent, slang, emoji noise, 5-line rekap).
4. **Quality scoring** — strict pass + composite tier (`excellent` … `broken`), not binary pass/fail.
5. **Prompt tune (partial)** — retested 4 failure scenarios with legitimate prompt variants (datetime anchor, slang glossary). Stopped early — diminishing ROI vs API cost.

## Top models (hard-25, 5-model roster)

| Model | Strict | Composite | Latency |
|-------|--------|-----------|---------|
| `google/gemini-3.1-flash-lite` | 24/25 | 99 | ~2.0s |
| `google/gemini-3-flash-preview` | 24/25 | 99 | ~3.3s |
| `google/gemma-4-31b-it` | 24/25 | 98 | ~6.8s |
| `z-ai/glm-4.5` | 22/25 | 98 | ~3.6s |
| `z-ai/glm-4.7` | 22/25 | 97 | ~5.0s |

**Recommendation:** `gemini-3.1-flash-lite` for production (best speed + accuracy).  
**Runner-up:** `gemini-3-flash-preview` if you want to stay in Gemini but avoid the "lite" SKU.

## The only 4 scenarios anyone failed

| ID | Issue | Real defect? |
|----|-------|--------------|
| `hard-sep-wifi-token` | `td malem` → models said `kemarin`, rubric expects `hari_ini` | **Debatable** — amounts 350k + 102.5k always correct |
| `hard-voice-ojek-correct` | GLM: `tadi pagi` → `kemarin` | Date label only; 35rb amount correct |
| `hard-slang-ceban-goceng` | GLM: read ceban/goceng as 100/500 or merged | **Yes** — slang decode failure |
| `hard-cilok-qty-44` | Gemma: `5rb 4 4 nya` → 1×5rb not 4×5rb | **Yes** — qty collapse (others merge to 20rb correctly) |

96% strict on a 25-scenario torture suite is **production-ready** with a confirm step.

## Prompt optimization (what worked / didn't)

From partial prompt-tune runs (~110 API calls, 5 of 10 variants):

| Variant | Effect |
|---------|--------|
| **Datetime anchor** (`Sekarang: {date} WIB` in system) | Fixed wifi-token + ojek date on Gemini/GLM — **best ROI** |
| **Date-expanded rules** | Similar to anchor alone |
| **Slang glossary** | Fixed GLM ceban/goceng but **broke** date parsing when used alone |
| **Qty rules + few-shot** | Marginal; Gemma cilok still failed |

**Do not:** embed test inputs/expected JSON in prompts, run 200+ variant matrix calls, or chase 25/25 via prompt stuffing.

## Production checklist

- [ ] Model: `google/gemini-3.1-flash-lite` (or `gemini-3-flash-preview`)
- [ ] Append dynamic datetime anchor to system prompt each request
- [ ] Confirm UI for amount + date before save
- [ ] Optional: slang glossary in prompt if you see GLM-class models
- [ ] Accept merged qty totals (1×20rb) as valid UX — don't force 4 line items

## Scenario design principles

Good scenarios are:

- Copied from real Indonesian chat patterns (typos, `td`, patungan, voice correction chains)
- Adversarial but **realistic** — not synthetic JSON-in-prompt traps
- Scored with alternate valid layouts (4×45rb zakat vs 1×180rb)

Bad scenarios / hacks:

- Matching few-shot examples in the system prompt
- Expecting exact `deskripsi` wording
- Penalizing linguistically valid `kemarin` for `tadi malam` without confirm UI

## Files

- `docs/results/hard-25-analysis.md` — full per-model breakdown (sample run)
- `docs/results/hard-12-analysis.md` — earlier 12-scenario run

Re-run to regenerate fresh timestamps under `docs/results/`.
