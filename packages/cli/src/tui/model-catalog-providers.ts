/**
 * Provider-specific model catalog fetchers.
 *
 * Each provider that exposes a `/v1/models` (or equivalent) endpoint is
 * fetched directly to get real-time model lists. Results are normalized to
 * `SyncedModel[]` and merged into the catalog cache alongside Models.dev data.
 *
 * Only configured providers (API key present in env or credential store) are
 * fetched. All fetches are fire-and-forget with short timeouts — a failure
 * in one provider never blocks others or degrades the catalog.
 */

import type { SyncedModel } from "./model-catalog-sync.js";
import { CUSTOM_OPENAI_ENV_VARS } from "./provider-status.js";
import { loadCustomOpenaiConfig } from "./credential-store.js";

const FETCH_TIMEOUT_MS = 8_000;

// ── Provider fetcher definitions ──

export interface ProviderModelFetcher {
  /** Provider id as named in the runtime. */
  providerId: string;
  /** Base URL for the model listing endpoint. */
  baseUrl: string;
  /** API key to authenticate. */
  apiKey: string;
  /** Parse the provider-specific response shape into SyncedModel[]. */
  parseResponse: (json: unknown) => SyncedModel[];
}

// ── OpenRouter ──
// GET https://openrouter.ai/api/v1/models
// Response: { data: [{ id, pricing: { prompt, completion }, context_length }] }
// Pricing is USD per token (not per 1M).

function normalizeOpenRouterModels(raw: unknown): SyncedModel[] {
  if (typeof raw !== "object" || raw === null) return [];
  const data = (raw as Record<string, unknown>)["data"];
  if (!Array.isArray(data)) return [];

  const out: SyncedModel[] = [];
  for (const item of data) {
    if (typeof item !== "object" || item === null) continue;
    const id = typeof item["id"] === "string" ? item["id"] : undefined;
    if (!id) continue;

    const pricing = (typeof item["pricing"] === "object" && item["pricing"] !== null
      ? item["pricing"] as Record<string, unknown>
      : {}) as Record<string, unknown>;

    const contextLength = typeof item["context_length"] === "number"
      ? item["context_length"]
      : undefined;

    // OpenRouter prices are USD per token; convert to $/1M tokens.
    const promptRaw = typeof pricing["prompt"] === "string" || typeof pricing["prompt"] === "number"
      ? Number(pricing["prompt"])
      : undefined;
    const completionRaw = typeof pricing["completion"] === "string" || typeof pricing["completion"] === "number"
      ? Number(pricing["completion"])
      : undefined;

    const entry: SyncedModel = { id, provider: "openrouter" };
    if (contextLength !== undefined) entry.contextTokens = contextLength;

    // Mark free models (discount=1 or prompt/completion = 0).
    const discount = typeof pricing["discount"] === "number" ? pricing["discount"] : 0;
    if (discount >= 1 || (promptRaw === 0 && completionRaw === 0)) {
      entry.input = 0;
      entry.output = 0;
    } else if (promptRaw !== undefined && completionRaw !== undefined && Number.isFinite(promptRaw) && Number.isFinite(completionRaw)) {
      // Convert per-token to per-1M tokens.
      entry.input = promptRaw * 1_000_000;
      entry.output = completionRaw * 1_000_000;
    }

    out.push(entry);
  }
  return out;
}

// ── OpenAI-compatible providers (OpenAI, DeepSeek, xAI, Qwen, Custom) ──
// GET /v1/models
// Response: { data: [{ id, owned_by? }] }
// No pricing data — prices come from MODEL_PRICING or "—" fallback.

function normalizeOpenAiCompatibleModels(raw: unknown, providerId: string): SyncedModel[] {
  if (typeof raw !== "object" || raw === null) return [];
  const data = (raw as Record<string, unknown>)["data"];
  if (!Array.isArray(data)) return [];

  const out: SyncedModel[] = [];
  for (const item of data) {
    if (typeof item !== "object" || item === null) continue;
    const id = typeof item["id"] === "string" ? item["id"] : undefined;
    if (!id) continue;
    // Skip embedding and moderation models — only list chat/completion models.
    if (id.includes("embedding") || id.includes("moderation")) continue;
    out.push({ id, provider: providerId });
  }
  return out;
}

// ── Provider env var → fetcher mapping ──

