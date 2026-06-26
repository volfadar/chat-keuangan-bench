# Finance Parse Hard-12 Eval — 2026-06-26T16:34:26.621Z

## Models (7, excluding deepseek-v4-flash & deepseek-v4-pro)

- `google/gemini-3-flash-preview`
- `google/gemini-3.1-flash-lite`
- `z-ai/glm-4.5`
- `z-ai/glm-4.7`
- `openai/gpt-oss-120b`
- `inclusionai/ling-2.6-1t`
- `google/gemma-4-31b-it`

## Scoreboard

| Model | Strict | Composite avg | Excellent | Usable+ | Partial | Misleading | Broken | Errors | Latency |
|-------|--------|---------------|-----------|---------|---------|------------|--------|--------|---------|
| google/gemma-4-31b-it | 11/12 | 98 | 11 | 1 | 0 | 0 | 0 | 0 | 6570ms |
| google/gemini-3.1-flash-lite | 11/12 | 93 | 11 | 1 | 0 | 0 | 0 | 0 | 2021ms |
| z-ai/glm-4.5 | 11/12 | 93 | 11 | 1 | 0 | 0 | 0 | 0 | 4051ms |
| z-ai/glm-4.7 | 11/12 | 93 | 11 | 1 | 0 | 0 | 0 | 0 | 9662ms |
| google/gemini-3-flash-preview | 11/12 | 84 | 11 | 0 | 0 | 1 | 0 | 0 | 5662ms |
| inclusionai/ling-2.6-1t | 10/12 | 89 | 10 | 1 | 0 | 1 | 0 | 0 | 3188ms |
| openai/gpt-oss-120b | 10/12 | 84 | 10 | 1 | 0 | 1 | 0 | 0 | 1399ms |

## Scenarios

### hard-bakmi-qty-22
- **Failure mode:** qty×unit price ('12rb 2 2 nya') — models collapse to 1×12rb
- **Input:** hmm maren gw keknya beli sarden 12rb terus hari ini makan bakmi 2 bungkus, harganya sih 12rb 2 2 nya

### hard-cod-shopee-phantom
- **Failure mode:** COD Shopee — Ling hallucinated pemasukan Rp0
- **Input:** baru cod shopee case hp 95rb terus sekalian beli kabel type c 25rb di toko samping

### hard-indomaret-price-copy
- **Failure mode:** adjacent price bleed (kopi 35rb copied from 87.5k or 18rb)
- **Input:** kemarin indomaret belanja 87.500 terus gojek 18rb kopi susu 35rb

### hard-gaji-cair-bca
- **Failure mode:** income misclassified as pengeluaran (GLM v1 bug)
- **Input:** td sore gaji cair 4,5 jt masuk rekening bca alhamdulillah

### hard-td-zakat-4orang
- **Failure mode:** td→kemarin wrong; 4×45rb vs 180rb total
- **Input:** td zakat fitrah 4 orang @ 45rb di masjid deket rumah

### hard-voice-triple-correct
- **Failure mode:** voice self-correction chain — must land on final 50rb not 15rb
- **Input:** gojek ke kampus... 15rb... eh engga 50rb... iya 50rb bener kemarin

### hard-tf-admin-fee
- **Failure mode:** transfer principal + admin fee — 2 entries or merged
- **Input:** tf 2jt ke vendor cleaning tapi kena admin 6500

### hard-infaq-donasi-mixed
- **Failure mode:** mixed direction same message — infaq out, donasi in
- **Input:** hari ini infaq jumat 50rb terus siang dapat transfer donasi 300rb dari pak ustadz

### hard-curhat-tanpa-nominal
- **Failure mode:** emotional vent with no amounts — should not invent transactions
- **Input:** abis jajan di mall tadi dompet kering banget huhu males banget

### hard-laptop-15-juta
- **Failure mode:** 15 vs 15 juta correction — must not record 15000
- **Input:** beli laptop kemarin 15... eh maksudnya 15 juta bukan 15 ribu

### hard-patungan-warung
- **Failure mode:** total bill vs personal patungan share — only 80rb is user's expense
- **Input:** kemarin makan rame2 di warung total 320rb gw patungan 80rb sendiri

