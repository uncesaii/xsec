import { describe, expect, it, vi } from "vitest";

import { MODEL_PRICING, modelProvider } from "@xsec/shared";

import { buildModelCatalog, displayModelTitle, formatModelPrice, modelContextWindow, modelSelectorItems, type CatalogModel } from "./model-catalog.js";

const SOME_MODEL = "gpt-5.5";

describe("formatModelPrice", () => {
  it("renders input/output dollars per million", () => {
    expect(formatModelPrice(5, 30)).toBe("$5/30 per M");
    expect(formatModelPrice(2.5, 15)).toBe("$2.5/15 per M");
    expect(formatModelPrice(0.075, 0.6)).toBe("$0.075/0.6 per M");
  });

  it("collapses a zero-rate model to 'free'", () => {
    expect(formatModelPrice(0, 0)).toBe("free");
  });

  it("only says 'free' when BOTH rates are zero", () => {
    expect(formatModelPrice(0, 15)).toBe("$0/15 per M");
    expect(formatModelPrice(3, 0)).toBe("$3/0 per M");
  });
});

describe("buildModelCatalog", () => {
  it("is non-empty and covers the pricing table", () => {
    const catalog = buildModelCatalog();
    expect(catalog.length).toBeGreaterThan(0);
    // Every priced model except the synthetic fallback row is offered.
    expect(catalog).toHaveLength(Object.keys(MODEL_PRICING).length - 1);
    expect(catalog.some((model) => model.id === "default")).toBe(false);
  });

  it("gives every entry a real id, provider, and price", () => {
    for (const model of buildModelCatalog()) {
      expect(model.id.length).toBeGreaterThan(0);
      expect(model.provider.length).toBeGreaterThan(0);
      expect(model.provider).toBe(modelProvider(model.id));
      expect(model.price === "free" || model.price.endsWith(" per M")).toBe(true);
    }
  });

  it("puts the current model first", () => {
    const catalog = buildModelCatalog("glm-5.3");
    expect(catalog[0].id).toBe("glm-5.3");
    // ...and does not duplicate it further down the list.
    expect(catalog.filter((model) => model.id === "glm-5.3")).toHaveLength(1);
  });

  it("sorts the rest by provider then id", () => {
    const rest = buildModelCatalog(SOME_MODEL).slice(1);
    for (let i = 1; i < rest.length; i += 1) {
      const previous = rest[i - 1];
      const current = rest[i];
      const ordered =
        previous.provider < current.provider ||
        (previous.provider === current.provider && previous.id < current.id);
      expect(ordered, `${previous.provider}/${previous.id} before ${current.provider}/${current.id}`).toBe(true);
    }
  });

  it("is deterministic across calls and independent of the current model", () => {
    expect(buildModelCatalog()).toEqual(buildModelCatalog());

    const withCurrent = buildModelCatalog(SOME_MODEL);
    const plain = buildModelCatalog();
    // Removing the pinned row must leave exactly the unpinned ordering.
    expect(withCurrent.slice(1)).toEqual(plain.filter((model) => model.id !== SOME_MODEL));
  });

  it("returns a fresh array each call", () => {
    const first = buildModelCatalog();
    first.length = 0;
    expect(buildModelCatalog().length).toBeGreaterThan(0);
  });

  it("never prints while pricing the catalog", () => {
    // getRates warns on an unknown model; every catalog id comes FROM the
    // price table, so a warning here means the derivation drifted.
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
    const log = vi.spyOn(console, "log").mockImplementation(() => {});
    try {
      buildModelCatalog(SOME_MODEL);
      expect(warn).not.toHaveBeenCalled();
      expect(log).not.toHaveBeenCalled();
    } finally {
      warn.mockRestore();
      log.mockRestore();
    }
  });
});

describe("modelSelectorItems", () => {
  it("maps each model to a selector row", () => {
    const items = modelSelectorItems(SOME_MODEL);
    expect(items.length).toBe(buildModelCatalog().length);
    for (const item of items) {
      expect(item.id.length).toBeGreaterThan(0);
      expect(item.label).toBe(item.id);
      expect(item.meta).toBeDefined();
      expect(item.meta!.length).toBeGreaterThan(0);
      expect(item.meta).toContain(" · ");
      expect(item.disabled).toBeUndefined();
    }
  });

  it("flags exactly the current model", () => {
    const items = modelSelectorItems(SOME_MODEL);
    const flagged = items.filter((item) => item.current);
    expect(flagged).toHaveLength(1);
    expect(flagged[0].id).toBe(SOME_MODEL);
    expect(items[0].id).toBe(SOME_MODEL);
  });

  it("flags nothing when there is no current model", () => {
    expect(modelSelectorItems().some((item) => item.current)).toBe(false);
  });

  it("carries the provider and price into the meta line", () => {
    const catalog = buildModelCatalog(SOME_MODEL);
    const items = modelSelectorItems(SOME_MODEL);
    expect(items[0].meta).toBe(`${catalog[0].provider} · ${catalog[0].price}`);
  });
});

