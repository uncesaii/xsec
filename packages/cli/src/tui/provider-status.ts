/**
 * Which LLM providers this machine can actually reach.
 *
 * The `/model` picker is derived from the pricing table, which lists every
 * model the tool knows how to price — not every model it can currently call.
 * An operator can therefore pick a model whose provider has no credentials
 * here; the turn then dies with zero tokens and a message about a key they
 * never knew they needed. This module is the truthful side of that: it names
 * the providers the runtime can detect, the exact env vars each one reads,
 * and how to configure the ones that are dark.
 *
 * The mapping below is transcribed from the provider detection in
 * packages/core/src/runtime/llm-api.ts — `resolveFailoverProvider`
 * (~L660-712), `providerForModel` (~L1152-1200), and the env-priority chain
 * in `detectProvider` (~L1386-1533). It is DERIVED, not guessed: several
 * providers deviate from the `<VENDOR>_API_KEY` pattern (`Z_AI_API_KEY`,
 * `AZURE_OPENAI_API_KEY`, and the two `XSEC_CHATGPT_*` tokens), so extend
 * this table by re-reading that file rather than by analogy.
 *
 * Additionally, `MODELS_DEV_PROVIDERS` from models-dev-providers.ts provides
 * the full list of 213 providers from models.dev, used by the /providers
 * screen to show all available vendors and their configuration status.
 */

import { MODELS_DEV_PROVIDERS, MODELS_DEV_BY_ID, MODELS_DEV_BY_RUNTIME_ID, type ModelsDevProvider, isModelsDevProviderConfigured } from "./models-dev-providers.js";

export interface ProviderInfo {
  /** Provider id as the runtime names it, e.g. "anthropic". */
  id: string;
  /** Human label, e.g. "Anthropic". */
  label: string;
  /** Credential protocol; OAuth providers must never be treated as key fields. */
  auth: "api-key" | "oauth";
  /** Every env var that can supply credentials, most-preferred first. */
  envVars: readonly string[];
  /** How to configure it, one line, operator-facing. */
  hint: string;
  /**
   * Set only for providers the runtime can also authenticate from a file on
   * disk. `providerStates` is pure over env and never stats the filesystem,
   * so such a provider can read as unconfigured here while the runtime still
   * finds credentials — the hint says so, and callers that want certainty
   * should ask the runtime, not this table.
   */
  fileSource?: string;
}

export interface ProviderState extends ProviderInfo {
  configured: boolean;
  /** Which env var was actually found, when configured via env. */
  via?: string;
}

/**
 * Ordered by the runtime's real env-priority chain (detectProvider,
 * ~L1386-1533): chatgpt-codex wins outright as an explicit opt-in, then the
 * metered keys, with anthropic last because it doubles as the final fallback.
 * Note the prose comments at llm-api.ts L1205-1207 and L1548 state a
 * DIFFERENT order; the code above is what actually runs, so this follows it.
 */
