import type { RubricCriterion } from "@mastra/evals/scorers/prebuilt";
import type { IfRuleId } from "./prompt";

export type MoneyType = "pemasukan" | "pengeluaran";

export type LedgerRow = {
  id: number;
  org_id: string;
  type: MoneyType;
  jumlah: number;
  deskripsi: string;
  tanggal_hint: string | null;
  /** ISO date YYYY-MM-DD when known */
  tanggal: string | null;
  vendor: string | null;
  source: string | null;
  ambigu: number;
  catatan: string | null;
  created_at: string;
};

export type PrefillMessage =
  | { role: "user"; content: string }
  | { role: "assistant"; content: string };

export type DeterministicAssert =
  | { kind: "row_count"; eq: number; orgId?: string }
  | { kind: "has_amount"; type: MoneyType; jumlah: number; deskripsiIncludes?: string[]; orgId?: string }
  | { kind: "no_amount"; jumlah: number; orgId?: string; type?: MoneyType }
  | { kind: "amounts_set"; type?: MoneyType; jumlahs: number[]; orgId?: string }
  | { kind: "file_exists"; relativePath: string; minBytes?: number }
  | { kind: "csv_sum_matches_ledger"; relativePath: string; column?: string; orgId?: string }
  | { kind: "tool_called"; toolId: string; minTimes?: number }
  | { kind: "tool_order"; before: string; after: string }
  | { kind: "min_distinct_tools"; min: number }
  | { kind: "reply_mentions"; anyOf: string[] }
  | { kind: "reply_not_mentions"; anyOf: string[] }
  | { kind: "no_posted_rows"; orgId?: string }
  | { kind: "org_row_count"; orgId: string; eq: number }
  | { kind: "no_org_leak"; forbiddenOrgId: string; afterSeedCount?: number }
  | {
      kind: "period_sum";
      orgId: string;
      type?: MoneyType;
      start: string;
      end: string;
      eq?: number;
      min?: number;
      max?: number;
    }
  | { kind: "sql_mentions"; anyOf: string[] }
  | { kind: "has_ambigu"; min?: number; orgId?: string }
  | { kind: "has_vendor"; vendorIncludes: string; jumlah?: number; orgId?: string }
  | {
      /** Pass if ledger has ambigu>=1 OR assistant asked clarifying question */
      kind: "ambigu_or_ask";
      askAnyOf: string[];
      orgId?: string;
    }
  | { kind: "net_equals"; orgId?: string; eq: number };

export type AgenticTurn = {
  role: "user";
  content: string;
};

export type AgenticScenario = {
  id: string;
  title: string;
  failureMode: string;
  /** Difficulty band */
  tier?: "hard" | "hardplus";
  turns: AgenticTurn[];
  /**
   * Prefill chat history BEFORE scored turns (contaminated AI mistakes,
   * prior org context, auditor notes). Injected into memory; not scored as agent output.
   */
  prefill?: PrefillMessage[];
  /** Active org hint injected into first user turn context / system addendum */
  activeOrgId?: string;
  seedFiles?: Array<{ from: string; to: string }>;
  seedSql?: string[];
  maxStepsPerTurn?: number;
  asserts: DeterministicAssert[];
  rubric: RubricCriterion[];
  /** IFBench: which R* rules are in-scope for this scenario */
  ifRules?: IfRuleId[];
  judgeFocus: string;
};

export type ToolCallRecord = {
  toolName: string;
  args: unknown;
  result: unknown;
  turnIndex: number;
};

export type TurnTrace = {
  turnIndex: number;
  user: string;
  assistantText: string;
  toolCalls: ToolCallRecord[];
  ms: number;
};

export type DeterministicResult = {
  score: number; // 0..40
  passed: number;
  total: number;
  details: Array<{ assert: DeterministicAssert; ok: boolean; note: string }>;
};

export type IfBenchResult = {
  /** 0..100 fraction of in-scope IF rules judged satisfied */
  score: number;
  rules: Array<{ id: IfRuleId; satisfied: boolean; reasoning: string }>;
  reason: string;
};

export type ScenarioRunResult = {
  scenarioId: string;
  modelId: string;
  tier: "hard" | "hardplus";
  turns: TurnTrace[];
  ledger: LedgerRow[];
  deterministic: DeterministicResult;
  rubricScore: number; // 0..25
  rubricReason: string;
  stepScore: number; // 0..25
  stepReason: string;
  stepFlags: Record<string, number> | null;
  ifBench: IfBenchResult;
  /** Combined 0..100 = det40 + rub25 + step25 + if10 */
  totalScore: number;
  error: string | null;
  ms: number;
};
