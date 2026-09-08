/**
 * Bundled offline snapshot of the model catalog.
 *
 * The `/model` picker is derived from the local pricing table in @xsec/shared,
 * which only lists ids the engine has hand-priced. That table is authoritative
 * for cost but deliberately narrow, so the picker never shows a model the
 * operator's provider offers that we simply haven't priced yet.
 *
 * `model-catalog-sync.ts` closes that gap by pulling the live catalog from
 * Models.dev and caching it. This file is the *last-resort* fallback for when
 * that cache is cold and the network is unavailable (air-gapped review boxes,
 * first run offline): a small, curated, provider-diverse snapshot so the
 * picker is never emptier than the pricing table alone.
 *
 * Keep it short and representative — it is a floor, not a mirror. Refresh it
 * occasionally from a real Models.dev pull; drift here only affects the
 * offline-first-run experience, never priced/synced rows.
 */

import type { SyncedModel } from "./model-catalog-sync.js";

/** Curated floor: a handful of current models per major provider. */
export const OFFLINE_MODEL_CATALOG: SyncedModel[] = [
  // Anthropic
  { id: "claude-opus-4-7", provider: "anthropic", contextTokens: 200_000, input: 5, output: 25 },
  { id: "claude-sonnet-4-6", provider: "anthropic", contextTokens: 1_000_000, input: 3, output: 15 },
  { id: "claude-haiku-4-5", provider: "anthropic", contextTokens: 200_000, input: 0.8, output: 4 },
  // OpenAI
  { id: "gpt-5.5", provider: "openai", contextTokens: 400_000, input: 5, output: 30 },
  { id: "gpt-5.5-mini", provider: "openai", contextTokens: 400_000, input: 0.25, output: 2 },
  // Google
  { id: "gemini-3-pro", provider: "google", contextTokens: 1_000_000, input: 1.25, output: 10 },
  { id: "gemini-3-flash", provider: "google", contextTokens: 1_000_000, input: 0.3, output: 2.5 },
  // DeepSeek
  { id: "deepseek-v4", provider: "deepseek", contextTokens: 128_000, input: 0.27, output: 1.1 },
  // Meta (hosted)
  { id: "llama-4-maverick", provider: "meta", contextTokens: 1_000_000, input: 0.5, output: 0.77 },
  { id: "llama-4-scout", provider: "meta", contextTokens: 10_000_000, input: 0.2, output: 0.35 },
  // Mistral
  { id: "mistral-large", provider: "mistral", contextTokens: 128_000, input: 2, output: 6 },
  // Alibaba Qwen
  { id: "qwen3.8-max", provider: "qwen", contextTokens: 256_000, input: 2, output: 6 },
  // xAI
  { id: "grok-4.6", provider: "xai", contextTokens: 256_000, input: 2, output: 6 },
  // Moonshot
  { id: "k3", provider: "moonshot", contextTokens: 256_000, input: 3, output: 15 },
  // Z.AI
  { id: "glm-5.3", provider: "z-ai", contextTokens: 200_000, input: 1.4, output: 4.4 },
  // GenSpark via llm_proxy (from gsk opencode-config; Bearer on https://www.genspark.ai/api/llm_proxy/v1)  { id: "genspark/claude-fable-5", provider: "genspark", contextTokens: 1000000, input: 5500.0, output: 27500.0 },
  { id: "genspark/claude-fable-5-1", provider: "genspark", contextTokens: 1000000, input: 5500.0, output: 27500.0 },
  { id: "genspark/claude-opus-5", provider: "genspark", contextTokens: 1000000, input: 2750.0, output: 13750.0 },
  { id: "genspark/claude-opus-4-8", provider: "genspark", contextTokens: 1000000, input: 2750.0, output: 13750.0 },
  { id: "genspark/claude-opus-4-7", provider: "genspark", contextTokens: 1000000, input: 2750.0, output: 13750.0 },
  { id: "genspark/claude-opus-4-6-1m", provider: "genspark", contextTokens: 1000000, input: 2750.0, output: 13750.0 },
  { id: "genspark/claude-sonnet-4-6-1m", provider: "genspark", contextTokens: 1000000, input: 1650.0, output: 8250.0 },
  { id: "genspark/claude-opus-4-6", provider: "genspark", contextTokens: 200000, input: 2750.0, output: 13750.0 },
  { id: "genspark/claude-sonnet-5", provider: "genspark", contextTokens: 400000, input: 1100.0, output: 5500.0 },
  { id: "genspark/claude-sonnet-4-6", provider: "genspark", contextTokens: 200000, input: 1650.0, output: 8250.0 },
  { id: "genspark/claude-haiku-4-5", provider: "genspark", contextTokens: 200000, input: 550.0, output: 2750.0 },
  { id: "genspark/gpt-5.2", provider: "genspark", contextTokens: 400000, input: 962.5, output: 7700.0 },
  { id: "genspark/gpt-5.4", provider: "genspark", contextTokens: 1000000, input: 1375.0, output: 8250.0 },
  { id: "genspark/gpt-5.5", provider: "genspark", contextTokens: 1000000, input: 2750.0, output: 16500.0 },
  { id: "genspark/gpt-5.6-sol", provider: "genspark", contextTokens: 1000000, input: 2200.0, output: 11000.0 },
  { id: "genspark/gpt-6-astra", provider: "genspark", contextTokens: 1000000, input: 5500.0, output: 27500.0 },
  { id: "genspark/gpt-5.6-terra", provider: "genspark", contextTokens: 1000000, input: 1100.0, output: 6600.0 },
  { id: "genspark/gpt-5.6-luna", provider: "genspark", contextTokens: 1000000, input: 110.0, output: 660.0 },
  { id: "genspark/deep-seek-v4-pro-baseten", provider: "genspark", contextTokens: 1000000, input: 957.0, output: 1914.0 },
  { id: "genspark/deep-seek-v4-flash", provider: "genspark", contextTokens: 1000000, input: 242.0, output: 726.0 },
  { id: "genspark/deep-seek-v4-flash-vision-exp", provider: "genspark", contextTokens: 1000000, input: 121.0, output: 363.0 },
  { id: "genspark/gpt-5.4-mini", provider: "genspark", contextTokens: 400000, input: 412.5, output: 2475.0 },
  { id: "genspark/gpt-5.4-nano", provider: "genspark", contextTokens: 400000, input: 110.0, output: 687.5 },
  { id: "genspark/grok-4.5", provider: "genspark", contextTokens: 200000, input: 1100.0, output: 3300.0 },
  { id: "genspark/grok-4.6", provider: "genspark", contextTokens: 200000, input: 1100.0, output: 3300.0 },
  { id: "genspark/kimi-k2p6", provider: "genspark", contextTokens: 262144, input: 522.5, output: 2200.0 },
  { id: "genspark/minimax-m2p7", provider: "genspark", contextTokens: 196608, input: 165.0, output: 660.0 },
  { id: "genspark/minimax-m3", provider: "genspark", contextTokens: 524288, input: 165.0, output: 660.0 },
  { id: "genspark/glm-5p2", provider: "genspark", contextTokens: 1000000, input: 770.0, output: 2420.0 },
  { id: "genspark/kimi-k3", provider: "genspark", contextTokens: 1048576, input: 1650.0, output: 8250.0 },
  { id: "genspark/deepseek-v4-pro-0813", provider: "genspark", contextTokens: 1000000, input: 726.0, output: 2178.0 },
  { id: "genspark/solar-pro4", provider: "genspark", contextTokens: 524288, input: 165.0, output: 660.0 },
  { id: "genspark/glm-5p3", provider: "genspark", contextTokens: 1000000, input: 770.0, output: 2420.0 },
  { id: "genspark/muse-spark-1.3", provider: "genspark", contextTokens: 1048576, input: 687.5, output: 2337.5 },

];
