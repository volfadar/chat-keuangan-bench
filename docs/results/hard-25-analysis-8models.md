# Finance Parse Hard-25 Eval — 2026-06-26 (legacy)

> **Superseded by:** [`hard-25-analysis-12models.md`](./hard-25-analysis-12models.md) (12 models, Jun 27 update)

25 extreme-but-realistic scenarios (12 rewrites + 13 new angles) × 8 models.

## Models (full eval roster)

- `google/gemini-3.1-flash-lite`
- `google/gemini-3-flash-preview`
- `google/gemma-4-31b-it`
- `z-ai/glm-4.5`
- `z-ai/glm-4.7`
- `openai/gpt-oss-120b`
- `inclusionai/ling-2.6-1t`
- `deepseek/deepseek-v4-flash`

## Recommendation

**Legacy note:** This run predates the Jun 27 supplement. For current guidance see **`google/gemma-4-31b-it`** (production) or **`gemini-3.1-flash-lite`** (latency).

**Top pick in this 8-model run:** `google/gemini-3.1-flash-lite` — 24/25 strict, composite 99, ~1955ms.

## Scoreboard

| Model | Strict | Composite avg | Excellent | Usable+ | Partial | Misleading | Broken | Errors | Latency |
|-------|--------|---------------|-----------|---------|---------|------------|--------|--------|---------|
| google/gemini-3.1-flash-lite | 24/25 | 99 | 24 | 1 | 0 | 0 | 0 | 0 | 1955ms |
| google/gemini-3-flash-preview | 24/25 | 99 | 24 | 1 | 0 | 0 | 0 | 0 | 6913ms |
| google/gemma-4-31b-it | 24/25 | 98 | 24 | 0 | 1 | 0 | 0 | 0 | 5959ms |
| z-ai/glm-4.5 | 22/25 | 98 | 22 | 3 | 0 | 0 | 0 | 0 | 3733ms |
| z-ai/glm-4.7 | 22/25 | 97 | 22 | 2 | 1 | 0 | 0 | 0 | 4387ms |
| inclusionai/ling-2.6-1t | 22/25 | 94 | 22 | 1 | 2 | 0 | 0 | 0 | 3196ms |
| deepseek/deepseek-v4-flash | 21/25 | 97 | 21 | 4 | 0 | 0 | 0 | 0 | 2385ms |
| openai/gpt-oss-120b | 21/25 | 96 | 21 | 3 | 0 | 0 | 1 | 0 | 1253ms |

## Scenarios

### hard-cilok-qty-44 _(rewrite of hard-bakmi-qty-22)_
- **Failure mode:** qty×unit price ('5rb 4 4 nya') — models collapse to 1×5rb
- **Input:** td sore beli pulsa 25rb sama jajan cilok 4 tusuk 5rb 4 4 nya

### hard-cod-jnt-tip _(rewrite of hard-cod-shopee-phantom)_
- **Failure mode:** COD multi-entry — risk of phantom Rp0 'income' from the COD word
- **Input:** barusan paket cod jnt sampe, bayar 150rb buat sepatu, sama kasih tip kurir 5rb

### hard-alfamart-price-copy _(rewrite of hard-indomaret-price-copy)_
- **Failure mode:** adjacent price bleed (air 6rb copied from 63.700 or parkir 2rb)
- **Input:** tadi belanja di alfamart 63.700 terus parkir 2rb beli air mineral 6rb

### hard-bonus-cair-gopay _(rewrite of hard-gaji-cair-bca)_
- **Failure mode:** income misclassified as pengeluaran (cair/masuk = pemasukan)
- **Input:** td bonus proyek cair 2,5jt masuk gopay alhamdulillah

### hard-td-spp-3anak _(rewrite of hard-td-zakat-4orang)_
- **Failure mode:** td→hari_ini; 3×250rb vs 750rb total
- **Input:** td bayar spp 3 anak @ 250rb di sekolah

### hard-voice-ojek-correct _(rewrite of hard-voice-triple-correct)_
- **Failure mode:** voice self-correction chain — must land on final 35rb not 20rb
- **Input:** ojek ke stasiun... 20rb... eh bukan, 35rb... iya 35rb deh tadi pagi

### hard-tf-supplier-admin _(rewrite of hard-tf-admin-fee)_
- **Failure mode:** transfer principal + admin fee — 2 entries or merged
- **Input:** transfer ke supplier 1,5jt kena biaya admin 2500

### hard-listrik-cashback-mixed _(rewrite of hard-infaq-donasi-mixed)_
- **Failure mode:** mixed direction same message — listrik out, cashback in
- **Input:** pagi tadi bayar listrik 200rb, siangnya dapet cashback ovo 25rb

