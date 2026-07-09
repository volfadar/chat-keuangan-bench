# Rupiah-Pro Leaderboard (v1.0.0)

Generated: 2026-07-09T23:09:24.940Z

Multi-turn Indonesian **pencatatan keuangan** agent bench — tools, ledger asserts, org isolation, OCR/mutasi/auditor flows.

## Public score (v1)

`100 * (det/40)^2 * (ifBench/100)`

- Headline suite: **14 discriminative scenarios**
- Rubric + step collected at run time for audit, **not** in the public average
- Offline rescore from existing traces — no re-run required

## Leaderboard

| Rank | Model | Rupiah-Pro | Legacy raw* | Δ | n | min | <60 | <80 | =100 |
|-----:|-------|-------------:|------------:|--:|--:|----:|---:|---:|-----:|
| 1 | `google/gemini-3-flash-preview` | **89** | 95.4 | -6.4 | 14 | 26.2 | 2 | 3 | 11 |
| 2 | `google/gemini-3.1-flash-lite` | **88.1** | 95.9 | -7.8 | 14 | 36 | 2 | 3 | 11 |
| 3 | `xiaomi/mimo-v2.5-pro` | **87.9** | 95.6 | -7.7 | 14 | 36 | 1 | 4 | 10 |
| 4 | `z-ai/glm-4.5` | **86.1** | 93.4 | -7.3 | 14 | 9 | 2 | 3 | 10 |
| 5 | `google/gemma-4-31b-it` | **84.9** | 96 | -11.1 | 14 | 27 | 2 | 5 | 9 |
| 6 | `z-ai/glm-4.7` | **84.6** | 94.6 | -10 | 14 | 36 | 3 | 4 | 9 |
| 7 | `inclusionai/ling-2.6-1t` | **82.3** | 92.4 | -10.1 | 14 | 9 | 3 | 3 | 11 |
| 8 | `deepseek/deepseek-v4-flash` | **76** | 90.6 | -14.6 | 14 | 10.6 | 4 | 6 | 8 |
| 9 | `deepseek/deepseek-v4-pro` | **75** | 90.2 | -15.2 | 14 | 16 | 4 | 6 | 8 |
| 10 | `qwen/qwen3.6-35b-a3b` | **62.2** | 81.4 | -19.2 | 14 | 0 | 7 | 7 | 6 |

*Legacy raw* = old det40+rub25+step25+if10 average on the same 14 scenarios (audit only).

**Spread (max−min):** 26.8 points.

## Scenario set

- `h-weekend-voice-mess`
- `h-patungan-then-koreksi-share`
- `h-dobel-bensin-frustasi`
- `h-slang-plus-titik-bleed`
- `h-daily-export-pdf-pack`
- `h-slang-gopek-meja-bleed`
- `h-patungan-3way-tip-trap`
- `h-batal-then-pilih-satu-nota`
- `h-td-kemarin-koreksi-slang`
- `h-spike-void-then-real`
- `hp-switch-org-midchat`
- `hp-contaminated-refund-plus-mutasi`
- `hp-auditor-pdf-csv-nota`
- `hp-double-post-rage-dedupe`

## Per-model detail

### `google/gemini-3-flash-preview` — **89**

| Scenario | Rupiah-Pro | Legacy | Det/40 | IF |
|----------|-------------:|-------:|-------:|---:|
| h-batal-then-pilih-satu-nota | 26.2 | 62 | 25 | 67 |
| h-spike-void-then-real | 45 | 86 | 31 | 75 |
| h-td-kemarin-koreksi-slang | 75 | 95 | 40 | 75 |
| h-weekend-voice-mess | 100 | 100 | 40 | 100 |
| h-patungan-then-koreksi-share | 100 | 100 | 40 | 100 |
| h-slang-plus-titik-bleed | 100 | 100 | 40 | 100 |
| h-daily-export-pdf-pack | 100 | 100 | 40 | 100 |
| h-dobel-bensin-frustasi | 100 | 100 | 40 | 100 |
| h-slang-gopek-meja-bleed | 100 | 92 | 40 | 100 |
| h-patungan-3way-tip-trap | 100 | 100 | 40 | 100 |
| hp-switch-org-midchat | 100 | 100 | 40 | 100 |
| hp-contaminated-refund-plus-mutasi | 100 | 100 | 40 | 100 |
| hp-auditor-pdf-csv-nota | 100 | 100 | 40 | 100 |
| hp-double-post-rage-dedupe | 100 | 100 | 40 | 100 |