export const PROVIDERS: readonly ProviderInfo[] = [
  {
    id: "chatgpt-codex",
    label: "ChatGPT Codex",
    auth: "oauth",
    // OAuth, not an API key. Both tokens are accepted and the access token is
    // read first (llm-api.ts L874-875, L1386-1394), so it leads the list.
    envVars: ["XSEC_CHATGPT_ACCESS_TOKEN", "XSEC_CHATGPT_OAUTH_REFRESH_TOKEN"],
    fileSource: "~/.codex/auth.json (override with XSEC_CHATGPT_AUTH_FILE)",
    hint: "run `codex login` to write ~/.codex/auth.json, or invoke xsec with env XSEC_CHATGPT_OAUTH_REFRESH_TOKEN=...",
  },
  {
    id: "deepseek",
    label: "DeepSeek",
    auth: "api-key",
    envVars: ["DEEPSEEK_API_KEY"],
    hint: "set DEEPSEEK_API_KEY (endpoint override: DEEPSEEK_BASE_URL)",
  },
  {
    id: "openrouter",
    label: "OpenRouter",
    auth: "api-key",
    envVars: ["OPENROUTER_API_KEY"],
    hint: "set OPENROUTER_API_KEY=sk-or-... from openrouter.ai/keys",
  },
  {
    id: "azure",
    label: "Azure OpenAI",
    auth: "api-key",
    envVars: ["AZURE_OPENAI_API_KEY"],
    hint: "set AZURE_OPENAI_API_KEY plus AZURE_OPENAI_BASE_URL (or [model_providers.azure] in ~/.codex/config.toml)",
  },
  {
    id: "openai",
    label: "OpenAI",
    auth: "api-key",
    envVars: ["OPENAI_API_KEY"],
    hint: "set OPENAI_API_KEY=sk-... from platform.openai.com/api-keys",
  },
  {
    id: "z-ai",
    label: "Z.ai GLM",
    auth: "api-key",
    envVars: ["Z_AI_API_KEY"],
    hint: "set Z_AI_API_KEY from your Z.ai Coding Plan (endpoint override: Z_AI_BASE_URL)",
  },
  {
    id: "kimi",
    label: "Moonshot Kimi",
    auth: "api-key",
    envVars: ["KIMI_API_KEY"],
    hint: "set KIMI_API_KEY from your Kimi coding plan (endpoint override: KIMI_BASE_URL)",
  },
  {
    id: "qwen",
    label: "Alibaba Qwen",
    auth: "api-key",
    envVars: ["QWEN_API_KEY"],
    hint: "set QWEN_API_KEY from Alibaba Model Studio (endpoint override: QWEN_BASE_URL)",
  },
  {
    id: "xai",
    label: "xAI Grok",
    auth: "api-key",
    envVars: ["XAI_API_KEY"],
    hint: "set XAI_API_KEY from console.x.ai (endpoint override: XAI_BASE_URL)",
  },
  {
    id: "nvidia",
    label: "NVIDIA",
    auth: "api-key",
    envVars: ["NVIDIA_API_KEY"],
    hint: "set NVIDIA_API_KEY from build.nvidia.com (endpoint override: NVIDIA_BASE_URL)",
  },
  {
    id: "groq",
    label: "Groq",
    auth: "api-key",
    envVars: ["GROQ_API_KEY"],
    hint: "set GROQ_API_KEY from console.groq.com (endpoint override: GROQ_BASE_URL)",
  },
  {
    id: "together",
    label: "Together AI",
    auth: "api-key",
    envVars: ["TOGETHER_API_KEY"],
    hint: "set TOGETHER_API_KEY from api.together.xyz (endpoint override: TOGETHER_BASE_URL)",
  },
  {
    id: "fireworks",
    label: "Fireworks AI",
    auth: "api-key",
    envVars: ["FIREWORKS_API_KEY"],
    hint: "set FIREWORKS_API_KEY from fireworks.ai (endpoint override: FIREWORKS_BASE_URL)",
  },
  {
    id: "deepinfra",
    label: "DeepInfra",
    auth: "api-key",
    envVars: ["DEEPINFRA_API_KEY"],
    hint: "set DEEPINFRA_API_KEY from deepinfra.com (endpoint override: DEEPINFRA_BASE_URL)",
  },
  {
    id: "cerebras",
    label: "Cerebras",
    auth: "api-key",
    envVars: ["CEREBRAS_API_KEY"],
    hint: "set CEREBRAS_API_KEY from cerebras.ai (endpoint override: CEREBRAS_BASE_URL)",
  },
  {
    id: "siliconflow",
    label: "SiliconFlow",
    auth: "api-key",
    envVars: ["SILICONFLOW_API_KEY"],
    hint: "set SILICONFLOW_API_KEY from siliconflow.cn (endpoint override: SILICONFLOW_BASE_URL)",
  },
  {
    id: "novita",
    label: "Novita AI",
    auth: "api-key",
    envVars: ["NOVITA_API_KEY"],
    hint: "set NOVITA_API_KEY from novita.ai (endpoint override: NOVITA_BASE_URL)",
  },
  {
    id: "friendli",
    label: "Friendli",
    auth: "api-key",
    envVars: ["FRIENDLI_TOKEN"],
    hint: "set FRIENDLI_TOKEN from friendli.ai (endpoint override: FRIENDLI_BASE_URL)",
  },
  {
    id: "baseten",
    label: "Baseten",
    auth: "api-key",
    envVars: ["BASETEN_API_KEY"],
    hint: "set BASETEN_API_KEY from baseten.co (endpoint override: BASETEN_BASE_URL)",
  },
  {
    id: "modal",
    label: "Modal",
    auth: "api-key",
    envVars: ["MODAL_PROXY_TOKEN"],
    hint: "set MODAL_PROXY_TOKEN from modal.com (endpoint override: MODAL_BASE_URL)",
  },
  {
    id: "scaleway",
    label: "Scaleway",
    auth: "api-key",
    envVars: ["SCALEWAY_API_KEY"],
    hint: "set SCALEWAY_API_KEY from scaleway.com (endpoint override: SCALEWAY_BASE_URL)",
  },
  {
    id: "ovhcloud",
    label: "OVHcloud",
    auth: "api-key",
    envVars: ["OVHCLOUD_API_KEY"],
    hint: "set OVHCLOUD_API_KEY from ovhcloud.com (endpoint override: OVHCLOUD_BASE_URL)",
  },
  {
    id: "vultr",
    label: "Vultr",
    auth: "api-key",
    envVars: ["VULTR_API_KEY"],
    hint: "set VULTR_API_KEY from vultr.com (endpoint override: VULTR_BASE_URL)",
  },
  {
    id: "digitalocean",
    label: "DigitalOcean",
    auth: "api-key",
    envVars: ["DIGITALOCEAN_ACCESS_TOKEN"],
    hint: "set DIGITALOCEAN_ACCESS_TOKEN from digitalocean.com (endpoint override: DIGITALOCEAN_BASE_URL)",
  },
  {
    id: "google",
    label: "Google Gemini",
    auth: "api-key",
    envVars: ["GOOGLE_API_KEY"],
    hint: "set GOOGLE_API_KEY from aistudio.google.com (endpoint override: GOOGLE_BASE_URL)",
  },
  {
    id: "mistral",
    label: "Mistral AI",
    auth: "api-key",
    envVars: ["MISTRAL_API_KEY"],
    hint: "set MISTRAL_API_KEY from console.mistral.ai (endpoint override: MISTRAL_BASE_URL)",
  },
  {
    id: "meta",
    label: "Meta Muse",
    auth: "api-key",
    envVars: ["META_API_KEY"],
    hint: "set META_API_KEY from dev.meta.ai (endpoint override: META_BASE_URL)",
  },
  {
    id: "cohere",
    label: "Cohere",
    auth: "api-key",
    envVars: ["COHERE_API_KEY"],
    hint: "set COHERE_API_KEY from dashboard.cohere.com (endpoint override: COHERE_BASE_URL)",
  },
  {
    id: "perplexity",
    label: "Perplexity",
    auth: "api-key",
    envVars: ["PERPLEXITY_API_KEY"],
    hint: "set PERPLEXITY_API_KEY from perplexity.ai (endpoint override: PERPLEXITY_BASE_URL)",
  },
  {
    id: "anthropic",
    label: "Anthropic",
    auth: "api-key",
    envVars: ["ANTHROPIC_API_KEY"],
    hint: "set ANTHROPIC_API_KEY=sk-ant-... from console.anthropic.com",
  },
  {
    id: "custom-openai",
    label: "Custom",
    auth: "api-key",
    envVars: ["XSEC_CUSTOM_OPENAI_API_KEY"],
    hint: "set XSEC_CUSTOM_OPENAI_API_KEY, XSEC_CUSTOM_OPENAI_BASE_URL, and XSEC_CUSTOM_OPENAI_MODEL (or use /connect for interactive setup)",
  },
  {
    id: "zen",
    label: "OpenCode Zen",
    auth: "api-key",
    envVars: ["ZEN_API_KEY"],
    hint: "set ZEN_API_KEY from OpenCode Zen (endpoint override: ZEN_BASE_URL)",
  },
];