### hard-vent-no-nominal _(rewrite of hard-curhat-tanpa-nominal)_
- **Failure mode:** emotional vent, no amounts — should not invent transactions
- **Input:** capek banget hari ini muter2 nyari diskonan tapi ujung2nya ga beli apa2

### hard-hp-2juta _(rewrite of hard-laptop-15-juta)_
- **Failure mode:** 2 vs 2 juta correction — must not record 2000
- **Input:** beli hp baru tadi 2... eh maksudnya 2 juta ya bukan 2 ribu

### hard-patungan-tim _(rewrite of hard-patungan-warung)_
- **Failure mode:** total bill vs personal share — only 90rb is user's expense
- **Input:** tadi makan bareng tim total 540rb, gw bagian 90rb aja

### hard-atk-3line _(rewrite of hard-setoran-3-line)_
- **Failure mode:** three distinct ATK items — qty/price copy risk
- **Input:** beli atk: pulpen 2 lusin 30rb, kertas hvs 1 rim 55rb, map plastik 8rb

### hard-typo-beras-minyak _(new)_
- **Failure mode:** heavy typos (bli/sm/pasr) + two line items
- **Input:** kemarin bli beras 5kg 68rb sm minyak goreng 2 ltr 38rb di pasr

### hard-sep-wifi-token _(new)_
- **Failure mode:** dot thousand-separators (350.000 / 102.500) not decimals
- **Input:** bayar wifi 350.000 sama token listrik 102.500 td malem

### hard-ksuffix-decimal _(new)_
- **Failure mode:** k-suffix with decimal (27.5k = 27.500, 2k = 2.000)
- **Input:** ngopi tadi 27.5k terus parkir 2k doang

### hard-future-kulkas _(new)_
- **Failure mode:** pure future plan ('besok mau beli') — nothing happened yet
- **Input:** besok rencananya mau beli kulkas 3jt, nabung dulu deh sekarang

### hard-past-future-dp _(new)_
- **Failure mode:** mixed past+future — record only the paid DP, not the future lunas
- **Input:** kemarin udah bayar dp motor 5jt, besok mau lunasin sisanya 15jt

### hard-refund-tokopedia _(new)_
- **Failure mode:** refund masuk saldo = pemasukan (not pengeluaran)
- **Input:** barang tokopedia rusak, refund 85rb udah masuk saldo tadi

### hard-diskon-net-price _(new)_
- **Failure mode:** discount math — net paid is 200rb, not 250rb and not 2 entries
- **Input:** beli sepatu 250rb tapi ada diskon 50rb jadi cuma bayar 200rb

### hard-slang-ceban-goceng _(new)_
- **Failure mode:** money slang (ceban=10rb, goceng=5rb) — must convert, not read 0
- **Input:** tadi jajan es teh ceban sama gorengan goceng

### hard-spelled-setengah-juta _(new)_
- **Failure mode:** spelled amount 'setengah juta' = 500.000
- **Input:** td dapet bonus setengah juta dari klien lama

### hard-cancelled-jaket _(new)_
- **Failure mode:** cancelled purchase ('gak jadi beli') — no transaction occurred
- **Input:** jadinya gak jadi beli jaket yang 350rb, batal checkout

### hard-daging-2kg _(new)_
- **Failure mode:** per-kg qty (2kg @ 135rb) — 2×135rb or 270rb merged
- **Input:** beli daging sapi 2kg @ 135rb di tukang daging

### hard-emoji-wa-noise _(new)_
- **Failure mode:** emoji + WA formatting noise around two amounts
- **Input:** 💸 pengeluaran hari ini: bensin 50rb, makan siang 35rb 🙏

### hard-rekap-5line _(new)_
- **Failure mode:** 5-item daily rekap — count fidelity + no merge/drop
- **Input:** rekap hari ini: sarapan 20rb, bensin 40rb, parkir 5rb, makan siang 30rb, kopi sore 18rb

## Per-model analysis

### google/gemini-3.1-flash-lite

- Strict pass: **24/25**
- Mean composite quality: **98.8**
- Latency: **~1955ms**
- Quality wins: hard-sep-wifi-token(composite=95)
- Key failures: hard-sep-wifi-token(usable_with_edit)

#### Scenario detail

