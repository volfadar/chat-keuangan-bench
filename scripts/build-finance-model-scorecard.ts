/**
 * build-finance-model-scorecard.ts — Merge hard-25 eval JSON + OpenRouter activity CSV.
 *
 * Produces a rich scorecard: quality (strict/composite), latency, cost, throughput, value.
 *
 * Run:
 *   bun run apps/ai/scripts/build-finance-model-scorecard.ts
 *   bun run apps/ai/scripts/build-finance-model-scorecard.ts \
 *     --results docs/research/logs/2026-06-26-finance-hard-25-results.json \
 *     --results docs/research/logs/2026-06-27-finance-hard-25-supplement.json \
 *     --csv docs/research/openrouter_activity_2026-06-26.csv
 */

import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";
import { ALL_EVAL_MODELS, USD_TO_IDR, shortModelName } from "../src/core/model-roster.ts";

const SCENARIO_COUNT = 25;

function usdToIdr(usd: number): number {
  return Math.round(usd * USD_TO_IDR);
}

function fmtIdr(usd: number | null | undefined): string {
  if (usd == null || Number.isNaN(usd)) return "—";
  return `Rp\u00a0${usdToIdr(usd).toLocaleString("id-ID")}`;
}

interface CsvRow {
  cost_total: number;
  tokens_prompt: number;
  tokens_completion: number;
  model_permaslug: string;
  generation_time_ms: number;
  time_to_first_token_ms: number;
}

interface EvalResultRow {
  modelId: string;
  scenarioId: string;
  ms: number;
  quality: { strictPass: boolean; compositeScore: number; tier: string } | null;
  error: string | null;
}

interface EvalCostStats {
  avgCostUsd: number;
  estCost25RunUsd: number;
  source: string;
}

interface SingleModelResultRow {
  scenarioId: string;
  strictPass: boolean;
  ms: number;
  costUsd: number;
  error: string | null;
}

interface SingleModelPayload {
  runAt: string;
  model?: string;
  label?: string;
  backend?: string;
  results: SingleModelResultRow[];
  avgCostUsd?: number;
  totalCostUsd?: number;
  avgMs?: number;
}

interface EvalPayload {
  runAt: string;
  models: string[];
  results: EvalResultRow[];
  summaries: Array<{
    modelId: string;
    strictPass: number;
    meanComposite: number;
    meanMs: number;
    tierCounts: Record<string, number>;
    errors: number;
  }>;
}

function resolveSingleModelId(data: SingleModelPayload): string {
  const label = data.label ?? "";
  if (label.includes("deepseek-v4-pro-direct") || data.backend === "deepseek-direct") {
    return "deepseek/deepseek-v4-pro";
  }
  if (label.includes("deepseek-v4-pro-or") || label.includes("or-default")) {
    return "deepseek/deepseek-v4-pro@openrouter";
  }
  if (data.model?.startsWith("deepseek-v4-pro")) return "deepseek/deepseek-v4-pro";
  return data.model ?? label;
}

function compositeForRow(strictPass: boolean): { compositeScore: number; tier: string } {
  if (strictPass) return { compositeScore: 100, tier: "excellent" };
  return { compositeScore: 75, tier: "usable_with_edit" };
}

function convertSingleModelPayload(data: SingleModelPayload): {
  rows: EvalResultRow[];
  costStats: EvalCostStats;
  modelId: string;
} {
  const modelId = resolveSingleModelId(data);
  const okRows = data.results.filter((r) => !r.error);
  const avgCost =
    data.avgCostUsd ??
    (okRows.length ? okRows.reduce((s, r) => s + r.costUsd, 0) / okRows.length : 0);
  const rows: EvalResultRow[] = data.results.map((r) => {
    const q = compositeForRow(r.strictPass);
    return {
      modelId,
      scenarioId: r.scenarioId,
      ms: r.ms,
      quality: r.error
        ? null
        : { strictPass: r.strictPass, compositeScore: q.compositeScore, tier: q.tier },
      error: r.error,
    };
  });
  return {
    rows,
    modelId,
    costStats: {
      avgCostUsd: avgCost,
      estCost25RunUsd: data.totalCostUsd ?? avgCost * SCENARIO_COUNT,
      source: "eval-run",
    },
  };
}

