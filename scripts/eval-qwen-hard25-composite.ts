/**
 * Full Parse-25 hard-25 with composite scoring for top Qwen provider/configs.
 *
 *   bun run scripts/eval-qwen-hard25-composite.ts
 */

import { config } from "dotenv";
import { mkdirSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";

config({ path: resolve(import.meta.dirname, "../.env") });

import { SYSTEM_PROMPT, parseFinanceJson, type ParsedFinance } from "../src/core/eval-core.ts";
import { USD_TO_IDR } from "../src/core/model-roster.ts";
import { HARD_SCENARIOS, analyzeQuality, type QualityAnalysis } from "./eval-hard-25.ts";

const MODEL = "qwen/qwen3.6-35b-a3b";

/** Top-2 from Parse-25 provider matrix (strict avg). */
const CANDIDATES = [
  {
    id: "wandb-mild",
    provider: "wandb/fp8",
    label: "WandB",
    sampling: { temperature: 0.3, top_p: 0.9, top_k: 40 },
  },
  {
    id: "siliconflow-mild",
    provider: "siliconflow/fp8",
    label: "SiliconFlow",
    sampling: { temperature: 0.3, top_p: 0.9, top_k: 40 },
  },
] as const;

interface OrUsage {
  prompt_tokens?: number;
  completion_tokens?: number;
  cost?: number;
}

async function callOpenRouter(
  text: string,
  provider: string,
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
    provider: { only: [provider], allow_fallbacks: false },
    ...sampling,
  };

  const t0 = Date.now();
  const res = await fetch("https://openrouter.ai/api/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
      "HTTP-Referer": "https://github.com/volfadar/chat-keuangan-bench",
      "X-Title": "chat-keuangan-bench-qwen-composite",
    },
    body: JSON.stringify(body),
  });

  const payload = (await res.json()) as {
    choices?: Array<{ message?: { content?: string } }>;
    usage?: OrUsage;
    error?: { message?: string };
  };

  if (!res.ok) throw new Error(`HTTP ${res.status}: ${payload.error?.message ?? res.statusText}`);
  const content = payload.choices?.[0]?.message?.content;
  if (!content) throw new Error("empty content");

  return {
    parsed: parseFinanceJson(content),
    ms: Date.now() - t0,
    usage: payload.usage ?? {},
  };
}

type ScenarioRow = {
  scenarioId: string;
  strictPass: boolean;
  compositeScore: number;
  tier: QualityAnalysis["tier"];
  ms: number;
  costUsd: number;
  error: string | null;
  issues: string[];
};

async function runCandidate(c: (typeof CANDIDATES)[number]): Promise<{
  candidate: (typeof CANDIDATES)[number];
  strictPass: number;
  meanComposite: number;
  totalCostUsd: number;
  avgMs: number;
  tierCounts: Record<string, number>;
  results: ScenarioRow[];
}> {
  console.log(`\n${"=".repeat(72)}`);
  console.log(`▶ ${c.label} / mild (${c.provider})`);
  console.log("=".repeat(72));

  const results: ScenarioRow[] = [];
  for (const scenario of HARD_SCENARIOS) {
    process.stdout.write(`  ${scenario.id} ... `);
    try {
      const { parsed, ms, usage } = await callOpenRouter(scenario.text, c.provider, c.sampling);
      const q = analyzeQuality(parsed, scenario);
      results.push({
        scenarioId: scenario.id,
        strictPass: q.strictPass,
        compositeScore: q.compositeScore,
        tier: q.tier,
        ms,
        costUsd: usage.cost ?? 0,
        error: null,
        issues: q.strictIssues,
      });
      const icon = q.strictPass ? "PASS" : q.tier === "usable_with_edit" ? "EDIT" : "FAIL";
      console.log(`${icon} composite=${q.compositeScore} tier=${q.tier} ${ms}ms`);
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      console.log(`ERROR: ${msg}`);
      results.push({
        scenarioId: scenario.id,
        strictPass: false,
        compositeScore: 0,
        tier: "broken",
        ms: 0,
        costUsd: 0,
        error: msg,
        issues: [],
      });
    }
  }

  const ok = results.filter((r) => r.strictPass && !r.error);
  const scored = results.filter((r) => !r.error);
  const meanComposite =
    scored.reduce((s, r) => s + r.compositeScore, 0) / Math.max(scored.length, 1);
  const tierCounts: Record<string, number> = {};
  for (const r of results) tierCounts[r.tier] = (tierCounts[r.tier] ?? 0) + 1;
  const timed = results.filter((r) => r.ms > 0);

  return {
    candidate: c,
    strictPass: ok.length,
    meanComposite,
    totalCostUsd: results.reduce((s, r) => s + r.costUsd, 0),
    avgMs: timed.length ? timed.reduce((s, r) => s + r.ms, 0) / timed.length : 0,
    tierCounts,
    results,
  };
}