describe("displayModelTitle", () => {
  it("drops a redundant trailing Free when the row is labeled Free", () => {
    expect(
      displayModelTitle({ id: "laguna-s-2.1-free", provider: "zen", price: "free", input: 0, output: 0 }),
    ).toBe("Laguna S 2.1");
    expect(
      displayModelTitle({ id: "x/y:free", provider: "openrouter", price: "free", input: 0, output: 0 }),
    ).toBe("Y");
  });

  it("keeps Free in the title when the row is not labeled Free", () => {
    expect(
      displayModelTitle({ id: "mystery-free", provider: "poolside", price: "$1/2 per M" }),
    ).toBe("Mystery Free");
  });

  it("prefers feed names verbatim", () => {
    expect(
      displayModelTitle({ id: "big-pickle", provider: "zen", price: "free", name: "Big Pickle", input: 0, output: 0 }),
    ).toBe("Big Pickle");
  });
});

describe("modelContextWindow", () => {
  const catalog: CatalogModel[] = [
    { id: "a/model", provider: "a", price: "—", contextTokens: 200_000 },
    { id: "b/other", provider: "b", price: "—" },
    { id: "c/third", provider: "c", price: "—", contextTokens: 0 },
  ];

  it("returns the window for an exact id match", () => {
    expect(modelContextWindow(catalog, "a/model")).toBe(200_000);
  });

  it("matches case-insensitively as a fallback", () => {
    expect(modelContextWindow(catalog, "A/MODEL")).toBe(200_000);
  });

  it("returns undefined — never a guess — when unknown", () => {
    expect(modelContextWindow(catalog, undefined)).toBeUndefined();
    expect(modelContextWindow(catalog, "nope/unknown")).toBeUndefined();
    // Known row, but no feed reported a window under any sibling shape.
    expect(modelContextWindow(catalog, "b/other")).toBeUndefined();
    // A zero/degenerate window is not a window, and no sibling id shape
    // knows better.
    expect(modelContextWindow(catalog, "c/third")).toBeUndefined();
  });

  it("prefers the exact row over a case-insensitive collision", () => {
    const dupe: CatalogModel[] = [
      ...catalog,
      { id: "A/MODEL", provider: "a", price: "—", contextTokens: 1_000_000 },
    ];
    expect(modelContextWindow(dupe, "A/MODEL")).toBe(1_000_000);
    expect(modelContextWindow(dupe, "a/model")).toBe(200_000);
  });

  it("resolves across vendor-prefix and :free id shapes when unanimous", () => {
    // The provider /v1/models row carries the id but no window; the feed
    // row knows the window under the bare id.
    const mixed: CatalogModel[] = [
      { id: "nvidia/nemotron-3-super-120b-a12b", provider: "nvidia", price: "—" },
      { id: "nemotron-3-super-120b-a12b", provider: "nvidia", price: "—", contextTokens: 256_000 },
    ];
    expect(modelContextWindow(mixed, "nvidia/nemotron-3-super-120b-a12b")).toBe(256_000);
    // Same weights via OpenRouter's :free billing shape.
    const free: CatalogModel[] = [
      { id: "qwen/qwen3-plus:free", provider: "openrouter", price: "free" },
      { id: "qwen3-plus", provider: "qwen", price: "—", contextTokens: 128_000 },
    ];
    expect(modelContextWindow(free, "qwen/qwen3-plus:free")).toBe(128_000);
  });

  it("refuses to guess when sibling id shapes disagree", () => {
    const clash: CatalogModel[] = [
      { id: "a/foo", provider: "a", price: "—", contextTokens: 100_000 },
      { id: "b/foo", provider: "b", price: "—", contextTokens: 200_000 },
    ];
    // Exact rows still answer for themselves…
    expect(modelContextWindow(clash, "a/foo")).toBe(100_000);
    // …but an unknown shape must not pick a side.
    expect(modelContextWindow(clash, "c/foo")).toBeUndefined();
  });
});
