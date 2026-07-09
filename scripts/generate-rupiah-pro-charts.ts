/**
 * generate-rupiah-pro-charts.ts — Parse-25-style SVG charts for Rupiah-Pro.
 *
 * Cost axis (public / reliable):
 *   OpenRouter **unit price** from Parse-25 scorecard (`csvCostPerReqUsd` → IDR/request).
 *   Same measured prices as the Parse-25 quality-vs-price chart — NOT wall-time
 *   attribution of parallel agentic batches (those over-attribute slow/cheap models
 *   like Gemma and are not comparable across batches).
 *
 * Latency axis: mean scenario ms from agentic suite traces (agent + judge).
 *
 * Suite $ burn: kept in cost-attribution.json as audit-only (unreliable until
 * serial re-runs with per-model key snapshots).
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

type ScorecardPayload = {
  scorecard: Array<{
    modelId: string;
    csvCostPerReqUsd: number | null;
    estCost25Usd: number | null;
  }>;
};

type CostRow = {
  modelId: string;
  score: number;
  meanMs: number;
  totalMs: number;
  /** Measured OpenRouter IDR per request (Parse-25 scorecard) — public X axis */
  unitCostIdr: number;
  unitCostUsd: number;
  estCost25Usd: number;
  costMethod: "scorecard_csv_unit_price";
  /** Audit-only parallel-batch wall share — NOT for ranking */
  suiteBurnUsdAudit: number | null;
  suiteBurnMethod: string | null;
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