| Scenario | Strict | Tier | Composite | Got/Exp | Notes |
|----------|--------|------|-----------|---------|-------|
| hard-cilok-qty-44 | ✓ | excellent | 92 | 2/5 | Alt strict layout accepted (merged qty / total / principal+fee / share); missing/unmatched expected: pengeluaran 5000 [cilok] |
| hard-cod-jnt-tip | ✓ | excellent | 100 | 2/2 | — |
| hard-alfamart-price-copy | ✓ | excellent | 100 | 3/3 | — |
| hard-bonus-cair-gopay | ✓ | excellent | 100 | 1/1 | — |
| hard-td-spp-3anak | ✓ | excellent | 92 | 1/3 | Alt strict layout accepted (merged qty / total / principal+fee / share); missing/unmatched expected: pengeluaran 250000 [spp] |
| hard-voice-ojek-correct | ✓ | excellent | 100 | 1/1 | — |
| hard-tf-supplier-admin | ✓ | excellent | 100 | 2/2 | — |
| hard-listrik-cashback-mixed | ✓ | excellent | 100 | 2/2 | — |
| hard-vent-no-nominal | ✓ | excellent | 100 | 0/0 | Correctly flagged bukan_transaksi |
| hard-hp-2juta | ✓ | excellent | 100 | 1/1 | — |
| hard-patungan-tim | ✓ | excellent | 100 | 1/1 | — |
| hard-atk-3line | ✓ | excellent | 100 | 3/3 | — |
| hard-typo-beras-minyak | ✓ | excellent | 100 | 2/2 | — |
| hard-sep-wifi-token | ✗ | usable_with_edit | 95 | 2/2 | Near-correct — minor edit in confirm UI would suffice; Amounts mostly correct despite layout mismatch |
| hard-ksuffix-decimal | ✓ | excellent | 100 | 2/2 | — |
| hard-future-kulkas | ✓ | excellent | 100 | 0/0 | Correctly flagged bukan_transaksi |
| hard-past-future-dp | ✓ | excellent | 100 | 1/1 | — |
| hard-refund-tokopedia | ✓ | excellent | 100 | 1/1 | — |
| hard-diskon-net-price | ✓ | excellent | 100 | 1/1 | — |
| hard-slang-ceban-goceng | ✓ | excellent | 100 | 2/2 | — |
| hard-spelled-setengah-juta | ✓ | excellent | 100 | 1/1 | — |
| hard-cancelled-jaket | ✓ | excellent | 100 | 0/0 | Correctly flagged bukan_transaksi |
| hard-daging-2kg | ✓ | excellent | 92 | 1/2 | Alt strict layout accepted (merged qty / total / principal+fee / share); missing/unmatched expected: pengeluaran 135000 [daging] |
| hard-emoji-wa-noise | ✓ | excellent | 100 | 2/2 | — |
| hard-rekap-5line | ✓ | excellent | 100 | 5/5 | — |

### google/gemini-3-flash-preview

- Strict pass: **24/25**
- Mean composite quality: **98.8**
- Latency: **~6913ms**
- Quality wins: hard-sep-wifi-token(composite=95)
- Key failures: hard-sep-wifi-token(usable_with_edit)

#### Scenario detail

| Scenario | Strict | Tier | Composite | Got/Exp | Notes |
|----------|--------|------|-----------|---------|-------|
| hard-cilok-qty-44 | ✓ | excellent | 92 | 2/5 | Alt strict layout accepted (merged qty / total / principal+fee / share); missing/unmatched expected: pengeluaran 5000 [cilok] |
| hard-cod-jnt-tip | ✓ | excellent | 100 | 2/2 | — |
| hard-alfamart-price-copy | ✓ | excellent | 100 | 3/3 | — |
| hard-bonus-cair-gopay | ✓ | excellent | 100 | 1/1 | — |
| hard-td-spp-3anak | ✓ | excellent | 92 | 1/3 | Alt strict layout accepted (merged qty / total / principal+fee / share); missing/unmatched expected: pengeluaran 250000 [spp] |
| hard-voice-ojek-correct | ✓ | excellent | 100 | 1/1 | — |
| hard-tf-supplier-admin | ✓ | excellent | 100 | 2/2 | — |
| hard-listrik-cashback-mixed | ✓ | excellent | 100 | 2/2 | — |
| hard-vent-no-nominal | ✓ | excellent | 100 | 0/0 | Correctly flagged bukan_transaksi |
| hard-hp-2juta | ✓ | excellent | 100 | 1/1 | — |
| hard-patungan-tim | ✓ | excellent | 100 | 1/1 | — |
| hard-atk-3line | ✓ | excellent | 100 | 3/3 | — |
| hard-typo-beras-minyak | ✓ | excellent | 100 | 2/2 | — |
| hard-sep-wifi-token | ✗ | usable_with_edit | 95 | 2/2 | Near-correct — minor edit in confirm UI would suffice; Amounts mostly correct despite layout mismatch |
| hard-ksuffix-decimal | ✓ | excellent | 100 | 2/2 | — |
| hard-future-kulkas | ✓ | excellent | 100 | 0/0 | Correctly flagged bukan_transaksi |
| hard-past-future-dp | ✓ | excellent | 100 | 1/1 | — |
| hard-refund-tokopedia | ✓ | excellent | 100 | 1/1 | — |
| hard-diskon-net-price | ✓ | excellent | 100 | 1/1 | — |
| hard-slang-ceban-goceng | ✓ | excellent | 100 | 2/2 | — |
| hard-spelled-setengah-juta | ✓ | excellent | 100 | 1/1 | — |
| hard-cancelled-jaket | ✓ | excellent | 100 | 0/0 | Correctly flagged bukan_transaksi |
| hard-daging-2kg | ✓ | excellent | 92 | 1/2 | Alt strict layout accepted (merged qty / total / principal+fee / share); missing/unmatched expected: pengeluaran 135000 [daging] |
| hard-emoji-wa-noise | ✓ | excellent | 100 | 2/2 | — |
| hard-rekap-5line | ✓ | excellent | 100 | 5/5 | — |

