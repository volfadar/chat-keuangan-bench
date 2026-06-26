# SaaS pricing guide — AI pencatatan keuangan (Indonesia)

Practical advice for founders building **full-AI** or **AI-assisted** finance-tracking apps (WhatsApp chat, voice, casual Indonesian input). Numbers below are grounded in the **[hard-25 benchmark](./REPORT.md)** and OpenRouter CSV (Jun 2026).

**FX:** 1 USD = **17.905 IDR** (27 Jun 2026)

---

## 1. Know your AI unit economics first

One **parse** = one LLM call that turns a chat message into structured `pemasukan` / `pengeluaran` JSON.

| Model (production pick) | IDR / parse | Quality (hard-25) | When to use |
|-------------------------|-------------|-------------------|-------------|
| **gemini-3.1-flash-lite** | **~Rp 13** | 24/25 | Default production — best balance |
| gemma-4-31b-it | ~Rp 5 | 24/25 | Cheaper; slower; qty edge cases |
| deepseek-v4-flash | ~Rp 2 | 21/25 | Lean MVP only — more errors |
| gemini-3-flash-preview | ~Rp 23 | 24/25 | Avoid unless you need a specific feature |

**Add buffers in pricing math (not in benchmark):**

| Buffer | Multiplier | Why |
|--------|------------|-----|
| Retries / failed JSON | ×1.2–1.3 | Model occasionally returns invalid JSON |
| Confirm UI re-parse | ×1.1–1.5 | User edits → second call |
| Date/amount correction | ×1.0–2.0 | Worst case: parse + confirm flow |
| **Planning default** | **×1.5** | Safe COGS per parse on gemini-3.1 ≈ **Rp 20** |

---

## 2. Estimate usage per user persona

| Persona | Parses / month | AI COGS (gemini ×1.5) | Notes |
|---------|----------------|------------------------|-------|
| Manual only | 0–5 | Rp 0–100 | Uses form UI, not chat |
| Personal ringan | 30 | ~Rp 600 | ~1 chat/day |
| Personal aktif | 100 | ~Rp 2.000 | Daily expense logging |
| UMKM / warung | 200–400 | ~Rp 4.000–8.000 | Many small transactions |
| Toko + staff (3 orang) | 600–1.200 | ~Rp 12.000–24.000 | Shared WA number |

> **Rule:** Price and cap tiers using the **UMKM row**, not the personal row — your heaviest users set your margin floor.

---

## 3. Monthly operational cost — three capital scenarios

These are **full-stack** estimates (AI + infra + channels), not AI alone. Adjust team lines to your reality.

### Assumptions (500 registered users, early stage)

| Line item | Aman (safe) | Normal | Ketat (lean) |
|-----------|-------------|--------|--------------|
| Paying users (month 6) | 50 | 150 | 80 |
| % using AI heavily | 60% | 35% | 25% |
| Avg parses / AI user / month | 200 | 100 | 60 |
| Model | gemini-3.1 | gemini-3.1 | deepseek + cap |
| Effective IDR / parse | Rp 20 | Rp 20 | Rp 4 |

### A. **Aman** — safe runway (worst-case planning)

*Assume growth is slow, AI adoption is high, you keep premium model, 6-month buffer.*

| Cost bucket | / month (IDR) |
|-------------|---------------|
| AI inference (500 users × 60% × 200 × Rp 20) | **Rp 1,2 jt** |
| Cloud (app + DB + Redis + backup) | Rp 3–5 jt |
| WhatsApp / messaging (BSP, WAHA, or Meta) | Rp 2–6 jt |
| Payment gateway + notif (email/SMS) | Rp 500 rb–1 jt |
| Tools (monitoring, domain, OpenRouter min spend) | Rp 500 rb–1 jt |
| Support / ops (part-time) | Rp 5–10 jt |
| Marketing (paid + content) | Rp 5–10 jt |
| **Total burn** | **~Rp 17–34 jt / bulan** |
| **Capital 6 bulan** | **Rp 100–200 jt** |