function isSingleModelPayload(data: unknown): data is SingleModelPayload {
  const d = data as SingleModelPayload;
  return Array.isArray(d.results) && d.results.length > 0 && "strictPass" in d.results[0]!;
}

interface ModelCsvStats {
  requests: number;
  totalCostUsd: number;
  avgCostUsd: number;
  avgGenMs: number;
  avgTtftMs: number;
  avgPromptTokens: number;
  avgCompletionTokens: number;
  throughputTps: number;
  estCost25RunUsd: number;
}

interface ScorecardRow {
  modelId: string;
  inEval: boolean;
  strict: number | null;
  composite: number | null;
  evalMeanMs: number | null;
  csvAvgGenMs: number | null;
  csvAvgTtftMs: number | null;
  csvCostPerReqUsd: number | null;
  estCost25Usd: number | null;
  throughputTps: number | null;
  valueIndex: number | null;
  tierExcellent: number | null;
  errors: number | null;
}

function normalizeModelSlug(permaslug: string): string | null {
  const s = permaslug.toLowerCase();
  if (s.includes("gemini-3.1-flash-lite")) return "google/gemini-3.1-flash-lite";
  if (s.includes("gemini-3-flash-preview")) return "google/gemini-3-flash-preview";
  if (s.includes("gemma-4-31b")) return "google/gemma-4-31b-it";
  if (s.includes("glm-4.5")) return "z-ai/glm-4.5";
  if (s.includes("glm-4.7")) return "z-ai/glm-4.7";
  if (s.includes("gpt-oss-120b")) return "openai/gpt-oss-120b";
  if (s.includes("ling-2.6")) return "inclusionai/ling-2.6-1t";
  if (s.includes("deepseek-v4-flash")) return "deepseek/deepseek-v4-flash";
  if (s.includes("deepseek-v4-pro")) return "deepseek/deepseek-v4-pro";
  if (s.includes("mimo-v2.5")) return "xiaomi/mimo-v2.5-pro";
  if (s.includes("nemotron-3-nano")) return "nvidia/nemotron-3-nano-30b-a3b";
  return null;
}

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

function loadCsv(path: string): CsvRow[] {
  const text = readFileSync(path, "utf8");
  const lines = text.trim().split("\n");
  const header = parseCsvLine(lines[0]!);
  const idx = (name: string) => header.indexOf(name);

  const rows: CsvRow[] = [];
  for (let i = 1; i < lines.length; i++) {
    const cols = parseCsvLine(lines[i]!);
    const model = cols[idx("model_permaslug")] ?? "";
    const normalized = normalizeModelSlug(model);
    if (!normalized) continue;
    rows.push({
      cost_total: Number(cols[idx("cost_total")] ?? 0),
      tokens_prompt: Number(cols[idx("tokens_prompt")] ?? 0),
      tokens_completion: Number(cols[idx("tokens_completion")] ?? 0),
      model_permaslug: model,
      generation_time_ms: Number(cols[idx("generation_time_ms")] ?? 0),
      time_to_first_token_ms: Number(cols[idx("time_to_first_token_ms")] ?? 0),
    });
  }
  return rows;
}

function aggregateCsv(rows: CsvRow[]): Map<string, ModelCsvStats> {
  const buckets = new Map<string, CsvRow[]>();
  for (const r of rows) {
    const id = normalizeModelSlug(r.model_permaslug);
    if (!id) continue;
    const arr = buckets.get(id) ?? [];
    arr.push(r);
    buckets.set(id, arr);
  }

  const out = new Map<string, ModelCsvStats>();
  for (const [id, list] of buckets) {
    const n = list.length;
    const totalCostUsd = list.reduce((s, r) => s + r.cost_total, 0);
    const avgGenMs = list.reduce((s, r) => s + r.generation_time_ms, 0) / n;
    const avgTtftMs = list.reduce((s, r) => s + r.time_to_first_token_ms, 0) / n;
    const avgPromptTokens = list.reduce((s, r) => s + r.tokens_prompt, 0) / n;
    const avgCompletionTokens = list.reduce((s, r) => s + r.tokens_completion, 0) / n;
    const throughputTps =
      list.reduce((s, r) => {
        const sec = r.generation_time_ms / 1000;
        return s + (sec > 0 ? r.tokens_completion / sec : 0);
      }, 0) / n;
    const avgCostUsd = totalCostUsd / n;
    out.set(id, {
      requests: n,
      totalCostUsd,
      avgCostUsd,
      avgGenMs,
      avgTtftMs,
      avgPromptTokens,
      avgCompletionTokens,
      throughputTps,
      estCost25RunUsd: avgCostUsd * SCENARIO_COUNT,
    });
  }
  return out;
}