function buildProviderFetchers(env: Record<string, string | undefined>): ProviderModelFetcher[] {
  const fetchers: ProviderModelFetcher[] = [];

  // OpenRouter
  const openrouterKey = env["OPENROUTER_API_KEY"];
  if (openrouterKey && openrouterKey.trim().length > 0) {
    fetchers.push({
      providerId: "openrouter",
      baseUrl: "https://openrouter.ai/api/v1",
      apiKey: openrouterKey.trim(),
      parseResponse: normalizeOpenRouterModels,
    });
  }

  // OpenAI
  const openaiKey = env["OPENAI_API_KEY"];
  if (openaiKey && openaiKey.trim().length > 0) {
    fetchers.push({
      providerId: "openai",
      baseUrl: env["OPENAI_BASE_URL"]?.trim() || "https://api.openai.com/v1",
      apiKey: openaiKey.trim(),
      parseResponse: (raw) => normalizeOpenAiCompatibleModels(raw, "openai"),
    });
  }

  // DeepSeek
  const deepseekKey = env["DEEPSEEK_API_KEY"];
  if (deepseekKey && deepseekKey.trim().length > 0) {
    fetchers.push({
      providerId: "deepseek",
      baseUrl: env["DEEPSEEK_BASE_URL"]?.trim() || "https://api.deepseek.com",
      apiKey: deepseekKey.trim(),
      parseResponse: (raw) => normalizeOpenAiCompatibleModels(raw, "deepseek"),
    });
  }

  // xAI
  const xaiKey = env["XAI_API_KEY"];
  if (xaiKey && xaiKey.trim().length > 0) {
    fetchers.push({
      providerId: "xai",
      baseUrl: env["XAI_BASE_URL"]?.trim() || "https://api.x.ai/v1",
      apiKey: xaiKey.trim(),
      parseResponse: (raw) => normalizeOpenAiCompatibleModels(raw, "xai"),
    });
  }

  // Qwen (Alibaba Model Studio)
  const qwenKey = env["QWEN_API_KEY"];
  if (qwenKey && qwenKey.trim().length > 0) {
    fetchers.push({
      providerId: "qwen",
      baseUrl: env["QWEN_BASE_URL"]?.trim() || "https://token-plan.ap-southeast-1.maas.aliyuncs.com/compatible-mode/v1",
      apiKey: qwenKey.trim(),
      parseResponse: (raw) => normalizeOpenAiCompatibleModels(raw, "qwen"),
    });
  }

  // Custom OpenAI-compatible endpoint
  const customKey = env[CUSTOM_OPENAI_ENV_VARS.apiKey];
  const customUrl = env[CUSTOM_OPENAI_ENV_VARS.baseUrl];
  if (customKey && customKey.trim().length > 0 && customUrl && customUrl.trim().length > 0) {
    fetchers.push({
      providerId: "custom-openai",
      baseUrl: customUrl.trim().replace(/\/+$/, ""),
      apiKey: customKey.trim(),
      parseResponse: (raw) => normalizeOpenAiCompatibleModels(raw, "custom-openai"),
    });
  }

  return fetchers;
}

/**
 * Fetch model lists from all configured providers that expose a
 * `/v1/models` endpoint. Returns the merged, deduplicated list.
 * Never throws — individual provider failures are silently skipped.
 */
export async function fetchProviderModels(
  env: Record<string, string | undefined> = process.env,
  fetchImpl?: typeof fetch,
): Promise<SyncedModel[]> {
  const fetchers = buildProviderFetchers(env);
  if (fetchers.length === 0) return [];

  const fetchFn = fetchImpl ?? globalThis.fetch;
  if (typeof fetchFn !== "function") return [];

  const results = await Promise.allSettled(
    fetchers.map(async (fetcher) => {
      const url = `${fetcher.baseUrl.replace(/\/+$/, "")}/models`;
      const controller = new AbortController();
      const timer = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);
      try {
        const res = await fetchFn(url, {
          headers: {
            "Authorization": `Bearer ${fetcher.apiKey}`,
            "Content-Type": "application/json",
          },
          signal: controller.signal,
        });
        if (!res.ok) return [];
        const json = (await res.json()) as unknown;
        return fetcher.parseResponse(json);
      } catch {
        return [];
      } finally {
        clearTimeout(timer);
      }
    }),
  );

  const seen = new Set<string>();
  const out: SyncedModel[] = [];
  for (const result of results) {
    if (result.status !== "fulfilled") continue;
    for (const model of result.value) {
      const key = model.id.toLowerCase();
      if (seen.has(key)) continue;
      seen.add(key);
      out.push(model);
    }
  }
  return out;
}

// Re-export for testing
export { normalizeOpenRouterModels, normalizeOpenAiCompatibleModels };