function wallShareCosts(): Map<string, { usd: number; batchId: string }> {
  const out = new Map<string, { usd: number; batchId: string }>();
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

function loadUnitPrices(): Map<string, { usdPerReq: number; estCost25Usd: number }> {
  const path = resolve("docs/results/scorecard.json");
  const sc = loadJson<ScorecardPayload>(path);
  const out = new Map<string, { usdPerReq: number; estCost25Usd: number }>();
  for (const r of sc.scorecard) {
    if (r.csvCostPerReqUsd == null) continue;
    out.set(r.modelId, {
      usdPerReq: r.csvCostPerReqUsd,
      estCost25Usd: r.estCost25Usd ?? r.csvCostPerReqUsd * 25,
    });
  }
  return out;
}

type TimingRow = {
  modelId: string;
  score: number;
  meanMs: number;
  totalMs: number;
};

function buildTimingRows(lb: LeaderboardPayload): TimingRow[] {
  return lb.leaderboard.map((row) => {
    const t = suiteTiming(row.sourcePath);
    return {
      modelId: row.modelId,
      score: row.score,
      meanMs: t.meanMs,
      totalMs: t.totalMs,
    };
  });
}

function buildCostRows(lb: LeaderboardPayload): CostRow[] {
  const unitPrices = loadUnitPrices();
  const burnAudit = wallShareCosts();
  const missing: string[] = [];

  const rows: CostRow[] = [];
  for (const row of lb.leaderboard) {
    const t = suiteTiming(row.sourcePath);
    const price = unitPrices.get(row.modelId);
    if (!price) {
      missing.push(row.modelId);
      continue;
    }
    const burn = burnAudit.get(row.modelId);
    rows.push({
      modelId: row.modelId,
      score: row.score,
      meanMs: t.meanMs,
      totalMs: t.totalMs,
      unitCostUsd: price.usdPerReq,
      unitCostIdr: usdToIdr(price.usdPerReq),
      estCost25Usd: price.estCost25Usd,
      costMethod: "scorecard_csv_unit_price",
      suiteBurnUsdAudit: burn?.usd ?? null,
      suiteBurnMethod: burn
        ? `wall_share_of_batch:${burn.batchId}`
        : "no_budget_track",
    });
  }

  if (missing.length) {
    console.warn(
      `WARN: no Parse-25 unit price for: ${missing.join(", ")} — omitted from cost scatter only`,
    );
  }
  return rows;
}

function main() {
  const root = resolve(import.meta.dirname, "..");
  const lbPath = resolve(root, "docs/results/agentic/rupiah-pro-leaderboard-latest.json");
  const outDir = resolve(root, "docs/charts/rupiah-pro");
  mkdirSync(outDir, { recursive: true });

  const lb = loadJson<LeaderboardPayload>(lbPath);
  const timings = buildTimingRows(lb);
  const costs = buildCostRows(lb);
  if (costs.length === 0) throw new Error("No models with unit prices");

  const byScore = [...timings].sort((a, b) => b.score - a.score);
  const byCost = [...costs].sort((a, b) => a.unitCostUsd - b.unitCostUsd);
  const byLatency = [...timings].sort((a, b) => a.meanMs - b.meanMs);

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
    title: "OpenRouter unit price (IDR / request)",
    unit: `Same measured prices as Parse-25 scorecard · FX 1 USD = ${USD_TO_IDR.toLocaleString("id-ID")} IDR · NOT agentic suite burn`,
    rows: byCost.map((r, i) => ({
      label: shortModelName(r.modelId),
      value: r.unitCostIdr,
      display: fmtIdr(r.unitCostIdr),
      color: PALETTE[i % PALETTE.length]!,
    })),
  });

  const latencyChart = barChartSvg({
    title: "Mean scenario latency (agent + judge)",
    unit: "Milliseconds — lower is better · from Rupiah-Pro suite traces",
    rows: byLatency.map((r, i) => ({
      label: shortModelName(r.modelId),
      value: r.meanMs,
      display: `${Math.round(r.meanMs / 1000)}s`,
      color: PALETTE[i % PALETTE.length]!,
    })),
  });

  const minIdr = Math.min(...costs.map((c) => c.unitCostIdr));
  const maxIdr = Math.max(...costs.map((c) => c.unitCostIdr));
  const yMin = Math.max(0, Math.floor(Math.min(...timings.map((c) => c.score)) / 5) * 5 - 5);
  const yMax = 100;

  const scatterChart = scatterSvg({
    title: "Rupiah-Pro: quality vs unit price",
    xLabel: "IDR / request → (cheaper left · more expensive right)",
    yLabel: `Rupiah-Pro score (${yMin}–${yMax})`,
    yMin,
    yMax,
    xMetricTicks: idrCostTicks(minIdr, maxIdr),
    formatXTick: (n) => `Rp\u00a0${Math.round(n)}`,
    shortLabel: shortModelName,
    points: costs.map((r, i) => ({
      label: r.modelId,
      x: r.unitCostIdr,
      y: r.score,
      color: PALETTE[i % PALETTE.length]!,
    })),
  });

  writeFileSync(resolve(outDir, "score.svg"), scoreChart);
  writeFileSync(resolve(outDir, "cost-unit-idr.svg"), costChart);
  // Keep old filename as alias so existing links don't 404
  writeFileSync(resolve(outDir, "cost-suite-idr.svg"), costChart);
  writeFileSync(resolve(outDir, "latency.svg"), latencyChart);
  writeFileSync(resolve(outDir, "quality-vs-price.svg"), scatterChart);

  const costMeta = {
    generatedAt: new Date().toISOString(),
    fxUsdToIdr: USD_TO_IDR,
    publicCostAxis: {
      metric: "csvCostPerReqUsd from docs/results/scorecard.json (Parse-25 OpenRouter activity)",
      unit: "IDR per request",
      rationale:
        "Unit prices are measured and comparable. Parallel agentic batch wall-share made Gemma look more expensive than Gemini because Gemma is slower (more wall ms) while actually cheaper per token — that ranking was wrong.",
    },
    suiteBurnAuditOnly: {
      note: "Wall-share of budget-track overall.spentUsd — do NOT use for public ranking until serial re-runs.",
      tracks: BUDGET_TRACKS,
    },
    models: costs.map((c) => ({
      modelId: c.modelId,
      score: c.score,
      meanMs: Math.round(c.meanMs),
      unitCostUsd: c.unitCostUsd,
      unitCostIdr: c.unitCostIdr,
      estCost25Usd: c.estCost25Usd,
      costMethod: c.costMethod,
      suiteBurnUsdAudit: c.suiteBurnUsdAudit,
      suiteBurnMethod: c.suiteBurnMethod,
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
    `**Public cost metric:** measured OpenRouter **IDR/request** from the Parse-25 scorecard (same source as Parse-25 quality-vs-price).`,
    ``,
    `> Agentic suite $ burn from parallel batches is **not** used on the public chart — wall-share wrongly ranked slow/cheap models (e.g. Gemma) above Gemini.`,
    ``,
    ...chartEmbedMd(
      "./score.svg",
      "Public score",
      "Rupiah-Pro v1 · 14 discriminative scenarios.",
    ),
    ...chartEmbedMd(
      "./cost-unit-idr.svg",
      "Unit price (IDR / request)",
      `FX: 1 USD = ${USD_TO_IDR.toLocaleString("id-ID")} IDR · Parse-25 scorecard.`,
    ),
    ...chartEmbedMd("./latency.svg", "Mean scenario latency"),
    ...chartEmbedMd(
      "./quality-vs-price.svg",
      "Quality vs unit price",
      "Ideal quadrant: **top-left** (high score, cheaper → left).",
    ),
    `## Cost table`,
    ``,
    `| Model | Score | Mean latency | IDR/req | $/25-parse |`,
    `|-------|------:|-------------:|--------:|-----------:|`,
    ...byScore.map((r) => {
      const c = costs.find((x) => x.modelId === r.modelId);
      return `| \`${shortModelName(r.modelId)}\` | ${r.score} | ${Math.round(r.meanMs / 1000)}s | ${c ? fmtIdr(c.unitCostIdr) : "—"} | ${c ? `$${c.estCost25Usd.toFixed(4)}` : "—"} |`;
    }),
    ``,
  ];

  writeFileSync(resolve(outDir, "README.md"), reportLines.join("\n"));

  console.log(`Rupiah-Pro charts → ${outDir}/`);
  console.log("Public cost = Parse-25 unit price (IDR/req):");
  for (const c of byCost) {
    console.log(
      `  ${fmtIdr(c.unitCostIdr).padStart(8)}  score=${c.score.toFixed(1).padStart(5)}  ${shortModelName(c.modelId)}`,
    );
  }
}

main();
