import { PROVIDERS } from "./provider-status.js";

export interface ConnectionRecovery {
  providerId: string;
  title: string;
  detail: string;
}

/**
 * Vendor shorthands the provider table's labels don't contain, longest-match
 * first so "Azure OpenAI" never falls through to "OpenAI". These preserve the
 * historical routings (codex, azure, anthropic/claude, openrouter, deepseek,
 * z-ai, kimi, qwen, xai, openai); every other vendor resolves via its label
 * in the table below.
 */
const PROVIDER_ALIASES: Array<{ pattern: RegExp; id: string }> = [
  { pattern: /codex/i, id: "chatgpt-codex" },
  { pattern: /azure/i, id: "azure" },
  { pattern: /anthropic|claude/i, id: "anthropic" },
  { pattern: /openrouter/i, id: "openrouter" },
  { pattern: /deepseek/i, id: "deepseek" },
  { pattern: /\bz[.-]?ai\b|glm/i, id: "z-ai" },
  { pattern: /moonshot|kimi/i, id: "kimi" },
  { pattern: /alibaba|qwen/i, id: "qwen" },
  { pattern: /\bxai\b|x\.ai|grok/i, id: "xai" },
  { pattern: /\bzen\b/i, id: "zen" },
  { pattern: /genspark/i, id: "genspark" },
  { pattern: /openai/i, id: "openai" },
];

/**
 * Signals that smell like credentials/billing rather than a bad request.
 * Deliberately EXCLUDES bare 404 / "not found" / model-mismatch text: a
 * model the vendor doesn't serve (wrong-vendor routing, delisted id) is
 * fixed by reselecting in /model, and yanking the operator to a credential
 * form there is exactly the confusion this module exists to prevent.
 */
const CREDENTIAL_SIGNAL =
  /401|403|unauthorized|forbidden|invalid key|invalid credential|credential|auth\b|token|login|user not found|quota|billing|plan quota|exhaust/i;

/** Wrong-model signals: never a credential problem, never a recovery. A bare
 * 404 joins them — re-pasting a key has never fixed a not-found. */
const MODEL_MISMATCH_SIGNAL =
  /\b404\b|model .*not (found|available|supported|served)|no such model|unknown model|not served by|reselect in \/model/i;

/**
 * Transient network failures: timeouts, drops, refusals, operator cancels.
 * The key is fine — the request never completed (or the operator killed
 * it) — so routing to the credential form actively misleads: re-pasting a
 * working key fixes nothing, and yanking the operator to /connect
 * mid-engagement is the confusion. The turn already reports the failure
 * inline; the operator just retries. Checked FIRST so a transient always
 * wins over any credential-looking substring sharing the same detail.
 */
const TRANSIENT_SIGNAL =
  /timed?\s?out|timeout|aborted?\b|cancelled? by operator|cancelled\b|canceled\b|econnreset|econnrefused|etimedout|econnaborted|enotfound|eai_again|socket hang ?up|fetch failed|failed to fetch|connection (reset|refused|closed|aborted)|network error/i;

function escapeRegExp(text: string): string {
  return text.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

/**
 * Converts a provider-side failure into a provider-specific recovery route.
 *
 * The vendor resolves structurally — aliases first, then every label in the
 * provider table (longest first so "Azure OpenAI" beats "OpenAI") — instead
 * of a hand-maintained regex list that drifts from the table and misses
 * vendors. Tool, target, model-mismatch and rate-limit failures return
 * null: opening credential setup for those sends the operator to the wrong
 * surface.
 */
export function connectionRecoveryForError(error: string): ConnectionRecovery | null {
  const detail = error.trim();
  if (!detail) return null;

  let providerId: string | undefined;
  for (const alias of PROVIDER_ALIASES) {
    if (alias.pattern.test(detail)) {
      providerId = alias.id;
      break;
    }
  }
  if (!providerId) {
    const byLabelLength = [...PROVIDERS].sort((a, b) => b.label.length - a.label.length);
    for (const info of byLabelLength) {
      if (new RegExp(`\\b${escapeRegExp(info.label)}\\b`, "i").test(detail)) {
        providerId = info.id;
        break;
      }
    }
  }
  if (!providerId) return null;

  // A timeout is a network problem, not a credential problem — never yank
  // to the credential form for one (see TRANSIENT_SIGNAL).
  if (TRANSIENT_SIGNAL.test(detail)) return null;

  // A wrong model on the right vendor is fixed in /model, not /connect.
  if (MODEL_MISMATCH_SIGNAL.test(detail) && !CREDENTIAL_SIGNAL.test(detail)) return null;

  // A bare rate-limit is throttling, not credentials: reconnecting the key
  // cannot help, and yanking the operator to /connect mid-engagement is the
  // confusion. Quota/billing-flavored 429s still route (credential screen
  // owns the billing path).
  if (/\b429\b/.test(detail) && !CREDENTIAL_SIGNAL.test(detail)) return null;

  if (providerId === "chatgpt-codex") {
    return { providerId, title: "ChatGPT Codex needs to reconnect", detail };
  }
  const label = PROVIDERS.find((info) => info.id === providerId)?.label ?? providerId;
  return {
    providerId,
    title: `${label} credentials need attention`,
    detail,
  };
}
