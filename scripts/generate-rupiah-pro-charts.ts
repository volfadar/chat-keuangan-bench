/**
 * generate-rupiah-pro-charts.ts — Parse-25-style SVG charts for Rupiah-Pro.
 *
 * Cost metric (best available until serial re-runs):
 *   - Measured OpenRouter batch spend (`overall.spentUsd` from budget-track-*.json)
 *   - Attributed to each model by wall-time share within that batch
 *   - Pre-tracker models (gemma, deepseek-v4-flash): estimated via median
 *     attributed-USD / total-scenario-ms from tracked models
 *
 * Scatter: cheap left → expensive right; ideal = top-left.
 *
 *   bun run scripts/generate-rupiah-pro-charts.ts
 */

import { mkdirSync, readFileSync, writeFileSync, existsSync } from "node:fs";
import { resolve } from "node:path";
import { USD_TO_IDR, shortModelName } from "../src/core/model-roster.ts";
import {
  PALETTE,
  barChartSvg,
  chartEmbedMd,
  idrCostTicks,
  scatterSvg,
} from "./lib/chart-svg.ts";

type LeaderboardPayload = {
  generatedAt?: string;
  version?: string;
  leaderboard: Array<{
    rank: number;
    modelId: string;
    score: number;
    min: number;
    below60: number;
    below80: number;
    sourcePath: string;
  }>;
};

type BudgetTrack = {
  runId: string;
  overall: { spentUsd: number };
  scoreboard: Array<{
    modelId: string;
    wallMs: number;
    spentUsd?: number;
    errors?: number;
    skipped?: boolean;
  }>;
};

type SuiteResult = {
  summary: { modelId: string };
  results: Array<{ ms?: number; error?: string | null }>;
};

type CostRow = {
  modelId: string;
  score: number;
  meanMs: number;
  totalMs: number;
  suiteCostUsd: number;
  suiteCostIdr: number;
  costMethod: "wall_share_of_batch" | "estimated_from_median_usd_per_ms";
  batchId?: string;
};

const BUDGET_TRACKS = [
  "docs/results/agentic/budget-track-2026-07-09T13-47-17.json",
  "docs/results/agentic/budget-track-2026-07-09T22-30-02.json",
];

function usdToIdr(usd: number): number {
  return Math.round(usd * USD_TO_IDR);
}

function fmtIdr(amount: number): string {
  return `Rp\u00a0${amount.toLocaleString("id-ID")}`;
}

function fmtIdrShort(amount: number): string {
  if (amount >= 1_000_000) return `Rp ${(amount / 1_000_000).toFixed(1)}jt`;
  if (amount >= 1_000) return `Rp ${Math.round(amount / 1_000)}rb`;
  return fmtIdr(amount);
}

function loadJson<T>(path: string): T {
  return JSON.parse(readFileSync(resolve(path), "utf8")) as T;
}

/** Wall-share attribution of measured batch spend → per-model suite USD. */
function wallShareCosts(): Map<string, { usd: number; batchId: string; wallMs: number }> {
  const out = new Map<string, { usd: number; batchId: string; wallMs: number }>();
  for (const rel of BUDGET_TRACKS) {
    const path = resolve(rel);
    if (!existsSync(path)) continue;
    const track = loadJson<BudgetTrack>(path);
    const valid = track.scoreboard.filter((s) => !s.skipped && (s.errors ?? 0) === 0);
    const sumWall = valid.reduce((a, s) => a + s.wallMs, 0);
    if (sumWall <= 0) continue;
    for (const s of valid) {
      out.set(s.modelId, {
        usd: track.overall.spentUsd * (s.wallMs / sumWall),
        batchId: track.runId,
        wallMs: s.wallMs,
      });
    }
  }
  return out;
}

function suiteTiming(sourcePath: string): { meanMs: number; totalMs: number } {
  const data = loadJson<SuiteResult>(sourcePath);
  const ms = data.results.map((r) => r.ms ?? 0);
  const totalMs = ms.reduce((a, b) => a + b, 0);
  return {
    totalMs,
    meanMs: totalMs / Math.max(ms.length, 1),
  };
}