### google/gemma-4-31b-it

- Strict pass: **24/25**
- Mean composite quality: **97.8**
- Latency: **~5959ms**
- Key failures: hard-cilok-qty-44(partially_usable)

#### Scenario detail

| Scenario | Strict | Tier | Composite | Got/Exp | Notes |
|----------|--------|------|-----------|---------|-------|
| hard-cilok-qty-44 | ✗ | partially_usable | 53 | 2/5 | missing/unmatched expected: pengeluaran 5000 [cilok]; missing/unmatched expected: pengeluaran 5000 [cilok] |
| hard-cod-jnt-tip | ✓ | excellent | 100 | 2/2 | — |
| hard-alfamart-price-copy | ✓ | excellent | 100 | 3/3 | — |
| hard-bonus-cair-gopay | ✓ | excellent | 100 | 1/1 | — |
| hard-td-spp-3anak | ✓ | excellent | 100 | 3/3 | — |
| hard-voice-ojek-correct | ✓ | excellent | 100 | 1/1 | — |
| hard-tf-supplier-admin | ✓ | excellent | 100 | 2/2 | — |
| hard-listrik-cashback-mixed | ✓ | excellent | 100 | 2/2 | — |
| hard-vent-no-nominal | ✓ | excellent | 100 | 0/0 | Correctly flagged bukan_transaksi |
| hard-hp-2juta | ✓ | excellent | 100 | 1/1 | — |
| hard-patungan-tim | ✓ | excellent | 100 | 1/1 | — |
| hard-atk-3line | ✓ | excellent | 100 | 3/3 | — |
| hard-typo-beras-minyak | ✓ | excellent | 100 | 2/2 | — |
| hard-sep-wifi-token | ✓ | excellent | 100 | 2/2 | — |
| hard-ksuffix-decimal | ✓ | excellent | 100 | 2/2 | — |
| hard-future-kulkas | ✓ | excellent | 100 | 0/0 | Correctly flagged bukan_transaksi |
| hard-past-future-dp | ✓ | excellent | 100 | 1/1 | — |
| hard-refund-tokopedia | ✓ | excellent | 100 | 1/1 | — |
| hard-diskon-net-price | ✓ | excellent | 100 | 1/1 | — |
| hard-slang-ceban-goceng | ✓ | excellent | 100 | 2/2 | — |
| hard-spelled-setengah-juta | ✓ | excellent | 100 | 1/1 | — |
| hard-cancelled-jaket | ✓ | excellent | 100 | 0/0 | Correctly flagged bukan_transaksi |
| hard-daging-2kg | ✓ | excellent | 92 | 1/2 | Alt strict layout accepted (merged qty / total / principal+fee / share); missing/unmatched expected: pengeluaran 135000 [daging] |
| hard-emoji-wa-noise | ✓ | excellent | 100 | 2/2 | — |
| hard-rekap-5line | ✓ | excellent | 100 | 5/5 | — |

### z-ai/glm-4.5

- Strict pass: **22/25**
- Mean composite quality: **97.7**
- Latency: **~3733ms**
- Quality wins: hard-voice-ojek-correct(composite=95); hard-sep-wifi-token(composite=95)
- Key failures: hard-slang-ceban-goceng(usable_with_edit); hard-voice-ojek-correct(usable_with_edit); hard-sep-wifi-token(usable_with_edit)

#### Scenario detail