### hard-setoran-3-line
- **Failure mode:** three distinct school supplies — fotokopi price copy risk
- **Input:** setoran buku tulis 2 pack 24rb fotokopi 12 lembar 36rb jilid 15rb

## Per-model analysis

### google/gemma-4-31b-it

- Strict pass: **11/12**
- Mean composite quality: **97.9**
- Key failures: hard-bakmi-qty-22(usable_with_edit)

#### Scenario detail

| Scenario | Strict | Tier | Composite | Notes |
|----------|--------|------|-----------|-------|
| hard-bakmi-qty-22 | ✗ | usable_with_edit | 75 | missing/unmatched expected: pengeluaran 12000 [bakmi]; missing/unmatched expected: pengeluaran 12000 [bakmi] |
| hard-cod-shopee-phantom | ✓ | excellent | 100 | — |
| hard-indomaret-price-copy | ✓ | excellent | 100 | — |
| hard-gaji-cair-bca | ✓ | excellent | 100 | — |
| hard-td-zakat-4orang | ✓ | excellent | 100 | — |
| hard-voice-triple-correct | ✓ | excellent | 100 | — |
| hard-tf-admin-fee | ✓ | excellent | 100 | — |
| hard-infaq-donasi-mixed | ✓ | excellent | 100 | — |
| hard-curhat-tanpa-nominal | ✓ | excellent | 100 | Correctly flagged bukan_transaksi |
| hard-laptop-15-juta | ✓ | excellent | 100 | — |
| hard-patungan-warung | ✓ | excellent | 100 | — |
| hard-setoran-3-line | ✓ | excellent | 100 | — |

### google/gemini-3.1-flash-lite

- Strict pass: **11/12**
- Mean composite quality: **92.8**
- Key failures: hard-bakmi-qty-22(usable_with_edit)

#### Scenario detail

| Scenario | Strict | Tier | Composite | Notes |
|----------|--------|------|-----------|-------|
| hard-bakmi-qty-22 | ✗ | usable_with_edit | 75 | missing/unmatched expected: pengeluaran 12000 [bakmi]; missing/unmatched expected: pengeluaran 12000 [bakmi] |
| hard-cod-shopee-phantom | ✓ | excellent | 100 | — |
| hard-indomaret-price-copy | ✓ | excellent | 100 | — |
| hard-gaji-cair-bca | ✓ | excellent | 100 | — |
| hard-td-zakat-4orang | ✓ | excellent | 38 | Alt strict layout accepted (merged qty, zakat total, admin fee, etc.); missing/unmatched expected: pengeluaran 45000 [zakat] |
| hard-voice-triple-correct | ✓ | excellent | 100 | — |
| hard-tf-admin-fee | ✓ | excellent | 100 | — |
| hard-infaq-donasi-mixed | ✓ | excellent | 100 | — |
| hard-curhat-tanpa-nominal | ✓ | excellent | 100 | Correctly flagged bukan_transaksi |
| hard-laptop-15-juta | ✓ | excellent | 100 | — |
| hard-patungan-warung | ✓ | excellent | 100 | — |
| hard-setoran-3-line | ✓ | excellent | 100 | — |

### z-ai/glm-4.5

- Strict pass: **11/12**
- Mean composite quality: **92.8**
- Key failures: hard-bakmi-qty-22(usable_with_edit)

#### Scenario detail

| Scenario | Strict | Tier | Composite | Notes |
|----------|--------|------|-----------|-------|
| hard-bakmi-qty-22 | ✗ | usable_with_edit | 75 | missing/unmatched expected: pengeluaran 12000 [bakmi]; missing/unmatched expected: pengeluaran 12000 [bakmi] |
| hard-cod-shopee-phantom | ✓ | excellent | 100 | — |
| hard-indomaret-price-copy | ✓ | excellent | 100 | — |
| hard-gaji-cair-bca | ✓ | excellent | 100 | — |
| hard-td-zakat-4orang | ✓ | excellent | 38 | Alt strict layout accepted (merged qty, zakat total, admin fee, etc.); missing/unmatched expected: pengeluaran 45000 [zakat] |
| hard-voice-triple-correct | ✓ | excellent | 100 | — |
| hard-tf-admin-fee | ✓ | excellent | 100 | — |
| hard-infaq-donasi-mixed | ✓ | excellent | 100 | — |
| hard-curhat-tanpa-nominal | ✓ | excellent | 100 | Correctly flagged bukan_transaksi |
| hard-laptop-15-juta | ✓ | excellent | 100 | — |
| hard-patungan-warung | ✓ | excellent | 100 | — |
| hard-setoran-3-line | ✓ | excellent | 100 | — |

