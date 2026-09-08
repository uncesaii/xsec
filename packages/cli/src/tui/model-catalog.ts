/**
 * The selectable model list behind `/model`.
 *
 * There is deliberately no second hand-maintained list of models here: the
 * pricing table in @xsec/shared is already the one place that knows which
 * ids the tool understands, and a separate "menu" list would drift from it
 * the first time a model is added. So the catalog is derived — ids from
 * MODEL_PRICING, provider from `modelProvider`, price from `getRates` — and
 * this module only decides ordering and presentation.
 */

import { MODEL_PRICING, getRates, modelProvider } from "@xsec/shared";

import type { SelectorItem } from "./selector.js";
import { loadCatalogModels, type CatalogSyncOptions } from "./model-catalog-sync.js";

export interface CatalogModel {
  id: string;
  provider: string;
  /** "$5/30 per M", or "free" when both rates are zero. */
  price: string;
  /**
   * Friendly display name (OpenCode's `info.name`). The picker renders
   * `name ?? beautified id` so raw `vendor/model` ids stay in code only.
   */
  name?: string;
  /** Release date for newest-first sorting (OpenCode's `release_date`). */
  releaseDate?: string;
  /** $/1M input/output when known — drives the "Free" label. */
  input?: number;
  output?: number;
  /** Lifecycle status; "deprecated" rows are filtered like upstream. */
  status?: string;
  /**
   * Context window in tokens, when the feed reports it (Models.dev
   * `limit.context`, OpenRouter `context_length`, provider `/v1/models`
   * when available). Drives the model-aware status-bar meter — absent
   * means "unknown", never a guessed number.
   */
  contextTokens?: number;
}

/**
 * Friendly picker title (OpenCode: `info.name ?? model`). Hides the
 * `vendor/` slash prefix when no feed name exists, e.g.
 * `nvidia/nemotron-3-super-120b-a12b` → `Nemotron 3 Super 120b A12b`.
 * A trailing "Free" is dropped from the title itself — the right-hand
 * "Free" label already carries that info (and the detail pane confirms
 * it), so `qwen3.6-plus-free` reads "Qwen3.6 Plus", like OpenRouter.
 * The real id is always kept in `CatalogModel.id` for routing.
 */