### `google/gemini-3.1-flash-lite` — **88.1**

| Scenario | Rupiah-Pro | Legacy | Det/40 | IF |
|----------|-------------:|-------:|-------:|---:|
| h-slang-gopek-meja-bleed | 36 | 73 | 24 | 100 |
| hp-switch-org-midchat | 37.7 | 81 | 30 | 67 |
| h-spike-void-then-real | 60.1 | 91 | 31 | 100 |
| h-weekend-voice-mess | 100 | 100 | 40 | 100 |
| h-patungan-then-koreksi-share | 100 | 100 | 40 | 100 |
| h-slang-plus-titik-bleed | 100 | 100 | 40 | 100 |
| h-daily-export-pdf-pack | 100 | 100 | 40 | 100 |
| h-dobel-bensin-frustasi | 100 | 100 | 40 | 100 |
| h-patungan-3way-tip-trap | 100 | 97 | 40 | 100 |
| h-batal-then-pilih-satu-nota | 100 | 100 | 40 | 100 |
| h-td-kemarin-koreksi-slang | 100 | 100 | 40 | 100 |
| hp-contaminated-refund-plus-mutasi | 100 | 100 | 40 | 100 |
| hp-auditor-pdf-csv-nota | 100 | 100 | 40 | 100 |
| hp-double-post-rage-dedupe | 100 | 100 | 40 | 100 |

### `xiaomi/mimo-v2.5-pro` — **87.9**

| Scenario | Rupiah-Pro | Legacy | Det/40 | IF |
|----------|-------------:|-------:|-------:|---:|
| h-slang-gopek-meja-bleed | 36 | 73 | 24 | 100 |
| h-spike-void-then-real | 60.1 | 91 | 31 | 100 |
| h-batal-then-pilih-satu-nota | 67 | 91 | 40 | 67 |
| h-weekend-voice-mess | 68.1 | 93 | 33 | 100 |
| h-patungan-then-koreksi-share | 100 | 94 | 40 | 100 |
| h-slang-plus-titik-bleed | 100 | 100 | 40 | 100 |
| h-daily-export-pdf-pack | 100 | 100 | 40 | 100 |
| h-dobel-bensin-frustasi | 100 | 100 | 40 | 100 |
| h-patungan-3way-tip-trap | 100 | 97 | 40 | 100 |
| h-td-kemarin-koreksi-slang | 100 | 100 | 40 | 100 |
| hp-switch-org-midchat | 100 | 100 | 40 | 100 |
| hp-contaminated-refund-plus-mutasi | 100 | 100 | 40 | 100 |
| hp-auditor-pdf-csv-nota | 100 | 100 | 40 | 100 |
| hp-double-post-rage-dedupe | 100 | 100 | 40 | 100 |

### `z-ai/glm-4.5` — **86.1**

| Scenario | Rupiah-Pro | Legacy | Det/40 | IF |
|----------|-------------:|-------:|-------:|---:|
| h-slang-gopek-meja-bleed | 9 | 63 | 24 | 25 |
| h-dobel-bensin-frustasi | 50 | 77 | 40 | 50 |
| h-spike-void-then-real | 60.8 | 94 | 36 | 75 |
| hp-auditor-pdf-csv-nota | 85.6 | 83 | 37 | 100 |
| h-weekend-voice-mess | 100 | 100 | 40 | 100 |
| h-patungan-then-koreksi-share | 100 | 97 | 40 | 100 |
| h-slang-plus-titik-bleed | 100 | 100 | 40 | 100 |
| h-daily-export-pdf-pack | 100 | 100 | 40 | 100 |
| h-patungan-3way-tip-trap | 100 | 94 | 40 | 100 |
| h-batal-then-pilih-satu-nota | 100 | 100 | 40 | 100 |
| h-td-kemarin-koreksi-slang | 100 | 100 | 40 | 100 |
| hp-switch-org-midchat | 100 | 100 | 40 | 100 |
| hp-contaminated-refund-plus-mutasi | 100 | 100 | 40 | 100 |
| hp-double-post-rage-dedupe | 100 | 100 | 40 | 100 |

