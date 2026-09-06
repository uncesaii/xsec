import { describe, expect, it, vi } from "vitest";
import {
  normalizeOpenRouterModels,
  normalizeOpenAiCompatibleModels,
  fetchProviderModels,
} from "./model-catalog-providers.js";

describe("normalizeOpenRouterModels", () => {
  it("parses a valid OpenRouter response", () => {
    const raw = {
      data: [
        {
          id: "anthropic/claude-sonnet-4",
          context_length: 200000,
          pricing: { prompt: "0.000003", completion: "0.000015" },
        },
        {
          id: "google/gemini-2.5-pro",
          context_length: 1000000,
          pricing: { prompt: "0.00000125", completion: "0.00001" },
        },
      ],
    };
    const models = normalizeOpenRouterModels(raw);
    expect(models).toHaveLength(2);

    const claude = models.find((m) => m.id === "anthropic/claude-sonnet-4")!;
    expect(claude.provider).toBe("openrouter");
    expect(claude.contextTokens).toBe(200000);
    // Per-token to per-1M: 0.000003 * 1_000_000 = 3
    expect(claude.input).toBe(3);
    expect(claude.output).toBe(15);
  });

  it("marks free models correctly", () => {
    const raw = {
      data: [
        {
          id: "meta-llama/llama-3.3-70b-instruct:free",
          context_length: 128000,
          pricing: { prompt: "0", completion: "0", discount: 1 },
        },
      ],
    };
    const models = normalizeOpenRouterModels(raw);
    expect(models).toHaveLength(1);
    expect(models[0].input).toBe(0);
    expect(models[0].output).toBe(0);
  });

  it("marks discount=1 as free even with non-zero prices", () => {
    const raw = {
      data: [
        {
          id: "some/model",
          pricing: { prompt: "0.000005", completion: "0.00001", discount: 1 },
        },
      ],
    };
    const models = normalizeOpenRouterModels(raw);
    expect(models[0].input).toBe(0);
    expect(models[0].output).toBe(0);
  });

  it("handles malformed data without throwing", () => {
    expect(normalizeOpenRouterModels(null)).toEqual([]);
    expect(normalizeOpenRouterModels("nope")).toEqual([]);
    expect(normalizeOpenRouterModels({})).toEqual([]);
    expect(normalizeOpenRouterModels({ data: "not-array" })).toEqual([]);
  });

  it("skips items without id", () => {
    const raw = {
      data: [
        { context_length: 100000 },
        { id: "valid/model", context_length: 50000 },
      ],
    };
    const models = normalizeOpenRouterModels(raw);
    expect(models).toHaveLength(1);
    expect(models[0].id).toBe("valid/model");
  });
});

describe("normalizeOpenAiCompatibleModels", () => {
  it("parses a valid OpenAI-compatible response", () => {
    const raw = {
      data: [
        { id: "gpt-4", owned_by: "openai" },
        { id: "gpt-3.5-turbo", owned_by: "openai" },
      ],
    };
    const models = normalizeOpenAiCompatibleModels(raw, "openai");
    expect(models).toHaveLength(2);
    expect(models[0].id).toBe("gpt-4");
    expect(models[0].provider).toBe("openai");
    expect(models[1].id).toBe("gpt-3.5-turbo");
  });

  it("filters out non-chat models", () => {
    const raw = {
      data: [
        { id: "text-embedding-3-large" },
        { id: "text-embedding-3-small" },
        { id: "gpt-4" },
        { id: "text-moderation-latest" },
        { id: "nvidia/nv-embedqa-mistral-7b-v2" },
        { id: "nvidia/nvclip" },
        { id: "nvidia/riva-translate-4b-instruct" },
        { id: "nvidia/nemotron-parse" },
        { id: "nvidia/phi-3-vision-128k-instruct" },
        { id: "nvidia/nemotron-4-340b-reward" },
        { id: "meta/llama-guard-4-12b" },
        { id: "nvidia/nemotron-3-embed-1b" },
      ],
    };
    const models = normalizeOpenAiCompatibleModels(raw, "nvidia");
    expect(models).toHaveLength(1);
    expect(models[0].id).toBe("gpt-4");
  });

  it("handles malformed data without throwing", () => {
    expect(normalizeOpenAiCompatibleModels(null, "openai")).toEqual([]);
    expect(normalizeOpenAiCompatibleModels({}, "openai")).toEqual([]);
  });
});

describe("fetchProviderModels", () => {
  it("fetches from configured providers", async () => {
    const mockFetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        data: [
          { id: "test-model-1" },
          { id: "test-model-2" },
        ],
      }),
    });

    const env = {
      OPENAI_API_KEY: "sk-test",
      OPENAI_BASE_URL: "https://api.openai.com/v1",
    };

    const models = await fetchProviderModels(env, mockFetch);
    expect(models.length).toBeGreaterThanOrEqual(2);
    expect(models.some((m) => m.id === "test-model-1")).toBe(true);
  });

  it("returns empty for no configured providers", async () => {
    const mockFetch = vi.fn();
    const models = await fetchProviderModels({}, mockFetch);
    expect(models).toEqual([]);
    expect(mockFetch).not.toHaveBeenCalled();
  });

  it("handles fetch failures gracefully", async () => {
    const mockFetch = vi.fn().mockRejectedValue(new Error("network error"));
    const env = { OPENAI_API_KEY: "sk-test" };
    const models = await fetchProviderModels(env, mockFetch);
    expect(models).toEqual([]);
  });

  it("does not deduplicate models with same ID from different providers", async () => {
    let callCount = 0;
    const mockFetch = vi.fn().mockImplementation(async () => {
      callCount++;
      return {
        ok: true,
        json: async () => ({
          data: [{ id: "shared-model" }],
        }),
      };
    });

    const env = {
      OPENAI_API_KEY: "sk-test",
      DEEPSEEK_API_KEY: "sk-ds-test",
    };

    const models = await fetchProviderModels(env, mockFetch);
    // Both providers return "shared-model" — different providers can serve the same model ID.
    const sharedModels = models.filter((m) => m.id === "shared-model");
    expect(sharedModels).toHaveLength(2);
    expect(sharedModels[0].provider).not.toBe(sharedModels[1].provider);
  });
});