export function displayModelName(model: Pick<CatalogModel, "id" | "name" | "provider">): string {
  if (model.name && model.name.trim().length > 0) return model.name.trim();
  // Strip any `vendor/` prefix (not just our own provider's): OpenRouter
  // lists `cohere/command-a` as "Command A", never "Cohere Command A".
  // An OpenRouter `:free` suffix reads as a trailing " Free" word, never
  // with the colon (`...:free` → `... Free`). The real id is always kept
  // in `CatalogModel.id` for routing.
  const slash = model.id.indexOf("/");
  const bare = (slash >= 0 ? model.id.slice(slash + 1) : model.id).replace(/:free$/i, " free");
  return bare
    .split(/[-_ ]+/)
    .filter(Boolean)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

/**
 * Whether the row earns OpenCode's right-hand "Free" label.
 * Upstream marks it only for Zen (`provider.id === "opencode"`); we mark any
 * zero-cost row so OpenRouter `:free` and Zen free models all read the same.
 */
export function isModelFree(model: Pick<CatalogModel, "input" | "output" | "price">): boolean {
  if (typeof model.input === "number" && typeof model.output === "number") {
    return model.input === 0 && model.output === 0;
  }
  return model.price === "free";
}

/**
 * Picker-row title: the friendly name, minus a redundant trailing "Free"
 * when the row already carries the Free label on the right (e.g.
 * "Laguna S 2.1 Free" + Free → "Laguna S 2.1" + Free). The real id is
 * untouched — only display text is trimmed, and only when nothing is lost.
 */
export function displayModelTitle(model: CatalogModel): string {
  const title = displayModelName(model);
  if (!isModelFree(model)) return title;
  return title.replace(/\s+free$/i, "").trimEnd() || title;
}

/**
 * `default` is the fallback rate row for unrecognised models, not a model an
 * operator can select — offering it would set the engine to a model id that
 * no provider answers to.
 */
const NON_MODEL_PRICING_KEYS = new Set(["default"]);

/** Byte-order compare: locale-independent so the menu order never shifts. */
function compareStrings(a: string, b: string): number {
  if (a === b) return 0;
  return a < b ? -1 : 1;
}

/**
 * Rates are stored as plain numbers ($/1M) with inconsistent precision —
 * 5, 2.5, 0.075. Rendering them through toFixed would print "$5.00/30.00";
 * trimming to the significant digits keeps the column narrow enough to sit
 * beside the model id in a terminal.
 */
function formatRate(value: number): string {
  return String(Number(value.toFixed(4)));
}

export function formatModelPrice(input: number, output: number): string {
  if (input === 0 && output === 0) return "free";
  return `$${formatRate(input)}/${formatRate(output)} per M`;
}

export function buildModelCatalog(currentModel?: string): CatalogModel[] {
  const offlineById = new Map(
    loadCatalogModels().models.map((m) => [m.id.toLowerCase(), m]),
  );
  const models = Object.keys(MODEL_PRICING)
    .filter((id) => !NON_MODEL_PRICING_KEYS.has(id))
    .map((id) => {
      const rates = getRates(id);
      const offline = offlineById.get(id.toLowerCase());
      return {
        id,
        provider: modelProvider(id),
        price: formatModelPrice(rates.input, rates.output),
        input: rates.input,
        output: rates.output,
        contextTokens: offline?.contextTokens,
      } satisfies CatalogModel;
    });

  // The active model floats to the top: it is the row the operator most
  // often wants to confirm, and it doubles as the overlay's initial
  // highlight. Everything else groups by provider so the list reads as
  // vendor sections rather than as an alphabet soup of ids.
  return models.sort((a, b) => {
    if (a.id === currentModel) return b.id === currentModel ? 0 : -1;
    if (b.id === currentModel) return 1;
    return compareStrings(a.provider, b.provider) || compareStrings(a.id, b.id);
  });
}

export function modelSelectorItems(currentModel?: string): SelectorItem[] {
  return buildModelCatalog(currentModel).map((model) => ({
    id: model.id,
    label: model.id,
    meta: `${model.provider} · ${model.price}`,
    current: model.id === currentModel,
  }));
}

// ── Models.dev-synced superset ────────────────────────────────────────────────
//
// `buildModelCatalog` above is the priced core: exactly the ids @xsec/shared
// has rates for, in a stable order. The functions below widen the picker to
// every model the operator's provider offers by folding in the Models.dev
// catalog (cached, with a bundled offline floor — see model-catalog-sync.ts).
// Synced rows the pricing table already covers are dropped so a priced row is
// never shadowed by a rate-less duplicate.

/** Byte-order-stable sort used by both the priced and full catalogs. */
function compareCatalogRows(currentModel?: string) {
  return (a: CatalogModel, b: CatalogModel): number => {
    if (a.id === currentModel) return b.id === currentModel ? 0 : -1;
    if (b.id === currentModel) return 1;
    return compareStrings(a.provider, b.provider) || compareStrings(a.id, b.id);
  };
}

/**
 * Models present in the cached/offline Models.dev catalog but NOT already in
 * the pricing table. Price is shown only when the feed carried one; otherwise
 * a neutral placeholder, so the operator can still select the model (cost
 * accounting falls back to the `default` rate row, exactly as it does today
 * for any unrecognised id).
 */
export function catalogExtras(opts: CatalogSyncOptions = {}): CatalogModel[] {
  const priced = new Set(Object.keys(MODEL_PRICING).map((k) => k.toLowerCase()));
  const seen = new Set<string>();
  const out: CatalogModel[] = [];
  for (const m of loadCatalogModels(opts).models) {
    // Deprecated rows never reach the picker (matches OpenCode's
    // `info.status !== "deprecated"` filter).
    if (typeof m.status === "string" && m.status.toLowerCase() === "deprecated") continue;
    // Provider-aware dedup: same id on different providers are distinct rows.
    const key = `${m.id.toLowerCase()}:${m.provider.toLowerCase()}`;
    if (priced.has(m.id.toLowerCase()) || seen.has(key)) continue;
    seen.add(key);
    const price =
      typeof m.input === "number" && typeof m.output === "number"
        ? formatModelPrice(m.input, m.output)
        : "—";
    out.push({
      id: m.id,
      provider: m.provider,
      price,
      name: m.name,
      releaseDate: m.releaseDate,
      input: m.input,
      output: m.output,
      status: m.status,
      contextTokens: m.contextTokens,
    });
  }
  return out;
}

/**
 * The full picker list: the priced core plus every Models.dev-synced model we
 * don't already price, sorted into one provider-grouped list with the active
 * model floated to the top.
 */
export function buildFullModelCatalog(
  currentModel?: string,
  opts: CatalogSyncOptions = {},
): CatalogModel[] {
  const priced = buildModelCatalog(currentModel);
  const extras = catalogExtras(opts);
  return [...priced, ...extras].sort(compareCatalogRows(currentModel));
}

export function fullModelSelectorItems(
  currentModel?: string,
  opts: CatalogSyncOptions = {},
): SelectorItem[] {
  return buildFullModelCatalog(currentModel, opts).map((model) => ({
    id: model.id,
    label: model.id,
    meta: `${model.provider} · ${model.price}`,
    current: model.id === currentModel,
  }));
}

/**
 * The model's real context window in tokens, or `undefined` when no feed
 * reported one. Match strategy, in order:
 * 1. exact id match;
 * 2. case-insensitive id match (OpenRouter `:free` casing, vendor casing);
 * 3. bare-id match — the `vendor/` prefix and any `:free` suffix are
 *    billing/routing decorations on the same weights, so `nvidia/foo`,
 *    `foo`, and `other-vendor/foo:free` all describe the same window
 *    *provided every catalog row that knows a window for that bare id
 *    agrees on the value*. Disagreement (two genuinely different models
 *    sharing a bare name) degrades to `undefined`: callers fall back to
 *    the turn budget, which is at least honest about what it measures.
 * Never guesses a number.
 */
export function modelContextWindow(
  catalog: readonly CatalogModel[],
  modelId: string | undefined,
): number | undefined {
  if (!modelId) return undefined;
  const exact = catalog.find((model) => model.id === modelId);
  const row = exact ?? catalog.find((model) => model.id.toLowerCase() === modelId.toLowerCase());
  const windowOf = (candidate: CatalogModel | undefined): number | undefined =>
    candidate &&
    typeof candidate.contextTokens === "number" &&
    Number.isFinite(candidate.contextTokens) &&
    candidate.contextTokens > 0
      ? Math.trunc(candidate.contextTokens)
      : undefined;
  const direct = windowOf(row);
  if (direct !== undefined) return direct;
  // A known id shape without a reported window (e.g. a provider `/v1/models`
  // row, which carries no context data) must not shadow a feed row that
  // DOES know the window under a sibling id shape — fall through to the
  // bare-id search rather than returning undefined here.
  const bare = bareModelId(modelId);
  if (!bare) return undefined;
  const windows = new Set<number>();
  for (const model of catalog) {
    if (bareModelId(model.id) !== bare) continue;
    const known = windowOf(model);
    if (known !== undefined) windows.add(known);
  }
  // Unanimous (a single knower counts as unanimous) or nothing.
  return windows.size === 1 ? [...windows][0] : undefined;
}

/**
 * The routing/billing decorations stripped: `Nvidia/Foo:free` → `foo`.
 * Both the vendor prefix and the OpenRouter `:free` suffix describe how
 * the model is *served*, not which weights run — the context window is
 * identical either way.
 */
function bareModelId(id: string): string | undefined {
  const slash = id.indexOf("/");
  const withoutVendor = slash >= 0 ? id.slice(slash + 1) : id;
  const bare = withoutVendor.replace(/:free$/i, "").trim().toLowerCase();
  return bare.length > 0 ? bare : undefined;
}
