# Qwen3.6 Parse-25 composite — top-2

Generated: 2026-07-12T09:39:04.972Z

- Model: `qwen/qwen3.6-35b-a3b`
- Suite: hard-25 with full composite / tier scoring
- Candidates: WandB/mild + SiliconFlow/mild (top strict cells from provider matrix)

## Winner

**SiliconFlow / mild** (`siliconflow/fp8`) — **24/25** strict, composite **98.6**, ~4606ms, Rp 238/run

## Comparison

| Rank | Provider | Strict | Composite | avg ms | IDR/run | excellent | usable | partial | misleading | broken |
|-----:|----------|-------:|----------:|-------:|--------:|----------:|-------:|--------:|-----------:|-------:|
| 1 | SiliconFlow | **24/25** | **98.6** | 4606 | Rp 238 | 24 | 1 | 0 | 0 | 0 |
| 2 | WandB | **23/25** | **95.6** | 2356 | Rp 230 | 23 | 0 | 2 | 0 | 0 |

### SiliconFlow / mild — failures

| Scenario | Composite | Tier | Issues |
|----------|----------:|------|--------|
| hard-slang-ceban-goceng | 88 | usable_with_edit | missing/unmatched expected: pengeluaran 10000 [teh]; extra entries: pengeluaran 5000 "es teh ceban" |

### WandB / mild — failures

| Scenario | Composite | Tier | Issues |
|----------|----------:|------|--------|
| hard-cilok-qty-44 | 53 | partially_usable | missing/unmatched expected: pengeluaran 5000 [cilok]; missing/unmatched expected: pengeluaran 5000 [cilok] |
| hard-slang-ceban-goceng | 53 | partially_usable | missing/unmatched expected: pengeluaran 10000 [teh]; missing/unmatched expected: pengeluaran 5000 [gorengan] |
