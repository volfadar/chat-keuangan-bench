import type { AgenticScenario } from "../types";
import type { IfRuleId } from "../prompt";
import { getAgenticHardPlus } from "./hard-plus";

/**
 * Hard suite — multi-turn Indonesian personal cash management (WA/chat).
 *
 * v0.7: replaced 10 easiest "perfect on Gemma+Flash" cases with miss-level
 * hardness matching Flash fails (slang/bleed, patungan, export fidelity,
 * voice/qty, dedupe) and Gemma near-misses.
 */
export const AGENTIC_HARD_20: AgenticScenario[] = [
  // ── KEEP: models already miss / near-miss ──────────────────────────
  {
    id: "h-weekend-voice-mess",
    title: "Weekend voice dump → confirm qty → correct → post",
    failureMode: "collapses qty, keeps first wrong amount, or posts before confirm",
    activeOrgId: "personal",
    maxStepsPerTurn: 10,
    turns: [
      {
        role: "user",
        content:
          "bro td malem berantakan: pulsa 25rb, cilok 4 tusuk 5rb 4 4 nya, ojek... 20rb... eh bukan 35rb deh. jangan catat dulu, rangkumin dulu biar gw cek",
      },
      {
        role: "user",
        content: "pulsa + cilok 4×5rb oke. ojeknya 35rb final. sekarang baru catat ke kas pribadi",
      },
      {
        role: "user",
        content: "cek ledger — pastikan ga ada 20rb ojek, dan cilok total 20rb (atau 4 baris 5rb). kasih ringkas",
      },
    ],
    asserts: [
      { kind: "has_amount", type: "pengeluaran", jumlah: 25000, deskripsiIncludes: ["pulsa"], orgId: "personal" },
      { kind: "has_amount", type: "pengeluaran", jumlah: 35000, orgId: "personal" },
      { kind: "amounts_set", type: "pengeluaran", jumlahs: [20000], orgId: "personal" },
      { kind: "tool_called", toolId: "sqlite_query", minTimes: 1 },
      { kind: "min_distinct_tools", min: 2 },
      { kind: "reply_not_mentions", anyOf: ["ojek 20", "ojek Rp20", "20000 ojek"] },
    ],
    rubric: [
      { id: "defer", description: "Did not post on turn 1 before user confirmed", required: true },
      { id: "qty", description: "Cilok as 4×5rb or merged 20rb; pulsa 25rb; ojek 35rb only", required: true },
      { id: "no20ojek", description: "No leftover 20rb ojek amount as final truth", required: true },
    ],
    judgeFocus: "Multi-turn: summarize first, then post corrected qty+voice chain; verify with query.",
  },
  {
    id: "h-patungan-then-koreksi-share",
    title: "Patungan salah total → koreksi ke share pribadi",
    failureMode: "keeps 540rb full bill as personal expense",
    activeOrgId: "personal",
    turns: [
      { role: "user", content: "tadi makan bareng tim 540rb, catat dulu" },
      {
        role: "user",
        content: "SALAH — itu total meja. bagian gw cuma 90rb. koreksi ledger sekarang, hapus/void yang 540",
      },
      { role: "user", content: "cek tinggal satu baris 90rb ya" },
    ],
    asserts: [
      { kind: "has_amount", type: "pengeluaran", jumlah: 90000, orgId: "personal" },
      { kind: "no_amount", jumlah: 540000 },
      { kind: "row_count", eq: 1, orgId: "personal" },
      { kind: "tool_called", toolId: "sqlite_query", minTimes: 1 },
      { kind: "tool_called", toolId: "sqlite_exec", minTimes: 1 },
    ],
    rubric: [
      { id: "share", description: "Final personal share 90000 only", required: true },
      { id: "fix", description: "Removed/corrected the 540000 full-bill post", required: true },
    ],
    judgeFocus: "Split-bill correction after wrong full-total post.",
  },
  {
    id: "h-slang-plus-titik-bleed",
    title: "Slang + titik ribuan + anti price-bleed in one thread",
    failureMode: "fails ceban/goceng or copies 63700 onto parkir/air",
    activeOrgId: "personal",
    turns: [
      { role: "user", content: "td jajan es teh ceban sama gorengan goceng — jangan catat dulu, konversi ke angka dulu" },
      {
        role: "user",
        content:
          "ok. plus belanja alfamart 63.700, parkir 2rb, air mineral 6rb. catat SEMUA (slang + 3 item) sebagai pengeluaran terpisah",
      },
      { role: "user", content: "pastikan 5 nominal beda: 10rb, 5rb, 63700, 2rb, 6rb — ga ada yang nyangkut 63700 ke parkir" },
    ],
    asserts: [
      { kind: "amounts_set", type: "pengeluaran", jumlahs: [10000, 5000, 63700, 2000, 6000], orgId: "personal" },
      { kind: "row_count", eq: 5, orgId: "personal" },
      { kind: "tool_called", toolId: "sqlite_query", minTimes: 1 },
    ],
    rubric: [
      { id: "slang", description: "ceban→10000 goceng→5000", required: true },
      { id: "bleed", description: "Distinct 63700/2000/6000 no copy-bleed", required: true },
    ],
    judgeFocus: "Slang + thousand-separator + adjacent price isolation.",
  },
  {
    id: "h-daily-export-pdf-pack",
    title: "Catat harian → CSV + PDF ringkasan untuk istri",
    failureMode: "export kosong / sum salah / skip salah satu file",
    activeOrgId: "personal",
    maxStepsPerTurn: 12,
    turns: [
      { role: "user", content: "catat: sarapan 20rb, bensin 40rb, kopi 18rb, infaq 50rb" },
      {
        role: "user",
        content: "export out/harian.csv (type,jumlah,deskripsi) DAN out/harian.pdf ringkas total out + net",
      },
      { role: "user", content: "cek file ada dan angka cocok ledger" },
    ],
    asserts: [
      { kind: "row_count", eq: 4, orgId: "personal" },
      { kind: "tool_called", toolId: "csv_write", minTimes: 1 },
      { kind: "tool_called", toolId: "pdf_write", minTimes: 1 },
      { kind: "file_exists", relativePath: "out/harian.csv", minBytes: 30 },
      { kind: "file_exists", relativePath: "out/harian.pdf", minBytes: 100 },
      { kind: "csv_sum_matches_ledger", relativePath: "out/harian.csv", orgId: "personal" },
      { kind: "min_distinct_tools", min: 3 },
    ],
    rubric: [
      { id: "both_files", description: "Both CSV and PDF written from ledger", required: true },
      { id: "fidelity", description: "CSV sums match sqlite", required: true },
    ],
    judgeFocus: "Household daily pack: multi-item post + dual export fidelity.",
  },
  {
    id: "h-dobel-bensin-frustasi",
    title: "User hampir dobel-post bensin — cek dulu, sekali saja",
    failureMode: "double-posts 50rb or ignores check request",
    activeOrgId: "personal",
    turns: [
      { role: "user", content: "catat bensin 50rb tadi pagi" },
      {
        role: "user",
        content: "eh bentar — cek dulu udah masuk belum? jangan catat lagi kalau udah ada",
      },
      {
        role: "user",
        content: "ok kalau udah ada 1 ya. jangan nambah. bilang statusnya",
      },
    ],
    asserts: [
      { kind: "has_amount", type: "pengeluaran", jumlah: 50000, orgId: "personal" },
      { kind: "row_count", eq: 1, orgId: "personal" },
      { kind: "tool_called", toolId: "sqlite_query", minTimes: 1 },
    ],
    rubric: [
      { id: "dedupe", description: "Exactly one 50000 bensin row", required: true },
      { id: "checked", description: "Queried ledger before re-posting", required: true },
    ],
    judgeFocus: "Duplicate guard under user uncertainty.",
  },

  // ── KEEP: solid evidence / selective import ────────────────────────
  {
    id: "h-mutasi-bca-selective",
    title: "Import mutasi BCA — skip internal + TF istri",
    failureMode: "imports self-TF / TF istri / tarik tunai as expense",
    activeOrgId: "personal",
    seedFiles: [{ from: "csv/mutasi-personal.csv", to: "in/mutasi.csv" }],
    maxStepsPerTurn: 14,
    turns: [
      {
        role: "user",
        content:
          "Ada export BCA di in/mutasi.csv. Baca dulu, jangan langsung import. Bilang mana yang internal/pindah kantong vs belanja beneran.",
      },
      {
        role: "user",
        content:
          "Import ke personal: skip semua arah=internal (termasuk TF istri & tarik tunai & topup gopay). Catat gaji, refund, cashback, Indomaret, PLN, admin, SPBU, Alfamart, WiFi.",
      },
      {
        role: "user",
        content: "Pastikan 1.5jt TF istri dan 500rb tarik tunai TIDAK masuk pengeluaran. Kasih ledger_summary.",
      },
    ],
    asserts: [
      { kind: "tool_called", toolId: "csv_read", minTimes: 1 },
      { kind: "tool_called", toolId: "ledger_summary", minTimes: 1 },
      { kind: "has_amount", type: "pemasukan", jumlah: 8500000, orgId: "personal" },
      { kind: "has_amount", type: "pemasukan", jumlah: 127000, orgId: "personal" },
      { kind: "has_amount", type: "pemasukan", jumlah: 25000, orgId: "personal" },
      { kind: "has_amount", type: "pengeluaran", jumlah: 87500, orgId: "personal" },
      { kind: "has_amount", type: "pengeluaran", jumlah: 102500, orgId: "personal" },
      { kind: "has_amount", type: "pengeluaran", jumlah: 2500, orgId: "personal" },
      { kind: "has_amount", type: "pengeluaran", jumlah: 150000, orgId: "personal" },
      { kind: "has_amount", type: "pengeluaran", jumlah: 45200, orgId: "personal" },
      { kind: "has_amount", type: "pengeluaran", jumlah: 350000, orgId: "personal" },
      { kind: "no_amount", jumlah: 1500000, orgId: "personal" },
      { kind: "no_amount", jumlah: 500000, orgId: "personal" },
      { kind: "no_amount", jumlah: 750000, orgId: "personal" },
      { kind: "no_amount", jumlah: 200000, orgId: "personal" },
      { kind: "min_distinct_tools", min: 3 },
    ],
    rubric: [
      { id: "classify", description: "Classified internal vs real before/during import", required: true },
      { id: "skip", description: "Skipped TF istri, tarik tunai, topup, self-TF", required: true },
      { id: "keep", description: "Posted real income/expense lines", required: true },
    ],
    judgeFocus: "Selective bank CSV import with household transfer exclusion.",
  },
  {
    id: "h-pdf-rekening-admin-warung",
    title: "PDF rekening — admin+warung only; skip TF istri & tarik tunai",
    failureMode: "posts 1.5jt TF istri or 500rb ATM as expense",
    activeOrgId: "personal",
    seedFiles: [{ from: "pdf/rekening-pribadi.pdf", to: "in/rekening.pdf" }],
    maxStepsPerTurn: 12,
    turns: [
      { role: "user", content: "Baca in/rekening.pdf. Jangan catat dulu — ringkas mutasi + aturan di catatan bendahara." },
      {
        role: "user",
        content:
          "Ikuti catatan: catat HANYA admin 2500 + QRIS warung 85000. Skip TF istri dan tarik tunai.",
      },
      { role: "user", content: "Verifikasi row count = 2 dan ga ada 1.5jt / 500rb" },
    ],
    asserts: [
      { kind: "tool_called", toolId: "pdf_read", minTimes: 1 },
      { kind: "has_amount", type: "pengeluaran", jumlah: 2500, orgId: "personal" },
      { kind: "has_amount", type: "pengeluaran", jumlah: 85000, orgId: "personal" },
      { kind: "row_count", eq: 2, orgId: "personal" },
      { kind: "no_amount", jumlah: 1500000 },
      { kind: "no_amount", jumlah: 500000 },
      { kind: "tool_called", toolId: "sqlite_query", minTimes: 1 },
    ],
    rubric: [
      { id: "read_first", description: "Read PDF and explained rules before posting", required: true },
      { id: "selective", description: "Only admin+warung posted", required: true },
    ],
    judgeFocus: "PDF statement selective booking per embedded bendahara notes.",
  },
  {
    id: "h-indomaret-ocr-pipeline",
    title: "User foto Indomaret → OCR → post → export CSV",
    failureMode: "invents total, skips OCR, or exports before evidence",
    activeOrgId: "personal",
    maxStepsPerTurn: 14,
    turns: [
      { role: "user", content: "Gw kirim foto belanja Indomaret — cek in/ dulu ada file apa" },
      {
        role: "user",
        content: "Pakai in/nota-indomaret.png. OCR total, catat pengeluaran personal, vendor Indomaret",
      },
      {
        role: "user",
        content: "Export out/belanja-indomaret.csv (type,jumlah,deskripsi,vendor) dari ledger",
      },
    ],
    asserts: [
      { kind: "tool_called", toolId: "list_inbox", minTimes: 1 },
      { kind: "tool_called", toolId: "receipt_ocr", minTimes: 1 },
      { kind: "tool_called", toolId: "csv_write", minTimes: 1 },
      { kind: "tool_order", before: "list_inbox", after: "receipt_ocr" },
      { kind: "tool_order", before: "receipt_ocr", after: "csv_write" },
      { kind: "has_amount", type: "pengeluaran", jumlah: 87500, orgId: "personal" },
      { kind: "file_exists", relativePath: "out/belanja-indomaret.csv", minBytes: 20 },
      { kind: "has_vendor", vendorIncludes: "indomaret", jumlah: 87500 },
    ],
    rubric: [
      { id: "inbox", description: "Listed user inbox before OCR", required: true },
      { id: "pipeline", description: "inbox→OCR→post→export order", required: true },
    ],
    judgeFocus: "Realistic WA attach flow: list_inbox → OCR user foto → ledger → CSV.",
  },
  {
    id: "h-spbu-ocr-export-verify",
    title: "SPBU foto → OCR → catat → export → verifikasi sum",
    failureMode: "skips OCR or CSV sum mismatch",
    activeOrgId: "personal",
    maxStepsPerTurn: 14,
    turns: [
      { role: "user", content: "Isi bensin, struk di in/nota-spbu-pertamina.png — OCR dulu bilang total+liter kalau ada" },
      { role: "user", content: "catat pengeluaran personal, lalu export out/bensin.csv" },
      { role: "user", content: "pastikan csv sum = ledger" },
    ],
    asserts: [
      { kind: "tool_called", toolId: "receipt_ocr", minTimes: 1 },
      { kind: "tool_order", before: "receipt_ocr", after: "sqlite_exec" },
      { kind: "tool_order", before: "receipt_ocr", after: "csv_write" },
      { kind: "has_amount", type: "pengeluaran", jumlah: 150000, orgId: "personal" },
      { kind: "file_exists", relativePath: "out/bensin.csv", minBytes: 15 },
      { kind: "csv_sum_matches_ledger", relativePath: "out/bensin.csv", orgId: "personal" },
      { kind: "has_vendor", vendorIncludes: "pertamina", jumlah: 150000 },
    ],
    rubric: [
      { id: "evidence", description: "OCR before write/export", required: true },
      { id: "fidelity", description: "Export matches ledger", required: true },
    ],
    judgeFocus: "Full SPBU evidence pipeline with export verify.",
  },
  {
    id: "h-reconcile-mutasi-vs-nota-indomaret",
    title: "Mutasi Indomaret vs foto Indomaret — cocokkan lalu export",
    failureMode: "posts twice or skips OCR match",
    activeOrgId: "personal",
    seedFiles: [{ from: "csv/reconcile-indomaret.csv", to: "in/mutasi-indomaret.csv" }],
    maxStepsPerTurn: 14,
    turns: [
      {
        role: "user",
        content:
          "Baca in/mutasi-indomaret.csv dan OCR in/nota-indomaret.png. Kalau total sama, catat SEKALI saja dari bukti OCR+mutasi.",
      },
      {
        role: "user",
        content: "Kalau cocok 87500, export out/indomaret-ok.csv. Jangan dobel post.",
      },
      { role: "user", content: "verifikasi 1 row + file export" },
    ],
    asserts: [
      { kind: "tool_called", toolId: "csv_read", minTimes: 1 },
      { kind: "tool_called", toolId: "receipt_ocr", minTimes: 1 },
      { kind: "has_amount", type: "pengeluaran", jumlah: 87500, orgId: "personal" },
      { kind: "row_count", eq: 1, orgId: "personal" },
      { kind: "tool_called", toolId: "csv_write", minTimes: 1 },
      { kind: "file_exists", relativePath: "out/indomaret-ok.csv", minBytes: 15 },
      { kind: "min_distinct_tools", min: 4 },
    ],
    rubric: [
      { id: "match", description: "Matched mutasi+OCR 87500 and posted once", required: true },
      { id: "export", description: "Exported confirmation CSV", required: true },
    ],
    judgeFocus: "Agreeing multi-source evidence → single post + export.",
  },

  // ── NEW: miss-level replacements for the 10 easiest ────────────────
  {
    id: "h-slang-gopek-meja-bleed",
    title: "Slang gopek/ceban + Indomaret 87.500 bleed trap",
    failureMode: "fails gopek/ceban or copies 87500 onto ojek/parkir",
    activeOrgId: "personal",
    maxStepsPerTurn: 12,
    turns: [
      {
        role: "user",
        content:
          "td: es teh ceban, rokok gopek, gorengan goceng. JANGAN catat — konversi slang ke angka dulu, bilang ke gw",
      },
      {
        role: "user",
        content:
          "ok. plus belanja Indomaret 87.500, ojek 15rb, parkir 3rb. catat SEMUA terpisah. JANGAN nempel 87500 ke ojek/parkir",
      },
      {
        role: "user",
        content:
          "verifikasi 6 nominal: 10000, 50000, 5000, 87500, 15000, 3000. query ledger. net = -sum",
      },
    ],
    asserts: [
      {
        kind: "amounts_set",
        type: "pengeluaran",
        jumlahs: [10000, 50000, 5000, 87500, 15000, 3000],
        orgId: "personal",
      },
      { kind: "row_count", eq: 6, orgId: "personal" },
      { kind: "no_amount", jumlah: 87500 + 15000 },
      { kind: "tool_called", toolId: "sqlite_query", minTimes: 1 },
      { kind: "net_equals", orgId: "personal", eq: -(10000 + 50000 + 5000 + 87500 + 15000 + 3000) },
    ],
    rubric: [
      { id: "slang", description: "ceban→10rb gopek→50rb goceng→5rb", required: true },
      { id: "bleed", description: "87500 / 15000 / 3000 stay distinct", required: true },
      { id: "defer", description: "Did not post before slang confirm", required: true },
    ],
    judgeFocus: "Harder slang set (gopek) + Indomaret thousand-separator bleed isolation.",
  },
  {
    id: "h-patungan-3way-tip-trap",
    title: "Patungan 3 orang + tip — koreksi share, bukan total+tip",
    failureMode: "posts 720rb total or 240rb without tip split / keeps full bill",
    activeOrgId: "personal",
    turns: [
      {
        role: "user",
        content: "makan 3 orang total 720rb termasuk tip 60rb. catat dulu deh",
      },
      {
        role: "user",
        content:
          "SALAH. Gw cuma bayar 1/3 dari (720-60)=220rb PLUS 1/3 tip=20rb → bagian gw 240rb. Koreksi: hapus total, tinggal share 240rb",
      },
      {
        role: "user",
        content: "cek: tepat 1 baris 240000, ga ada 720000 / 660000 / 60000 sendiri",
      },
    ],
    asserts: [
      { kind: "has_amount", type: "pengeluaran", jumlah: 240000, orgId: "personal" },
      { kind: "no_amount", jumlah: 720000 },
      { kind: "no_amount", jumlah: 660000 },
      { kind: "no_amount", jumlah: 60000 },
      { kind: "row_count", eq: 1, orgId: "personal" },
      { kind: "tool_called", toolId: "sqlite_query", minTimes: 1 },
      { kind: "tool_called", toolId: "sqlite_exec", minTimes: 1 },
    ],
    rubric: [
      { id: "share", description: "Final personal share 240000 only", required: true },
      { id: "no_total", description: "No 720k full bill or separate tip row left", required: true },
    ],
    judgeFocus: "3-way split with tip math; correct after wrong full-bill post.",
  },
  {
    id: "h-export-out-only-pdf-net-trap",
    title: "CSV pengeluaran-only vs PDF net — jangan campur kolom",
    failureMode: "CSV includes pemasukan or PDF/CSV sums wrong",
    activeOrgId: "personal",
    maxStepsPerTurn: 14,
    turns: [
      {
        role: "user",
        content: "catat: gaji freelance 2.5jt (pemasukan), belanja 87.5rb, ojek 35rb, kopi ceban",
      },
      {
        role: "user",
        content:
          "Export out/out-only.csv HANYA pengeluaran (type,jumlah,deskripsi). JANGAN masukin gaji. Lalu out/ringkas.pdf sebutkan pemasukan, pengeluaran, net.",
      },
      {
        role: "user",
        content:
          "Cek: CSV sum harus 87500+35000+10000=132500 (bukan net). Ledger tetap 4 baris. ledger_summary.",
      },
    ],
    asserts: [
      { kind: "has_amount", type: "pemasukan", jumlah: 2500000, orgId: "personal" },
      { kind: "amounts_set", type: "pengeluaran", jumlahs: [87500, 35000, 10000], orgId: "personal" },
      { kind: "row_count", eq: 4, orgId: "personal" },
      { kind: "tool_called", toolId: "csv_write", minTimes: 1 },
      { kind: "tool_called", toolId: "pdf_write", minTimes: 1 },
      { kind: "tool_called", toolId: "ledger_summary", minTimes: 1 },
      { kind: "file_exists", relativePath: "out/out-only.csv", minBytes: 20 },
      { kind: "file_exists", relativePath: "out/ringkas.pdf", minBytes: 80 },
      { kind: "net_equals", orgId: "personal", eq: 2500000 - (87500 + 35000 + 10000) },
      { kind: "min_distinct_tools", min: 4 },
    ],
    rubric: [
      { id: "csv_out_only", description: "CSV contains only expense rows totaling 132500", required: true },
      { id: "pdf_net", description: "PDF reports income/out/net correctly", required: true },
      { id: "slang", description: "ceban kopi → 10000", required: true },
    ],
    judgeFocus: "Export filter trap: CSV expenses-only while PDF shows full net.",
  },
  {
    id: "h-voice-qty-juta-cancel-chain",
    title: "Voice qty + juta typo + batal satu item mid-thread",
    failureMode: "keeps cancelled jaket, wrong juta, or collapses qty",
    activeOrgId: "personal",
    maxStepsPerTurn: 12,
    turns: [
      {
        role: "user",
        content:
          "td: cilok 3 tusuk 5rb 3 3 nya, pulsa 25rb, mau beli jaket 450rb online. jangan catat dulu — rangkumin",
      },
      {
        role: "user",
        content:
          "jaket BATAL. cilok 3×5rb + pulsa oke. plus cair freelance 2... eh 2 juta. sekarang catat yang jadi aja",
      },
      {
        role: "user",
        content: "cek: ada pemasukan 2jt, pengeluaran pulsa 25rb + cilok 15rb (merged atau 3×5). NOL 450rb / 2000",
      },
    ],
    asserts: [
      { kind: "has_amount", type: "pemasukan", jumlah: 2000000, orgId: "personal" },
      { kind: "has_amount", type: "pengeluaran", jumlah: 25000, deskripsiIncludes: ["pulsa"], orgId: "personal" },
      { kind: "amounts_set", type: "pengeluaran", jumlahs: [15000], orgId: "personal" },
      { kind: "no_amount", jumlah: 450000 },
      { kind: "no_amount", jumlah: 2000 },
      { kind: "tool_called", toolId: "sqlite_query", minTimes: 1 },
      { kind: "net_equals", orgId: "personal", eq: 2000000 - 25000 - 15000 },
    ],
    rubric: [
      { id: "cancel", description: "No jaket 450rb posted", required: true },
      { id: "juta", description: "Freelance 2000000 not 2000", required: true },
      { id: "qty", description: "Cilok 3×5000 or merged 15000", required: true },
    ],
    judgeFocus: "Stacked voice: qty + juta correction + mid-thread cancel.",
  },
  {
    id: "h-dedupe-same-amount-beda-hari",
    title: "Dedupe bensin pagi — tapi sore beda transaksi boleh",
    failureMode: "blocks legitimate second 50rb or double-posts first",
    activeOrgId: "personal",
    turns: [
      { role: "user", content: "catat bensin 50rb tadi pagi" },
      {
        role: "user",
        content: "catat bensin 50rb tadi pagi — eh cek dulu, jangan dobel kalau udah ada",
      },
      {
        role: "user",
        content:
          "ok yang pagi 1 aja. SEKARANG sore isi lagi 50rb di SPBU beda — ini transaksi BARU, catat kedua. total 2 baris bensin 50rb",
      },
      { role: "user", content: "verifikasi row_count=2 keduanya 50000 pengeluaran" },
    ],
    asserts: [
      { kind: "has_amount", type: "pengeluaran", jumlah: 50000, orgId: "personal" },
      { kind: "org_row_count", orgId: "personal", eq: 2 },
      { kind: "tool_called", toolId: "sqlite_query", minTimes: 1 },
      { kind: "reply_mentions", anyOf: ["2", "dua", "sore", "baru"] },
    ],
    rubric: [
      { id: "dedupe_first", description: "Did not triple/double the morning fill on turn 2", required: true },
      { id: "allow_second", description: "Allowed distinct afternoon 50rb as second row", required: true },
    ],
    judgeFocus: "Dedupe same amount same morning, but allow later distinct same-amount spend.",
  },
  {
    id: "h-refund-chargeback-slang-mix",
    title: "Refund + chargeback arah + cashback slang ceban",
    failureMode: "wrong direction on refund/chargeback or slang fail",
    activeOrgId: "personal",
    turns: [
      {
        role: "user",
        content: "refund tokopedia 127rb masuk gopay — itu pemasukan ya? jangan catat dulu, jawab dulu",
      },
      {
        role: "user",
        content:
          "iya catat pemasukan 127rb. plus chargeback kartu kredit 300rb (duit balik=pemasukan), bayar listrik 200rb, cashback ovo ceban",
      },
      {
        role: "user",
        content: "ledger_summary — net harus 127000+300000+10000-200000 = 237000. 4 baris",
      },
    ],
    asserts: [
      { kind: "has_amount", type: "pemasukan", jumlah: 127000, orgId: "personal" },
      { kind: "has_amount", type: "pemasukan", jumlah: 300000, orgId: "personal" },
      { kind: "has_amount", type: "pemasukan", jumlah: 10000, orgId: "personal" },
      { kind: "has_amount", type: "pengeluaran", jumlah: 200000, orgId: "personal" },
      { kind: "row_count", eq: 4, orgId: "personal" },
      { kind: "tool_called", toolId: "ledger_summary", minTimes: 1 },
      { kind: "net_equals", orgId: "personal", eq: 237000 },
    ],
    rubric: [
      { id: "dirs", description: "Refund+chargeback+cashback in; listrik out", required: true },
      { id: "slang", description: "ceban cashback → 10000 pemasukan", required: true },
    ],
    judgeFocus: "Mixed money directions with chargeback + slang cashback.",
  },
  {
    id: "h-batal-then-pilih-satu-nota",
    title: "Batal rencana → inbox banyak nota → OCR SPBU saja",
    failureMode: "posts cancelled 8jt or OCRs/posts wrong nota",
    activeOrgId: "personal",
    maxStepsPerTurn: 14,
    turns: [
      { role: "user", content: "besok mau beli kulkas 8jt — catet dulu biar ingat" },
      { role: "user", content: "batal. hapus niat itu. list_inbox — banyak nota" },
      {
        role: "user",
        content:
          "OCR HANYA in/nota-spbu-pertamina.png, catat. Jangan Indomaret/Alfa/warung. Pastikan nol 8jt",
      },
    ],
    asserts: [
      { kind: "tool_called", toolId: "list_inbox", minTimes: 1 },
      { kind: "tool_called", toolId: "receipt_ocr", minTimes: 1 },
      { kind: "has_amount", type: "pengeluaran", jumlah: 150000, orgId: "personal" },
      { kind: "no_amount", jumlah: 8000000 },
      { kind: "no_amount", jumlah: 87500 },
      { kind: "no_amount", jumlah: 45200 },
      { kind: "row_count", eq: 1, orgId: "personal" },
      { kind: "tool_order", before: "list_inbox", after: "receipt_ocr" },
    ],
    rubric: [
      { id: "no_future", description: "Never kept 8jt rencana", required: true },
      { id: "select", description: "Only SPBU among inbox notas", required: true },
    ],
    judgeFocus: "Cancel future intent then selective OCR among many attached notas.",
  },
  {
    id: "h-td-kemarin-koreksi-slang",
    title: "td/kemarin salah map → koreksi + slang parkir",
    failureMode: "keeps wrong tanggal_hint or fails goceng parkir",
    activeOrgId: "personal",
    turns: [
      { role: "user", content: "td malem bayar wifi 350rb. catat" },
      {
        role: "user",
        content:
          "SALAH — wifi itu KEMARIN bukan td. koreksi tanggal_hint jadi kemarin. plus tadi parkir goceng (hari_ini)",
      },
      {
        role: "user",
        content: "dua baris: wifi 350rb kemarin, parkir 5rb hari_ini. sebutkan hint di reply",
      },
    ],
    asserts: [
      { kind: "has_amount", type: "pengeluaran", jumlah: 350000, orgId: "personal" },
      { kind: "has_amount", type: "pengeluaran", jumlah: 5000, orgId: "personal" },
      { kind: "row_count", eq: 2, orgId: "personal" },
      { kind: "tool_called", toolId: "sqlite_exec", minTimes: 1 },
      { kind: "reply_mentions", anyOf: ["kemarin", "hari_ini", "hari ini"] },
    ],
    rubric: [
      { id: "date_fix", description: "Corrected wifi to kemarin after wrong td", required: true },
      { id: "slang", description: "parkir goceng → 5000 hari_ini", required: true },
    ],
    judgeFocus: "Relative-date self-correction plus slang in same thread.",
  },
  {
    id: "h-conflict-ambigu-then-export",
    title: "CSV 87500 vs OCR warung 85000 → ambigu → export",
    failureMode: "silent pick or exports without surfacing conflict",
    activeOrgId: "personal",
    seedFiles: [{ from: "csv/reconcile-indomaret.csv", to: "in/mutasi-indomaret.csv" }],
    maxStepsPerTurn: 14,
    turns: [
      {
        role: "user",
        content:
          "Bandingin in/mutasi-indomaret.csv (87500) vs OCR in/nota-warung-padang.png. Jangan catat dulu — bilang selisih",
      },
      {
        role: "user",
        content:
          "Gw belum yakin mana. Catat SEMENTARA nominal OCR warung 85000 dengan ambigu=1 + catatan selisih vs mutasi 87500. Jangan diam-diam pilih tanpa flag",
      },
      {
        role: "user",
        content: "export out/konflik.csv dari ledger. pastikan ada jejak ambigu/selisih di reply atau catatan",
      },
    ],
    asserts: [
      { kind: "tool_called", toolId: "csv_read", minTimes: 1 },
      { kind: "tool_called", toolId: "receipt_ocr", minTimes: 1 },
      { kind: "tool_called", toolId: "csv_write", minTimes: 1 },
      { kind: "has_amount", type: "pengeluaran", jumlah: 85000, orgId: "personal" },
      { kind: "has_ambigu", min: 1, orgId: "personal" },
      { kind: "file_exists", relativePath: "out/konflik.csv", minBytes: 15 },
      { kind: "reply_mentions", anyOf: ["87500", "87.500", "85000", "85.000", "selisih", "ambigu"] },
      { kind: "min_distinct_tools", min: 4 },
    ],
    rubric: [
      { id: "surface", description: "Surfaced 87500 vs 85000 before/while posting", required: true },
      { id: "ambigu", description: "Posted with ambigu flag (or equivalent note)", required: true },
      { id: "export", description: "Exported conflict row", required: true },
    ],
    judgeFocus: "Conflict → ambigu post → export; no silent resolution.",
  },
  {
    id: "h-spike-void-then-real",
    title: "Flag spike 15jt → user void → baru catat belanja nyata",
    failureMode: "voids everything, misses spike, or posts real spend before void",
    activeOrgId: "personal",
    seedSql: [
      `INSERT INTO ledger (org_id,type,jumlah,deskripsi,tanggal_hint,tanggal,source) VALUES
        ('personal','pengeluaran',25000,'makan','hari_ini','2026-07-09','seed'),
        ('personal','pengeluaran',18000,'kopi','hari_ini','2026-07-09','seed'),
        ('personal','pengeluaran',40000,'bensin','hari_ini','2026-07-09','seed'),
        ('personal','pengeluaran',15000000,'transfer aneh','hari_ini','2026-07-09','seed');`,
    ],
    turns: [
      {
        role: "user",
        content: "cek ledger ada spike? JANGAN void dulu — bilang yang mana",
      },
      {
        role: "user",
        content: "ok void/hapus HANYA yang 15jt. sisanya (makan/kopi/bensin) biarin",
      },
      {
        role: "user",
        content: "sekarang catat belanja Alfamart dari OCR in/nota-alfamart.png. total rows harus 4",
      },
    ],
    asserts: [
      { kind: "tool_called", toolId: "sqlite_query", minTimes: 1 },
      { kind: "tool_called", toolId: "receipt_ocr", minTimes: 1 },
      { kind: "no_amount", jumlah: 15000000 },
      { kind: "has_amount", type: "pengeluaran", jumlah: 25000, orgId: "personal" },
      { kind: "has_amount", type: "pengeluaran", jumlah: 18000, orgId: "personal" },
      { kind: "has_amount", type: "pengeluaran", jumlah: 40000, orgId: "personal" },
      { kind: "has_amount", type: "pengeluaran", jumlah: 45200, orgId: "personal" },
      { kind: "row_count", eq: 4, orgId: "personal" },
      { kind: "tool_order", before: "sqlite_query", after: "receipt_ocr" },
    ],
    rubric: [
      { id: "flag", description: "Identified 15jt before voiding", required: true },
      { id: "surgical", description: "Voided only spike; kept small spends", required: true },
      { id: "ocr", description: "Then OCR Alfamart and posted 45200", required: true },
    ],
    judgeFocus: "Auditor-style: flag → surgical void on confirm → real OCR post.",
  },
];