### z-ai/glm-4.7

- Strict pass: **11/12**
- Mean composite quality: **92.8**
- Key failures: hard-bakmi-qty-22(usable_with_edit)

#### Scenario detail

| Scenario | Strict | Tier | Composite | Notes |
|----------|--------|------|-----------|-------|
| hard-bakmi-qty-22 | ✗ | usable_with_edit | 75 | Model surfaced ambiguity in catatan — good for confirm UI; missing/unmatched expected: pengeluaran 12000 [bakmi] |
| hard-cod-shopee-phantom | ✓ | excellent | 100 | — |
| hard-indomaret-price-copy | ✓ | excellent | 100 | — |
| hard-gaji-cair-bca | ✓ | excellent | 100 | — |
| hard-td-zakat-4orang | ✓ | excellent | 38 | Alt strict layout accepted (merged qty, zakat total, admin fee, etc.); missing/unmatched expected: pengeluaran 45000 [zakat] |
| hard-voice-triple-correct | ✓ | excellent | 100 | — |
| hard-tf-admin-fee | ✓ | excellent | 100 | — |
| hard-infaq-donasi-mixed | ✓ | excellent | 100 | — |
| hard-curhat-tanpa-nominal | ✓ | excellent | 100 | Correctly flagged bukan_transaksi |
| hard-laptop-15-juta | ✓ | excellent | 100 | — |
| hard-patungan-warung | ✓ | excellent | 100 | — |
| hard-setoran-3-line | ✓ | excellent | 100 | — |

### inclusionai/ling-2.6-1t

- Strict pass: **10/12**
- Mean composite quality: **88.6**
- Key failures: hard-setoran-3-line(misleading); hard-bakmi-qty-22(usable_with_edit)

#### Scenario detail

| Scenario | Strict | Tier | Composite | Notes |
|----------|--------|------|-----------|-------|
| hard-bakmi-qty-22 | ✗ | usable_with_edit | 76 | Model surfaced ambiguity in catatan — good for confirm UI; missing/unmatched expected: pengeluaran 12000 [bakmi] |
| hard-cod-shopee-phantom | ✓ | excellent | 100 | — |
| hard-indomaret-price-copy | ✓ | excellent | 100 | — |
| hard-gaji-cair-bca | ✓ | excellent | 100 | — |
| hard-td-zakat-4orang | ✓ | excellent | 38 | Alt strict layout accepted (merged qty, zakat total, admin fee, etc.); missing/unmatched expected: pengeluaran 45000 [zakat] |
| hard-voice-triple-correct | ✓ | excellent | 100 | — |
| hard-tf-admin-fee | ✓ | excellent | 100 | — |
| hard-infaq-donasi-mixed | ✓ | excellent | 100 | — |
| hard-curhat-tanpa-nominal | ✓ | excellent | 100 | Correctly flagged bukan_transaksi |
| hard-laptop-15-juta | ✓ | excellent | 100 | — |
| hard-patungan-warung | ✓ | excellent | 100 | — |
| hard-setoran-3-line | ✗ | misleading | 49 | Spurious pemasukan detected (phantom/zero income); missing/unmatched expected: pengeluaran 24000 [buku] |

### openai/gpt-oss-120b

- Strict pass: **10/12**
- Mean composite quality: **84.1**
- Quality wins: hard-gaji-cair-bca(composite=95)
- Key failures: hard-setoran-3-line(misleading); hard-gaji-cair-bca(usable_with_edit)

#### Scenario detail

