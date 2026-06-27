/**
 * eval-hard-25-single.ts — Full hard-25 run for one model (OpenRouter or DeepSeek direct).
 *
 * Examples:
 *   bun run scripts/eval-hard-25-single.ts --model xiaomi/mimo-v2.5-pro --provider xiaomi/fp8
 *   bun run scripts/eval-hard-25-single.ts --model nvidia/nemotron-3-nano-30b-a3b
 *   bun run scripts/eval-hard-25-single.ts --model deepseek/deepseek-v4-pro --provider deepseek
 *   bun run scripts/eval-hard-25-single.ts --direct-deepseek
 */

import { config } from "dotenv";
import { mkdirSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";

config({ path: resolve(import.meta.dirname, "../.env") });

import { SYSTEM_PROMPT, parseFinanceJson, scoreExtraction, type ParsedFinance } from "../src/core/eval-core.ts";
import { USD_TO_IDR } from "../src/core/model-roster.ts";
import { HARD_SCENARIOS } from "./eval-hard-25.ts";

const DEEPSEEK_DIRECT_MODEL = "deepseek-v4-pro";

interface OrUsage {
  prompt_tokens?: number;
  completion_tokens?: number;
  cost?: number;
}

interface CliArgs {
  model: string;
  providerOnly: string[] | null;
  directDeepSeek: boolean;
  label: string;
}

function parseArgs(): CliArgs {
  const argv = process.argv.slice(2);
  let model = "nvidia/nemotron-3-nano-30b-a3b";
  let providerOnly: string[] | null = null;
  let directDeepSeek = false;
  let label = "";

  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a === "--model" && argv[i + 1]) model = argv[++i];
    else if (a === "--provider" && argv[i + 1]) providerOnly = [argv[++i]];
    else if (a === "--direct-deepseek") directDeepSeek = true;
    else if (a === "--label" && argv[i + 1]) label = argv[++i];
  }

  if (directDeepSeek) {
    model = DEEPSEEK_DIRECT_MODEL;
    label = label || "deepseek-v4-pro-direct";
  } else if (!label) {
    const prov = providerOnly?.[0] ?? "default";
    label = `${model.replace(/\//g, "-")}-${prov}`;
  }

  return { model, providerOnly, directDeepSeek, label };
}

async function parseViaOpenRouter(
  model: string,
  text: string,
  providerOnly: string[] | null,
): Promise<{ parsed: ParsedFinance; ms: number; usage: OrUsage }> {
  const apiKey = process.env.OPENROUTER_API_KEY;
  if (!apiKey) throw new Error("OPENROUTER_API_KEY missing");

  const body: Record<string, unknown> = {
    model,
    messages: [
      { role: "system", content: SYSTEM_PROMPT },
      { role: "user", content: text },
    ],
    temperature: 0,
    max_tokens: 2048,
    reasoning: { effort: "none", exclude: true },
    response_format: { type: "json_object" },
  };
  if (providerOnly) {
    body.provider = { only: providerOnly, allow_fallbacks: false };
  }

  const t0 = Date.now();
  const res = await fetch("https://openrouter.ai/api/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
      "HTTP-Referer": "https://github.com/volfadar/chat-keuangan-bench",
      "X-Title": "chat-keuangan-bench-eval",
    },
    body: JSON.stringify(body),
  });

  const payload = (await res.json()) as {
    choices?: Array<{ message?: { content?: string } }>;
    usage?: OrUsage;
    error?: { message?: string };
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

function estimateDeepSeekCost(promptTokens: number, completionTokens: number): number {
  return (promptTokens * 0.435 + completionTokens * 0.87) / 1_000_000;
}

async function parseViaDeepSeekDirect(
  text: string,
): Promise<{ parsed: ParsedFinance; ms: number; usage: OrUsage }> {
  const apiKey = process.env.DEEPSEEK_API_KEY;
  if (!apiKey) throw new Error("DEEPSEEK_API_KEY missing");

  const t0 = Date.now();
  const res = await fetch("https://api.deepseek.com/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: DEEPSEEK_DIRECT_MODEL,
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        { role: "user", content: text },
      ],
      temperature: 0,
      max_tokens: 2048,
      response_format: { type: "json_object" },
      thinking: { type: "disabled" },
      enable_thinking: false,
    }),
  });

  const payload = (await res.json()) as {
    choices?: Array<{ message?: { content?: string } }>;
    usage?: { prompt_tokens?: number; completion_tokens?: number };
    error?: { message?: string };
  };

  if (!res.ok) {
    throw new Error(`HTTP ${res.status}: ${payload.error?.message ?? res.statusText}`);
  }

  const content = payload.choices?.[0]?.message?.content;
  if (!content) throw new Error("empty content");

  const promptTokens = payload.usage?.prompt_tokens ?? 0;
  const completionTokens = payload.usage?.completion_tokens ?? 0;

  return {
    parsed: parseFinanceJson(content),
    ms: Date.now() - t0,
    usage: {
      prompt_tokens: promptTokens,
      completion_tokens: completionTokens,
      cost: estimateDeepSeekCost(promptTokens, completionTokens),
    },
  };
}

