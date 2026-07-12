# Qwen3.6 Rupiah-Pro provider smoke matrix

Generated: 2026-07-12T06:36:57.063Z

- Model: `qwen/qwen3.6-35b-a3b`
- Suite: **5 of 8 hardplus** (hardest / discriminative for Qwen)
- IDs: `hp-double-post-rage-dedupe`, `hp-switch-org-midchat`, `hp-contaminated-qty-rage-fix`, `hp-auditor-pdf-csv-nota`, `hp-contaminated-refund-plus-mutasi`
- Providers: AtlasCloud, AkashML (tool-capable; WandB/SiliconFlow lack tools on OR)
- Configs: det0, mild, friend
- Public score: `100 × (det/40)² × (ifBench/100)`

## Cell ranking

| Rank | Provider | Config | Rupiah-Pro avg | min–max | det avg | IF avg | avg ms | errors |
|-----:|----------|--------|---------------:|--------:|--------:|-------:|-------:|-------:|
| 1 | AtlasCloud | friend | **100.0** | 100–100 | 40.0 | 100 | 61348 | 0 |
| 2 | AkashML | det0 | **100.0** | 100–100 | 40.0 | 100 | 61886 | 0 |
| 3 | AtlasCloud | det0 | **90.0** | 67–100 | 40.0 | 90 | 65838 | 0 |
| 4 | AkashML | mild | **82.4** | 26.2–100 | 36.4 | 93 | 54067 | 0 |
| 5 | AtlasCloud | mild | **56.9** | 10.9–100 | 33.4 | 70 | 71985 | 0 |
| 6 | AkashML | friend | **49.4** | 9–100 | 30.6 | 70 | 64037 | 0 |

## Per-scenario detail

### AtlasCloud / friend

| Scenario | Rupiah-Pro | Det/40 | IF | ms | Error |
|----------|-----------:|-------:|---:|---:|-------|
| hp-switch-org-midchat | 100 | 40 | 100 | 47757 |  |
| hp-contaminated-qty-rage-fix | 100 | 40 | 100 | 45025 |  |
| hp-contaminated-refund-plus-mutasi | 100 | 40 | 100 | 62332 |  |
| hp-auditor-pdf-csv-nota | 100 | 40 | 100 | 100349 |  |
| hp-double-post-rage-dedupe | 100 | 40 | 100 | 51276 |  |

### AkashML / det0

| Scenario | Rupiah-Pro | Det/40 | IF | ms | Error |
|----------|-----------:|-------:|---:|---:|-------|
| hp-switch-org-midchat | 100 | 40 | 100 | 60516 |  |
| hp-contaminated-qty-rage-fix | 100 | 40 | 100 | 51119 |  |
| hp-contaminated-refund-plus-mutasi | 100 | 40 | 100 | 69416 |  |
| hp-auditor-pdf-csv-nota | 100 | 40 | 100 | 69338 |  |
| hp-double-post-rage-dedupe | 100 | 40 | 100 | 59040 |  |

### AtlasCloud / det0

| Scenario | Rupiah-Pro | Det/40 | IF | ms | Error |
|----------|-----------:|-------:|---:|---:|-------|
| hp-switch-org-midchat | 100 | 40 | 100 | 60044 |  |
| hp-contaminated-qty-rage-fix | 100 | 40 | 100 | 46578 |  |
| hp-contaminated-refund-plus-mutasi | 100 | 40 | 100 | 72745 |  |
| hp-auditor-pdf-csv-nota | 83 | 40 | 83 | 88379 |  |
| hp-double-post-rage-dedupe | 67 | 40 | 67 | 61445 |  |

### AkashML / mild

| Scenario | Rupiah-Pro | Det/40 | IF | ms | Error |
|----------|-----------:|-------:|---:|---:|-------|
| hp-switch-org-midchat | 26.2 | 25 | 67 | 58777 |  |
| hp-contaminated-qty-rage-fix | 100 | 40 | 100 | 40189 |  |
| hp-contaminated-refund-plus-mutasi | 100 | 40 | 100 | 57290 |  |
| hp-auditor-pdf-csv-nota | 85.6 | 37 | 100 | 77155 |  |
| hp-double-post-rage-dedupe | 100 | 40 | 100 | 36925 |  |

### AtlasCloud / mild

| Scenario | Rupiah-Pro | Det/40 | IF | ms | Error |
|----------|-----------:|-------:|---:|---:|-------|
| hp-switch-org-midchat | 37.7 | 30 | 67 | 71141 |  |
| hp-contaminated-qty-rage-fix | 100 | 40 | 100 | 58669 |  |
| hp-contaminated-refund-plus-mutasi | 36.1 | 34 | 50 | 74115 |  |
| hp-auditor-pdf-csv-nota | 100 | 40 | 100 | 107262 |  |
| hp-double-post-rage-dedupe | 10.9 | 23 | 33 | 48736 |  |

### AkashML / friend

| Scenario | Rupiah-Pro | Det/40 | IF | ms | Error |
|----------|-----------:|-------:|---:|---:|-------|
| hp-switch-org-midchat | 25 | 20 | 100 | 61401 |  |
| hp-contaminated-qty-rage-fix | 9 | 24 | 25 | 62143 |  |
| hp-contaminated-refund-plus-mutasi | 13.1 | 29 | 25 | 72819 |  |
| hp-auditor-pdf-csv-nota | 100 | 40 | 100 | 74617 |  |
| hp-double-post-rage-dedupe | 100 | 40 | 100 | 49207 |  |

## Sampling configs

- **det0** — bench-default (temp=0): `{"temperature":0}`
- **mild** — mild (temp=0.3, top_p=0.9, top_k=40): `{"temperature":0.3,"top_p":0.9,"top_k":40}`
- **friend** — friend-rec (temp=1.0, top_p=0.95, top_k=20, presence=1.5): `{"temperature":1,"top_p":0.95,"top_k":20,"min_p":0,"presence_penalty":1.5,"repetition_penalty":1}`

## Notes

- Smoke only (n=5 scenarios, 1 repeat) — not a full Rupiah-Pro leaderboard claim.
- WandB/SiliconFlow were preferred from Parse-25 but both report `tools=false` on OpenRouter for this model.
- Substitutes: AtlasCloud (best Parse-25 among tool-capable) + AkashML (fast/cheap tool-capable).
