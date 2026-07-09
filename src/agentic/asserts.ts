import { existsSync, readFileSync, statSync } from "node:fs";
import { resolveSandboxPath, type Sandbox } from "./sandbox";
import type {
  DeterministicAssert,
  DeterministicResult,
  LedgerRow,
  ToolCallRecord,
} from "./types";

export function readLedger(sandbox: Sandbox, orgId?: string): LedgerRow[] {
  if (orgId) {
    return sandbox.db.all<LedgerRow>(
      `SELECT * FROM ledger WHERE org_id = ? ORDER BY id ASC`,
      orgId,
    );
  }
  return sandbox.db.all<LedgerRow>(`SELECT * FROM ledger ORDER BY id ASC`);
}

function deskripsiMatch(row: LedgerRow, needles?: string[]): boolean {
  if (!needles?.length) return true;
  const hay = `${row.deskripsi} ${row.vendor ?? ""}`.toLowerCase();
  return needles.every((n) => hay.includes(n.toLowerCase()));
}

function parseCsvAmounts(text: string): number[] {
  const lines = text.split(/\r?\n/).filter(Boolean);
  if (lines.length < 2) return [];
  const headers = (lines[0] ?? "").split(",").map((h) => h.trim().toLowerCase());
  const idx = headers.findIndex((h) => h === "jumlah" || h === "amount" || h === "nominal");
  if (idx < 0) return [];
  return lines.slice(1).map((line) => {
    const cols = line.split(",");
    return Math.abs(Number(String(cols[idx] ?? "").replace(/[^\d.-]/g, ""))) || 0;
  });
}

function filterLedger(ledger: LedgerRow[], orgId?: string): LedgerRow[] {
  return orgId ? ledger.filter((r) => r.org_id === orgId) : ledger;
}