async function main() {
  const { model, providerOnly, directDeepSeek, label } = parseArgs();
  const runAt = new Date().toISOString();

  console.log(`Hard-25 eval — ${runAt}`);
  console.log(`Label: ${label}`);
  if (directDeepSeek) {
    console.log(`Backend: DeepSeek API direct (${DEEPSEEK_DIRECT_MODEL})`);
  } else {
    console.log(`Model: ${model}`);
    console.log(
      `Provider: ${providerOnly ? `${providerOnly.join(", ")} (no fallbacks)` : "OpenRouter default routing"}`,
    );
  }
  console.log(`Scenarios: ${HARD_SCENARIOS.length}\n`);

  const results: Array<{
    scenarioId: string;
    strictPass: boolean;
    ms: number;
    costUsd: number;
    promptTokens: number;
    completionTokens: number;
    issues: string[];
    error: string | null;
  }> = [];

  for (const scenario of HARD_SCENARIOS) {
    process.stdout.write(`  ${scenario.id} ... `);
    try {
      const { parsed, ms, usage } = directDeepSeek
        ? await parseViaDeepSeekDirect(scenario.text)
        : await parseViaOpenRouter(model, scenario.text, providerOnly);
      const scored = scoreExtraction(parsed, scenario);
      results.push({
        scenarioId: scenario.id,
        strictPass: scored.pass,
        ms,
        costUsd: usage.cost ?? 0,
        promptTokens: usage.prompt_tokens ?? 0,
        completionTokens: usage.completion_tokens ?? 0,
        issues: scored.issues,
        error: null,
      });
      console.log(`${scored.pass ? "PASS" : "FAIL"} $${(usage.cost ?? 0).toFixed(5)} ${ms}ms`);
      if (!scored.pass && scored.issues.length) {
        console.log(`         ${scored.issues.slice(0, 2).join(" | ")}`);
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      console.log(`ERROR: ${msg}`);
      results.push({
        scenarioId: scenario.id,
        strictPass: false,
        ms: 0,
        costUsd: 0,
        promptTokens: 0,
        completionTokens: 0,
        issues: [],
        error: msg,
      });
    }
  }

  const ok = results.filter((r) => r.strictPass && !r.error);
  const totalUsd = results.reduce((s, r) => s + r.costUsd, 0);
  const successCount = results.filter((r) => !r.error).length;
  const avgUsd = totalUsd / Math.max(successCount, 1);
  const avgMs =
    results.filter((r) => r.ms > 0).reduce((s, r) => s + r.ms, 0) /
    Math.max(results.filter((r) => r.ms > 0).length, 1);

  console.log(`\n${"=".repeat(72)}`);
  console.log(`Strict: ${ok.length}/${HARD_SCENARIOS.length}`);
  console.log(`Total cost: $${totalUsd.toFixed(4)} (Rp ${Math.round(totalUsd * USD_TO_IDR).toLocaleString("id-ID")})`);
  console.log(`Avg/request: $${avgUsd.toFixed(5)} (Rp ${Math.round(avgUsd * USD_TO_IDR)})`);
  console.log(`Avg latency: ${Math.round(avgMs)}ms`);
  console.log(`Errors: ${results.filter((r) => r.error).length}`);

  const outDir = resolve(import.meta.dirname, "../docs/results/runs");
  mkdirSync(outDir, { recursive: true });
  const slug = runAt.slice(0, 10);
  const safeLabel = label.replace(/[^a-zA-Z0-9-]+/g, "-").toLowerCase();
  const jsonPath = resolve(outDir, `${slug}-${safeLabel}-results.json`);
  writeFileSync(
    jsonPath,
    JSON.stringify(
      {
        runAt,
        label,
        model: directDeepSeek ? DEEPSEEK_DIRECT_MODEL : model,
        backend: directDeepSeek ? "deepseek-direct" : "openrouter",
        provider: providerOnly,
        strictPass: ok.length,
        totalScenarios: HARD_SCENARIOS.length,
        totalCostUsd: totalUsd,
        avgCostUsd: avgUsd,
        avgMs,
        usdToIdr: USD_TO_IDR,
        results,
      },
      null,
      2,
    ),
  );
  console.log(`\nWrote ${jsonPath}`);
  console.log(`Rebuild scorecard: bun run eval:scorecard && bun run report`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
