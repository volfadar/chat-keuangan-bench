# Publishing checklist

```bash
cd /path/to/chat-keuangan-bench

# 1. Create empty repo on GitHub (e.g. chat-keuangan-bench)
git add -A
git commit -m "Initial release: Indonesian finance chat LLM benchmark"

# 2. Push
git remote add origin git@github.com:YOUR_USER/chat-keuangan-bench.git
git push -u origin main
```

## Before publishing

- [ ] Copy `.env.example` → `.env` locally only (never commit `.env`)
- [ ] Optional: strip large JSON from `docs/results/` if you re-run evals (analysis `.md` + `scorecard.json` are enough for samples)

## npm (optional later)

The package is runnable via Bun/git clone. npm publish is optional — name `chat-keuangan-bench` may need scope if taken (`@yourscope/chat-keuangan-bench`).
