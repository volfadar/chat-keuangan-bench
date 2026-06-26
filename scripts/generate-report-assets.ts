/**
 * generate-report-assets.ts — SVG charts + IDR-enriched report from scorecard JSON.
 *
 * FX rate: 1 USD = 17,905 IDR (27 Jun 2026 ~12:50 WIB)
 *
 * Run:
 *   bun run scripts/generate-report-assets.ts
 *   bun run scripts/generate-report-assets.ts --scorecard docs/results/scorecard.json
 */

import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";

/** 1 USD = 17,905 IDR — 27 Jun 2026 ~12:50 WIB */
export const USD_TO_IDR = 17_905;

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
  return modelId.split("/").pop() ?? modelId;
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

/** Native SVG width — renders large when embedded full-width in README */
const CHART_WIDTH = 960;
const BAR_HEIGHT = 36;
const LABEL_W = 220;
const VALUE_W = 140;

function barChartSvg(opts: {
  title: string;
  rows: Array<{ label: string; value: number; display: string; color: string }>;
  maxValue?: number;
  width?: number;
  barHeight?: number;
  unit?: string;
}): string {
  const width = opts.width ?? CHART_WIDTH;
  const barH = opts.barHeight ?? BAR_HEIGHT;
  const gap = 12;
  const labelW = LABEL_W;
  const valueW = VALUE_W;
  const chartW = width - labelW - valueW - 48;
  const max = opts.maxValue ?? Math.max(...opts.rows.map((r) => r.value), 1);
  const height = 56 + opts.rows.length * (barH + gap) + 28;

  const bars = opts.rows
    .map((r, i) => {
      const y = 52 + i * (barH + gap);
      const w = Math.max(4, (r.value / max) * chartW);
      return `
    <text x="8" y="${y + barH * 0.72}" class="label">${escapeXml(r.label)}</text>
    <rect x="${labelW}" y="${y}" width="${w}" height="${barH}" rx="4" fill="${r.color}"/>
    <text x="${labelW + chartW + 8}" y="${y + barH * 0.72}" class="value">${escapeXml(r.display)}</text>`;
    })
    .join("");

  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${width} ${height}" width="${width}" height="${height}">
  <style>
    .title { font: 600 18px system-ui, sans-serif; fill: #0f172a; }
    .label { font: 14px system-ui, sans-serif; fill: #334155; }
    .value { font: 14px system-ui, sans-serif; fill: #475569; }
    .sub { font: 12px system-ui, sans-serif; fill: #64748b; }
  </style>
  <rect width="100%" height="100%" fill="#fafafa"/>
  <text x="16" y="28" class="title">${escapeXml(opts.title)}</text>
  ${opts.unit ? `<text x="16" y="46" class="sub">${escapeXml(opts.unit)}</text>` : ""}
  ${bars}
</svg>`;
}

function scatterSvg(opts: {
  title: string;
  points: Array<{ label: string; x: number; y: number; color: string }>;
  xLabel: string;
  yLabel: string;
  width?: number;
  height?: number;
}): string {
  const W = opts.width ?? CHART_WIDTH;
  const H = opts.height ?? 500;
  const pad = { l: 64, r: 32, t: 48, b: 56 };
  const plotW = W - pad.l - pad.r;
  const plotH = H - pad.t - pad.b;
  const maxX = Math.max(...opts.points.map((p) => p.x), 1);
  const maxY = 100;

  const dots = opts.points
    .map((p) => {
      const cx = pad.l + (p.x / maxX) * plotW;
      const cy = pad.t + plotH - (p.y / maxY) * plotH;
      return `
    <circle cx="${cx}" cy="${cy}" r="9" fill="${p.color}" opacity="0.85"/>
    <text x="${cx + 12}" y="${cy + 5}" class="dot-label">${escapeXml(shortName(p.label))}</text>`;
    })
    .join("");

  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" width="${W}" height="${H}">
  <style>
    .title { font: 600 18px system-ui, sans-serif; fill: #0f172a; }
    .axis { font: 13px system-ui, sans-serif; fill: #64748b; }
    .dot-label { font: 12px system-ui, sans-serif; fill: #334155; }
  </style>
  <rect width="100%" height="100%" fill="#fafafa"/>
  <text x="12" y="22" class="title">${escapeXml(opts.title)}</text>
  <line x1="${pad.l}" y1="${pad.t + plotH}" x2="${pad.l + plotW}" y2="${pad.t + plotH}" stroke="#cbd5e1"/>
  <line x1="${pad.l}" y1="${pad.t}" x2="${pad.l}" y2="${pad.t + plotH}" stroke="#cbd5e1"/>
  <text x="${pad.l + plotW / 2}" y="${H - 8}" text-anchor="middle" class="axis">${escapeXml(opts.xLabel)}</text>
  <text x="14" y="${pad.t + plotH / 2}" transform="rotate(-90 14 ${pad.t + plotH / 2})" text-anchor="middle" class="axis">${escapeXml(opts.yLabel)}</text>
  ${dots}
</svg>`;
}

function escapeXml(s: string): string {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}

/** Full-width chart block for GitHub README / REPORT (HTML img renders larger than table cells). */
function chartEmbedMd(relPath: string, title: string, caption?: string): string[] {
  const lines = [
    `#### ${title}`,
    ``,
    `<p align="center">`,
    `  <img src="${relPath}" alt="${title}" width="${CHART_WIDTH}" />`,
    `</p>`,
    ``,
  ];
  if (caption) lines.splice(1, 0, caption, ``);
  return lines;
}

const PALETTE = [
  "#2563eb", "#16a34a", "#dc2626", "#9333ea", "#ea580c",
  "#0891b2", "#ca8a04", "#4f46e5",
];

function main() {
  const { scorecardPath, outDir } = parseArgs(process.argv);
  const payload = JSON.parse(readFileSync(scorecardPath, "utf8")) as ScorecardPayload;
  const rows = payload.scorecard.filter((r) => r.strict != null).sort((a, b) => (b.strict ?? 0) - (a.strict ?? 0));

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

  const scatterChart = scatterSvg({
    title: "Quality vs speed (trade-off)",
    xLabel: "Mean latency (ms) — lower is better →",
    yLabel: "Composite quality score",
    points: rows.map((r, i) => ({
      label: r.modelId,
      x: r.evalMeanMs ?? 0,
      y: r.composite ?? 0,
      color: PALETTE[i % PALETTE.length]!,
    })),
  });

  const throughputChart = barChartSvg({
    title: "OpenRouter throughput (completion tokens / sec)",
    unit: "From activity CSV — higher is better",
    rows: [...rows]
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
  writeFileSync(resolve(outDir, "quality-vs-latency.svg"), scatterChart);
  writeFileSync(resolve(outDir, "throughput.svg"), throughputChart);

  // Enriched markdown report
  const reportLines = [
    `# Model comparison report`,
    ``,
    `Generated from hard-25 eval + OpenRouter activity CSV.`,
    `**FX:** 1 USD = **${USD_TO_IDR.toLocaleString("id-ID")} IDR** (27 Jun 2026, ~12:50 WIB)`,
    ``,
    `## Visual summary`,
    ``,
    `Charts render at **${CHART_WIDTH}px** width — scroll horizontally on narrow screens if needed.`,
    ``,
    ...chartEmbedMd("./charts/strict-pass.svg", "Strict pass rate", "Hard-25 scenarios passed with exact structured match."),
    ...chartEmbedMd("./charts/cost-25-idr.svg", "Cost per 25-scenario eval run (IDR)", `FX: 1 USD = ${USD_TO_IDR.toLocaleString("id-ID")} IDR`),
    ...chartEmbedMd("./charts/latency.svg", "Mean eval latency per scenario"),
    ...chartEmbedMd("./charts/quality-vs-latency.svg", "Quality vs speed trade-off"),
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

  reportLines.push(
    ``,
    `## Recommendations`,
    ``,
    `| Use case | Model | Why |`,
    `|----------|-------|-----|`,
    `| **Production (best overall)** | \`gemini-3.1-flash-lite\` | 24/25 strict, ~2s, acceptable cost (~${fmtIdrShort(usdToIdr(0.0181))}/25-run) |`,
    `| **Quality tie, slower** | \`gemini-3-flash-preview\` | Same 24/25, higher cost (~${fmtIdrShort(usdToIdr(0.0318))}/25-run) |`,
    `| **Fastest** | \`gpt-oss-120b\` | ~1.3s/scenario, 282 t/s — 21/25 strict |`,
    `| **Cheapest** | \`deepseek-v4-flash\` | ~${fmtIdrShort(usdToIdr(0.0028))}/25-run — 21/25 strict |`,
    ``,
    `> Per-message inference at scale: multiply **IDR/request** by your daily message volume.`,
  );

  const reportDir = resolve(import.meta.dirname, "../docs");
  writeFileSync(resolve(reportDir, "REPORT.md"), reportLines.join("\n"));

  console.log(`Charts: ${outDir}/`);
  console.log(`Report: ${resolve(reportDir, "REPORT.md")}`);
}

main();
