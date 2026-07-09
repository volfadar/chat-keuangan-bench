import { mkdirSync, cpSync, existsSync, rmSync, writeFileSync, readFileSync } from "node:fs";
import { join, resolve } from "node:path";
import { PDFDocument, StandardFonts } from "pdf-lib";
import { openSqlite, type SqlDb } from "./sqlite";

const FIXTURES_ROOT = resolve(import.meta.dirname, "../../fixtures/agentic");
const RUNS_ROOT = resolve(import.meta.dirname, "../../.runs/agentic");

export type Sandbox = {
  id: string;
  root: string;
  dbPath: string;
  db: SqlDb;
  toolLog: Array<{ toolName: string; args: unknown; result: unknown; turnIndex: number }>;
  currentTurn: number;
};

function ensureLedgerSchema(db: SqlDb) {
  db.exec(`
    CREATE TABLE IF NOT EXISTS orgs (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL
    );
    CREATE TABLE IF NOT EXISTS ledger (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      org_id TEXT NOT NULL DEFAULT 'personal',
      type TEXT NOT NULL CHECK(type IN ('pemasukan','pengeluaran')),
      jumlah INTEGER NOT NULL,
      deskripsi TEXT NOT NULL,
      tanggal_hint TEXT,
      tanggal TEXT,
      vendor TEXT,
      source TEXT,
      ambigu INTEGER NOT NULL DEFAULT 0,
      catatan TEXT,
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    );
    CREATE INDEX IF NOT EXISTS idx_ledger_org ON ledger(org_id);
    CREATE INDEX IF NOT EXISTS idx_ledger_tanggal ON ledger(tanggal);
    CREATE TABLE IF NOT EXISTS meta (
      key TEXT PRIMARY KEY,
      value TEXT NOT NULL
    );
    INSERT OR IGNORE INTO orgs (id, name) VALUES
      ('personal', 'Kas Pribadi'),
      ('yayasan', 'Yayasan Menara Sunnah'),
      ('sekolah', 'MSN School / PSB');
  `);
}

