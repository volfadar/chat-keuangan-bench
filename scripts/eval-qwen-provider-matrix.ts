/**
 * Parse-25 provider × sampling matrix for qwen/qwen3.6-35b-a3b on OpenRouter.
 *
 *   bun run scripts/eval-qwen-provider-matrix.ts
 *   bun run scripts/eval-qwen-provider-matrix.ts --repeats 3 --concurrency 2
 *   bun run scripts/eval-qwen-provider-matrix.ts --smoke   # 1 scenario × 1 repeat
 */

import { config } from "dotenv";
import { mkdirSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";

config({ path: resolve(import.meta.dirname, "../.env") });

import { SYSTEM_PROMPT, parseFinanceJson, scoreExtraction, type ParsedFinance } from "../src/core/eval-core.ts";
import { USD_TO_IDR } from "../src/core/model-roster.ts";
import { HARD_SCENARIOS } from "./eval-hard-25.ts";

const MODEL = "qwen/qwen3.6-35b-a3b";

/** Top-5 live OpenRouter endpoints for this model (quality/uptime/throughput). */
const PROVIDERS = [
  { id: "wandb/fp8", label: "WandB" },
  { id: "parasail/fp8", label: "Parasail" },
  { id: "akashml/fp8", label: "AkashML" },
  { id: "atlas-cloud/fp8", label: "AtlasCloud" },
  { id: "siliconflow/fp8", label: "SiliconFlow" },
] as const;

type SamplingConfig = {
  id: string;
  label: string;
  params: Record<string, number>;
};

const CONFIGS: SamplingConfig[] = [
  {
    id: "det0",
    label: "bench-default (temp=0)",
    params: { temperature: 0 },
  },
  {
    id: "mild",
    label: "mild (temp=0.3, top_p=0.9)",
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

interface OrUsage {
  prompt_tokens?: number;
  completion_tokens?: number;
  cost?: number;
}

interface ScenarioResult {
  scenarioId: string;
  strictPass: boolean;
  ms: number;
  costUsd: number;
  error: string | null;
  issues: string[];
}

interface RunResult {
  provider: string;
  providerLabel: string;
  configId: string;
  configLabel: string;
  repeat: number;
  runAt: string;
  strictPass: number;
  totalScenarios: number;
  errors: number;
  totalCostUsd: number;
  avgMs: number;
  results: ScenarioResult[];
}

function parseCli() {
  const argv = process.argv.slice(2);
  let repeats = 3;
  let concurrency = 2;
  let smoke = false;
  let providers = PROVIDERS.map((p) => p.id);
  let configs = CONFIGS.map((c) => c.id);

  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a === "--repeats" && argv[i + 1]) repeats = Number(argv[++i]);
    else if (a === "--concurrency" && argv[i + 1]) concurrency = Number(argv[++i]);
    else if (a === "--smoke") smoke = true;
    else if (a === "--providers" && argv[i + 1]) providers = argv[++i].split(",");
    else if (a === "--configs" && argv[i + 1]) configs = argv[++i].split(",");
  }

  if (smoke) repeats = 1;
  return { repeats, concurrency, smoke, providers, configs };
}

async function callOpenRouter(
  text: string,
  providerOnly: string,
  sampling: Record<string, number>,
): Promise<{ parsed: ParsedFinance; ms: number; usage: OrUsage }> {
  const apiKey = process.env.OPENROUTER_API_KEY;
  if (!apiKey) throw new Error("OPENROUTER_API_KEY missing");

  const body: Record<string, unknown> = {
    model: MODEL,
    messages: [
      { role: "system", content: SYSTEM_PROMPT },
      { role: "user", content: text },
    ],
    max_tokens: 2048,
    reasoning: { effort: "none", exclude: true },
    response_format: { type: "json_object" },
    provider: { only: [providerOnly], allow_fallbacks: false },
    ...sampling,
  };

  const t0 = Date.now();
  const res = await fetch("https://openrouter.ai/api/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
      "HTTP-Referer": "https://github.com/volfadar/chat-keuangan-bench",
      "X-Title": "chat-keuangan-bench-qwen-matrix",
    },
    body: JSON.stringify(body),
  });

  const payload = (await res.json()) as {
    choices?: Array<{ message?: { content?: string } }>;
    usage?: OrUsage;
    error?: { message?: string; metadata?: unknown };
  };

  if (!res.ok) {
    throw new Error(`HTTP ${res.status}: ${payload.error?.message ?? res.statusText}`);
  }

  const content = payload.choices?.[0]?.message?.content;
  if (!content) throw new Error("empty content");

  return {
    parsed: parseFinanceJson(content),
    ms: Date.now() - t0,
    usage: payload.usage ?? {},
  };
}

