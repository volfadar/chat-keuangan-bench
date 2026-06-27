/**
 * Canonical model roster for hard-25 evals and scorecard generation.
 * Single source of truth — import here instead of duplicating arrays.
 */

export const ALL_EVAL_MODELS = [
  "google/gemini-3.1-flash-lite",
  "google/gemini-3-flash-preview",
  "google/gemma-4-31b-it",
  "z-ai/glm-4.5",
  "z-ai/glm-4.7",
  "openai/gpt-oss-120b",
  "inclusionai/ling-2.6-1t",
  "deepseek/deepseek-v4-flash",
  "xiaomi/mimo-v2.5-pro",
  "nvidia/nemotron-3-nano-30b-a3b",
  "deepseek/deepseek-v4-pro",
  "deepseek/deepseek-v4-pro@openrouter",
] as const;

export type EvalModelId = (typeof ALL_EVAL_MODELS)[number];

/** Original Jun 26 batch (8 models). */
export const ORIGINAL_EVAL_MODELS = ALL_EVAL_MODELS.slice(0, 8);

/** Jun 27 supplement runs. */
export const SUPPLEMENT_EVAL_MODELS = ALL_EVAL_MODELS.slice(8);

export const USD_TO_IDR = 17_905;

export function shortModelName(modelId: string): string {
  return modelId.split("/").pop()?.replace("@openrouter", " (OR)") ?? modelId;
}