Use this when pitching investors or quitting a job — you won't panic at month 3.

### B. **Normal** — realistic bootstrap

*Mixed manual + AI, gemini-3.1, confirm UI limits double calls.*

| Cost bucket | / month (IDR) |
|-------------|---------------|
| AI (500 × 35% × 100 × Rp 20) | **Rp 350 rb** |
| Cloud + WA + tools | Rp 4–7 jt |
| Founder-only team (no salary / small) | Rp 2–5 jt |
| Light marketing | Rp 2–4 jt |
| **Total burn** | **~Rp 9–16 jt / bulan** |
| **Capital 6 bulan** | **Rp 55–100 jt** |

### C. **Ketat** — ramen profitable

*Solo founder, strict AI caps, cheaper model, manual-first product.*

| Cost bucket | / month (IDR) |
|-------------|---------------|
| AI (500 × 25% × 60 × Rp 4) | **Rp 30 rb** |
| Minimal VPS + single DB | Rp 800 rb–1,5 jt |
| WA via 1 cheap channel / user brings own | Rp 500 rb–1 jt |
| No paid ads | Rp 0–500 rb |
| **Total burn** | **~Rp 2–4 jt / bulan** |
| **Capital 6 bulan** | **Rp 12–25 jt** |

---

## 4. Margin rules that actually work

| Metric | Target | Why |
|--------|--------|-----|
| **Gross margin** (revenue − variable COGS) | **≥ 70%** | Standard healthy SaaS |
| **AI COGS as % of ARPU** (on AI tiers) | **≤ 15–20%** | Leaves room for WA + payment fees |
| **AI COGS as % of ARPU** (bundled tier) | **≤ 10%** blended | Most users won't max parses |
| **LTV : CAC** | **≥ 3 : 1** | Before scaling ads |

**Quick check:**

```
Minimum price (AI tier) ≈ (expected parses × Rp 20) ÷ 0.15

Example: 100 parses → COGS Rp 2.000 → min price ≈ Rp 13.300
→ charge at least Rp 39.000–49.000 for comfortable margin + infra share
```

---

## 5. Product split — main vs add-on

Don't put unlimited AI in the base plan. Indonesian users are price-sensitive; **unbundle** so manual users subsidize nothing.

### Produk utama (core) — **tanpa AI atau AI percobaan**

**What to include**

- Input manual (form), kategori, laporan bulanan
- Export PDF/Excel, 1 bisnis / 1 user
- Dashboard pemasukan vs pengeluaran
- **Bonus:** 10–20 parse AI / bulan (teaser, not the value prop)

**Suggested price:** **Rp 49.000 – 79.000 / bulan** (tahunan −15–20%)

**Why this price**

- Competes with spreadsheet + mental effort, not with BukuWarung enterprise
- Almost **no variable AI cost** → 80–90% gross margin after infra
- Entry point for UMKM yang belum percaya chat AI

---

### Add-on A — **AI Chat Keuangan** (main upsell)

**What to include**

- Parse chat WhatsApp / in-app (slang Indonesia, `ceban`, patungan, dll.)
- **Kuota: 100 parse / bulan**
- Konfirmasi sebelum simpan (kurangi salah simpan + retry)

**COGS:** 100 × Rp 20 ≈ **Rp 2.000 / user / bulan**

**Suggested price:** **Rp 49.000 – 69.000 / bulan** (add-on)

**Overage:** **Rp 500 – 750 / parse** extra (still 25–35× markup on COGS)

**Gross margin on AI slice:** ~95% variable; ~70% after allocating shared infra

---

### Add-on B — **AI Pro / Toko**

**What to include**

- **300–500 parse / bulan**
- Multi-user (2–5 orang), 1 nomor WA bisnis
- Prioritas antrian, riwayat chat