### `google/gemma-4-31b-it` — **84.9**

| Scenario | Rupiah-Pro | Legacy | Det/40 | IF |
|----------|-------------:|-------:|-------:|---:|
| h-slang-gopek-meja-bleed | 27 | 74 | 24 | 75 |
| h-dobel-bensin-frustasi | 50 | 95 | 40 | 50 |
| h-spike-void-then-real | 60.1 | 91 | 31 | 100 |
| h-td-kemarin-koreksi-slang | 75 | 92 | 40 | 75 |
| hp-switch-org-midchat | 76.6 | 95 | 35 | 100 |
| h-weekend-voice-mess | 100 | 100 | 40 | 100 |
| h-patungan-then-koreksi-share | 100 | 100 | 40 | 100 |
| h-slang-plus-titik-bleed | 100 | 100 | 40 | 100 |
| h-daily-export-pdf-pack | 100 | 100 | 40 | 100 |
| h-patungan-3way-tip-trap | 100 | 100 | 40 | 100 |
| h-batal-then-pilih-satu-nota | 100 | 97 | 40 | 100 |
| hp-contaminated-refund-plus-mutasi | 100 | 100 | 40 | 100 |
| hp-auditor-pdf-csv-nota | 100 | 100 | 40 | 100 |
| hp-double-post-rage-dedupe | 100 | 100 | 40 | 100 |

### `z-ai/glm-4.7` — **84.6**

| Scenario | Rupiah-Pro | Legacy | Det/40 | IF |
|----------|-------------:|-------:|-------:|---:|
| h-slang-gopek-meja-bleed | 36 | 73 | 24 | 100 |
| h-spike-void-then-real | 45 | 73 | 31 | 75 |
| h-daily-export-pdf-pack | 50 | 92 | 40 | 50 |
| h-weekend-voice-mess | 68.1 | 93 | 33 | 100 |
| hp-auditor-pdf-csv-nota | 85.6 | 97 | 37 | 100 |
| h-patungan-then-koreksi-share | 100 | 100 | 40 | 100 |
| h-slang-plus-titik-bleed | 100 | 100 | 40 | 100 |
| h-dobel-bensin-frustasi | 100 | 100 | 40 | 100 |
| h-patungan-3way-tip-trap | 100 | 97 | 40 | 100 |
| h-batal-then-pilih-satu-nota | 100 | 100 | 40 | 100 |
| h-td-kemarin-koreksi-slang | 100 | 100 | 40 | 100 |
| hp-switch-org-midchat | 100 | 100 | 40 | 100 |
| hp-contaminated-refund-plus-mutasi | 100 | 100 | 40 | 100 |
| hp-double-post-rage-dedupe | 100 | 100 | 40 | 100 |

### `inclusionai/ling-2.6-1t` — **82.3**

| Scenario | Rupiah-Pro | Legacy | Det/40 | IF |
|----------|-------------:|-------:|-------:|---:|
| h-slang-gopek-meja-bleed | 9 | 66 | 24 | 25 |
| hp-contaminated-refund-plus-mutasi | 13.1 | 59 | 29 | 25 |
| h-spike-void-then-real | 30 | 86 | 31 | 50 |
| h-weekend-voice-mess | 100 | 100 | 40 | 100 |
| h-patungan-then-koreksi-share | 100 | 100 | 40 | 100 |
| h-slang-plus-titik-bleed | 100 | 100 | 40 | 100 |
| h-daily-export-pdf-pack | 100 | 100 | 40 | 100 |
| h-dobel-bensin-frustasi | 100 | 94 | 40 | 100 |
| h-patungan-3way-tip-trap | 100 | 100 | 40 | 100 |
| h-batal-then-pilih-satu-nota | 100 | 100 | 40 | 100 |
| h-td-kemarin-koreksi-slang | 100 | 88 | 40 | 100 |
| hp-switch-org-midchat | 100 | 100 | 40 | 100 |
| hp-auditor-pdf-csv-nota | 100 | 100 | 40 | 100 |
| hp-double-post-rage-dedupe | 100 | 100 | 40 | 100 |

