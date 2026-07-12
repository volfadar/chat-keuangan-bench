# Qwen3.6 Parse-25 provider matrix

Generated: 2026-07-12T05:57:35.679Z

- Model: `qwen/qwen3.6-35b-a3b`
- Suite: Parse-25 (hard-25)
- Repeats per cell: 3
- Total full runs: 45

## Provider ranking (primary: det0 avg strict)

| Rank | Provider | det0 avg | det0 min–max | best config | best avg | avg ms (det0) | IDR/run (det0) |
|-----:|----------|---------:|-------------:|-------------|---------:|--------------:|---------------:|
| 1 | SiliconFlow (`siliconflow/fp8`) | **20.7** | 20–21 | mild | 21.0 | 6512 | Rp 235 |
| 2 | AtlasCloud (`atlas-cloud/fp8`) | **20.7** | 20–21 | det0 | 20.7 | 2490 | Rp 183 |
| 3 | AkashML (`akashml/fp8`) | **20.3** | 20–21 | mild | 20.7 | 1837 | Rp 155 |
| 4 | WandB (`wandb/fp8`) | **20.0** | 20–20 | mild | 21.0 | 1517 | Rp 225 |
| 5 | Parasail (`parasail/fp8`) | **20.0** | 20–20 | mild | 20.7 | 1876 | Rp 148 |

## Full cell results (avg / min / max strict)

| Provider | Config | avg | min | max | repeats | errors | avg ms | IDR/run |
|----------|--------|----:|----:|----:|---------|-------:|-------:|--------:|
| WandB | mild | **21.0** | 21 | 21 | 21, 21, 21 | 0% | 1590 | Rp 228 |
| SiliconFlow | mild | **21.0** | 21 | 21 | 21, 21, 21 | 0% | 6042 | Rp 237 |
| Parasail | mild | **20.7** | 20 | 21 | 21, 20, 21 | 0% | 1618 | Rp 144 |
| AkashML | mild | **20.7** | 20 | 21 | 21, 21, 20 | 0% | 1990 | Rp 154 |
| AtlasCloud | det0 | **20.7** | 20 | 21 | 21, 20, 21 | 0% | 2490 | Rp 183 |
| AtlasCloud | mild | **20.7** | 20 | 21 | 21, 20, 21 | 0% | 2564 | Rp 187 |
| SiliconFlow | det0 | **20.7** | 20 | 21 | 21, 20, 21 | 0% | 6512 | Rp 235 |
| AkashML | det0 | **20.3** | 20 | 21 | 20, 21, 20 | 0% | 1837 | Rp 155 |
| WandB | friend | **20.0** | 19 | 21 | 21, 20, 19 | 0% | 1467 | Rp 226 |
| WandB | det0 | **20.0** | 20 | 20 | 20, 20, 20 | 0% | 1517 | Rp 225 |
| Parasail | friend | **20.0** | 19 | 21 | 20, 21, 19 | 0% | 1643 | Rp 143 |
| Parasail | det0 | **20.0** | 20 | 20 | 20, 20, 20 | 0% | 1876 | Rp 148 |
| AkashML | friend | **19.7** | 19 | 21 | 19, 21, 19 | 0% | 1934 | Rp 152 |
| AtlasCloud | friend | **19.7** | 19 | 21 | 21, 19, 19 | 0% | 2599 | Rp 184 |
| SiliconFlow | friend | **19.3** | 18 | 21 | 18, 21, 19 | 0% | 6185 | Rp 235 |

## Sampling configs

- **det0** — bench-default (temp=0): `{"temperature":0}`
- **mild** — mild (temp=0.3, top_p=0.9): `{"temperature":0.3,"top_p":0.9,"top_k":40}`
- **friend** — friend-rec (temp=1.0, top_p=0.95, top_k=20, presence=1.5): `{"temperature":1,"top_p":0.95,"top_k":20,"min_p":0,"presence_penalty":1.5,"repetition_penalty":1}`

## Notes

- Strict score is /25 (or 1 in smoke mode).
- `det0` matches the existing Parse-25 harness (`temperature: 0`).
- Friend config is high-entropy (temp=1 + presence_penalty=1.5) — expect more variance on structured JSON.
