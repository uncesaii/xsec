import { describe, expect, it } from "vitest";
import { connectionRecoveryForError } from "./connection-recovery.js";

describe("connectionRecoveryForError", () => {
  it("routes a broken Codex refresh token into ChatGPT Codex connection", () => {
    const recovery = connectionRecoveryForError(
      "ChatGPT (Codex backend) API error: token refresh failed: 401",
    );
    expect(recovery).toMatchObject({
      providerId: "chatgpt-codex",
      title: "ChatGPT Codex needs to reconnect",
    });
  });

  it("routes every configurable API-key provider to its own credential form", () => {
    for (const [error, providerId] of [
      ["Azure OpenAI API error: invalid credential", "azure"],
      ["Anthropic API error: invalid key", "anthropic"],
      ["OpenRouter HTTP 401", "openrouter"],
      ["DeepSeek API error: invalid key", "deepseek"],
      ["Z.ai GLM API error", "z-ai"],
      ["Moonshot Kimi API error", "kimi"],
      ["Alibaba Model Studio API error", "qwen"],
      ["xAI Grok API error", "xai"],
      ["OpenAI API error: invalid key", "openai"],
    ]) {
      expect(connectionRecoveryForError(error)).toMatchObject({ providerId });
    }
  });

  it("keeps non-provider failures in the transcript", () => {
    expect(connectionRecoveryForError("read_file denied outside approved scope")).toBeNull();
  });

  it("routes every provider label to its own credential form on auth failures", () => {
    const cases: Array<[string, string]> = [
      ["ChatGPT Codex API error 401", "chatgpt-codex"],
      ["Azure OpenAI API error 401", "azure"],
      ["Anthropic API error 401", "anthropic"],
      ["OpenRouter API error 401", "openrouter"],
      ["DeepSeek API error 401", "deepseek"],
      ["Z.ai GLM API error 401", "z-ai"],
      ["Moonshot Kimi API error 401", "kimi"],
      ["Alibaba Qwen API error 401", "qwen"],
      ["xAI Grok API error 401", "xai"],
      ["OpenAI API error 401", "openai"],
      ["NVIDIA API error 401", "nvidia"],
      ["Groq API error 401", "groq"],
      ["Together AI API error 401", "together"],
      ["Fireworks AI API error 401", "fireworks"],
      ["DeepInfra API error 401", "deepinfra"],
      ["Cerebras API error 401", "cerebras"],
      ["SiliconFlow API error 401", "siliconflow"],
      ["Novita AI API error 401", "novita"],
      ["Friendli API error 401", "friendli"],
      ["Baseten API error 401", "baseten"],
      ["Modal API error 401", "modal"],
      ["Scaleway API error 401", "scaleway"],
      ["OVHcloud API error 401", "ovhcloud"],
      ["Vultr API error 401", "vultr"],
      ["DigitalOcean API error 401", "digitalocean"],
      ["Google Gemini API error 401", "google"],
      ["Mistral AI API error 401", "mistral"],
      ["Meta Muse API error 401", "meta"],
      ["Cohere API error 401", "cohere"],
      ["Perplexity API error 401", "perplexity"],
      ["OpenCode Zen API error 401", "zen"],
    ];
    for (const [error, providerId] of cases) {
      expect(connectionRecoveryForError(error), error).toMatchObject({ providerId });
    }
  });

  it("never yanks wrong-model failures to the credential form", () => {
    for (const error of [
      "NVIDIA API error 404: 404 page not found",
      'NVIDIA API error 404: Model "nvidia/nemotron-3-super-120b-a12b" is not served by NVIDIA. Reselect in /model.',
      "OpenRouter API error 404: No endpoints found for model",
      "OpenRouter API error 429: rate limited",
    ]) {
      expect(connectionRecoveryForError(error), error).toBeNull();
    }
  });

  it("still routes billing failures to the credential form", () => {
    const recovery = connectionRecoveryForError(
      "OpenRouter insufficient_quota: plan quota exhausted (plan=free)",
    );
    expect(recovery).toMatchObject({ providerId: "openrouter" });
  });
});