export async function createSandbox(
  scenarioId: string,
  opts?: {
    seedFiles?: Array<{ from: string; to: string }>;
    seedSql?: string[];
  },
): Promise<Sandbox> {
  const id = `${scenarioId}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
  const root = join(RUNS_ROOT, id);
  if (existsSync(root)) rmSync(root, { recursive: true, force: true });
  mkdirSync(join(root, "out"), { recursive: true });
  mkdirSync(join(root, "in"), { recursive: true });

  // Always seed local Indonesian thermal-receipt PNGs into in/ (no Unsplash stubs).
  const imagesDir = join(FIXTURES_ROOT, "images");
  if (existsSync(imagesDir)) {
    for (const name of [
      "nota-indomaret.png",
      "nota-alfamart.png",
      "nota-warung-padang.png",
      "nota-spbu-pertamina.png",
      "nota-apotik-kimia-farma.png",
    ]) {
      const src = join(imagesDir, name);
      if (existsSync(src)) cpSync(src, join(root, "in", name));
    }
  }

  for (const seed of opts?.seedFiles ?? []) {
    const src = join(FIXTURES_ROOT, seed.from);
    const dest = join(root, seed.to);
    mkdirSync(join(dest, ".."), { recursive: true });
    if (!existsSync(src)) {
      throw new Error(`Missing fixture: ${src}`);
    }
    cpSync(src, dest);
    // PDF fixtures ship a .txt sidecar for pdf_read text extraction — copy it too.
    const sidecarSrc = `${src}.txt`;
    if (existsSync(sidecarSrc)) {
      cpSync(sidecarSrc, `${dest}.txt`);
    }
  }

  const dbPath = join(root, "ledger.db");
  const db = await openSqlite(dbPath);
  ensureLedgerSchema(db);
  for (const sql of opts?.seedSql ?? []) {
    db.exec(sql);
  }

  return {
    id,
    root,
    dbPath,
    db,
    toolLog: [],
    currentTurn: 0,
  };
}

export function closeSandbox(sandbox: Sandbox) {
  sandbox.db.close();
}

export function resolveSandboxPath(sandbox: Sandbox, relativePath: string): string {
  const cleaned = relativePath.replace(/^\/+/, "");
  const full = resolve(sandbox.root, cleaned);
  if (!full.startsWith(sandbox.root)) {
    throw new Error(`Path escapes sandbox: ${relativePath}`);
  }
  return full;
}

export function recordTool(
  sandbox: Sandbox,
  toolName: string,
  args: unknown,
  result: unknown,
) {
  sandbox.toolLog.push({
    toolName,
    args,
    result,
    turnIndex: sandbox.currentTurn,
  });
}

/** Build default fixtures once (idempotent). */
export async function ensureDefaultFixtures() {
  mkdirSync(join(FIXTURES_ROOT, "csv"), { recursive: true });
  mkdirSync(join(FIXTURES_ROOT, "pdf"), { recursive: true });
  mkdirSync(join(FIXTURES_ROOT, "images"), { recursive: true });

  const mutasi = join(FIXTURES_ROOT, "csv/mutasi.csv");
  if (!existsSync(mutasi)) {
    writeFileSync(
      mutasi,
      [
        "tanggal,keterangan,jumlah,arah",
        "2026-07-01,TRSF dari BCA sendiri,-500000,internal",
        "2026-07-01,TRSF ke BCA sendiri,500000,internal",
        "2026-07-02,Indomaret 87.500,-87500,pengeluaran",
        "2026-07-02,Gaji masuk,4500000,pemasukan",
        "2026-07-03,PLN Token,-102500,pengeluaran",
        "2026-07-03,Biaya admin transfer,-2500,pengeluaran",
      ].join("\n") + "\n",
      "utf8",
    );
  }

  const conflictCsv = join(FIXTURES_ROOT, "csv/conflict-indomaret.csv");
  if (!existsSync(conflictCsv)) {
    writeFileSync(
      conflictCsv,
      ["tanggal,keterangan,jumlah,arah", "2026-07-02,Indomaret,-87500,pengeluaran"].join("\n") +
        "\n",
      "utf8",
    );
  }

  const statementPdf = join(FIXTURES_ROOT, "pdf/rekening.pdf");
  if (!existsSync(statementPdf)) {
    const doc = await PDFDocument.create();
    const page = doc.addPage([420, 595]);
    const font = await doc.embedFont(StandardFonts.Helvetica);
    const lines = [
      "REKENING KORAN — DEMO FIXTURE",
      "Tanggal: 03 Jul 2026",
      "Mutasi:",
      "- Transfer keluar Rp 1.500.000",
      "- Biaya admin transfer Rp 2.500",
      "- Saldo akhir Rp 12.345.000",
      "Catatan: hanya biaya admin yang perlu dicatat sebagai pengeluaran operasional.",
    ];
    let y = 560;
    for (const line of lines) {
      page.drawText(line, { x: 40, y, size: 11, font });
      y -= 18;
    }
    writeFileSync(statementPdf, await doc.save());
  }

  // receipt-urls.json + ocr-conflict.json + nota-*.png are maintained by
  // scripts/generate-receipt-fixtures.ts — do not regenerate Unsplash stubs here.
  const manifest = join(FIXTURES_ROOT, "images/receipts-manifest.json");
  if (!existsSync(manifest)) {
    throw new Error(
      "Missing fixtures/agentic/images/receipts-manifest.json — run: bun run scripts/generate-receipt-fixtures.ts",
    );
  }
}

export function readFixtureJson<T>(relativePath: string): T {
  return JSON.parse(readFileSync(join(FIXTURES_ROOT, relativePath), "utf8")) as T;
}

export { FIXTURES_ROOT, RUNS_ROOT };