async function runOnce(
  provider: (typeof PROVIDERS)[number],
  cfg: SamplingConfig,
  repeat: number,
  scenarios: typeof HARD_SCENARIOS,
): Promise<RunResult> {
  const runAt = new Date().toISOString();
  const results: ScenarioResult[] = [];

  for (const scenario of scenarios) {
    process.stdout.write(`    [${provider.label}/${cfg.id} r${repeat}] ${scenario.id} ... `);
    try {
      const { parsed, ms, usage } = await callOpenRouter(scenario.text, provider.id, cfg.params);
      const scored = scoreExtraction(parsed, scenario);
      results.push({
        scenarioId: scenario.id,
        strictPass: scored.pass,
        ms,
        costUsd: usage.cost ?? 0,
        error: null,
        issues: scored.issues,
      });
      console.log(`${scored.pass ? "PASS" : "FAIL"} ${ms}ms`);
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      console.log(`ERROR: ${msg}`);
      results.push({
        scenarioId: scenario.id,
        strictPass: false,
        ms: 0,
        costUsd: 0,
        error: msg,
        issues: [],
      });
    }
  }

  const ok = results.filter((r) => r.strictPass && !r.error).length;
  const errors = results.filter((r) => r.error).length;
  const timed = results.filter((r) => r.ms > 0);
  return {
    provider: provider.id,
    providerLabel: provider.label,
    configId: cfg.id,
    configLabel: cfg.label,
    repeat,
    runAt,
    strictPass: ok,
    totalScenarios: scenarios.length,
    errors,
    totalCostUsd: results.reduce((s, r) => s + r.costUsd, 0),
    avgMs: timed.length ? timed.reduce((s, r) => s + r.ms, 0) / timed.length : 0,
    results,
  };
}

function stats(nums: number[]) {
  if (!nums.length) return { avg: 0, min: 0, max: 0, n: 0 };
  const sum = nums.reduce((a, b) => a + b, 0);
  return {
    avg: sum / nums.length,
    min: Math.min(...nums),
    max: Math.max(...nums),
    n: nums.length,
  };
}