function mergeEvalPayloads(
  paths: string[],
): { payload: EvalPayload; evalCosts: Map<string, EvalCostStats> } {
  const byKey = new Map<string, EvalResultRow>();
  const models = new Set<string>();
  const evalCosts = new Map<string, EvalCostStats>();
  let runAt = "";

  for (const p of paths) {
    const raw = JSON.parse(readFileSync(p, "utf8")) as unknown;
    if (isSingleModelPayload(raw)) {
      const { rows, modelId, costStats } = convertSingleModelPayload(raw);
      runAt = raw.runAt || runAt;
      models.add(modelId);
      evalCosts.set(modelId, costStats);
      for (const r of rows) {
        byKey.set(`${r.modelId}::${r.scenarioId}`, r);
      }
      continue;
    }

    const data = raw as EvalPayload;
    runAt = data.runAt || runAt;
    for (const r of data.results) {
      byKey.set(`${r.modelId}::${r.scenarioId}`, r);
      models.add(r.modelId);
    }
  }

  const results = [...byKey.values()];
  const summaries = [...models].map((modelId) => {
    const rows = results.filter((r) => r.modelId === modelId);
    const ok = rows.filter((r) => r.quality?.strictPass);
    const composites = rows.filter((r) => r.quality).map((r) => r.quality!.compositeScore);
    const tierCounts: Record<string, number> = {};
    for (const r of rows) {
      const t = r.quality?.tier;
      if (t) tierCounts[t] = (tierCounts[t] ?? 0) + 1;
    }
    return {
      modelId,
      strictPass: ok.length,
      meanComposite: composites.length ? composites.reduce((a, b) => a + b, 0) / composites.length : 0,
      meanMs: rows.filter((r) => r.ms > 0).reduce((s, r) => s + r.ms, 0) / Math.max(rows.filter((r) => r.ms > 0).length, 1),
      tierCounts,
      errors: rows.filter((r) => r.error).length,
    };
  });

  return { payload: { runAt, models: [...models], results, summaries }, evalCosts };
}

function parseArgs(argv: string[]) {
  const results: string[] = [];
  let csv = resolve(import.meta.dirname, "../docs/data/openrouter_activity_2026-06-26.csv");
  let outDir = resolve(import.meta.dirname, "../docs/results");

  for (let i = 2; i < argv.length; i++) {
    const a = argv[i];
    if (a === "--results" && argv[i + 1]) results.push(resolve(argv[++i]!));
    else if (a === "--csv" && argv[i + 1]) csv = resolve(argv[++i]!);
    else if (a === "--out" && argv[i + 1]) outDir = resolve(argv[++i]!);
  }

  if (results.length === 0) {
    const runsDir = resolve(outDir, "runs");
    results.push(
      resolve(outDir, "2026-06-26-finance-hard-25-results.json"),
      resolve(runsDir, "2026-06-27-mimo-v25-pro-xiaomi-results.json"),
      resolve(runsDir, "2026-06-27-nemotron-nano-30b-default-results.json"),
      resolve(runsDir, "2026-06-27-deepseek-v4-pro-direct-results.json"),
      resolve(runsDir, "2026-06-27-deepseek-v4-pro-or-default-results.json"),
    );
  }
  return { results, csv, outDir };
}