**COGS:** 500 × Rp 20 ≈ **Rp 10.000 / user / bulan**

**Suggested price:** **Rp 99.000 – 149.000 / bulan**

---

### Add-on C — **Laporan & compliance** (low AI cost)

**What to include**

- Laporan pajak-ready, Buku besar sederhana, ekspor untuk accountant
- **No extra AI** — pure software value

**Suggested price:** **Rp 29.000 – 49.000 / bulan**

Good margin anchor: sells to users who already trust your data.

---

### Bundle **Premium** (positioning, not discounting)

| Bundle | Includes | Price (IDR/bulan) | Logic |
|--------|----------|-------------------|-------|
| **Starter** | Core only | Rp 59.000 | Land grab |
| **Bisnis** | Core + AI Chat (100 parse) | **Rp 119.000** | Core 59k + AI 49k ≈ no discount |
| **Toko** | Core + AI Pro (500 parse) + 3 users | **Rp 199.000** | Anchor high; makes Bisnis look fair |

> **Never** price bundle below `(Core + Add-ons) × 0.85` — you're training customers to wait for promos.

---

## 6. Example P&L at 150 paying users (normal scenario)

| | Users | ARPU | MRR |
|--|-------|------|-----|
| Core only (60%) | 90 | Rp 59.000 | Rp 5,31 jt |
| + AI Chat add-on (30%) | 45 | +Rp 49.000 | +Rp 2,21 jt |
| + AI Pro (10%) | 15 | +Rp 99.000 | +Rp 1,49 jt |
| **Total MRR** | 150 | ~Rp 60.000 blended | **~Rp 9,0 jt** |

| Cost | / month |
|------|---------|
| AI variable | ~Rp 350 rb |
| Infra + WA + fees | ~Rp 5 jt |
| **Gross profit (rough)** | **~Rp 3,5–4 jt** before salary |

Break-even on ops alone: **~120–140 paying users** at this mix — realistic month 4–8 for a focused Indonesian niche.

---

## 7. Pricing psychology (Indonesia)

1. **Show IDR per day** — "Rp 119rb/bulan ≈ Rp 4rb/hari, kurang dari 1 kopi" for Bisnis tier.
2. **Annual plan** — 2 bulan gratis (pay 10) improves cash flow for your **aman** runway.
3. **Parse quota visible** — "80/100 parse tersisa" prevents bill shock and reduces support.
4. **Free tier** — manual only + 5 AI parse total (lifetime or/month) — conversion funnel, not a product.
5. **WA is the moat, AI is the cost** — charge for WA integration in higher tiers; it's often pricier than LLM.

---

## 8. Checklist before launch

- [ ] Pick model from [benchmark](./REPORT.md) — default **gemini-3.1-flash-lite**
- [ ] Cap parses per tier in code (hard limit, not honor system)
- [ ] Confirm UI before save (cuts support + wrong bookings)
- [ ] Log cost per user / per tenant for margin review monthly
- [ ] Plan FX: OpenRouter bills USD — if IDR weakens 10%, recheck add-on prices every quarter
- [ ] Keep **core product valuable without AI** — if OpenRouter down, app still works

---

## 9. One-page summary

| Question | Answer |
|----------|--------|
| AI cost per chat (planning)? | **~Rp 20** on gemini-3.1 with buffers |
| Minimum viable AI add-on price? | **Rp 49.000/mo** for 100 parses |
| Core product price? | **Rp 49.000–79.000/mo** manual-first |
| Safe 6-month capital (small team)? | **Rp 100–200 jt** |
| Lean solo capital? | **Rp 12–25 jt** |
| Target AI COGS % of ARPU? | **≤ 15–20%** on AI tiers |
| Best margin structure? | **Core cheap + AI add-on + overage** |

---

*This guide is advisory, not financial advice. Re-run `bun run eval:scorecard` and `bun run report` when you change models or prompts — unit economics shift with token length and error rate.*
