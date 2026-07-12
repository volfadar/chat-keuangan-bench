/**
 * generate-report-assets.ts — SVG charts + IDR-enriched report from scorecard JSON.
 *
 * Scatter: X = cost ascending (cheap left → expensive right), ideal = top-left.
 *
 * FX rate: 1 USD = 17,905 IDR (27 Jun 2026 ~12:50 WIB)
 *
 * Run:
 *   bun run scripts/generate-report-assets.ts
 *   bun run scripts/generate-report-assets.ts --scorecard docs/results/scorecard.json
 */

import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";
import { ALL_EVAL_MODELS, USD_TO_IDR, shortModelName } from "../src/core/model-roster.ts";
import {
  PALETTE,
  barChartSvg,
  chartEmbedMd,
  idrCostTicks,
  scatterSvg,
} from "./lib/chart-svg.ts";

export { USD_TO_IDR, shortModelName as shortName } from "../src/core/model-roster.ts";

export function usdToIdr(usd: number): number {
  return Math.round(usd * USD_TO_IDR);
}

export function fmtIdr(amount: number): string {
  return `Rp\u00a0${amount.toLocaleString("id-ID")}`;
}

export function fmtIdrShort(amount: number): string {
  if (amount >= 1_000_000) return `Rp ${(amount / 1_000_000).toFixed(1)}jt`;
  if (amount >= 1_000) return `Rp ${Math.round(amount / 1_000)}rb`;
  return fmtIdr(amount);
}

interface ScorecardRow {
  modelId: string;
  strict: number | null;
  composite: number | null;
  evalMeanMs: number | null;
  estCost25Usd: number | null;
  throughputTps: number | null;
  csvCostPerReqUsd: number | null;
}

interface ScorecardPayload {
  scorecard: ScorecardRow[];
  generatedAt?: string;
}

function shortName(modelId: string): string {
  return shortModelName(modelId);
}

function parseArgs(argv: string[]) {
  let scorecardPath = resolve(import.meta.dirname, "../docs/results/scorecard.json");
  let outDir = resolve(import.meta.dirname, "../docs/charts");
  for (let i = 2; i < argv.length; i++) {
    if (argv[i] === "--scorecard" && argv[i + 1]) scorecardPath = resolve(argv[++i]!);
    else if (argv[i] === "--out" && argv[i + 1]) outDir = resolve(argv[++i]!);
  }
  return { scorecardPath, outDir };
}