function buildReport(runs: RunResult[]) {
  type CellKey = string;
  const groups = new Map<CellKey, RunResult[]>();
  for (const run of runs) {
    const key = `${run.provider}|${run.configId}`;
    const arr = groups.get(key) ?? [];
    arr.push(run);
    groups.set(key, arr);
  }

  const rows: Array<{
    provider: string;
    providerLabel: string;
    configId: string;
    configLabel: string;
    strict: ReturnType<typeof stats>;
    costUsd: ReturnType<typeof stats>;
    avgMs: ReturnType<typeof stats>;
    errorRate: number;
    repeats: number[];
  }> = [];

  for (const [, cellRuns] of groups) {
    const first = cellRuns[0]!;
    rows.push({
      provider: first.provider,
      providerLabel: first.providerLabel,
      configId: first.configId,
      configLabel: first.configLabel,
      strict: stats(cellRuns.map((r) => r.strictPass)),
      costUsd: stats(cellRuns.map((r) => r.totalCostUsd)),
      avgMs: stats(cellRuns.map((r) => r.avgMs)),
      errorRate: cellRuns.reduce((s, r) => s + r.errors, 0) / (cellRuns.length * first.totalScenarios),
      repeats: cellRuns.map((r) => r.strictPass),
    });
  }

  rows.sort((a, b) => b.strict.avg - a.strict.avg || a.avgMs.avg - b.avgMs.avg);

  const byProvider = new Map<string, typeof rows>();
  for (const row of rows) {
    const arr = byProvider.get(row.provider) ?? [];
    arr.push(row);
    byProvider.set(row.provider, arr);
  }

  const providerRanks = [...byProvider.entries()]
    .map(([provider, cells]) => {
      const best = cells.reduce((a, b) => (b.strict.avg > a.strict.avg ? b : a));
      const det0 = cells.find((c) => c.configId === "det0");
      return {
        provider,
        label: best.providerLabel,
        bestConfig: best.configId,
        bestAvg: best.strict.avg,
        bestMin: best.strict.min,
        bestMax: best.strict.max,
        det0Avg: det0?.strict.avg ?? null,
        det0Min: det0?.strict.min ?? null,
        det0Max: det0?.strict.max ?? null,
        det0Ms: det0?.avgMs.avg ?? null,
        det0Cost: det0?.costUsd.avg ?? null,
      };
    })
    .sort((a, b) => (b.det0Avg ?? b.bestAvg) - (a.det0Avg ?? a.bestAvg));

  return { rows, providerRanks };
}

function formatReport(
  runs: RunResult[],
  meta: { model: string; repeats: number; smoke: boolean },
): string {
  const { rows, providerRanks } = buildReport(runs);
  const lines: string[] = [];
  lines.push(`# Qwen3.6 Parse-25 provider matrix`);
  lines.push("");
  lines.push(`Generated: ${new Date().toISOString()}`);
  lines.push("");
  lines.push(`- Model: \`${meta.model}\``);
  lines.push(`- Suite: Parse-25 (hard-25${meta.smoke ? ", smoke=1 scenario" : ""})`);
  lines.push(`- Repeats per cell: ${meta.repeats}`);
  lines.push(`- Total full runs: ${runs.length}`);
  lines.push("");
  lines.push(`## Provider ranking (primary: det0 avg strict)`);
  lines.push("");
  lines.push(`| Rank | Provider | det0 avg | det0 min–max | best config | best avg | avg ms (det0) | IDR/run (det0) |`);
  lines.push(`|-----:|----------|---------:|-------------:|-------------|---------:|--------------:|---------------:|`);
  providerRanks.forEach((p, i) => {
    const det0 = p.det0Avg == null ? "—" : p.det0Avg.toFixed(1);
    const range =
      p.det0Min == null ? "—" : `${p.det0Min}–${p.det0Max}`;
    const ms = p.det0Ms == null ? "—" : String(Math.round(p.det0Ms));
    const idr =
      p.det0Cost == null ? "—" : String(Math.round(p.det0Cost * USD_TO_IDR));
    lines.push(
      `| ${i + 1} | ${p.label} (\`${p.provider}\`) | **${det0}** | ${range} | ${p.bestConfig} | ${p.bestAvg.toFixed(1)} | ${ms} | Rp ${idr} |`,
    );
  });
  lines.push("");
  lines.push(`## Full cell results (avg / min / max strict)`);
  lines.push("");
  lines.push(`| Provider | Config | avg | min | max | repeats | errors | avg ms | IDR/run |`);
  lines.push(`|----------|--------|----:|----:|----:|---------|-------:|-------:|--------:|`);
  for (const r of rows) {
    lines.push(
      `| ${r.providerLabel} | ${r.configId} | **${r.strict.avg.toFixed(1)}** | ${r.strict.min} | ${r.strict.max} | ${r.repeats.join(", ")} | ${(r.errorRate * 100).toFixed(0)}% | ${Math.round(r.avgMs.avg)} | Rp ${Math.round(r.costUsd.avg * USD_TO_IDR)} |`,
    );
  }
  lines.push("");
  lines.push(`## Sampling configs`);
  lines.push("");
  for (const c of CONFIGS) {
    lines.push(`- **${c.id}** — ${c.label}: \`${JSON.stringify(c.params)}\``);
  }
  lines.push("");
  lines.push(`## Notes`);
  lines.push("");
  lines.push(`- Strict score is /${HARD_SCENARIOS.length} (or 1 in smoke mode).`);
  lines.push(`- \`det0\` matches the existing Parse-25 harness (\`temperature: 0\`).`);
  lines.push(`- Friend config is high-entropy (temp=1 + presence_penalty=1.5) — expect more variance on structured JSON.`);
  lines.push("");
  return lines.join("\n");
}

