# Publishing checklist

```bash
cd /path/to/chat-keuangan-bench

git add -A
git commit -m "Release: describe changes"
git push origin main
```

## Before publishing

- [ ] Copy `.env.example` → `.env` locally only (never commit `.env`)
- [ ] After new eval runs: `bun run bench:refresh` (scorecard + charts + analysis)
- [ ] Verify `docs/results/scorecard.json` and `hard-25-analysis-12models.md` updated
- [ ] Supplement runs go in `docs/results/runs/` (tracked in git)

## Repo layout (v0.3+)

| Artifact | Purpose |
|----------|---------|
| `docs/results/scorecard.json` | Merged 12-model metrics |
| `docs/results/hard-25-analysis-12models.md` | Full per-model failure analysis |
| `docs/results/runs/*.json` | Raw single-model eval logs |
| `docs/charts/*.svg` | README / REPORT visuals |
| `src/core/model-roster.ts` | Canonical model list |

## npm (optional)

Runnable via Bun/git clone. npm publish optional — name `chat-keuangan-bench` may need scope if taken.
