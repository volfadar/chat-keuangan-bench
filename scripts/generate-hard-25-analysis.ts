/**
 * generate-hard-25-analysis.ts — Full per-model hard-25 analysis markdown (12 models).
 *
 * Run: bun run scripts/generate-hard-25-analysis.ts
 */

import { readFileSync, writeFileSync, readdirSync } from "node:fs";
import { resolve } from "node:path";
import { ALL_EVAL_MODELS, USD_TO_IDR, shortModelName } from "../src/core/model-roster.ts";

const SCENARIO_COUNT = 25;

interface ScorecardRow {
  modelId: string;
  strict: number | null;
  composite: number | null;
  evalMeanMs: number | null;
  estCost25Usd: number | null;
  csvCostPerReqUsd: number | null;
  tierExcellent: number | null;
  errors: number | null;
}

interface EvalResultRow {
  modelId: string;
  scenarioId: string;
  quality: { strictPass: boolean; compositeScore: number; tier: string } | null;
  error: string | null;
}

interface SingleResult {
  scenarioId: string;
  strictPass: boolean;
  error: string | null;
}

interface SinglePayload {
  model?: string;
  label?: string;
  backend?: string;
  results: SingleResult[];
}

function fmtIdr(usd: number | null | undefined): string {
  if (usd == null) return "—";
  return `Rp ${Math.round(usd * USD_TO_IDR).toLocaleString("id-ID")}`;
}

function resolveSingleModelId(data: SinglePayload): string {
  const label = data.label ?? "";
  if (label.includes("deepseek-v4-pro-direct") || data.backend === "deepseek-direct") {
    return "deepseek/deepseek-v4-pro";
  }
  if (label.includes("or-default") || label.includes("or-deepseek")) {
    return "deepseek/deepseek-v4-pro@openrouter";
  }
  return data.model ?? label;
}

function isSinglePayload(data: unknown): data is SinglePayload {
  const d = data as SinglePayload;
  return Array.isArray(d.results) && d.results.length > 0 && "strictPass" in d.results[0]!;
}

function loadFailures(): Map<string, string[]> {
  const out = new Map<string, string[]>();
  const resultsDir = resolve(import.meta.dirname, "../docs/results");
  const paths = [
    resolve(resultsDir, "2026-06-26-finance-hard-25-results.json"),
    ...readdirSync(resolve(resultsDir, "runs"))
      .filter((f) => f.endsWith("-results.json"))
      .map((f) => resolve(resultsDir, "runs", f)),
  ];

  for (const p of paths) {
    const raw = JSON.parse(readFileSync(p, "utf8")) as unknown;
    if (isSinglePayload(raw)) {
      const modelId = resolveSingleModelId(raw);
      const fails = raw.results
        .filter((r) => !r.strictPass || r.error)
        .map((r) => r.scenarioId);
      out.set(modelId, fails);
      continue;
    }
    const data = raw as { results: EvalResultRow[] };
    for (const r of data.results) {
      if (!r.quality?.strictPass && !r.error) {
        const arr = out.get(r.modelId) ?? [];
        if (!arr.includes(r.scenarioId)) arr.push(r.scenarioId);
        out.set(r.modelId, arr);
      }
    }
  }
  return out;
}

function main() {
  const scorecardPath = resolve(import.meta.dirname, "../docs/results/scorecard.json");
  const payload = JSON.parse(readFileSync(scorecardPath, "utf8")) as { scorecard: ScorecardRow[] };
  const rows = payload.scorecard.filter((r) => r.strict != null);
  const failures = loadFailures();
  const date = new Date().toISOString().slice(0, 10);

  const sorted = [...rows].sort((a, b) => (b.strict ?? 0) - (a.strict ?? 0) || (b.composite ?? 0) - (a.composite ?? 0));

  const lines: string[] = [
    `# Finance Parse Hard-25 Eval — ${date}`,
    "",
    `25 extreme-but-realistic scenarios (12 rewrites + 13 new angles) × **${ALL_EVAL_MODELS.length} models**.`,
    "",
    "## Recommendation",
    "",
    "**Production:** `google/gemma-4-31b-it` — 24/25 strict, lowest cost among top tier, multimodal.",
    "",
    "**Latency leader (24/25):** `google/gemini-3.1-flash-lite` — ~2s/scenario.",
    "",
    "**DeepSeek v4 Pro:** use direct `api.deepseek.com` (22/25), not OpenRouter Baidu route (19/25).",
    "",
    "## Models (full roster)",
    "",
    ...ALL_EVAL_MODELS.map((m) => `- \`${m}\``),
    "",
    "## Scoreboard",
    "",
    "| Model | Strict | Composite | Excellent | Errors | Latency | IDR/25-run | IDR/req |",
    "|-------|--------|-----------|-----------|--------|---------|------------|---------|",
  ];

  for (const r of sorted) {
    lines.push(
      `| ${r.modelId} | ${r.strict}/${SCENARIO_COUNT} | ${r.composite?.toFixed(0)} | ${r.tierExcellent ?? "—"} | ${r.errors ?? 0} | ${Math.round(r.evalMeanMs ?? 0)}ms | ${fmtIdr(r.estCost25Usd)} | ${fmtIdr(r.csvCostPerReqUsd)} |`,
    );
  }

  lines.push("", "## Per-model failures", "");

  for (const r of sorted) {
    const fails = failures.get(r.modelId) ?? [];
    lines.push(`### ${r.modelId}`, "");
    lines.push(`- **Strict:** ${r.strict}/${SCENARIO_COUNT} · **Composite:** ${r.composite?.toFixed(0)} · **Latency:** ~${Math.round(r.evalMeanMs ?? 0)}ms`);
    lines.push(`- **Cost:** ${fmtIdr(r.estCost25Usd)}/25-run · ${fmtIdr(r.csvCostPerReqUsd)}/request`);
    if (fails.length === 0) lines.push("- **Failed scenarios:** none");
    else lines.push(`- **Failed scenarios:** ${fails.join(", ")}`);
    lines.push("");
  }

  lines.push(
    "## Failure clusters",
    "",
    "### Qty×unit line-split (22/25 ceiling)",
    "",
    "Models at 22/25 often fail: `hard-cilok-qty-44`, `hard-td-spp-3anak`, `hard-daging-2kg`.",
    "",
    "### Date-label semantics (24/25 models)",
    "",
    "`hard-sep-wifi-token`, `hard-voice-ojek-correct` — amounts correct; `tadi malam` vs `hari_ini` debatable.",
    "",
    "### Nemotron-only (15/25)",
    "",
    "Additional failures: future intent, cancelled orders, slang, patungan, COD tip.",
    "",
    "## Data sources",
    "",
    "- `docs/results/2026-06-26-finance-hard-25-results.json` — original 8-model run",
    "- `docs/results/runs/2026-06-27-*.json` — Jun 27 supplement",
    "- `docs/results/scorecard.json` — merged scorecard",
    "",
    "Regenerate: `bun run eval:scorecard && bun run report && bun run analysis`",
    "",
  );

  const outPath = resolve(import.meta.dirname, "../docs/results/hard-25-analysis.md");
  writeFileSync(outPath, lines.join("\n"));
  console.log(`Wrote ${outPath}`);
}

main();