async function mapPool<T, R>(items: T[], concurrency: number, fn: (item: T) => Promise<R>): Promise<R[]> {
  const out: R[] = new Array(items.length);
  let next = 0;
  async function worker() {
    while (true) {
      const i = next++;
      if (i >= items.length) return;
      out[i] = await fn(items[i]!);
    }
  }
  await Promise.all(Array.from({ length: Math.min(concurrency, items.length) }, () => worker()));
  return out;
}

async function main() {
  const { repeats, concurrency, smoke, providers, configs } = parseCli();
  const selectedProviders = PROVIDERS.filter((p) => providers.includes(p.id));
  const selectedConfigs = CONFIGS.filter((c) => configs.includes(c.id));
  const scenarios = smoke ? HARD_SCENARIOS.slice(0, 1) : HARD_SCENARIOS;

  if (!selectedProviders.length) throw new Error("No providers selected");
  if (!selectedConfigs.length) throw new Error("No configs selected");

  const jobs: Array<{ provider: (typeof PROVIDERS)[number]; cfg: SamplingConfig; repeat: number }> = [];
  for (const provider of selectedProviders) {
    for (const cfg of selectedConfigs) {
      for (let r = 1; r <= repeats; r++) {
        jobs.push({ provider, cfg, repeat: r });
      }
    }
  }

  console.log(`Qwen provider matrix — ${MODEL}`);
  console.log(`Providers: ${selectedProviders.map((p) => p.label).join(", ")}`);
  console.log(`Configs: ${selectedConfigs.map((c) => c.id).join(", ")}`);
  console.log(`Repeats: ${repeats} | Jobs: ${jobs.length} | Scenarios/job: ${scenarios.length}`);
  console.log(`Concurrency: ${concurrency}${smoke ? " | SMOKE" : ""}\n`);

  const runs = await mapPool(jobs, concurrency, async (job) =>
    runOnce(job.provider, job.cfg, job.repeat, scenarios),
  );

  const stamp = new Date().toISOString().replace(/[:.]/g, "-").slice(0, 19);
  const outDir = resolve(import.meta.dirname, "../docs/results/runs");
  mkdirSync(outDir, { recursive: true });
  const jsonPath = resolve(outDir, `${stamp.slice(0, 10)}-qwen36-provider-matrix${smoke ? "-smoke" : ""}.json`);
  const mdPath = resolve(outDir, `${stamp.slice(0, 10)}-qwen36-provider-matrix${smoke ? "-smoke" : ""}.md`);

  const report = formatReport(runs, { model: MODEL, repeats, smoke });
  writeFileSync(
    jsonPath,
    JSON.stringify(
      {
        model: MODEL,
        generatedAt: new Date().toISOString(),
        repeats,
        smoke,
        providers: selectedProviders,
        configs: selectedConfigs,
        runs,
        summary: buildReport(runs),
      },
      null,
      2,
    ),
  );
  writeFileSync(mdPath, report);

  console.log(`\n${"=".repeat(72)}`);
  console.log(report);
  console.log(`Wrote ${jsonPath}`);
  console.log(`Wrote ${mdPath}`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
