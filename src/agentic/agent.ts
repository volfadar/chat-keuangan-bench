import { Agent } from "@mastra/core/agent";
import { Memory } from "@mastra/memory";
import { InMemoryStore } from "@mastra/core/storage";
import { createOpenRouter } from "@openrouter/ai-sdk-provider";
import { AGENTIC_SYSTEM_PROMPT } from "./prompt";
import { createAgenticTools } from "./tools";
import type { Sandbox } from "./sandbox";

/** OpenRouter sampling knobs (subset used by provider matrix experiments). */
export type AgenticSampling = {
  temperature?: number;
  top_p?: number;
  top_k?: number;
  min_p?: number;
  presence_penalty?: number;
  repetition_penalty?: number;
  frequency_penalty?: number;
};

export function createOpenRouterModel(
  modelId: string,
  providerOnly?: string[],
  sampling?: AgenticSampling,
) {
  const apiKey = process.env.OPENROUTER_API_KEY;
  if (!apiKey) throw new Error("OPENROUTER_API_KEY missing");
  const openrouter = createOpenRouter({ apiKey });

  // gpt-oss requires reasoning enabled; most other bench models prefer it off.
  const reasoning =
    modelId.includes("gpt-oss")
      ? { effort: "low", exclude: true }
      : { effort: "none", exclude: true };

  const providers =
    providerOnly?.length
      ? providerOnly
      : modelId.includes("gpt-oss")
        ? ["groq"]
        : undefined;

  const extra: Record<string, unknown> = { reasoning, ...(sampling ?? {}) };
  if (providers?.length) {
    extra.provider = { only: providers, allow_fallbacks: false };
  }
  return openrouter(modelId, {
    // SDK accepts extraBody for OpenRouter routing + sampling
    extraBody: extra,
  } as never);
}

export function createFinanceAgent(opts: {
  modelId: string;
  sandbox: Sandbox;
  providerOnly?: string[];
  agentId?: string;
  instructions?: string;
  sampling?: AgenticSampling;
}) {
  const tools = createAgenticTools(opts.sandbox);
  const memory = new Memory({
    storage: new InMemoryStore(),
    options: {
      lastMessages: 60,
    },
  });

  const temperature = opts.sampling?.temperature ?? 0;

  const agent = new Agent({
    id: opts.agentId ?? `finance-agentic-${opts.modelId.replace(/\//g, "-")}`,
    name: "chat-keuangan-agentic",
    description: "Indonesian pencatatan keuangan multi-turn agent with tools",
    instructions: opts.instructions ?? AGENTIC_SYSTEM_PROMPT,
    model: createOpenRouterModel(opts.modelId, opts.providerOnly, opts.sampling) as never,
    tools,
    memory,
    defaultOptions: {
      modelSettings: {
        temperature,
        maxOutputTokens: 4096,
        ...(opts.sampling?.top_p != null ? { topP: opts.sampling.top_p } : {}),
        ...(opts.sampling?.presence_penalty != null
          ? { presencePenalty: opts.sampling.presence_penalty }
          : {}),
        ...(opts.sampling?.frequency_penalty != null
          ? { frequencyPenalty: opts.sampling.frequency_penalty }
          : {}),
      },
    },
  });

  return { agent, tools, memory };
}