| Scenario | Strict | Tier | Composite | Got/Exp | Notes |
|----------|--------|------|-----------|---------|-------|
| hard-cilok-qty-44 | ✓ | excellent | 92 | 2/5 | Alt strict layout accepted (merged qty / total / principal+fee / share); missing/unmatched expected: pengeluaran 5000 [cilok] |
| hard-cod-jnt-tip | ✓ | excellent | 100 | 2/2 | — |
| hard-alfamart-price-copy | ✓ | excellent | 100 | 3/3 | — |
| hard-bonus-cair-gopay | ✓ | excellent | 100 | 1/1 | — |
| hard-td-spp-3anak | ✓ | excellent | 92 | 1/3 | Alt strict layout accepted (merged qty / total / principal+fee / share); missing/unmatched expected: pengeluaran 250000 [spp] |
| hard-voice-ojek-correct | ✗ | usable_with_edit | 95 | 1/1 | Near-correct — minor edit in confirm UI would suffice; Amounts mostly correct despite layout mismatch |
| hard-tf-supplier-admin | ✓ | excellent | 100 | 2/2 | — |
| hard-listrik-cashback-mixed | ✓ | excellent | 100 | 2/2 | — |
| hard-vent-no-nominal | ✓ | excellent | 100 | 0/0 | Correctly flagged bukan_transaksi |
| hard-hp-2juta | ✓ | excellent | 100 | 1/1 | — |
| hard-patungan-tim | ✓ | excellent | 100 | 1/1 | — |
| hard-atk-3line | ✓ | excellent | 100 | 3/3 | — |
| hard-typo-beras-minyak | ✓ | excellent | 100 | 2/2 | — |
| hard-sep-wifi-token | ✗ | usable_with_edit | 95 | 2/2 | Near-correct — minor edit in confirm UI would suffice; Amounts mostly correct despite layout mismatch |
| hard-ksuffix-decimal | ✓ | excellent | 100 | 2/2 | — |
| hard-future-kulkas | ✓ | excellent | 100 | 0/0 | Correctly flagged bukan_transaksi |
| hard-past-future-dp | ✓ | excellent | 100 | 1/1 | — |
| hard-refund-tokopedia | ✓ | excellent | 100 | 1/1 | — |
| hard-diskon-net-price | ✓ | excellent | 100 | 1/1 | — |
| hard-slang-ceban-goceng | ✗ | usable_with_edit | 76 | 2/2 | missing/unmatched expected: pengeluaran 10000 [teh]; missing/unmatched expected: pengeluaran 5000 [gorengan] |
| hard-spelled-setengah-juta | ✓ | excellent | 100 | 1/1 | — |
| hard-cancelled-jaket | ✓ | excellent | 100 | 0/0 | Correctly flagged bukan_transaksi |
| hard-daging-2kg | ✓ | excellent | 92 | 1/2 | Alt strict layout accepted (merged qty / total / principal+fee / share); missing/unmatched expected: pengeluaran 135000 [daging] |
| hard-emoji-wa-noise | ✓ | excellent | 100 | 2/2 | — |
| hard-rekap-5line | ✓ | excellent | 100 | 5/5 | — |

### z-ai/glm-4.7

- Strict pass: **22/25**
- Mean composite quality: **96.8**
- Latency: **~4387ms**
- Quality wins: hard-voice-ojek-correct(composite=95); hard-sep-wifi-token(composite=95)
- Key failures: hard-slang-ceban-goceng(partially_usable); hard-voice-ojek-correct(usable_with_edit); hard-sep-wifi-token(usable_with_edit)

#### Scenario detail

| Scenario | Strict | Tier | Composite | Got/Exp | Notes |
|----------|--------|------|-----------|---------|-------|
| hard-cilok-qty-44 | ✓ | excellent | 92 | 2/5 | Alt strict layout accepted (merged qty / total / principal+fee / share); missing/unmatched expected: pengeluaran 5000 [cilok] |
| hard-cod-jnt-tip | ✓ | excellent | 100 | 2/2 | — |
| hard-alfamart-price-copy | ✓ | excellent | 100 | 3/3 | — |
| hard-bonus-cair-gopay | ✓ | excellent | 100 | 1/1 | — |
| hard-td-spp-3anak | ✓ | excellent | 92 | 1/3 | Alt strict layout accepted (merged qty / total / principal+fee / share); missing/unmatched expected: pengeluaran 250000 [spp] |
| hard-voice-ojek-correct | ✗ | usable_with_edit | 95 | 1/1 | Near-correct — minor edit in confirm UI would suffice; Amounts mostly correct despite layout mismatch |
| hard-tf-supplier-admin | ✓ | excellent | 100 | 2/2 | — |
| hard-listrik-cashback-mixed | ✓ | excellent | 100 | 2/2 | — |
| hard-vent-no-nominal | ✓ | excellent | 100 | 0/0 | Correctly flagged bukan_transaksi |
| hard-hp-2juta | ✓ | excellent | 100 | 1/1 | — |
| hard-patungan-tim | ✓ | excellent | 100 | 1/1 | — |
| hard-atk-3line | ✓ | excellent | 100 | 3/3 | — |
| hard-typo-beras-minyak | ✓ | excellent | 100 | 2/2 | — |
| hard-sep-wifi-token | ✗ | usable_with_edit | 95 | 2/2 | Near-correct — minor edit in confirm UI would suffice; Amounts mostly correct despite layout mismatch |
| hard-ksuffix-decimal | ✓ | excellent | 100 | 2/2 | — |
| hard-future-kulkas | ✓ | excellent | 100 | 0/0 | Correctly flagged bukan_transaksi |
| hard-past-future-dp | ✓ | excellent | 100 | 1/1 | — |
| hard-refund-tokopedia | ✓ | excellent | 100 | 1/1 | — |
| hard-diskon-net-price | ✓ | excellent | 100 | 1/1 | — |
| hard-slang-ceban-goceng | ✗ | partially_usable | 53 | 1/2 | missing/unmatched expected: pengeluaran 10000 [teh]; missing/unmatched expected: pengeluaran 5000 [gorengan] |
| hard-spelled-setengah-juta | ✓ | excellent | 100 | 1/1 | — |
| hard-cancelled-jaket | ✓ | excellent | 100 | 0/0 | Correctly flagged bukan_transaksi |
| hard-daging-2kg | ✓ | excellent | 92 | 1/2 | Alt strict layout accepted (merged qty / total / principal+fee / share); missing/unmatched expected: pengeluaran 135000 [daging] |
| hard-emoji-wa-noise | ✓ | excellent | 100 | 2/2 | — |
| hard-rekap-5line | ✓ | excellent | 100 | 5/5 | — |