export function runDeterministicAsserts(
  sandbox: Sandbox,
  asserts: DeterministicAssert[],
  toolLog: ToolCallRecord[],
  assistantTexts: string[],
): DeterministicResult {
  const ledger = readLedger(sandbox);
  const details: DeterministicResult["details"] = [];
  const replyBlob = assistantTexts.join("\n").toLowerCase();
  const sqlBlob = toolLog
    .filter((t) => t.toolName === "sqlite_exec" || t.toolName === "sqlite_query")
    .map((t) => JSON.stringify(t.args).toLowerCase())
    .join("\n");

  for (const assert of asserts) {
    let ok = false;
    let note = "";

    switch (assert.kind) {
      case "row_count": {
        const rows = filterLedger(ledger, assert.orgId);
        ok = rows.length === assert.eq;
        note = `rows=${rows.length} expected=${assert.eq} org=${assert.orgId ?? "*"}`;
        break;
      }
      case "org_row_count": {
        const rows = filterLedger(ledger, assert.orgId);
        ok = rows.length === assert.eq;
        note = `org=${assert.orgId} rows=${rows.length} expected=${assert.eq}`;
        break;
      }
      case "no_posted_rows": {
        const rows = filterLedger(ledger, assert.orgId);
        ok = rows.length === 0;
        note = `rows=${rows.length} org=${assert.orgId ?? "*"}`;
        break;
      }
      case "has_amount": {
        const pool = filterLedger(ledger, assert.orgId);
        const hit = pool.find(
          (r) =>
            r.type === assert.type &&
            Number(r.jumlah) === assert.jumlah &&
            deskripsiMatch(r, assert.deskripsiIncludes),
        );
        ok = Boolean(hit);
        note = hit
          ? `found id=${hit.id} org=${hit.org_id}`
          : `missing ${assert.type} ${assert.jumlah} org=${assert.orgId ?? "*"}`;
        break;
      }
      case "no_amount": {
        const pool = filterLedger(ledger, assert.orgId);
        const hit = pool.some(
          (r) =>
            Number(r.jumlah) === assert.jumlah &&
            (assert.type ? r.type === assert.type : true),
        );
        ok = !hit;
        note = hit
          ? `unexpected amount ${assert.jumlah}${assert.type ? ` ${assert.type}` : ""}`
          : `amount ${assert.jumlah} absent`;
        break;
      }
      case "amounts_set": {
        const pool = filterLedger(ledger, assert.orgId).filter((r) =>
          assert.type ? r.type === assert.type : true,
        );
        const have = pool.map((r) => Number(r.jumlah));
        const missing = assert.jumlahs.filter((j) => !have.includes(j));
        const n5 = have.filter((h) => h === 5000).length;
        // Qty×unit soft pass: merged N×5000 total OR enough 5000 rows
        const qtyOk = (total: number, n: number) =>
          assert.jumlahs.includes(total) &&
          (have.includes(total) || n5 >= n) &&
          missing.every((m) => m === total || m === 5000);
        ok = missing.length === 0 || qtyOk(20000, 4) || qtyOk(15000, 3);
        note = `have=[${have.join(",")}] need=[${assert.jumlahs.join(",")}]`;
        break;
      }
      case "file_exists": {
        const full = resolveSandboxPath(sandbox, assert.relativePath);
        const exists = existsSync(full);
        const size = exists ? statSync(full).size : 0;
        ok = exists && size >= (assert.minBytes ?? 1);
        note = exists ? `size=${size}` : "missing file";
        break;
      }
      case "csv_sum_matches_ledger": {
        const full = resolveSandboxPath(sandbox, assert.relativePath);
        if (!existsSync(full)) {
          ok = false;
          note = "csv missing";
          break;
        }
        const amounts = parseCsvAmounts(readFileSync(full, "utf8"));
        const pool = filterLedger(ledger, assert.orgId);
        const ledgerSum = pool.reduce((s, r) => s + Number(r.jumlah), 0);
        const csvSum = amounts.reduce((s, n) => s + n, 0);
        ok = amounts.length === pool.length && csvSum === ledgerSum;
        note = `csvSum=${csvSum} ledgerSum=${ledgerSum}`;
        break;
      }
      case "tool_called": {
        const times = toolLog.filter((t) => t.toolName === assert.toolId).length;
        ok = times >= (assert.minTimes ?? 1);
        note = `calls=${times}`;
        break;
      }
      case "tool_order": {
        const beforeIdx = toolLog.findIndex((t) => t.toolName === assert.before);
        const afterIdx = toolLog.findIndex((t) => t.toolName === assert.after);
        ok = beforeIdx >= 0 && afterIdx >= 0 && beforeIdx < afterIdx;
        note = `before@${beforeIdx} after@${afterIdx}`;
        break;
      }
      case "min_distinct_tools": {
        const set = new Set(toolLog.map((t) => t.toolName));
        ok = set.size >= assert.min;
        note = `distinct=${set.size} need>=${assert.min} [${[...set].join(",")}]`;
        break;
      }
      case "has_ambigu": {
        const pool = filterLedger(ledger, assert.orgId);
        const n = pool.filter((r) => Number(r.ambigu) >= 1).length;
        ok = n >= (assert.min ?? 1);
        note = `ambiguRows=${n}`;
        break;
      }
      case "has_vendor": {
        const pool = filterLedger(ledger, assert.orgId);
        const needle = assert.vendorIncludes.toLowerCase();
        const hit = pool.find(
          (r) =>
            `${r.vendor ?? ""} ${r.deskripsi}`.toLowerCase().includes(needle) &&
            (assert.jumlah == null || Number(r.jumlah) === assert.jumlah),
        );
        ok = Boolean(hit);
        note = hit ? `vendor hit id=${hit.id}` : `missing vendor~${assert.vendorIncludes}`;
        break;
      }
      case "ambigu_or_ask": {
        const pool = filterLedger(ledger, assert.orgId);
        const hasAmb = pool.some((r) => Number(r.ambigu) >= 1);
        const asked = assert.askAnyOf.some((k) => replyBlob.includes(k.toLowerCase()));
        ok = hasAmb || asked;
        note = `ambigu=${hasAmb} asked=${asked}`;
        break;
      }
      case "net_equals": {
        const pool = filterLedger(ledger, assert.orgId);
        let pemasukan = 0;
        let pengeluaran = 0;
        for (const r of pool) {
          if (r.type === "pemasukan") pemasukan += Number(r.jumlah);
          else pengeluaran += Number(r.jumlah);
        }
        const net = pemasukan - pengeluaran;
        ok = net === assert.eq;
        note = `net=${net} expected=${assert.eq}`;
        break;
      }
      case "reply_mentions": {
        ok = assert.anyOf.some((k) => replyBlob.includes(k.toLowerCase()));
        note = ok ? "mention hit" : `none of ${assert.anyOf.join("|")}`;
        break;
      }
      case "reply_not_mentions": {
        ok = !assert.anyOf.some((k) => replyBlob.includes(k.toLowerCase()));
        note = ok ? "forbidden phrases absent" : `leaked ${assert.anyOf.join("|")}`;
        break;
      }
      case "no_org_leak": {
        // New rows for forbidden org beyond seed baseline
        const forbidden = ledger.filter((r) => r.org_id === assert.forbiddenOrgId);
        const baseline = assert.afterSeedCount ?? 0;
        // Pass if agent did not ADD rows to forbidden org (count <= seed)
        ok = forbidden.length <= baseline;
        note = `forbiddenOrg=${assert.forbiddenOrgId} rows=${forbidden.length} baseline=${baseline}`;
        break;
      }
      case "period_sum": {
        const rows = ledger.filter((r) => {
          if (r.org_id !== assert.orgId) return false;
          if (assert.type && r.type !== assert.type) return false;
          const d = r.tanggal ?? "";
          return d >= assert.start && d <= assert.end;
        });
        const sum = rows.reduce((s, r) => s + Number(r.jumlah), 0);
        if (assert.eq != null) ok = sum === assert.eq;
        else {
          ok = true;
          if (assert.min != null) ok = ok && sum >= assert.min;
          if (assert.max != null) ok = ok && sum <= assert.max;
        }
        note = `sum=${sum} rows=${rows.length} window=${assert.start}..${assert.end}`;
        break;
      }
      case "sql_mentions": {
        ok = assert.anyOf.some((k) => sqlBlob.includes(k.toLowerCase()));
        note = ok ? "sql keyword hit" : `sql missing ${assert.anyOf.join("|")}`;
        break;
      }
      default: {
        note = "unknown assert";
        ok = false;
      }
    }

    details.push({ assert, ok, note });
  }

  const passed = details.filter((d) => d.ok).length;
  const total = details.length || 1;
  const score = Math.round((passed / total) * 40);
  return { score, passed, total, details };
}