function buildMarkdown(rows: ScorecardRow[], csvStats: Map<string, ModelCsvStats>, evalPayload: EvalPayload): string {
  const ranked = [...rows].sort((a, b) => (b.valueIndex ?? 0) - (a.valueIndex ?? 0));
  const lines: string[] = [
    `# Finance Parse Model Scorecard — ${new Date().toISOString()}`,
    "",
    `Merged eval runs + OpenRouter CSV. **${evalPayload.models.length}/${ALL_EVAL_MODELS.length}** models in eval JSON.`,
    "",
    "## Executive summary",
    "",
  ];

  const withEval = ranked.filter((r) => r.inEval && r.strict != null);
  if (withEval[0]) {
    const bestQ = [...withEval].sort((a, b) => (b.strict ?? 0) - (a.strict ?? 0) || (b.composite ?? 0) - (a.composite ?? 0))[0]!;
    const best24 = [...withEval]
      .filter((r) => (r.strict ?? 0) >= 24)
      .sort((a, b) => (a.estCost25Usd ?? 9e9) - (b.estCost25Usd ?? 9e9))[0];
    const gemma = withEval.find((r) => r.modelId === "google/gemma-4-31b-it");
    const fastest = [...withEval].sort((a, b) => (a.evalMeanMs ?? 9e9) - (b.evalMeanMs ?? 9e9))[0]!;
    const cheapestUseful = [...withEval]
      .filter((r) => (r.strict ?? 0) >= 21)
      .sort((a, b) => (a.estCost25Usd ?? 9e9) - (b.estCost25Usd ?? 9e9))[0]!;

    lines.push(
      `- **Best quality (hard-25):** \`${bestQ.modelId}\` — ${bestQ.strict}/${SCENARIO_COUNT} strict, composite ${bestQ.composite?.toFixed(0)}`,
      `- **Best value at 24/25:** \`${best24?.modelId ?? "google/gemma-4-31b-it"}\` — ${best24?.strict ?? 24}/${SCENARIO_COUNT} strict, ~${fmtIdr(best24?.estCost25Usd ?? gemma?.estCost25Usd)}/25-run`,
      `- **Recommended production:** \`google/gemma-4-31b-it\` — 24/25, multimodal, ~${fmtIdr(gemma?.estCost25Usd)}/25-run`,
      `- **Fastest eval latency:** \`${fastest.modelId}\` — ~${fastest.evalMeanMs?.toFixed(0)}ms/scenario`,
      `- **Cheapest ≥21/25:** \`${cheapestUseful.modelId}\` — ${cheapestUseful.strict}/${SCENARIO_COUNT} strict, ~${fmtIdr(cheapestUseful.estCost25Usd)}/25-run`,
      `- **FX rate:** 1 USD = ${USD_TO_IDR.toLocaleString("id-ID")} IDR (27 Jun 2026)`,
      "",
    );
  }

  lines.push(
    "## Master scorecard",
    "",
    "| Model | Strict | Comp | Eval ms | $/req | IDR/req | $/25-run | IDR/25-run | tok/s | Value† |",
    "|-------|--------|------|---------|-------|---------|----------|------------|-------|--------|",
  );

  for (const r of ranked) {
    const strict = r.strict != null ? `${r.strict}/${SCENARIO_COUNT}` : "—";
    const comp = r.composite != null ? r.composite.toFixed(0) : "—";
    lines.push(
      `| ${r.modelId} | ${strict} | ${comp} | ${fmt(r.evalMeanMs)} | ${fmtUsd(r.csvCostPerReqUsd)} | ${fmtIdr(r.csvCostPerReqUsd)} | ${fmtUsd(r.estCost25Usd)} | ${fmtIdr(r.estCost25Usd)} | ${fmt(r.throughputTps, 1)} | ${fmt(r.valueIndex, 1)} |`,
    );
  }

  lines.push(
    "",
    "† **Value index** = `(strict% + composite) / est_cost_25_run_usd` — higher = more quality per dollar.",
    "",
    "## Models missing from eval JSON",
    "",
  );

  const missing = ALL_EVAL_MODELS.filter((m) => !evalPayload.models.includes(m));
  if (missing.length === 0) lines.push("_All roster models present._");
  else missing.forEach((m) => lines.push(`- \`${m}\` — run \`bun run eval-finance-hard-25.ts --model ${m}\``));

  lines.push("", "## OpenRouter CSV notes", "");
  lines.push(
    "- Stats aggregated from all CSV rows matching each model slug (Jun 26 eval day).",
    "- Includes `finance-parse-eval` and general `menara-sunnah` traffic for those models.",
    "- `est_cost_25_run` = avg cost per request × 25 scenarios.",
    "",
    "## Per-model eval failures",
    "",
  );

  for (const s of evalPayload.summaries.sort((a, b) => b.strictPass - a.strictPass)) {
    const fails = evalPayload.results
      .filter((r) => r.modelId === s.modelId && !r.quality?.strictPass)
      .map((r) => r.scenarioId);
    lines.push(`### ${s.modelId}`, `- Strict: **${s.strictPass}/${SCENARIO_COUNT}**, composite **${s.meanComposite.toFixed(1)}**`);
    if (fails.length) lines.push(`- Failed: ${fails.join(", ")}`);
    else lines.push("- Failed: none");
    lines.push("");
  }

  return lines.join("\n");
}