### inclusionai/ling-2.6-1t

- Strict pass: **22/25**
- Mean composite quality: **94.3**
- Latency: **~3196ms**
- Key failures: hard-slang-ceban-goceng(partially_usable); hard-td-spp-3anak(partially_usable); hard-past-future-dp(usable_with_edit)

#### Scenario detail

| Scenario | Strict | Tier | Composite | Got/Exp | Notes |
|----------|--------|------|-----------|---------|-------|
| hard-cilok-qty-44 | ✓ | excellent | 92 | 2/5 | Alt strict layout accepted (merged qty / total / principal+fee / share); missing/unmatched expected: pengeluaran 5000 [cilok] |
| hard-cod-jnt-tip | ✓ | excellent | 100 | 2/2 | — |
| hard-alfamart-price-copy | ✓ | excellent | 100 | 3/3 | — |
| hard-bonus-cair-gopay | ✓ | excellent | 100 | 1/1 | — |
| hard-td-spp-3anak | ✗ | partially_usable | 52 | 1/3 | missing/unmatched expected: pengeluaran 250000 [spp]; missing/unmatched expected: pengeluaran 250000 [spp] |
| hard-voice-ojek-correct | ✓ | excellent | 100 | 1/1 | — |
| hard-tf-supplier-admin | ✓ | excellent | 100 | 2/2 | — |
| hard-listrik-cashback-mixed | ✓ | excellent | 100 | 2/2 | — |
| hard-vent-no-nominal | ✓ | excellent | 100 | 0/0 | Correctly flagged bukan_transaksi |
| hard-hp-2juta | ✓ | excellent | 100 | 1/1 | — |
| hard-patungan-tim | ✓ | excellent | 95 | 1/1 | Alt strict layout accepted (merged qty / total / principal+fee / share); missing/unmatched expected: pengeluaran 90000 [makan,tim,bagian,patungan] |
| hard-atk-3line | ✓ | excellent | 100 | 3/3 | — |
| hard-typo-beras-minyak | ✓ | excellent | 100 | 2/2 | — |
| hard-sep-wifi-token | ✓ | excellent | 100 | 2/2 | — |
| hard-ksuffix-decimal | ✓ | excellent | 100 | 2/2 | — |
| hard-future-kulkas | ✓ | excellent | 100 | 0/0 | Correctly flagged bukan_transaksi |
| hard-past-future-dp | ✗ | usable_with_edit | 76 | 1/1 | missing/unmatched expected: pengeluaran 5000000 [dp,motor]; extra entries: pengeluaran 50000 "bayar dp motor" |
| hard-refund-tokopedia | ✓ | excellent | 100 | 1/1 | — |
| hard-diskon-net-price | ✓ | excellent | 100 | 1/1 | — |
| hard-slang-ceban-goceng | ✗ | partially_usable | 51 | 1/2 | Model surfaced ambiguity in catatan — good for confirm UI; missing/unmatched expected: pengeluaran 10000 [teh] |
| hard-spelled-setengah-juta | ✓ | excellent | 100 | 1/1 | — |
| hard-cancelled-jaket | ✓ | excellent | 100 | 0/0 | Correctly flagged bukan_transaksi |
| hard-daging-2kg | ✓ | excellent | 92 | 1/2 | Alt strict layout accepted (merged qty / total / principal+fee / share); missing/unmatched expected: pengeluaran 135000 [daging] |
| hard-emoji-wa-noise | ✓ | excellent | 100 | 2/2 | — |
| hard-rekap-5line | ✓ | excellent | 100 | 5/5 | — |

### deepseek/deepseek-v4-flash