| Scenario | Strict | Tier | Composite | Notes |
|----------|--------|------|-----------|-------|
| hard-bakmi-qty-22 | ✓ | excellent | 67 | Alt strict layout accepted (merged qty, zakat total, admin fee, etc.); missing/unmatched expected: pengeluaran 12000 [bakmi] |
| hard-cod-shopee-phantom | ✓ | excellent | 100 | — |
| hard-indomaret-price-copy | ✓ | excellent | 100 | — |
| hard-gaji-cair-bca | ✗ | usable_with_edit | 95 | Near-correct — minor edit in confirm UI would suffice; Amounts mostly correct despite layout mismatch |
| hard-td-zakat-4orang | ✓ | excellent | 37 | Alt strict layout accepted (merged qty, zakat total, admin fee, etc.); missing/unmatched expected: pengeluaran 45000 [zakat] |
| hard-voice-triple-correct | ✓ | excellent | 100 | — |
| hard-tf-admin-fee | ✓ | excellent | 61 | Alt strict layout accepted (merged qty, zakat total, admin fee, etc.); missing/unmatched expected: pengeluaran 2000000 [vendor,cleaning,tf,transfer] |
| hard-infaq-donasi-mixed | ✓ | excellent | 100 | — |
| hard-curhat-tanpa-nominal | ✓ | excellent | 100 | Correctly flagged bukan_transaksi |
| hard-laptop-15-juta | ✓ | excellent | 100 | — |
| hard-patungan-warung | ✓ | excellent | 100 | — |
| hard-setoran-3-line | ✗ | misleading | 49 | Spurious pemasukan detected (phantom/zero income); missing/unmatched expected: pengeluaran 24000 [buku] |

### google/gemini-3-flash-preview

- Strict pass: **11/12**
- Mean composite quality: **83.8**
- Key failures: hard-curhat-tanpa-nominal(misleading)

#### Scenario detail

| Scenario | Strict | Tier | Composite | Notes |
|----------|--------|------|-----------|-------|
| hard-bakmi-qty-22 | ✓ | excellent | 67 | Alt strict layout accepted (merged qty, zakat total, admin fee, etc.); missing/unmatched expected: pengeluaran 12000 [bakmi] |
| hard-cod-shopee-phantom | ✓ | excellent | 100 | — |
| hard-indomaret-price-copy | ✓ | excellent | 100 | — |
| hard-gaji-cair-bca | ✓ | excellent | 100 | — |
| hard-td-zakat-4orang | ✓ | excellent | 38 | Alt strict layout accepted (merged qty, zakat total, admin fee, etc.); missing/unmatched expected: pengeluaran 45000 [zakat] |
| hard-voice-triple-correct | ✓ | excellent | 100 | — |
| hard-tf-admin-fee | ✓ | excellent | 100 | — |
| hard-infaq-donasi-mixed | ✓ | excellent | 100 | — |
| hard-curhat-tanpa-nominal | ✗ | misleading | 0 | expected bukan_transaksi=true; expected 0 entries, got 1 |
| hard-laptop-15-juta | ✓ | excellent | 100 | — |
| hard-patungan-warung | ✓ | excellent | 100 | — |
| hard-setoran-3-line | ✓ | excellent | 100 | — |

## Cross-model insights

- **hard-bakmi-qty-22**: 2/7 strict, avg composite 73
- **hard-cod-shopee-phantom**: 7/7 strict, avg composite 100
- **hard-indomaret-price-copy**: 7/7 strict, avg composite 100
- **hard-gaji-cair-bca**: 6/7 strict, avg composite 99
- **hard-td-zakat-4orang**: 7/7 strict, avg composite 47
- **hard-voice-triple-correct**: 7/7 strict, avg composite 100
- **hard-tf-admin-fee**: 7/7 strict, avg composite 94
- **hard-infaq-donasi-mixed**: 7/7 strict, avg composite 100
- **hard-curhat-tanpa-nominal**: 6/7 strict, avg composite 86
- **hard-laptop-15-juta**: 7/7 strict, avg composite 100
- **hard-patungan-warung**: 7/7 strict, avg composite 100
- **hard-setoran-3-line**: 5/7 strict, avg composite 85