function buildCostRows(lb: LeaderboardPayload): CostRow[] {
  const attributed = wallShareCosts();
  const rates: number[] = [];
  const timings = new Map<string, { meanMs: number; totalMs: number }>();

  for (const row of lb.leaderboard) {
    const t = suiteTiming(row.sourcePath);
    timings.set(row.modelId, t);
    const a = attributed.get(row.modelId);
    if (a && t.totalMs > 0) rates.push(a.usd / t.totalMs);
  }

  rates.sort((a, b) => a - b);
  const medianRate = rates[Math.floor(rates.length / 2)] ?? 1.25e-7;

  return lb.leaderboard.map((row) => {
    const t = timings.get(row.modelId)!;
    const a = attributed.get(row.modelId);
    const suiteCostUsd = a ? a.usd : medianRate * t.totalMs;
    return {
      modelId: row.modelId,
      score: row.score,
      meanMs: t.meanMs,
      totalMs: t.totalMs,
      suiteCostUsd,
      suiteCostIdr: usdToIdr(suiteCostUsd),
      costMethod: a ? "wall_share_of_batch" : "estimated_from_median_usd_per_ms",
      batchId: a?.batchId,
    };
  });
}

function main() {
  const root = resolve(import.meta.dirname, "..");
  const lbPath = resolve(root, "docs/results/agentic/rupiah-pro-leaderboard-latest.json");
  const outDir = resolve(root, "docs/charts/rupiah-pro");
  mkdirSync(outDir, { recursive: true });

  const lb = loadJson<LeaderboardPayload>(lbPath);
  const costs = buildCostRows(lb);
  const byScore = [...costs].sort((a, b) => b.score - a.score);
  const byCost = [...costs].sort((a, b) => a.suiteCostUsd - b.suiteCostUsd);
  const byLatency = [...costs].sort((a, b) => a.meanMs - b.meanMs);

  const scoreChart = barChartSvg({
    title: "Rupiah-Pro public score (v1)",
    unit: "100 × (det/40)² × (ifBench/100) · 14 discriminative scenarios · higher is better",
    rows: byScore.map((r, i) => ({
      label: shortModelName(r.modelId),
      value: r.score,
      display: r.score.toFixed(1),
      color: PALETTE[i % PALETTE.length]!,
    })),
    maxValue: 100,
  });

  const costChart = barChartSvg({
    title: "Est. cost per full 28-scenario suite (IDR)",
    unit: `Wall-share of measured OpenRouter batch spend · FX 1 USD = ${USD_TO_IDR.toLocaleString("id-ID")} IDR · * = estimated`,
    rows: byCost.map((r, i) => ({
      label:
        shortModelName(r.modelId) +
        (r.costMethod === "estimated_from_median_usd_per_ms" ? " *" : ""),
      value: r.suiteCostIdr,
      display: fmtIdrShort(r.suiteCostIdr),
      color: PALETTE[i % PALETTE.length]!,
    })),
  });

  const latencyChart = barChartSvg({
    title: "Mean scenario latency (agent + judge)",
    unit: "Milliseconds — lower is better",
    rows: byLatency.map((r, i) => ({
      label: shortModelName(r.modelId),
      value: r.meanMs,
      display: `${Math.round(r.meanMs / 1000)}s`,
      color: PALETTE[i % PALETTE.length]!,
    })),
  });

  const minIdr = Math.min(...costs.map((c) => c.suiteCostIdr));
  const maxIdr = Math.max(...costs.map((c) => c.suiteCostIdr));
  const yMin = Math.max(0, Math.floor(Math.min(...costs.map((c) => c.score)) / 5) * 5 - 5);
  const yMax = 100;

  const scatterChart = scatterSvg({
    title: "Rupiah-Pro: quality vs suite cost",
    xLabel: "IDR / 28-scenario suite → (cheaper left · more expensive right)",
    yLabel: `Rupiah-Pro score (${yMin}–${yMax})`,
    yMin,
    yMax,
    xMetricTicks: idrCostTicks(minIdr, maxIdr),
    formatXTick: (n) => fmtIdrShort(n),
    shortLabel: shortModelName,
    points: costs.map((r, i) => ({
      label: r.modelId,
      x: r.suiteCostIdr,
      y: r.score,
      color: PALETTE[i % PALETTE.length]!,
    })),
  });

  writeFileSync(resolve(outDir, "score.svg"), scoreChart);
  writeFileSync(resolve(outDir, "cost-suite-idr.svg"), costChart);
  writeFileSync(resolve(outDir, "latency.svg"), latencyChart);
  writeFileSync(resolve(outDir, "quality-vs-price.svg"), scatterChart);

  const costMeta = {
    generatedAt: new Date().toISOString(),
    fxUsdToIdr: USD_TO_IDR,
    method:
      "overall.spentUsd from budget-track batches, attributed by wallMs share among successful models in that batch. Models without a budget track (gemma-4-31b-it, deepseek-v4-flash) use median attributed-USD/total-scenario-ms × their totalMs.",
    caveat:
      "Parallel runs share one OpenRouter key; wall-share is the best offline attribution until serial re-runs with per-model key snapshots.",
    models: costs.map((c) => ({
      modelId: c.modelId,
      score: c.score,
      meanMs: Math.round(c.meanMs),
      suiteCostUsd: Math.round(c.suiteCostUsd * 1e6) / 1e6,
      suiteCostIdr: c.suiteCostIdr,
      costMethod: c.costMethod,
      batchId: c.batchId ?? null,
    })),
  };
  writeFileSync(resolve(outDir, "cost-attribution.json"), JSON.stringify(costMeta, null, 2));

  const reportLines = [
    `# Rupiah-Pro charts`,
    ``,
    `Generated: ${costMeta.generatedAt}`,
    ``,
    `Same visual language as Parse-25. Cost X-axis: **cheaper left → expensive right**; ideal quadrant **top-left**.`,
    ``,
    `**Cost method:** ${costMeta.method}`,
    ``,
    `> ${costMeta.caveat}`,
    ``,
    ...chartEmbedMd(
      "./score.svg",
      "Public score",
      "Rupiah-Pro v1 · 14 discriminative scenarios.",
    ),
    ...chartEmbedMd(
      "./cost-suite-idr.svg",
      "Suite cost (IDR)",
      `FX: 1 USD = ${USD_TO_IDR.toLocaleString("id-ID")} IDR. * = estimated (no budget track).`,
    ),
    ...chartEmbedMd("./latency.svg", "Mean scenario latency"),
    ...chartEmbedMd(
      "./quality-vs-price.svg",
      "Quality vs suite cost",
      "Ideal quadrant: **top-left** (high score, cheaper → left).",
    ),
    `## Cost table`,
    ``,
    `| Model | Score | Mean latency | Suite $ | Suite IDR | Method |`,
    `|-------|------:|-------------:|--------:|----------:|--------|`,
    ...byScore.map(
      (r) =>
        `| \`${shortModelName(r.modelId)}\` | ${r.score} | ${Math.round(r.meanMs / 1000)}s | $${r.suiteCostUsd.toFixed(3)} | ${fmtIdr(r.suiteCostIdr)} | ${r.costMethod === "wall_share_of_batch" ? "measured†" : "estimated*"} |`,
    ),
    ``,
    `† Wall-share of measured batch \`overall.spentUsd\`. * Median USD/ms × scenario totalMs.`,
    ``,
  ];

  writeFileSync(resolve(outDir, "README.md"), reportLines.join("\n"));

  console.log(`Rupiah-Pro charts → ${outDir}/`);
  for (const c of byScore) {
    console.log(
      `  ${c.score.toFixed(1).padStart(5)}  ${fmtIdrShort(c.suiteCostIdr).padStart(8)}  ${shortModelName(c.modelId)}${c.costMethod === "estimated_from_median_usd_per_ms" ? " *" : ""}`,
    );
  }
}

main();