- Strict pass: **21/25**
- Mean composite quality: **97.2**
- Latency: **~2385ms**
- Quality wins: hard-alfamart-price-copy(composite=85); hard-listrik-cashback-mixed(composite=88); hard-atk-3line(composite=86); hard-rekap-5line(composite=95)
- Key failures: hard-alfamart-price-copy(usable_with_edit); hard-atk-3line(usable_with_edit); hard-listrik-cashback-mixed(usable_with_edit); hard-rekap-5line(usable_with_edit)

#### Scenario detail

| Scenario | Strict | Tier | Composite | Got/Exp | Notes |
|----------|--------|------|-----------|---------|-------|
| hard-cilok-qty-44 | ✓ | excellent | 92 | 2/5 | Alt strict layout accepted (merged qty / total / principal+fee / share); missing/unmatched expected: pengeluaran 5000 [cilok] |
| hard-cod-jnt-tip | ✓ | excellent | 100 | 2/2 | Model surfaced ambiguity in catatan — good for confirm UI |
| hard-alfamart-price-copy | ✗ | usable_with_edit | 85 | 3/3 | Suspected adjacent-price copy bug; missing/unmatched expected: pengeluaran 6000 [air,mineral] |
| hard-bonus-cair-gopay | ✓ | excellent | 100 | 1/1 | — |
| hard-td-spp-3anak | ✓ | excellent | 92 | 1/3 | Alt strict layout accepted (merged qty / total / principal+fee / share); missing/unmatched expected: pengeluaran 250000 [spp] |
| hard-voice-ojek-correct | ✓ | excellent | 100 | 1/1 | — |
| hard-tf-supplier-admin | ✓ | excellent | 100 | 2/2 | — |
| hard-listrik-cashback-mixed | ✗ | usable_with_edit | 88 | 2/2 | Near-correct — minor edit in confirm UI would suffice; missing/unmatched expected: pemasukan 25000 [cashback] |
| hard-vent-no-nominal | ✓ | excellent | 100 | 0/0 | Correctly flagged bukan_transaksi |
| hard-hp-2juta | ✓ | excellent | 100 | 1/1 | — |
| hard-patungan-tim | ✓ | excellent | 100 | 1/1 | — |
| hard-atk-3line | ✗ | usable_with_edit | 86 | 3/3 | Near-correct — minor edit in confirm UI would suffice; Model surfaced ambiguity in catatan — good for confirm UI |
| hard-typo-beras-minyak | ✓ | excellent | 100 | 2/2 | — |
| hard-sep-wifi-token | ✓ | excellent | 100 | 2/2 | — |
| hard-ksuffix-decimal | ✓ | excellent | 100 | 2/2 | — |
| hard-future-kulkas | ✓ | excellent | 100 | 0/0 | Correctly flagged bukan_transaksi |
| hard-past-future-dp | ✓ | excellent | 100 | 1/1 | — |
| hard-refund-tokopedia | ✓ | excellent | 100 | 1/1 | — |
| hard-diskon-net-price | ✓ | excellent | 100 | 1/1 | — |
| hard-slang-ceban-goceng | ✓ | excellent | 100 | 2/2 | — |
| hard-spelled-setengah-juta | ✓ | excellent | 100 | 1/1 | — |
| hard-cancelled-jaket | ✓ | excellent | 100 | 0/0 | Correctly flagged bukan_transaksi |
| hard-daging-2kg | ✓ | excellent | 92 | 1/2 | Alt strict layout accepted (merged qty / total / principal+fee / share); missing/unmatched expected: pengeluaran 135000 [daging] |
| hard-emoji-wa-noise | ✓ | excellent | 100 | 2/2 | — |
| hard-rekap-5line | ✗ | usable_with_edit | 95 | 5/5 | Near-correct — minor edit in confirm UI would suffice; missing/unmatched expected: pengeluaran 18000 [kopi] |

### openai/gpt-oss-120b

- Strict pass: **21/25**
- Mean composite quality: **96.3**
- Latency: **~1253ms**
- Quality wins: hard-bonus-cair-gopay(composite=95); hard-hp-2juta(composite=95); hard-spelled-setengah-juta(composite=95)
- Key failures: hard-slang-ceban-goceng(broken); hard-bonus-cair-gopay(usable_with_edit); hard-hp-2juta(usable_with_edit); hard-spelled-setengah-juta(usable_with_edit)

#### Scenario detail