function main() {
  const { scorecardPath, outDir } = parseArgs(process.argv);
  const payload = JSON.parse(readFileSync(scorecardPath, "utf8")) as ScorecardPayload;
  const rows = payload.scorecard
    .filter((r) => r.strict != null)
    .sort((a, b) => (b.strict ?? 0) - (a.strict ?? 0));

  mkdirSync(outDir, { recursive: true });

  const strictChart = barChartSvg({
    title: "Hard-25 strict pass (of 25 scenarios)",
    unit: "Higher is better",
    rows: rows.map((r, i) => ({
      label: shortName(r.modelId),
      value: r.strict ?? 0,
      display: `${r.strict}/25`,
      color: PALETTE[i % PALETTE.length]!,
    })),
    maxValue: 25,
  });

  const costRows = [...rows].sort((a, b) => (a.estCost25Usd ?? 0) - (b.estCost25Usd ?? 0));
  const costChart = barChartSvg({
    title: `Est. cost per 25-scenario eval run`,
    unit: `FX: 1 USD = ${USD_TO_IDR.toLocaleString("id-ID")} IDR (27 Jun 2026)`,
    rows: costRows.map((r, i) => {
      const idr = usdToIdr(r.estCost25Usd ?? 0);
      return {
        label: shortName(r.modelId),
        value: idr,
        display: fmtIdrShort(idr),
        color: PALETTE[i % PALETTE.length]!,
      };
    }),
  });

  const latencyChart = barChartSvg({
    title: "Mean eval latency per scenario",
    unit: "Milliseconds — lower is better",
    rows: [...rows]
      .sort((a, b) => (a.evalMeanMs ?? 0) - (b.evalMeanMs ?? 0))
      .map((r, i) => ({
        label: shortName(r.modelId),
        value: r.evalMeanMs ?? 0,
        display: `${Math.round(r.evalMeanMs ?? 0)} ms`,
        color: PALETTE[i % PALETTE.length]!,
      })),
  });

  const idrPrices = rows.map((r) => usdToIdr(r.csvCostPerReqUsd ?? 0));
  const minPrice = Math.min(...idrPrices);
  const maxPrice = Math.max(...idrPrices);

  const scatterChart = scatterSvg({
    title: "Quality vs price (trade-off)",
    xLabel: "IDR per parse → (cheaper left · more expensive right)",
    yLabel: "Composite score (90–100, fixed)",
    yMin: 90,
    yMax: 100,
    xMetricTicks: idrCostTicks(minPrice, maxPrice),
    formatXTick: (n) => `Rp\u00a0${Math.round(n)}`,
    shortLabel: shortName,
    points: rows.map((r, i) => ({
      label: r.modelId,
      x: usdToIdr(r.csvCostPerReqUsd ?? 0),
      y: r.composite ?? 0,
      color: PALETTE[i % PALETTE.length]!,
    })),
  });

  const throughputRows = rows.filter((r) => (r.throughputTps ?? 0) > 0);
  const throughputChart = barChartSvg({
    title: "OpenRouter throughput (completion tokens / sec)",
    unit: "From activity CSV — higher is better (new models: eval-run cost only)",
    rows: [...throughputRows]
      .sort((a, b) => (b.throughputTps ?? 0) - (a.throughputTps ?? 0))
      .map((r, i) => ({
        label: shortName(r.modelId),
        value: r.throughputTps ?? 0,
        display: `${(r.throughputTps ?? 0).toFixed(0)} t/s`,
        color: PALETTE[i % PALETTE.length]!,
      })),
  });

  writeFileSync(resolve(outDir, "strict-pass.svg"), strictChart);
  writeFileSync(resolve(outDir, "cost-25-idr.svg"), costChart);
  writeFileSync(resolve(outDir, "latency.svg"), latencyChart);
  writeFileSync(resolve(outDir, "quality-vs-price.svg"), scatterChart);
  writeFileSync(resolve(outDir, "throughput.svg"), throughputChart);

  const reportLines = [
    `# Model comparison report`,
    ``,
    `Generated from hard-25 eval + OpenRouter activity CSV.`,
    `**${ALL_EVAL_MODELS.length} models** evaluated · **FX:** 1 USD = **${USD_TO_IDR.toLocaleString("id-ID")} IDR** (27 Jun 2026)`,
    ``,
    `## Visual summary`,
    ``,
    `Charts render at **960px** width — scroll horizontally on narrow screens if needed.`,
    ``,
    ...chartEmbedMd(
      "./charts/strict-pass.svg",
      "Strict pass rate",
      "Hard-25 scenarios passed with exact structured match.",
    ),
    ...chartEmbedMd(
      "./charts/cost-25-idr.svg",
      "Cost per 25-scenario eval run (IDR)",
      `FX: 1 USD = ${USD_TO_IDR.toLocaleString("id-ID")} IDR`,
    ),
    ...chartEmbedMd("./charts/latency.svg", "Mean eval latency per scenario"),
    ...chartEmbedMd(
      "./charts/quality-vs-price.svg",
      "Quality vs price trade-off",
      "Ideal quadrant: **top-left** (high composite, cheaper → left). X-axis: cost ascending. Y-axis zoomed to 90–100.",
    ),
    ...chartEmbedMd("./charts/throughput.svg", "OpenRouter throughput (tokens/sec)"),
    `## Master table (USD + IDR)`,
    ``,
    `| Model | Strict | Composite | Latency | $/25-run | IDR/25-run | $/request | IDR/request |`,
    `|-------|--------|-----------|---------|----------|------------|-----------|-------------|`,
  ];

  for (const r of rows) {
    const idr25 = usdToIdr(r.estCost25Usd ?? 0);
    const idrReq = usdToIdr(r.csvCostPerReqUsd ?? 0);
    reportLines.push(
      `| ${shortName(r.modelId)} | ${r.strict}/25 | ${r.composite?.toFixed(0)} | ${Math.round(r.evalMeanMs ?? 0)}ms | $${(r.estCost25Usd ?? 0).toFixed(4)} | ${fmtIdr(idr25)} | $${(r.csvCostPerReqUsd ?? 0).toFixed(5)} | ${fmtIdr(idrReq)} |`,
    );
  }

  const gemma = rows.find((r) => r.modelId === "google/gemma-4-31b-it");
  const fastest = [...rows].sort((a, b) => (a.evalMeanMs ?? 9e9) - (b.evalMeanMs ?? 9e9))[0]!;
  const cheapest21 = [...rows]
    .filter((r) => (r.strict ?? 0) >= 21)
    .sort((a, b) => (a.estCost25Usd ?? 9e9) - (b.estCost25Usd ?? 9e9))[0]!;
  const dsFlash = rows.find((r) => r.modelId === "deepseek/deepseek-v4-flash");

  reportLines.push(
    ``,
    `## Recommendations`,
    ``,
    `| Use case | Model | Why |`,
    `|----------|-------|-----|`,
    `| **Production (recommended)** | \`gemma-4-31b-it\` | 24/25 strict, ~${fmtIdrShort(usdToIdr(gemma?.estCost25Usd ?? 0.0064))}/25-run, multimodal |`,
    `| **Best latency (24/25)** | \`gemini-3.1-flash-lite\` | ~2s/scenario, 24/25 strict |`,
    `| **Fastest overall** | \`${shortName(fastest.modelId)}\` | ~${Math.round(fastest.evalMeanMs ?? 0)}ms/scenario |`,
    `| **Cheapest ≥21/25** | \`${shortName(cheapest21?.modelId ?? "deepseek-v4-flash")}\` | ${cheapest21?.strict ?? 21}/25 at ~${fmtIdrShort(usdToIdr(cheapest21?.estCost25Usd ?? dsFlash?.estCost25Usd ?? 0))}/25-run |`,
    `| **DeepSeek v4 Pro** | \`deepseek-v4-pro\` (direct API) | 22/25 — not OpenRouter Baidu (19/25) |`,
    `| **Supplement: MiMo** | \`mimo-v2.5-pro\` | 22/25, Rp 101/25-run via Xiaomi OR provider |`,
    `| **Avoid** | \`nemotron-3-nano-30b-a3b\` | 15/25 — probe only |`,
    ``,
    `> Per-message inference at scale: multiply **IDR/request** by your daily message volume.`,
    ``,
    `See also: [hard-25-analysis.md](./results/hard-25-analysis.md) · [hard-25-supplement-jun27.md](./results/hard-25-supplement-jun27.md)`,
  );

  const reportDir = resolve(import.meta.dirname, "../docs");
  writeFileSync(resolve(reportDir, "REPORT.md"), reportLines.join("\n"));

  console.log(`Charts: ${outDir}/`);
  console.log(`Report: ${resolve(reportDir, "REPORT.md")}`);
}

main();