### `deepseek/deepseek-v4-flash` — **76**

| Scenario | Rupiah-Pro | Legacy | Det/40 | IF |
|----------|-------------:|-------:|-------:|---:|
| h-slang-plus-titik-bleed | 10.6 | 73 | 13 | 100 |
| h-patungan-then-koreksi-share | 36 | 78 | 24 | 100 |
| h-slang-gopek-meja-bleed | 36 | 76 | 24 | 100 |
| h-daily-export-pdf-pack | 52.6 | 77 | 29 | 100 |
| h-spike-void-then-real | 60.1 | 83 | 31 | 100 |
| h-weekend-voice-mess | 68.1 | 93 | 33 | 100 |
| h-dobel-bensin-frustasi | 100 | 97 | 40 | 100 |
| h-patungan-3way-tip-trap | 100 | 97 | 40 | 100 |
| h-batal-then-pilih-satu-nota | 100 | 100 | 40 | 100 |
| h-td-kemarin-koreksi-slang | 100 | 94 | 40 | 100 |
| hp-switch-org-midchat | 100 | 100 | 40 | 100 |
| hp-contaminated-refund-plus-mutasi | 100 | 100 | 40 | 100 |
| hp-auditor-pdf-csv-nota | 100 | 100 | 40 | 100 |
| hp-double-post-rage-dedupe | 100 | 100 | 40 | 100 |

### `deepseek/deepseek-v4-pro` — **75**

| Scenario | Rupiah-Pro | Legacy | Det/40 | IF |
|----------|-------------:|-------:|-------:|---:|
| h-patungan-then-koreksi-share | 16 | 64 | 16 | 100 |
| h-slang-gopek-meja-bleed | 27 | 74 | 24 | 75 |
| h-patungan-3way-tip-trap | 33.1 | 71 | 23 | 100 |
| h-batal-then-pilih-satu-nota | 39.1 | 67 | 25 | 100 |
| h-slang-plus-titik-bleed | 67 | 94 | 40 | 67 |
| h-weekend-voice-mess | 68.1 | 93 | 33 | 100 |
| h-daily-export-pdf-pack | 100 | 100 | 40 | 100 |
| h-dobel-bensin-frustasi | 100 | 100 | 40 | 100 |
| h-td-kemarin-koreksi-slang | 100 | 100 | 40 | 100 |
| h-spike-void-then-real | 100 | 100 | 40 | 100 |
| hp-switch-org-midchat | 100 | 100 | 40 | 100 |
| hp-contaminated-refund-plus-mutasi | 100 | 100 | 40 | 100 |
| hp-auditor-pdf-csv-nota | 100 | 100 | 40 | 100 |
| hp-double-post-rage-dedupe | 100 | 100 | 40 | 100 |

### `qwen/qwen3.6-35b-a3b` — **62.2**

| Scenario | Rupiah-Pro | Legacy | Det/40 | IF |
|----------|-------------:|-------:|-------:|---:|
| h-slang-plus-titik-bleed | 0 | 54 | 0 | 67 |
| h-patungan-then-koreksi-share | 10.7 | 42 | 16 | 67 |
| hp-double-post-rage-dedupe | 22.2 | 60 | 23 | 67 |
| hp-switch-org-midchat | 26.2 | 62 | 25 | 67 |
| h-slang-gopek-meja-bleed | 27 | 57 | 24 | 75 |
| h-dobel-bensin-frustasi | 50 | 89 | 40 | 50 |
| h-weekend-voice-mess | 51 | 80 | 33 | 75 |
| hp-auditor-pdf-csv-nota | 83 | 98 | 40 | 83 |
| h-daily-export-pdf-pack | 100 | 100 | 40 | 100 |
| h-patungan-3way-tip-trap | 100 | 100 | 40 | 100 |
| h-batal-then-pilih-satu-nota | 100 | 97 | 40 | 100 |
| h-td-kemarin-koreksi-slang | 100 | 100 | 40 | 100 |
| h-spike-void-then-real | 100 | 100 | 40 | 100 |
| hp-contaminated-refund-plus-mutasi | 100 | 100 | 40 | 100 |