| Scenario | Strict | Tier | Composite | Got/Exp | Notes |
|----------|--------|------|-----------|---------|-------|
| hard-cilok-qty-44 | ✓ | excellent | 92 | 2/5 | Alt strict layout accepted (merged qty / total / principal+fee / share); missing/unmatched expected: pengeluaran 5000 [cilok] |
| hard-cod-jnt-tip | ✓ | excellent | 100 | 2/2 | — |
| hard-alfamart-price-copy | ✓ | excellent | 100 | 3/3 | — |
| hard-bonus-cair-gopay | ✗ | usable_with_edit | 95 | 1/1 | Near-correct — minor edit in confirm UI would suffice; Amounts mostly correct despite layout mismatch |
| hard-td-spp-3anak | ✓ | excellent | 92 | 1/3 | Alt strict layout accepted (merged qty / total / principal+fee / share); missing/unmatched expected: pengeluaran 250000 [spp] |
| hard-voice-ojek-correct | ✓ | excellent | 100 | 1/1 | — |
| hard-tf-supplier-admin | ✓ | excellent | 100 | 2/2 | — |
| hard-listrik-cashback-mixed | ✓ | excellent | 100 | 2/2 | — |
| hard-vent-no-nominal | ✓ | excellent | 100 | 0/0 | Correctly flagged bukan_transaksi |
| hard-hp-2juta | ✗ | usable_with_edit | 95 | 1/1 | Near-correct — minor edit in confirm UI would suffice; Amounts mostly correct despite layout mismatch |
| hard-patungan-tim | ✓ | excellent | 100 | 1/1 | — |
| hard-atk-3line | ✓ | excellent | 100 | 3/3 | — |
| hard-typo-beras-minyak | ✓ | excellent | 100 | 2/2 | — |
| hard-sep-wifi-token | ✓ | excellent | 100 | 2/2 | — |
| hard-ksuffix-decimal | ✓ | excellent | 100 | 2/2 | — |
| hard-future-kulkas | ✓ | excellent | 100 | 0/0 | Correctly flagged bukan_transaksi |
| hard-past-future-dp | ✓ | excellent | 100 | 1/1 | — |
| hard-refund-tokopedia | ✓ | excellent | 100 | 1/1 | — |
| hard-diskon-net-price | ✓ | excellent | 100 | 1/1 | — |
| hard-slang-ceban-goceng | ✗ | broken | 47 | 1/2 | Model surfaced ambiguity in catatan — good for confirm UI; missing/unmatched expected: pengeluaran 10000 [teh] |
| hard-spelled-setengah-juta | ✗ | usable_with_edit | 95 | 1/1 | Near-correct — minor edit in confirm UI would suffice; Amounts mostly correct despite layout mismatch |
| hard-cancelled-jaket | ✓ | excellent | 100 | 0/0 | Correctly flagged bukan_transaksi |
| hard-daging-2kg | ✓ | excellent | 92 | 1/2 | Alt strict layout accepted (merged qty / total / principal+fee / share); missing/unmatched expected: pengeluaran 135000 [daging] |
| hard-emoji-wa-noise | ✓ | excellent | 100 | 2/2 | — |
| hard-rekap-5line | ✓ | excellent | 100 | 5/5 | — |

## Cross-model insights (per scenario)

- **hard-cilok-qty-44**: 7/8 strict, avg composite 87 ⚠️
- **hard-cod-jnt-tip**: 8/8 strict, avg composite 100
- **hard-alfamart-price-copy**: 7/8 strict, avg composite 98 ⚠️
- **hard-bonus-cair-gopay**: 7/8 strict, avg composite 99 ⚠️
- **hard-td-spp-3anak**: 7/8 strict, avg composite 88 ⚠️
- **hard-voice-ojek-correct**: 6/8 strict, avg composite 99 ⚠️
- **hard-tf-supplier-admin**: 8/8 strict, avg composite 100
- **hard-listrik-cashback-mixed**: 7/8 strict, avg composite 99 ⚠️
- **hard-vent-no-nominal**: 8/8 strict, avg composite 100
- **hard-hp-2juta**: 7/8 strict, avg composite 99 ⚠️
- **hard-patungan-tim**: 8/8 strict, avg composite 99
- **hard-atk-3line**: 7/8 strict, avg composite 98 ⚠️
- **hard-typo-beras-minyak**: 8/8 strict, avg composite 100
- **hard-sep-wifi-token**: 4/8 strict, avg composite 98 ⚠️
- **hard-ksuffix-decimal**: 8/8 strict, avg composite 100
- **hard-future-kulkas**: 8/8 strict, avg composite 100
- **hard-past-future-dp**: 7/8 strict, avg composite 97 ⚠️
- **hard-refund-tokopedia**: 8/8 strict, avg composite 100
- **hard-diskon-net-price**: 8/8 strict, avg composite 100
- **hard-slang-ceban-goceng**: 4/8 strict, avg composite 78 ⚠️
- **hard-spelled-setengah-juta**: 7/8 strict, avg composite 99 ⚠️
- **hard-cancelled-jaket**: 8/8 strict, avg composite 100
- **hard-daging-2kg**: 8/8 strict, avg composite 92
- **hard-emoji-wa-noise**: 8/8 strict, avg composite 100
- **hard-rekap-5line**: 7/8 strict, avg composite 99 ⚠️