async function main() {
  console.log(`Qwen Parse-25 composite — ${MODEL}`);
  console.log(`Candidates: ${CANDIDATES.map((c) => c.id).join(", ")}`);
  console.log(`Scenarios: ${HARD_SCENARIOS.length}\n`);

  const runs = [];
  for (const c of CANDIDATES) {
    runs.push(await runCandidate(c));
  }

  const ranked = [...runs].sort(
    (a, b) =>
      b.strictPass - a.strictPass ||
      b.meanComposite - a.meanComposite ||
      a.avgMs - b.avgMs,
  );
  const winner = ranked[0]!;

  const lines: string[] = [];
  lines.push(`# Qwen3.6 Parse-25 composite — top-2`);
  lines.push("");
  lines.push(`Generated: ${new Date().toISOString()}`);
  lines.push("");
  lines.push(`- Model: \`${MODEL}\``);
  lines.push(`- Suite: hard-25 with full composite / tier scoring`);
  lines.push(`- Candidates: WandB/mild + SiliconFlow/mild (top strict cells from provider matrix)`);
  lines.push("");
  lines.push(`## Winner`);
  lines.push("");
  lines.push(
    `**${winner.candidate.label} / mild** (\`${winner.candidate.provider}\`) — **${winner.strictPass}/25** strict, composite **${winner.meanComposite.toFixed(1)}**, ~${Math.round(winner.avgMs)}ms, Rp ${Math.round(winner.totalCostUsd * USD_TO_IDR)}/run`,
  );
  lines.push("");
  lines.push(`## Comparison`);
  lines.push("");
  lines.push(`| Rank | Provider | Strict | Composite | avg ms | IDR/run | excellent | usable | partial | misleading | broken |`);
  lines.push(`|-----:|----------|-------:|----------:|-------:|--------:|----------:|-------:|--------:|-----------:|-------:|`);
  ranked.forEach((r, i) => {
    const t = r.tierCounts;
    lines.push(
      `| ${i + 1} | ${r.candidate.label} | **${r.strictPass}/25** | **${r.meanComposite.toFixed(1)}** | ${Math.round(r.avgMs)} | Rp ${Math.round(r.totalCostUsd * USD_TO_IDR)} | ${t.excellent ?? 0} | ${t.usable_with_edit ?? 0} | ${t.partially_usable ?? 0} | ${t.misleading ?? 0} | ${t.broken ?? 0} |`,
    );
  });
  lines.push("");

  for (const r of ranked) {
    lines.push(`### ${r.candidate.label} / mild — failures`);
    lines.push("");
    const fails = r.results.filter((x) => !x.strictPass);
    if (!fails.length) {
      lines.push(`(none)`);
    } else {
      lines.push(`| Scenario | Composite | Tier | Issues |`);
      lines.push(`|----------|----------:|------|--------|`);
      for (const f of fails) {
        const note = f.error ?? (f.issues.slice(0, 2).join("; ") || "—");
        lines.push(
          `| ${f.scenarioId} | ${f.compositeScore} | ${f.tier} | ${note.replace(/\|/g, "/")} |`,
        );
      }
    }
    lines.push("");
  }

  const stamp = new Date().toISOString().slice(0, 10);
  const outDir = resolve(import.meta.dirname, "../docs/results/runs");
  mkdirSync(outDir, { recursive: true });
  const base = `${stamp}-qwen36-hard25-composite-top2`;
  const jsonPath = resolve(outDir, `${base}.json`);
  const mdPath = resolve(outDir, `${base}.md`);

  writeFileSync(
    jsonPath,
    JSON.stringify(
      {
        model: MODEL,
        generatedAt: new Date().toISOString(),
        winner: {
          id: winner.candidate.id,
          provider: winner.candidate.provider,
          label: winner.candidate.label,
          sampling: winner.candidate.sampling,
          strictPass: winner.strictPass,
          meanComposite: winner.meanComposite,
          avgMs: winner.avgMs,
          totalCostUsd: winner.totalCostUsd,
        },
        ranked: ranked.map((r) => ({
          id: r.candidate.id,
          provider: r.candidate.provider,
          label: r.candidate.label,
          sampling: r.candidate.sampling,
          strictPass: r.strictPass,
          meanComposite: r.meanComposite,
          avgMs: r.avgMs,
          totalCostUsd: r.totalCostUsd,
          tierCounts: r.tierCounts,
          results: r.results,
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
