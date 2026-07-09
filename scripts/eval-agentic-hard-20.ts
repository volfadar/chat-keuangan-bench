/**
 * eval-agentic-hard-20.ts — Multi-turn agentic finance bench.
 *
 * Suites:
 *   --suite hard      (20 classic)
 *   --suite hardplus  (8 multi-tenant / contamination / auditor / analysis)
 *   --suite all       (default: 28)
 *
 *   bun run scripts/eval-agentic-hard-20.ts --model google/gemma-4-31b-it --suite hardplus
 *   bun run scripts/eval-agentic-hard-20.ts --dry-run --suite all
 */

import { runAgenticSuite, writeAgenticReport } from "../src/agentic/runner";

function parseArgs(argv: string[]) {
  let model = "google/gemma-4-31b-it";
  let limit: number | undefined;
  let dryRun = false;
  let skipJudge = false;
  let provider: string | undefined;
  let suite: "hard" | "hardplus" | "all" = "all";
  let concurrency = 4;
  const ids: string[] = [];

  for (let i = 2; i < argv.length; i++) {
    const a = argv[i];
    if (a === "--model" && argv[i + 1]) model = argv[++i]!;
    else if (a === "--limit" && argv[i + 1]) limit = Number(argv[++i]);
    else if (a === "--dry-run") dryRun = true;
    else if (a === "--skip-judge") skipJudge = true;
    else if (a === "--provider" && argv[i + 1]) provider = argv[++i]!;
    else if (a === "--concurrency" && argv[i + 1]) concurrency = Number(argv[++i]);
    else if (a === "--suite" && argv[i + 1]) {
      const v = argv[++i]!;
      if (v === "hard" || v === "hardplus" || v === "all") suite = v;
    } else if (a === "--ids" && argv[i + 1]) {
      ids.push(
        ...argv[++i]!
          .split(",")
          .map((s) => s.trim())
          .filter(Boolean),
      );
    }
  }
  return { model, limit, dryRun, skipJudge, provider, ids, suite, concurrency };
}

async function main() {
  const args = parseArgs(process.argv);
  const { results, summary } = await runAgenticSuite({
    modelId: args.model,
    providerOnly: args.provider ? [args.provider] : undefined,
    limit: args.limit,
    ids: args.ids.length ? args.ids : undefined,
    suite: args.suite,
    skipJudge: args.skipJudge,
    dryRun: args.dryRun,
    concurrency: args.concurrency,
  });

  if (args.dryRun) return;

  const { jsonPath, mdPath } = writeAgenticReport(results, summary);
  console.log("\n=== SUMMARY ===");
  console.log(JSON.stringify(summary, null, 2));
  console.log(`\nJSON: ${jsonPath}`);
  console.log(`MD:   ${mdPath}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
