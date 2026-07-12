/**
 * Rupiah-Pro smoke matrix: Qwen3.6 × (WandB | SiliconFlow) × (det0 | mild | friend)
 * on 5 hardest hardplus scenarios.
 *
 *   bun run scripts/eval-qwen-agentic-provider-matrix.ts
 *   bun run scripts/eval-qwen-agentic-provider-matrix.ts --concurrency 1
 */

import { config } from "dotenv";
import { mkdirSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";

config({ path: resolve(import.meta.dirname, "../.env") });

import { runAgenticSuite } from "../src/agentic/runner";
import type { AgenticSampling } from "../src/agentic/agent";
import type { ScenarioRunResult } from "../src/agentic/types";

const MODEL = "qwen/qwen3.6-35b-a3b";

/** 5 hardest hardplus picks (Qwen historical weakness + discriminative set). */
const HARD_SMOKE_IDS = [
  "hp-double-post-rage-dedupe",
  "hp-switch-org-midchat",
  "hp-contaminated-qty-rage-fix",
  "hp-auditor-pdf-csv-nota",
  "hp-contaminated-refund-plus-mutasi",
] as const;

const PROVIDERS = [
  // NOTE: WandB + SiliconFlow won Parse-25 speed/quality, but OpenRouter marks
  // both as tools=false for qwen/qwen3.6-35b-a3b — they 404 on Rupiah-Pro.
  // Closest tool-capable picks from the same Parse-25 matrix:
  { id: "atlas-cloud/fp8", label: "AtlasCloud" },
  { id: "akashml/fp8", label: "AkashML" },
] as const;

type Cfg = { id: string; label: string; params: AgenticSampling };

const CONFIGS: Cfg[] = [
  { id: "det0", label: "bench-default (temp=0)", params: { temperature: 0 } },
  {
    id: "mild",
    label: "mild (temp=0.3, top_p=0.9, top_k=40)",
    params: { temperature: 0.3, top_p: 0.9, top_k: 40 },
  },
  {
    id: "friend",
    label: "friend-rec (temp=1.0, top_p=0.95, top_k=20, presence=1.5)",
    params: {
      temperature: 1.0,
      top_p: 0.95,
      top_k: 20,
      min_p: 0.0,
      presence_penalty: 1.5,
      repetition_penalty: 1.0,
    },
  },
];

function rupiahProScore(r: ScenarioRunResult): number {
  const det = r.deterministic.score;
  const iff = r.ifBench.score;
  return Math.round(100 * (det / 40) ** 2 * (iff / 100) * 10) / 10;
}

function parseCli() {
  const argv = process.argv.slice(2);
  let concurrency = 2;
  for (let i = 0; i < argv.length; i++) {
    if (argv[i] === "--concurrency" && argv[i + 1]) concurrency = Number(argv[++i]);
  }
  return { concurrency };
}

function stats(nums: number[]) {
  if (!nums.length) return { avg: 0, min: 0, max: 0, n: 0 };
  return {
    avg: nums.reduce((a, b) => a + b, 0) / nums.length,
    min: Math.min(...nums),
    max: Math.max(...nums),
    n: nums.length,
  };
}

async function main() {
  const { concurrency } = parseCli();
  type Cell = {
    provider: string;
    providerLabel: string;
    configId: string;
    configLabel: string;
    summary: Record<string, unknown>;
    results: ScenarioRunResult[];
    perScenario: Array<{
      scenarioId: string;
      det: number;
      ifBench: number;
      legacyTotal: number;
      rupiahPro: number;
      error: string | null;
      ms: number;
    }>;
  };

  const cells: Cell[] = [];
  const jobs = PROVIDERS.flatMap((p) =>
    CONFIGS.map((c) => ({ provider: p, config: c })),
  );

  console.log(`Qwen Rupiah-Pro smoke matrix — ${MODEL}`);
  console.log(`Scenarios (5/8 hardplus): ${HARD_SMOKE_IDS.join(", ")}`);
  console.log(`Providers: ${PROVIDERS.map((p) => p.label).join(", ")}`);
  console.log(`Configs: ${CONFIGS.map((c) => c.id).join(", ")}`);
  console.log(`Cells: ${jobs.length} | concurrency/cell: ${concurrency}\n`);

  for (const job of jobs) {
    console.log(`\n${"=".repeat(72)}`);
    console.log(`▶ ${job.provider.label} / ${job.config.id}`);
    console.log("=".repeat(72));

    const { results, summary } = await runAgenticSuite({
      modelId: MODEL,
      providerOnly: [job.provider.id],
      ids: [...HARD_SMOKE_IDS],
      suite: "hardplus",
      concurrency,
      sampling: job.config.params,
    });

    const perScenario = results.map((r) => ({
      scenarioId: r.scenarioId,
      det: r.deterministic.score,
      ifBench: r.ifBench.score,
      legacyTotal: r.totalScore,
      rupiahPro: rupiahProScore(r),
      error: r.error,
      ms: r.ms,
    }));

    cells.push({
      provider: job.provider.id,
      providerLabel: job.provider.label,
      configId: job.config.id,
      configLabel: job.config.label,
      summary,
      results,
      perScenario,
    });

    const rp = stats(perScenario.map((p) => p.rupiahPro));
    const det = stats(perScenario.map((p) => p.det));
    console.log(
      `  cell done: Rupiah-Pro avg=${rp.avg.toFixed(1)} [${rp.min}-${rp.max}] det_avg=${det.avg.toFixed(1)} errors=${perScenario.filter((p) => p.error).length}`,
    );
  }

  // Rank cells
  const ranked = cells
    .map((c) => {
      const rp = stats(c.perScenario.map((p) => p.rupiahPro));
      const det = stats(c.perScenario.map((p) => p.det));
      const iff = stats(c.perScenario.map((p) => p.ifBench));
      const ms = stats(c.perScenario.map((p) => p.ms));
      return {
        provider: c.provider,
        providerLabel: c.providerLabel,
        configId: c.configId,
        configLabel: c.configLabel,
        rupiahPro: rp,
        det,
        ifBench: iff,
        ms,
        errors: c.perScenario.filter((p) => p.error).length,
        perScenario: c.perScenario,
      };
    })
    .sort((a, b) => b.rupiahPro.avg - a.rupiahPro.avg || a.ms.avg - b.ms.avg);

  const lines: string[] = [];
  lines.push(`# Qwen3.6 Rupiah-Pro provider smoke matrix`);
  lines.push("");
  lines.push(`Generated: ${new Date().toISOString()}`);
  lines.push("");
  lines.push(`- Model: \`${MODEL}\``);
  lines.push(`- Suite: **5 of 8 hardplus** (hardest / discriminative for Qwen)`);
  lines.push(`- IDs: ${HARD_SMOKE_IDS.map((id) => `\`${id}\``).join(", ")}`);
  lines.push(`- Providers: AtlasCloud, AkashML (tool-capable; WandB/SiliconFlow lack tools on OR)`);
  lines.push(`- Configs: det0, mild, friend`);
  lines.push(`- Public score: \`100 × (det/40)² × (ifBench/100)\``);
  lines.push("");
  lines.push(`## Cell ranking`);
  lines.push("");
  lines.push(`| Rank | Provider | Config | Rupiah-Pro avg | min–max | det avg | IF avg | avg ms | errors |`);
  lines.push(`|-----:|----------|--------|---------------:|--------:|--------:|-------:|-------:|-------:|`);
  ranked.forEach((r, i) => {
    lines.push(
      `| ${i + 1} | ${r.providerLabel} | ${r.configId} | **${r.rupiahPro.avg.toFixed(1)}** | ${r.rupiahPro.min}–${r.rupiahPro.max} | ${r.det.avg.toFixed(1)} | ${r.ifBench.avg.toFixed(0)} | ${Math.round(r.ms.avg)} | ${r.errors} |`,
    );
  });
  lines.push("");
  lines.push(`## Per-scenario detail`);
  lines.push("");
  for (const r of ranked) {
    lines.push(`### ${r.providerLabel} / ${r.configId}`);
    lines.push("");
    lines.push(`| Scenario | Rupiah-Pro | Det/40 | IF | ms | Error |`);
    lines.push(`|----------|-----------:|-------:|---:|---:|-------|`);
    for (const s of r.perScenario) {
      lines.push(
        `| ${s.scenarioId} | ${s.rupiahPro} | ${s.det} | ${s.ifBench} | ${s.ms} | ${s.error ? s.error.slice(0, 60) : ""} |`,
      );
    }
    lines.push("");
  }
  lines.push(`## Sampling configs`);
  lines.push("");
  for (const c of CONFIGS) {
    lines.push(`- **${c.id}** — ${c.label}: \`${JSON.stringify(c.params)}\``);
  }
  lines.push("");
  lines.push(`## Notes`);
  lines.push("");
  lines.push(`- Smoke only (n=5 scenarios, 1 repeat) — not a full Rupiah-Pro leaderboard claim.`);
  lines.push(`- WandB/SiliconFlow were preferred from Parse-25 but both report \`tools=false\` on OpenRouter for this model.`);
  lines.push(`- Substitutes: AtlasCloud (best Parse-25 among tool-capable) + AkashML (fast/cheap tool-capable).`);
  lines.push("");

  const stamp = new Date().toISOString().replace(/[:.]/g, "-").slice(0, 19);
  const outDir = resolve(import.meta.dirname, "../docs/results/agentic");
  mkdirSync(outDir, { recursive: true });
  const base = `${stamp.slice(0, 10)}-qwen36-agentic-provider-smoke`;
  const jsonPath = resolve(outDir, `${base}.json`);
  const mdPath = resolve(outDir, `${base}.md`);

  writeFileSync(
    jsonPath,
    JSON.stringify(
      {
        model: MODEL,
        generatedAt: new Date().toISOString(),
        scenarioIds: HARD_SMOKE_IDS,
        providers: PROVIDERS,
        configs: CONFIGS,
        ranked,
        cells: cells.map((c) => ({
          provider: c.provider,
          providerLabel: c.providerLabel,
          configId: c.configId,
          configLabel: c.configLabel,
          summary: c.summary,
          perScenario: c.perScenario,
          results: c.results,
        })),
      },
      null,
      2,
    ),
  );
  writeFileSync(mdPath, lines.join("\n"));

  console.log(`\n${"=".repeat(72)}`);
  console.log(lines.join("\n"));
  console.log(`Wrote ${jsonPath}`);
  console.log(`Wrote ${mdPath}`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
