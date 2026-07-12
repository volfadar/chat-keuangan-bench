# Rupiah-Pro

**Rupiah-Pro** is the multi-turn agentic suite in [chat-keuangan-bench](https://github.com/volfadar/chat-keuangan-bench): Indonesian **pencatatan keuangan** with tools, ledger asserts, org isolation, OCR/mutasi/auditor flows.

Public scoreboard: [`results/agentic/rupiah-pro-leaderboard-latest.md`](./results/agentic/rupiah-pro-leaderboard-latest.md)

## Suites (raw runs)

| Suite | Count | Focus |
|-------|------:|-------|
| `hard` | 20 | Personal WA cash — slang/bleed, patungan, export traps, voice/qty, dedupe |
| `hardplus` | 8 | Org switch, contaminated history, auditor packs, MoM spend, org_hint import |
| `all` | 28 | Both (default for `eval:agentic`) |

Every scenario is **multi-step** (typically 3+ user turns).

## Public score — Rupiah-Pro v1.0

```text
score = 100 × (det/40)² × (ifBench/100)
```

| Piece | In public avg? | Notes |
|-------|:--------------:|-------|
| Deterministic (0–40) | **yes** (squared) | Ledger/org/period/file/tool/ambigu asserts |
| IFBench (0–100) | **yes** (multiplier) | R1–R14 instruction-following |
| Rubric | no | Logged in raw JSON only |
| Step quality | no | Logged in raw JSON only |

Headline board uses **14 discriminative scenarios** (models still separate). Easy forever-100 scenarios are culled from the average but remain in raw traces.

```bash
bun run score:rupiah-pro
# → docs/results/agentic/rupiah-pro-leaderboard-latest.{md,json}
# → docs/charts/rupiah-pro/* (score / cost / latency / quality-vs-price)
```

Charts use the same axis convention as Parse-25: **cheap left → expensive right**, ideal = **top-left**. Public cost axis = measured OpenRouter **IDR/request** from the Parse-25 scorecard (not parallel-batch wall-share — that wrongly made Gemma look pricier than Gemini).

### Why not “legacy raw” (det40+rub25+step25+if10)?

That formula packed almost every model into **~89–98**. Rubric/step were soft; many scenarios always scored 100. Rupiah-Pro v1 opens spread (~**75–88** on the current board) without re-running agents.

Raw run JSON still stores all four components for audit / research.

## Evidence flow

User attaches files → `list_inbox` → `receipt_ocr` / `csv_read` / `pdf_read` → ledger → export.  
`firecrawl_search` is for web **info** only and **refuses** “cari nota/struk”.

## Fixtures

Seeded into sandbox `in/`:

- `nota-indomaret.png` (Rp87.500), `nota-alfamart.png`, `nota-warung-padang.png`, `nota-spbu-pertamina.png`, `nota-apotik-kimia-farma.png`
- CSV: `mutasi-personal.csv`, `mutasi-yayasan.csv`, `reconcile-indomaret.csv`
- PDF: `rekening-pribadi.pdf`, `rekening-yayasan.pdf`

```bash
bun run fixtures:receipts
```

## Hard-plus highlights

- Mid-chat **org switch** (personal ↔ yayasan) with isolation checks
- **Contaminated prefill** (qty collapse, wrong refund direction, double-post)
- **Frustration MoM** spend + analysis CSV export
- **Auditor pack**: PDF + CSV + OCR + audit export, no auto-void
- **org_hint** CSV import for yayasan bendahara

## Run

```bash
bun run eval:agentic -- --suite hard --dry-run
bun run eval:agentic -- --suite all --model google/gemma-4-31b-it --concurrency 3
bun run eval:agentic -- --ids h-slang-gopek-meja-bleed,hp-auditor-pdf-csv-nota
bun run score:rupiah-pro
bun run report:rupiah-pro
bun run studio   # http://localhost:4111
```

## Judge (new runs)

Default: **1 combined LLM call** on `deepseek/deepseek-v4-pro` @ DeepSeek, reasoning **high** (`JUDGE_MODE=combined`).  
Collects det + rub + step + if into the raw report; **public leaderboard ignores rub/step**.

Legacy (expensive): `JUDGE_MODE=legacy` + `JUDGE_MODEL=z-ai/glm-5.2` + `JUDGE_PROVIDER=Novita`.

## Mastra Studio

```bash
bun run studio   # http://localhost:4111
```

Needs `LibSQLStore` + `Observability` + `MastraStorageExporter` in `src/mastra/index.ts` (DB: `.mastra/studio.db`).
