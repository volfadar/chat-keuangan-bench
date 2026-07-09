import { Agent } from "@mastra/core/agent";
import { Memory } from "@mastra/memory";
import { InMemoryStore } from "@mastra/core/storage";
import { createOpenRouter } from "@openrouter/ai-sdk-provider";
import { AGENTIC_SYSTEM_PROMPT } from "./prompt";
import { createAgenticTools } from "./tools";
import type { Sandbox } from "./sandbox";

export function createOpenRouterModel(modelId: string, providerOnly?: string[]) {
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

  const extra: Record<string, unknown> = { reasoning };
  if (providers?.length) {
    extra.provider = { only: providers, allow_fallbacks: false };
  }
  return openrouter(modelId, {
    // SDK accepts extraBody for OpenRouter routing
    extraBody: extra,
  } as never);
}

export function createFinanceAgent(opts: {
  modelId: string;
  sandbox: Sandbox;
  providerOnly?: string[];
  agentId?: string;
  instructions?: string;
}) {
  const tools = createAgenticTools(opts.sandbox);
  const memory = new Memory({
    storage: new InMemoryStore(),
    options: {
      lastMessages: 60,
    },
  });

  const agent = new Agent({
    id: opts.agentId ?? `finance-agentic-${opts.modelId.replace(/\//g, "-")}`,
    name: "chat-keuangan-agentic",
    description: "Indonesian pencatatan keuangan multi-turn agent with tools",
    instructions: opts.instructions ?? AGENTIC_SYSTEM_PROMPT,
    model: createOpenRouterModel(opts.modelId, opts.providerOnly) as never,
    tools,
    memory,
    defaultOptions: {
      modelSettings: {
        temperature: 0,
        maxOutputTokens: 4096,
      },
    },
  });

  return { agent, tools, memory };
}
