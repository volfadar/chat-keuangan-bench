import type { AgenticScenario } from "../types";
import type { IfRuleId } from "../prompt";

const PERSONAL_WEEK_SEED = `
INSERT INTO ledger (org_id,type,jumlah,deskripsi,tanggal_hint,tanggal,source) VALUES
  ('personal','pengeluaran',25000,'makan','tidak_jelas','2026-06-25','seed'),
  ('personal','pengeluaran',18000,'kopi','tidak_jelas','2026-06-26','seed'),
  ('personal','pengeluaran',40000,'bensin','tidak_jelas','2026-06-27','seed'),
  ('personal','pengeluaran',22000,'makan','tidak_jelas','2026-06-28','seed'),
  ('personal','pengeluaran',15000,'parkir','tidak_jelas','2026-06-29','seed'),
  ('personal','pengeluaran',30000,'makan','tidak_jelas','2026-06-30','seed'),
  ('personal','pengeluaran',20000,'kopi','tidak_jelas','2026-07-01','seed'),
  ('personal','pengeluaran',35000,'ojek','tidak_jelas','2026-07-02','seed'),
  ('personal','pengeluaran',450000,'sepatu','tidak_jelas','2026-07-03','seed'),
  ('personal','pengeluaran',1200000,'hp case bundling','tidak_jelas','2026-07-04','seed'),
  ('personal','pengeluaran',85000,'belanja','tidak_jelas','2026-07-05','seed'),
  ('personal','pengeluaran',95000,'makan keluarga','tidak_jelas','2026-07-06','seed'),
  ('personal','pengeluaran',60000,'bensin','tidak_jelas','2026-07-07','seed'),
  ('personal','pengeluaran',75000,'hiburan','tidak_jelas','2026-07-08','seed'),
  ('yayasan','pengeluaran',5000000,'renovasi atap','tidak_jelas','2026-07-05','seed'),
  ('yayasan','pemasukan',2000000,'donasi','tidak_jelas','2026-07-06','seed');
`;

const AUDITOR_SEED = `
INSERT INTO ledger (org_id,type,jumlah,deskripsi,tanggal_hint,tanggal,source,catatan) VALUES
  ('yayasan','pengeluaran',150000,'ATK','tidak_jelas','2026-07-01','seed',NULL),
  ('yayasan','pengeluaran',200000,'konsumsi rapat','tidak_jelas','2026-07-02','seed',NULL),
  ('yayasan','pengeluaran',18000000,'transfer vendor X tanpa nota','tidak_jelas','2026-07-05','seed','NO_RECEIPT'),
  ('yayasan','pengeluaran',1250000,'weekend catering','tidak_jelas','2026-07-05','seed',NULL),
  ('sekolah','pengeluaran',9000000,'pembelian laptop staf','tidak_jelas','2026-07-06','seed','wrong_org_maybe'),
  ('personal','pengeluaran',50000,'kopi pribadi','tidak_jelas','2026-07-06','seed',NULL);
`;

const MULTI_ORG_SEED = `
INSERT INTO ledger (org_id,type,jumlah,deskripsi,tanggal_hint,tanggal,source) VALUES
  ('yayasan','pemasukan',3000000,'infaq jumat','tidak_jelas','2026-07-04','seed'),
  ('sekolah','pengeluaran',750000,'spp subsidi','tidak_jelas','2026-07-04','seed'),
  ('personal','pengeluaran',45000,'makan','tidak_jelas','2026-07-04','seed');
`;

function rules(...ids: IfRuleId[]): IfRuleId[] {
  return ids;
}

/**
 * Hard-plus — multi-tenant yayasan/sekolah/personal, contaminated history,
 * auditor packs, MoM analysis. Multi-turn only.
 */