/** Env var names for the Custom provider's three fields. */
export const CUSTOM_OPENAI_ENV_VARS = {
  apiKey: "XSEC_CUSTOM_OPENAI_API_KEY",
  baseUrl: "XSEC_CUSTOM_OPENAI_BASE_URL",
  model: "XSEC_CUSTOM_OPENAI_MODEL",
} as const;

/**
 * An exported-but-empty variable is the classic way this breaks: `export
 * ANTHROPIC_API_KEY=` in a shell profile, or a CI secret that resolved to the
 * empty string, leaves the name present in `env` while carrying no credential.
 * Treat whitespace-only the same way — a stray newline from `$(cat key.txt)`
 * is not a key either.
 */
function hasCredential(value: string | undefined): boolean {
  return typeof value === "string" && value.trim().length > 0;
}

/** The first env var of `info` that actually holds a credential, if any. */
function satisfyingVar(info: ProviderInfo, env: Record<string, string | undefined>): string | undefined {
  // envVars is ordered most-preferred first, so the first hit is the one the
  // runtime would use — that is what `via` has to report.
  return info.envVars.find((name) => hasCredential(env[name]));
}

/** Pure over an injected environment so it is testable. */
export function providerStates(env: Record<string, string | undefined>): ProviderState[] {
  // Reads only, and only from `env` — never process.env, so a caller can ask
  // "what would this look like under that environment?" without mutating or
  // depending on the ambient one.
  return PROVIDERS.map((info) => {
    const via = satisfyingVar(info, env);
    return via === undefined ? { ...info, configured: false } : { ...info, configured: true, via };
  });
}

