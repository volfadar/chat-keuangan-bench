# Publishing checklist

```bash
cd /path/to/chat-keuangan-bench
git add -A
git commit -m "Release: describe changes"
git push origin main
```

## Before publishing

- [ ] Never commit `.env`
- [ ] Parse-25: after new runs, `bun run bench:refresh`
- [ ] Rupiah-Pro: after new agentic runs, `bun run score:rupiah-pro`
- [ ] Verify `docs/results/agentic/rupiah-pro-leaderboard-latest.md` and Parse-25 `docs/REPORT.md`

## Artifacts

| Artifact | Bench |
|----------|-------|
| `docs/results/scorecard.json` | Parse-25 |
| `docs/results/hard-25-analysis.md` | Parse-25 |
| `docs/charts/*.svg` | Parse-25 |
| `docs/charts/rupiah-pro/*.svg` | Rupiah-Pro |
| `docs/results/agentic/*-agentic-suite.json` | Rupiah-Pro raw traces |
| `docs/results/agentic/rupiah-pro-leaderboard-latest.*` | Rupiah-Pro public v1 |
| `docs/results/agentic/budget-track-*.json` | Measured suite spend (for cost charts) |
| `src/core/model-roster.ts` | Shared model list |
