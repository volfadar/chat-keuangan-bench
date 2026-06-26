# Finance Parse Hard-25 Eval — 2026-06-26T17:00:03.981Z

25 extreme-but-realistic scenarios (12 rewrites + 13 new angles) × top-5 models.

## Models (top-5 from hard-12, ranked)

- `google/gemma-4-31b-it`
- `google/gemini-3.1-flash-lite`
- `z-ai/glm-4.5`
- `z-ai/glm-4.7`
- `google/gemini-3-flash-preview`

## Recommendation

**Top pick: `google/gemini-3.1-flash-lite`** — 24/25 strict, composite 99, ~2005ms.

## Scoreboard

| Model | Strict | Composite avg | Excellent | Usable+ | Partial | Misleading | Broken | Errors | Latency |
|-------|--------|---------------|-----------|---------|---------|------------|--------|--------|---------|
| google/gemini-3.1-flash-lite | 24/25 | 99 | 24 | 1 | 0 | 0 | 0 | 0 | 2005ms |
| google/gemini-3-flash-preview | 24/25 | 99 | 24 | 1 | 0 | 0 | 0 | 0 | 3340ms |
| google/gemma-4-31b-it | 24/25 | 98 | 24 | 0 | 1 | 0 | 0 | 0 | 6827ms |
| z-ai/glm-4.5 | 22/25 | 98 | 22 | 3 | 0 | 0 | 0 | 0 | 3647ms |
| z-ai/glm-4.7 | 22/25 | 97 | 22 | 2 | 1 | 0 | 0 | 0 | 5028ms |

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
- Latency: **~2005ms**
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
- Latency: **~3340ms**
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
- Latency: **~6827ms**
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
- Latency: **~3647ms**
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
- Latency: **~5028ms**
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

## Cross-model insights (per scenario)

- **hard-cilok-qty-44**: 4/5 strict, avg composite 84 ⚠️
- **hard-cod-jnt-tip**: 5/5 strict, avg composite 100
- **hard-alfamart-price-copy**: 5/5 strict, avg composite 100
- **hard-bonus-cair-gopay**: 5/5 strict, avg composite 100
- **hard-td-spp-3anak**: 5/5 strict, avg composite 94
- **hard-voice-ojek-correct**: 3/5 strict, avg composite 98 ⚠️
- **hard-tf-supplier-admin**: 5/5 strict, avg composite 100
- **hard-listrik-cashback-mixed**: 5/5 strict, avg composite 100
- **hard-vent-no-nominal**: 5/5 strict, avg composite 100
- **hard-hp-2juta**: 5/5 strict, avg composite 100
- **hard-patungan-tim**: 5/5 strict, avg composite 100
- **hard-atk-3line**: 5/5 strict, avg composite 100
- **hard-typo-beras-minyak**: 5/5 strict, avg composite 100
- **hard-sep-wifi-token**: 1/5 strict, avg composite 96 ⚠️
- **hard-ksuffix-decimal**: 5/5 strict, avg composite 100
- **hard-future-kulkas**: 5/5 strict, avg composite 100
- **hard-past-future-dp**: 5/5 strict, avg composite 100
- **hard-refund-tokopedia**: 5/5 strict, avg composite 100
- **hard-diskon-net-price**: 5/5 strict, avg composite 100
- **hard-slang-ceban-goceng**: 3/5 strict, avg composite 86 ⚠️
- **hard-spelled-setengah-juta**: 5/5 strict, avg composite 100
- **hard-cancelled-jaket**: 5/5 strict, avg composite 100
- **hard-daging-2kg**: 5/5 strict, avg composite 92
- **hard-emoji-wa-noise**: 5/5 strict, avg composite 100
- **hard-rekap-5line**: 5/5 strict, avg composite 100