/** Is this specific provider usable given the environment? */
export function isProviderConfigured(providerId: string, env: Record<string, string | undefined>): boolean {
  // An unknown id is not an error: the model catalog derives providers from
  // the pricing table, which carries vendors with no direct runtime path
  // ("google", "meta", "mistral", "unknown"). Those are simply not
  // configurable here, so the honest answer is false rather than a throw that
  // would take the picker down.
  const info = PROVIDERS.find((candidate) => candidate.id === providerId);
  return info !== undefined && satisfyingVar(info, env) !== undefined;
}

// ── Models.dev integration ──────────────────────────────────────────────────
//
// The /providers screen shows both the core PROVIDERS (runtime-routable) and
// all models.dev providers (for visibility into what's available). The models.dev
// providers are checked against the environment to show configured/unconfigured
// status.

export type { ModelsDevProvider };

/** Re-export the full models.dev provider list for the /providers screen. */
export { MODELS_DEV_PROVIDERS };

/**
 * All providers shown on the /providers screen: core PROVIDERS first,
 * then models.dev providers not already in the core list.
 */
export interface AllProviderEntry {
  /** "core" for runtime providers, "models-dev" for catalog-only providers. */
  source: "core" | "models-dev";
  /** Provider ID. */
  id: string;
  /** Human-readable name. */
  label: string;
  /** Whether this provider has credentials configured. */
  configured: boolean;
  /** Which env var was found, if configured. */
  via?: string;
  /** The env vars this provider uses. */
  envVars: readonly string[];
}

/**
 * Get all providers for the /providers screen, combining core and models.dev.
 * Core providers come first, then models.dev providers not already in core.
 */
export function allProviders(env: Record<string, string | undefined>): AllProviderEntry[] {
  const coreIds = new Set(PROVIDERS.map((p) => p.id));
  const entries: AllProviderEntry[] = [];

  // Core providers first
  for (const state of providerStates(env)) {
    entries.push({
      source: "core",
      id: state.id,
      label: state.label,
      configured: state.configured,
      via: state.via,
      envVars: state.envVars,
    });
  }

  // Models.dev providers not already in core
  for (const md of MODELS_DEV_PROVIDERS) {
    if (coreIds.has(md.id)) continue;
    const configured = isModelsDevProviderConfigured(md, env);
    const via = md.envVars.find((v) => {
      const val = env[v];
      return typeof val === "string" && val.trim().length > 0;
    });
    entries.push({
      source: "models-dev",
      id: md.id,
      label: md.name,
      configured,
      via,
      envVars: md.envVars,
    });
  }

  return entries;
}

/**
 * Get all configured provider IDs (core + models.dev) for the model picker.
 * Used to filter which models can actually be routed.
 */
export function allConfiguredProviderIds(env: Record<string, string | undefined>): Set<string> {
  const ids = new Set<string>();
  for (const state of providerStates(env)) {
    if (state.configured) ids.add(state.id);
  }
  for (const md of MODELS_DEV_PROVIDERS) {
    if (isModelsDevProviderConfigured(md, env)) {
      ids.add(md.runtimeId ?? md.id);
    }
  }
  return ids;
}

/**
 * Map a catalog provider id to the runtime provider id.
 *
 * Catalog rows mix models.dev ids (`novita-ai`, `fireworks-ai`) and runtime
 * ids (`novita`, `nvidia`): provider-fetched rows already use
 * `runtimeId ?? id`, models.dev-synced rows use the raw models.dev id. The
 * runtime only understands its own ids and falls back to inference for
 * anything else, so normalize here — the picker passes the
 * `(provider, model)` tuple and the runtime trusts it (OpenCode-style).
 */
export function runtimeProviderForCatalogId(catalogId: string): string {
  const direct = MODELS_DEV_BY_ID.get(catalogId);
  if (direct) return direct.runtimeId ?? direct.id;
  const byRuntime = MODELS_DEV_BY_RUNTIME_ID.get(catalogId);
  if (byRuntime?.runtimeId) return byRuntime.runtimeId;
  return catalogId;
}