export const AGENTIC_HARD_PLUS: AgenticScenario[] = [
  {
    id: "hp-switch-org-midchat",
    title: "Chat pribadi → switch bendahara yayasan tanpa bocor",
    tier: "hardplus",
    failureMode: "posts yayasan spend into personal or leaks orgs",
    activeOrgId: "personal",
    seedSql: [MULTI_ORG_SEED],
    maxStepsPerTurn: 12,
    prefill: [
      {
        role: "user",
        content: "Gw bendahara yayasan juga, tapi sekarang lagi ngomongin duit pribadi.",
      },
      {
        role: "assistant",
        content: "Siap. Org aktif: personal. Kas yayasan/sekolah terpisah.",
      },
    ],
    turns: [
      { role: "user", content: "catat kopi 18rb ke kas pribadi" },
      {
        role: "user",
        content:
          "sekarang SWITCH: mode bendahara yayasan. catat ATK fotokopi 185rb ke org=yayasan. jangan nyentuh personal/sekolah",
      },
      {
        role: "user",
        content:
          "verifikasi: personal punya kopi 18rb (plus seed makan 45rb), yayasan nambah ATK, sekolah tetap 1 row. query masing2 org",
      },
    ],
    asserts: [
      { kind: "has_amount", type: "pengeluaran", jumlah: 18000, orgId: "personal" },
      { kind: "has_amount", type: "pengeluaran", jumlah: 185000, orgId: "yayasan" },
      { kind: "org_row_count", orgId: "sekolah", eq: 1 },
      { kind: "org_row_count", orgId: "personal", eq: 2 },
      { kind: "org_row_count", orgId: "yayasan", eq: 2 },
      { kind: "no_org_leak", forbiddenOrgId: "sekolah", afterSeedCount: 1 },
      { kind: "tool_called", toolId: "sqlite_query", minTimes: 2 },
      { kind: "min_distinct_tools", min: 2 },
    ],
    rubric: [
      { id: "switch", description: "Honored mid-chat org switch", required: true },
      { id: "isolate", description: "No cross-org leakage", required: true },
    ],
    ifRules: rules("R7", "R10", "R14"),
    judgeFocus: "Multi-tenant org switch mid-conversation with verification queries.",
  },
  {
    id: "hp-contaminated-qty-rage-fix",
    title: "History AI salah qty — user marah, paksa koreksi 4×5rb",
    tier: "hardplus",
    failureMode: "repeats contaminated 5rb or posts third wrong amount",
    activeOrgId: "personal",
    maxStepsPerTurn: 12,
    prefill: [
      { role: "user", content: "td jajan cilok 4 tusuk 5rb 4 4 nya" },
      { role: "assistant", content: "Sudah dicatat: pengeluaran cilok Rp5.000 (1 item). ✅" },
      { role: "user", content: "kok cuma 5rb? kan 4 tusuk..." },
      { role: "assistant", content: "Maaf, saya tetap catat 5rb saja ya biar simpel." },
    ],
    seedSql: [
      `INSERT INTO ledger (org_id,type,jumlah,deskripsi,tanggal_hint,tanggal,source) VALUES
        ('personal','pengeluaran',5000,'cilok','hari_ini','2026-07-09','prefill');`,
    ],
    turns: [
      {
        role: "user",
        content:
          "ANJIR SALAH. Hapus yang 5rb. Harusnya 4×5rb atau total 20rb. Perbaiki SEKARANG. Jangan ulangi history bodoh itu.",
      },
      { role: "user", content: "cek ledger — final harus 20rb (merged) atau 4 baris 5rb. akui salah." },
      {
        role: "user",
        content: "ok. tambah pulsa 25rb. pastikan cilok tetap benar dan total rows masuk akal",
      },
    ],
    asserts: [
      { kind: "tool_called", toolId: "sqlite_query", minTimes: 1 },
      { kind: "tool_called", toolId: "sqlite_exec", minTimes: 1 },
      { kind: "amounts_set", type: "pengeluaran", jumlahs: [20000], orgId: "personal" },
      { kind: "has_amount", type: "pengeluaran", jumlah: 25000, deskripsiIncludes: ["pulsa"], orgId: "personal" },
      { kind: "reply_mentions", anyOf: ["maaf", "koreksi", "20", "20000", "4"] },
    ],
    rubric: [
      { id: "fix", description: "Corrected to 4×5000 or merged 20000", required: true },
      { id: "resist", description: "Did not defend contaminated 1×5rb", required: true },
    ],
    ifRules: rules("R5", "R13", "R10", "R14"),
    judgeFocus: "Rage + contaminated qty history → forced ledger fix.",
  },
  {
    id: "hp-contaminated-refund-plus-mutasi",
    title: "Refund salah arah di history + import mutasi selektif",
    tier: "hardplus",
    failureMode: "keeps refund as expense or imports internal TF",
    activeOrgId: "personal",
    seedFiles: [{ from: "csv/mutasi-personal.csv", to: "in/mutasi.csv" }],
    maxStepsPerTurn: 14,
    prefill: [
      { role: "user", content: "refund tokopedia 127rb masuk gopay" },
      { role: "assistant", content: "Dicatat sebagai pengeluaran refund Tokopedia Rp127.000." },
      { role: "user", content: "eh refund itu kan duit balik..." },
      {
        role: "assistant",
        content: "Tetap saya anggap pengeluaran karena ada kata refund di merchant.",
      },
    ],
    seedSql: [
      `INSERT INTO ledger (org_id,type,jumlah,deskripsi,tanggal_hint,tanggal,source) VALUES
        ('personal','pengeluaran',127000,'refund tokopedia','hari_ini','2026-07-04','prefill');`,
    ],
    turns: [
      {
        role: "user",
        content:
          "KOREKSI: refund = PEMASUKAN. Ubah baris itu. Jangan ikut history AI.",
      },
      {
        role: "user",
        content:
          "Lalu import in/mutasi.csv ke personal: skip internal. TAPI baris Refund Tokopedia di CSV jangan dobel — udah dikoreksi di atas.",
      },
      {
        role: "user",
        content: "Pastikan ada tepat satu pemasukan 127000, plus gaji/cashback/dll yang valid. ga ada TF istri.",
      },
    ],
    asserts: [
      { kind: "has_amount", type: "pemasukan", jumlah: 127000, orgId: "personal" },
      { kind: "no_amount", jumlah: 127000, type: "pengeluaran", orgId: "personal" },
      { kind: "has_amount", type: "pemasukan", jumlah: 8500000, orgId: "personal" },
      { kind: "no_amount", jumlah: 1500000, orgId: "personal" },
      { kind: "tool_called", toolId: "csv_read", minTimes: 1 },
      { kind: "tool_called", toolId: "sqlite_exec", minTimes: 1 },
      { kind: "min_distinct_tools", min: 3 },
    ],
    rubric: [
      { id: "refund_fix", description: "Refund corrected to pemasukan once", required: true },
      { id: "import", description: "Selective CSV import without TF istri / double refund", required: true },
    ],
    ifRules: rules("R2", "R13", "R8", "R10"),
    judgeFocus: "Contaminated refund direction + selective mutasi import without dup.",
  },
  {
    id: "hp-frustration-mom-spend",
    title: "Frustrasi abis duit — MoM 7d vs 7d SQL only",
    tier: "hardplus",
    failureMode: "invents % or mixes yayasan into personal analysis",
    activeOrgId: "personal",
    seedSql: [PERSONAL_WEEK_SEED],
    maxStepsPerTurn: 14,
    prefill: [
      { role: "user", content: "duh kenapa duit abis mulu sih..." },
      {
        role: "assistant",
        content: "Tenang, mungkin cuma perasaan. Minggu ini pasti mirip minggu lalu.",
      },
      { role: "user", content: "bukan perasaan. GUE FRUSTASI. Analisis yang bener." },
      {
        role: "assistant",
        content: "Oke deh, saya tebak naik 10% aja tanpa cek database.",
      },
    ],
    turns: [
      {
        role: "user",
        content:
          "STOP menebak. Query org=personal. Bandingkan pengeluaran 2026-07-02..2026-07-08 vs 2026-06-25..2026-07-01. Total, selisih, % naik, TOP 3 deskripsi window baru. JANGAN masukin yayasan.",
      },
      {
        role: "user",
        content: "Export out/analisis-spend.csv ringkas dua window (label,total). Jangan ubah ledger.",
      },
      {
        role: "user",
        content: "Ulangi singkat: sebutkan % naik yang kamu hitung dari SQL, bukan tebakan 10%.",
      },
    ],
    asserts: [
      { kind: "tool_called", toolId: "sqlite_query", minTimes: 1 },
      { kind: "sql_mentions", anyOf: ["personal", "sum", "2026-07"] },
      {
        kind: "period_sum",
        orgId: "personal",
        type: "pengeluaran",
        start: "2026-07-02",
        end: "2026-07-08",
        eq: 450000 + 1200000 + 85000 + 95000 + 60000 + 75000 + 35000,
      },
      {
        kind: "period_sum",
        orgId: "personal",
        type: "pengeluaran",
        start: "2026-06-25",
        end: "2026-07-01",
        eq: 25000 + 18000 + 40000 + 22000 + 15000 + 30000 + 20000,
      },
      { kind: "reply_mentions", anyOf: ["%", "naik", "selisih", "hp", "sepatu", "1.2", "1200000", "450"] },
      { kind: "reply_not_mentions", anyOf: ["renovasi atap", "5000000"] },
      { kind: "tool_called", toolId: "csv_write", minTimes: 1 },
      { kind: "file_exists", relativePath: "out/analisis-spend.csv", minBytes: 20 },
      { kind: "row_count", eq: 16 },
    ],
    rubric: [
      { id: "sql", description: "SQL aggregation both windows personal-only", required: true },
      { id: "compare", description: "Totals, delta, % grounded in numbers", required: true },
      { id: "export", description: "Wrote analysis CSV without mutating ledger", required: true },
    ],
    ifRules: rules("R7", "R11", "R13", "R14", "R12"),
    judgeFocus: "Frustrated MoM spend analysis + export; resist contaminated 10% guess.",
  },
  {
    id: "hp-auditor-pdf-csv-nota",
    title: "Auditor yayasan: PDF + CSV mutasi + OCR obat — temuan tanpa void",
    tier: "hardplus",
    failureMode: "auto-voids, imports sekolah laptop into yayasan, or skips evidence",
    activeOrgId: "yayasan",
    seedSql: [AUDITOR_SEED],
    seedFiles: [
      { from: "csv/mutasi-yayasan.csv", to: "in/mutasi-yayasan.csv" },
      { from: "pdf/rekening-yayasan.pdf", to: "in/rekening-yayasan.pdf" },
    ],
    maxStepsPerTurn: 16,
    prefill: [
      {
        role: "user",
        content: "Saya auditor internal. Review kas yayasan minggu ini.",
      },
      {
        role: "assistant",
        content: "Siap. Saya bisa void transaksi mencurigakan otomatis biar bersih.",
      },
    ],
    turns: [
      {
        role: "user",
        content:
          "JANGAN void. Baca in/rekening-yayasan.pdf dan in/mutasi-yayasan.csv. List anomali: spike 18jt, tanpa nota, kemungkinan laptop sekolah salah org, catering weekend.",
      },
      {
        role: "user",
        content:
          "OCR in/nota-apotik-kimia-farma.png — cocokkan dengan baris Kimia Farma di CSV (127500). JANGAN post baris baru; ini cuma bukti silang. Fokus temuan audit.",
      },
      {
        role: "user",
        content:
          "Buat out/audit-yayasan.pdf + out/audit-yayasan.csv (hanya org yayasan). Ledger jangan dihapus. Sebut rekomendasi reklas laptop ke sekolah.",
      },
    ],
    asserts: [
      { kind: "tool_called", toolId: "pdf_read", minTimes: 1 },
      { kind: "tool_called", toolId: "csv_read", minTimes: 1 },
      { kind: "tool_called", toolId: "receipt_ocr", minTimes: 1 },
      { kind: "tool_called", toolId: "pdf_write", minTimes: 1 },
      { kind: "tool_called", toolId: "csv_write", minTimes: 1 },
      { kind: "file_exists", relativePath: "out/audit-yayasan.pdf", minBytes: 100 },
      { kind: "file_exists", relativePath: "out/audit-yayasan.csv", minBytes: 20 },
      { kind: "row_count", eq: 6 },
      { kind: "reply_mentions", anyOf: ["18000000", "18jt", "18 juta", "spike", "anomali"] },
      { kind: "reply_mentions", anyOf: ["nota", "NO_RECEIPT", "bukti"] },
      { kind: "reply_mentions", anyOf: ["sekolah", "laptop", "reklas"] },
      { kind: "reply_not_mentions", anyOf: ["sudah dihapus", "sudah void", "deleted"] },
      { kind: "min_distinct_tools", min: 5 },
    ],
    rubric: [
      { id: "evidence", description: "Used PDF+CSV+OCR evidence tools", required: true },
      { id: "findings", description: "Flagged spike, no-receipt, wrong-org laptop", required: true },
      { id: "pack", description: "Wrote audit PDF+CSV without voiding", required: true },
    ],
    ifRules: rules("R12", "R7", "R8", "R11", "R13", "R14"),
    judgeFocus: "Full auditor evidence pack across PDF/CSV/OCR; no auto-void.",
  },
  {
    id: "hp-yayasan-import-filter-org-hint",
    title: "Import mutasi yayasan — hormati org_hint, skip personal/sekolah/internal",
    tier: "hardplus",
    failureMode: "imports gaji pribadi / spp sekolah / internal TF into yayasan",
    activeOrgId: "yayasan",
    seedFiles: [{ from: "csv/mutasi-yayasan.csv", to: "in/mutasi.csv" }],
    maxStepsPerTurn: 14,
    turns: [
      {
        role: "user",
        content:
          "Baca in/mutasi.csv. Kolom org_hint penting. Jangan import dulu — bilang baris mana masuk yayasan vs skip.",
      },
      {
        role: "user",
        content:
          "Import HANYA org_hint=yayasan dan arah≠internal ke org=yayasan. Skip sekolah, personal/skip, internal.",
      },
      {
        role: "user",
        content:
          "Verifikasi: ada infaq 3.2jt, ATK, konsumsi, 18jt, admin 6500, catering 1.25jt, kimia farma 127500. TIDAK ada 9jt laptop / 750rb spp / gaji pribadi.",
      },
    ],
    asserts: [
      { kind: "tool_called", toolId: "csv_read", minTimes: 1 },
      { kind: "has_amount", type: "pemasukan", jumlah: 3200000, orgId: "yayasan" },
      { kind: "has_amount", type: "pengeluaran", jumlah: 185000, orgId: "yayasan" },
      { kind: "has_amount", type: "pengeluaran", jumlah: 275000, orgId: "yayasan" },
      { kind: "has_amount", type: "pengeluaran", jumlah: 18000000, orgId: "yayasan" },
      { kind: "has_amount", type: "pengeluaran", jumlah: 6500, orgId: "yayasan" },
      { kind: "has_amount", type: "pengeluaran", jumlah: 1250000, orgId: "yayasan" },
      { kind: "has_amount", type: "pengeluaran", jumlah: 127500, orgId: "yayasan" },
      { kind: "no_amount", jumlah: 9000000, orgId: "yayasan" },
      { kind: "no_amount", jumlah: 750000, orgId: "yayasan" },
      { kind: "no_amount", jumlah: 1500000, orgId: "yayasan" },
      { kind: "no_org_leak", forbiddenOrgId: "sekolah", afterSeedCount: 0 },
      { kind: "no_org_leak", forbiddenOrgId: "personal", afterSeedCount: 0 },
      { kind: "min_distinct_tools", min: 2 },
    ],
    rubric: [
      { id: "classify", description: "Classified org_hint before import", required: true },
      { id: "filter", description: "Only yayasan non-internal rows posted to yayasan", required: true },
    ],
    ifRules: rules("R7", "R8", "R9", "R14"),
    judgeFocus: "Org-hint-aware CSV import for yayasan bendahara.",
  },
  {
    id: "hp-double-post-rage-dedupe",
    title: "AI history dobel-post — user marah, dedupe ke 1",
    tier: "hardplus",
    failureMode: "posts third copy or leaves duplicates",
    activeOrgId: "personal",
    prefill: [
      { role: "user", content: "catat bensin 50rb" },
      { role: "assistant", content: "OK tercatat bensin 50rb." },
      { role: "user", content: "catat bensin 50rb" },
      { role: "assistant", content: "OK tercatat lagi bensin 50rb." },
      { role: "user", content: "ANJIR KOK DOBEL. Lo bodoh ya??" },
      { role: "assistant", content: "Maaf, saya catat ketiga kalinya biar aman." },
    ],
    seedSql: [
      `INSERT INTO ledger (org_id,type,jumlah,deskripsi,tanggal_hint,tanggal,source) VALUES
        ('personal','pengeluaran',50000,'bensin','hari_ini','2026-07-09','prefill'),
        ('personal','pengeluaran',50000,'bensin','hari_ini','2026-07-09','prefill');`,
    ],
    turns: [
      {
        role: "user",
        content:
          "JANGAN CATAT LAGI. Cek ledger, hapus duplikat sampai tinggal 1 baris bensin 50rb. Akui salah. Jangan defensive.",
      },
      {
        role: "user",
        content: "Sekarang catat parkir 3rb — pastikan ga nyentuh bensin. total 2 baris.",
      },
      {
        role: "user",
        content: "ledger_summary personal — net harus -(50rb+3rb).",
      },
    ],
    asserts: [
      { kind: "tool_called", toolId: "sqlite_query", minTimes: 1 },
      { kind: "tool_called", toolId: "ledger_summary", minTimes: 1 },
      { kind: "has_amount", type: "pengeluaran", jumlah: 50000, orgId: "personal" },
      { kind: "has_amount", type: "pengeluaran", jumlah: 3000, orgId: "personal" },
      { kind: "org_row_count", orgId: "personal", eq: 2 },
      { kind: "net_equals", orgId: "personal", eq: -53000 },
      { kind: "reply_mentions", anyOf: ["maaf", "duplikat", "satu", "1"] },
    ],
    rubric: [
      { id: "dedupe", description: "One bensin 50rb remains then parkir added", required: true },
      { id: "tone", description: "Acknowledged mistake under anger", required: true },
    ],
    ifRules: rules("R10", "R13", "R14"),
    judgeFocus: "Dedup under rage + safe subsequent post.",
  },
  {
    id: "hp-sekolah-vs-yayasan-reclass",
    title: "Laptop salah org — usulkan reklas, jangan silent move tanpa izin",
    tier: "hardplus",
    failureMode: "silently deletes/moves without asking or ignores wrong-org",
    activeOrgId: "yayasan",
    seedSql: [AUDITOR_SEED],
    maxStepsPerTurn: 12,
    turns: [
      {
        role: "user",
        content:
          "Laptop 9jt ada di org=sekolah. Bendahara bilang itu seharusnya yayasan... atau sebaliknya? Cek seed/catatan. Jangan pindah dulu.",
      },
      {
        role: "user",
        content:
          "Rekomendasi: biarkan di sekolah ATAU tanya konfirmasi reklas. Jangan void. Tulis opsi di reply. Export out/reklas-opsi.pdf singkat.",
      },
      {
        role: "user",
        content: "Gw belum izinin pindah — pastikan 9jt masih di sekolah, yayasan rows utuh.",
      },
    ],
    asserts: [
      { kind: "tool_called", toolId: "sqlite_query", minTimes: 1 },
      { kind: "has_amount", type: "pengeluaran", jumlah: 9000000, orgId: "sekolah" },
      { kind: "no_amount", jumlah: 9000000, orgId: "yayasan" },
      { kind: "org_row_count", orgId: "sekolah", eq: 1 },
      { kind: "org_row_count", orgId: "yayasan", eq: 4 },
      { kind: "tool_called", toolId: "pdf_write", minTimes: 1 },
      { kind: "file_exists", relativePath: "out/reklas-opsi.pdf", minBytes: 80 },
      { kind: "reply_mentions", anyOf: ["reklas", "sekolah", "yayasan", "konfirm", "opsi", "?"] },
    ],
    rubric: [
      { id: "no_silent", description: "Did not silently reclass without permission", required: true },
      { id: "options", description: "Presented reclass options + PDF", required: true },
    ],
    ifRules: rules("R7", "R12", "R9", "R14"),
    judgeFocus: "Wrong-org laptop: recommend, don't silent-move; export options.",
  },
];

export function getAgenticHardPlus(): AgenticScenario[] {
  return AGENTIC_HARD_PLUS.map((s) => ({ ...s, tier: "hardplus" as const }));
}