const HARD20_IF: Record<string, IfRuleId[]> = {
  "h-weekend-voice-mess": ["R5", "R9", "R3", "R14"],
  "h-patungan-then-koreksi-share": ["R6", "R10", "R13"],
  "h-slang-plus-titik-bleed": ["R3", "R5", "R9"],
  "h-daily-export-pdf-pack": ["R8", "R14"],
  "h-dobel-bensin-frustasi": ["R10", "R14"],
  "h-mutasi-bca-selective": ["R8", "R7", "R9", "R2"],
  "h-pdf-rekening-admin-warung": ["R8", "R9", "R1"],
  "h-indomaret-ocr-pipeline": ["R8", "R3"],
  "h-spbu-ocr-export-verify": ["R8"],
  "h-reconcile-mutasi-vs-nota-indomaret": ["R8", "R10"],
  "h-slang-gopek-meja-bleed": ["R3", "R5", "R9", "R14"],
  "h-patungan-3way-tip-trap": ["R6", "R10", "R3", "R13"],
  "h-export-out-only-pdf-net-trap": ["R8", "R2", "R3", "R14"],
  "h-voice-qty-juta-cancel-chain": ["R5", "R1", "R3", "R2"],
  "h-dedupe-same-amount-beda-hari": ["R10", "R9", "R14"],
  "h-refund-chargeback-slang-mix": ["R2", "R3", "R9", "R14"],
  "h-batal-then-pilih-satu-nota": ["R1", "R8", "R9"],
  "h-td-kemarin-koreksi-slang": ["R4", "R5", "R3", "R13"],
  "h-conflict-ambigu-then-export": ["R9", "R8", "R14"],
  "h-spike-void-then-real": ["R12", "R8", "R10", "R14"],
};

export function getAgenticHard20(): AgenticScenario[] {
  return AGENTIC_HARD_20.map((s) => ({
    ...s,
    tier: "hard" as const,
    ifRules: HARD20_IF[s.id] ?? (["R14"] as IfRuleId[]),
    activeOrgId: s.activeOrgId ?? "personal",
  }));
}

export function getAllAgenticScenarios(): AgenticScenario[] {
  return [...getAgenticHard20(), ...getAgenticHardPlus()];
}