function fmt(n: number | null | undefined, digits = 0): string {
  if (n == null || Number.isNaN(n)) return "—";
  return digits ? n.toFixed(digits) : Math.round(n).toString();
}

function fmtUsd(n: number | null | undefined): string {
  if (n == null || Number.isNaN(n)) return "—";
  if (n < 0.001) return `$${n.toFixed(5)}`;
  return `$${n.toFixed(4)}`;
}

function main() {
  const { results: resultPaths, csv, outDir } = parseArgs(process.argv);
  const csvRows = loadCsv(csv);
  const csvStats = aggregateCsv(csvRows);
  const { payload: evalPayload, evalCosts } = mergeEvalPayloads(resultPaths);

  const evalByModel = new Map(evalPayload.summaries.map((s) => [s.modelId, s]));

  const scorecard: ScorecardRow[] = ALL_EVAL_MODELS.map((modelId) => {
    const e = evalByModel.get(modelId);
    const c = csvStats.get(modelId);
    const ec = evalCosts.get(modelId);
    const strict = e?.strictPass ?? null;
    const composite = e?.meanComposite ?? null;
    const strictPct = strict != null ? (strict / SCENARIO_COUNT) * 100 : null;
    const costPerReq = c?.avgCostUsd ?? ec?.avgCostUsd ?? null;
    const estCost25 = c?.estCost25RunUsd ?? ec?.estCost25RunUsd ?? null;
    const valueIndex =
      strictPct != null && composite != null && estCost25 != null && estCost25 > 0
        ? (strictPct + composite) / estCost25
        : null;

    return {
      modelId,
      inEval: Boolean(e),
      strict,
      composite,
      evalMeanMs: e?.meanMs ?? null,
      csvAvgGenMs: c?.avgGenMs ?? null,
      csvAvgTtftMs: c?.avgTtftMs ?? null,
      csvCostPerReqUsd: costPerReq,
      estCost25Usd: estCost25,
      throughputTps: c?.throughputTps ?? null,
      valueIndex,
      tierExcellent: e?.tierCounts.excellent ?? null,
      errors: e?.errors ?? null,
    };
  });

  const md = buildMarkdown(scorecard, csvStats, evalPayload);
  const dateSlug = new Date().toISOString().slice(0, 10);
  mkdirSync(outDir, { recursive: true });
  const mdPath = resolve(outDir, `${dateSlug}-finance-model-scorecard.md`);
  const jsonPath = resolve(outDir, `${dateSlug}-finance-model-scorecard.json`);

  writeFileSync(mdPath, md);
  const scorecardJson = {
    generatedAt: new Date().toISOString(),
    csvPath: csv,
    evalSources: resultPaths,
    scorecard,
    csvStats: Object.fromEntries(csvStats),
    evalCosts: Object.fromEntries(evalCosts),
  };
  writeFileSync(jsonPath, JSON.stringify(scorecardJson, null, 2));
  writeFileSync(resolve(outDir, "scorecard.json"), JSON.stringify(scorecardJson, null, 2));

  console.log(`Scorecard: ${mdPath}`);
  console.log(`JSON: ${jsonPath}`);
  console.log(`Eval models: ${evalPayload.models.length}/${ALL_EVAL_MODELS.length}`);
  const missing = ALL_EVAL_MODELS.filter((m) => !evalPayload.models.includes(m));
  if (missing.length) console.log(`Missing: ${missing.join(", ")}`);
}

main();
