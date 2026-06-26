/**
 * strip-openrouter-csv.ts — Keep only columns used for cost/latency/throughput stats.
 *
 * Run:
 *   bun run scripts/strip-openrouter-csv.ts --in docs/data/openrouter_activity_2026-06-26.csv
 */

import { readFileSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";

const KEEP = [
  "cost_total",
  "tokens_prompt",
  "tokens_completion",
  "model_permaslug",
  "generation_time_ms",
  "time_to_first_token_ms",
] as const;

function parseCsvLine(line: string): string[] {
  const out: string[] = [];
  let cur = "";
  let inQuotes = false;
  for (let i = 0; i < line.length; i++) {
    const ch = line[i]!;
    if (ch === '"') inQuotes = !inQuotes;
    else if (ch === "," && !inQuotes) {
      out.push(cur);
      cur = "";
    } else cur += ch;
  }
  out.push(cur);
  return out;
}

function parseArgs(argv: string[]) {
  let input = resolve(import.meta.dirname, "../docs/data/openrouter_activity_2026-06-26.csv");
  let output = input;
  for (let i = 2; i < argv.length; i++) {
    if (argv[i] === "--in" && argv[i + 1]) input = resolve(argv[++i]!);
    else if (argv[i] === "--out" && argv[i + 1]) output = resolve(argv[++i]!);
  }
  return { input, output };
}

function main() {
  const { input, output } = parseArgs(process.argv);
  const lines = readFileSync(input, "utf8").trim().split("\n");
  const header = parseCsvLine(lines[0]!);
  const idx = Object.fromEntries(KEEP.map((k) => [k, header.indexOf(k)]));

  for (const k of KEEP) {
    if (idx[k]! < 0) {
      console.error(`Missing column: ${k}`);
      process.exit(1);
    }
  }

  const out = [KEEP.join(",")];
  for (let i = 1; i < lines.length; i++) {
    const cols = parseCsvLine(lines[i]!);
    out.push(KEEP.map((k) => cols[idx[k]!] ?? "").join(","));
  }

  writeFileSync(output, `${out.join("\n")}\n`);
  console.log(`Wrote ${out.length - 1} rows → ${output}`);
  console.log(`Columns: ${KEEP.join(", ")}`);
}

main();
