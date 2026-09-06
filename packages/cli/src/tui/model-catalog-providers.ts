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
    // OpenCode shows `info.name ?? model` — OpenRouter's feed carries a
    // human-readable `name`, so keep it for the friendly picker title.
    if (typeof item["name"] === "string" && (item["name"] as string).length > 0) {
      entry.name = item["name"] as string;
    }

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
    // Skip non-chat models — only list chat/completion models.
    const lower = id.toLowerCase();
    if (
      lower.includes("embedding") ||
      lower.includes("moderation") ||
      lower.includes("embed") ||
      lower.includes("clip") ||
      lower.includes("translate") ||
      lower.includes("parse") ||
      lower.includes("reward") ||
      lower.includes("safety") ||
      lower.includes("guard") ||
      lower.includes("rerank") ||
      lower.includes("speech") ||
      lower.includes("tts") ||
      lower.includes("stt") ||
      lower.includes("whisper") ||
      lower.includes("dall-e") ||
      lower.includes("image-generation") ||
      lower.includes("video-generation") ||
      lower.includes("-vision") ||
      lower.includes("vlm")
    ) continue;
    out.push({ id, provider: providerId });
  }
  return out;
}

// ── Provider env var → fetcher mapping ──
//
// Uses MODELS_DEV_PROVIDERS to automatically create fetchers for all
// OpenAI-compatible providers. Only providers with a base URL and whose
// env var is set will get a fetcher.

import { MODELS_DEV_PROVIDERS } from "./models-dev-providers.js";

/** Providers that need special parsing (not standard OpenAI-compatible). */
const SPECIAL_PARSERS = new Map<string, (raw: unknown) => SyncedModel[]>([
  ["openrouter", normalizeOpenRouterModels],
]);

function buildProviderFetchers(env: Record<string, string | undefined>): ProviderModelFetcher[] {
  const fetchers: ProviderModelFetcher[] = [];
  const seen = new Set<string>();

  // First: add the special providers (OpenRouter with custom parser)
  for (const md of MODELS_DEV_PROVIDERS) {
    if (!md.openaiCompatible || !md.baseUrl) continue;
    const parser = SPECIAL_PARSERS.get(md.id);
    if (!parser) continue;

    // Check if any of the provider's env vars is set
    const apiKey = md.envVars.find((v) => {
      const val = env[v];
      return typeof val === "string" && val.trim().length > 0;
    });
    if (!apiKey) continue;

    const key = (env[apiKey] ?? "").trim();
    const runtimeId = md.runtimeId ?? md.id;
    if (seen.has(runtimeId)) continue;
    seen.add(runtimeId);

    fetchers.push({
      providerId: runtimeId,
      baseUrl: md.baseUrl.replace(/\$\{[^}]+\}/g, ""), // Strip template vars
      apiKey: key,
      parseResponse: parser,
    });
  }

  // Then: add all standard OpenAI-compatible providers from models.dev
  for (const md of MODELS_DEV_PROVIDERS) {
    if (!md.openaiCompatible || !md.baseUrl) continue;
    if (SPECIAL_PARSERS.has(md.id)) continue; // Already handled above

    // Check if any of the provider's env vars is set
    const envVar = md.envVars.find((v) => {
      const val = env[v];
      return typeof val === "string" && val.trim().length > 0;
    });
    if (!envVar) continue;

    const apiKey = (env[envVar] ?? "").trim();
    const runtimeId = md.runtimeId ?? md.id;
    if (seen.has(runtimeId)) continue;
    seen.add(runtimeId);

    // Allow env var override for base URL (e.g. DEEPSEEK_BASE_URL)
    const baseURLOverride = md.envVars.length === 1
      ? env[md.envVars[0]!.replace("_API_KEY", "_BASE_URL")]
      : undefined;
    const baseUrl = baseURLOverride?.trim() || md.baseUrl.replace(/\$\{[^}]+\}/g, "");

    fetchers.push({
      providerId: runtimeId,
      baseUrl,
      apiKey,
      parseResponse: (raw) => normalizeOpenAiCompatibleModels(raw, runtimeId),
    });
  }

  // Finally: add custom-openai if configured
  const customKey = env[CUSTOM_OPENAI_ENV_VARS.apiKey];
  const customUrl = env[CUSTOM_OPENAI_ENV_VARS.baseUrl];
  if (customKey && customKey.trim().length > 0 && customUrl && customUrl.trim().length > 0) {
    if (!seen.has("custom-openai")) {
      fetchers.push({
        providerId: "custom-openai",
        baseUrl: customUrl.trim().replace(/\/+$/, ""),
        apiKey: customKey.trim(),
        parseResponse: (raw) => normalizeOpenAiCompatibleModels(raw, "custom-openai"),
      });
    }
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
      // Include provider in dedup key — different providers can serve the same model ID
      const key = `${model.id.toLowerCase()}:${model.provider}`;
      if (seen.has(key)) continue;
      seen.add(key);
      out.push(model);
    }
  }
  return out;
}

// Re-export for testing
export { normalizeOpenRouterModels, normalizeOpenAiCompatibleModels };
