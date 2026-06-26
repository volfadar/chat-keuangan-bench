# Publishing checklist

```bash
cd /root/rupiah-bench

# 1. Create empty repo on GitHub (e.g. rupiah-bench)
# 2. Initial commit
git add -A
git commit -m "Initial release: Indonesian finance chat LLM benchmark"

# 3. Push
git remote add origin git@github.com:YOUR_USER/rupiah-bench.git
git push -u origin main
```

## Before publishing

- [ ] Replace `your-username` in `package.json` and `README.md`
- [ ] Copy `.env.example` → `.env` locally only (never commit `.env`)
- [ ] Optional: strip large JSON from `docs/results/` if you re-run evals (analysis `.md` is enough for the sample)

## npm (optional later)

The package is runnable via Bun/git clone. npm publish is optional — name `rupiah-bench` may need scope if taken (`@yourscope/rupiah-bench`).
