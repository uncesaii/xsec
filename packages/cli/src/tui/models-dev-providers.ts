/**
 * Auto-generated provider registry from models.dev (213 providers).
 *
 * This is the single source of truth for which providers models.dev knows
 * about, their env vars, base URLs, and whether they use OpenAI-compatible
 * APIs. The /providers screen, model fetchers, and model routing all derive
 * from this table rather than maintaining separate lists.
 *
 * Generated from: https://models.dev/api.json
 * Last updated: 2026-09-06
 */

export interface ModelsDevProvider {
  /** Provider ID as used in models.dev (e.g. "anthropic", "openai"). */
  id: string;
  /** Human-readable name (e.g. "Anthropic", "OpenAI"). */
  name: string;
  /** Env var(s) for authentication, most-preferred first. */
  envVars: string[];
  /** Base URL for the OpenAI-compatible API endpoint, if available. */
  baseUrl?: string;
  /** Whether the provider uses an OpenAI-compatible /v1/models endpoint. */
  openaiCompatible: boolean;
  /** Whether this is a "native" SDK provider (Anthropic, OpenAI, Google, etc.). */
  native?: boolean;
  /** The xsec runtime provider ID to map to, if different from models.dev ID. */
  runtimeId?: string;
}

/**
 * All 213 providers from models.dev, mapped to our internal format.
 * Providers with `openaiCompatible: true` can have their models fetched
 * via the standard /v1/models endpoint.
 */
export const MODELS_DEV_PROVIDERS: readonly ModelsDevProvider[] = [
  // ── Major providers (native SDKs) ──
  // These have native SDKs but also expose OpenAI-compatible /v1/models endpoints.
  { id: "anthropic", name: "Anthropic", envVars: ["ANTHROPIC_API_KEY"], baseUrl: "https://api.anthropic.com/v1", openaiCompatible: true, native: true, runtimeId: "anthropic" },
  { id: "openai", name: "OpenAI", envVars: ["OPENAI_API_KEY"], baseUrl: "https://api.openai.com/v1", openaiCompatible: true, native: true, runtimeId: "openai" },
  { id: "google", name: "Google", envVars: ["GOOGLE_API_KEY", "GOOGLE_GENERATIVE_AI_API_KEY", "GEMINI_API_KEY"], baseUrl: "https://generativelanguage.googleapis.com/v1beta/openai", openaiCompatible: true, native: true, runtimeId: "google" },
  { id: "mistral", name: "Mistral", envVars: ["MISTRAL_API_KEY"], baseUrl: "https://api.mistral.ai/v1", openaiCompatible: true, native: true, runtimeId: "mistral" },
  { id: "cohere", name: "Cohere", envVars: ["COHERE_API_KEY"], baseUrl: "https://api.cohere.com/v2", openaiCompatible: true, native: true, runtimeId: "cohere" },
  { id: "perplexity", name: "Perplexity", envVars: ["PERPLEXITY_API_KEY"], baseUrl: "https://api.perplexity.ai", openaiCompatible: true, native: true, runtimeId: "perplexity" },
  { id: "xai", name: "xAI", envVars: ["XAI_API_KEY"], baseUrl: "https://api.x.ai/v1", openaiCompatible: true, native: true, runtimeId: "xai" },

  // ── Major providers (OpenAI-compatible) ──
  { id: "deepseek", name: "DeepSeek", envVars: ["DEEPSEEK_API_KEY"], baseUrl: "https://api.deepseek.com", openaiCompatible: true, runtimeId: "deepseek" },
  { id: "openrouter", name: "OpenRouter", envVars: ["OPENROUTER_API_KEY"], baseUrl: "https://openrouter.ai/api/v1", openaiCompatible: true, runtimeId: "openrouter" },
  { id: "meta", name: "Meta", envVars: ["META_MODEL_API_KEY"], baseUrl: "https://api.meta.ai/v1", openaiCompatible: true, runtimeId: "meta" },
  { id: "alibaba", name: "Alibaba", envVars: ["DASHSCOPE_API_KEY"], baseUrl: "https://dashscope-intl.aliyuncs.com/compatible-mode/v1", openaiCompatible: true, runtimeId: "qwen" },
  { id: "alibaba-token-plan", name: "Alibaba Token Plan", envVars: ["ALIBABA_TOKEN_PLAN_API_KEY"], baseUrl: "https://token-plan.ap-southeast-1.maas.aliyuncs.com/compatible-mode/v1", openaiCompatible: true, runtimeId: "qwen" },
  { id: "moonshotai", name: "Moonshot AI", envVars: ["MOONSHOT_API_KEY"], baseUrl: "https://api.moonshot.ai/v1", openaiCompatible: true, runtimeId: "kimi" },
  { id: "zhipuai", name: "Zhipu AI", envVars: ["ZHIPU_API_KEY"], baseUrl: "https://open.bigmodel.cn/api/paas/v4", openaiCompatible: true, runtimeId: "z-ai" },
  { id: "zai", name: "Z.AI", envVars: ["ZHIPU_API_KEY"], baseUrl: "https://api.z.ai/api/paas/v4", openaiCompatible: true, runtimeId: "z-ai" },

  // ── Cloud providers ──
  { id: "azure", name: "Azure", envVars: ["AZURE_RESOURCE_NAME", "AZURE_API_KEY"], native: true, runtimeId: "azure" },
  { id: "amazon-bedrock", name: "Amazon Bedrock", envVars: ["AWS_ACCESS_KEY_ID", "AWS_SECRET_ACCESS_KEY", "AWS_REGION", "AWS_BEARER_TOKEN_BEDROCK"], native: true },
  { id: "google-vertex", name: "Vertex", envVars: ["GOOGLE_VERTEX_PROJECT", "GOOGLE_VERTEX_LOCATION", "GOOGLE_APPLICATION_CREDENTIALS"], native: true },
  { id: "google-vertex-anthropic", name: "Vertex (Anthropic)", envVars: ["GOOGLE_VERTEX_PROJECT", "GOOGLE_VERTEX_LOCATION", "GOOGLE_APPLICATION_CREDENTIALS"], native: true },

  // ── GPU/inference providers ──
  { id: "nvidia", name: "Nvidia", envVars: ["NVIDIA_API_KEY"], baseUrl: "https://integrate.api.nvidia.com/v1", openaiCompatible: true },
  { id: "groq", name: "Groq", envVars: ["GROQ_API_KEY"], openaiCompatible: true },
  { id: "deepinfra", name: "Deep Infra", envVars: ["DEEPINFRA_API_KEY"], openaiCompatible: true },
  { id: "fireworks-ai", name: "Fireworks AI", envVars: ["FIREWORKS_API_KEY"], baseUrl: "https://api.fireworks.ai/inference/v1/", openaiCompatible: true },
  { id: "togetherai", name: "Together AI", envVars: ["TOGETHER_API_KEY"], openaiCompatible: true },
  { id: "cerebras", name: "Cerebras", envVars: ["CEREBRAS_API_KEY"], openaiCompatible: true },
  { id: "nebius", name: "Nebius Token Factory", envVars: ["NEBIUS_API_KEY"], baseUrl: "https://api.tokenfactory.nebius.com/v1", openaiCompatible: true },
  { id: "siliconflow", name: "SiliconFlow", envVars: ["SILICONFLOW_API_KEY"], baseUrl: "https://api.siliconflow.com/v1", openaiCompatible: true },
  { id: "huggingface", name: "Hugging Face", envVars: ["HF_TOKEN"], baseUrl: "https://router.huggingface.co/v1", openaiCompatible: true },
  { id: "novita-ai", name: "NovitaAI", envVars: ["NOVITA_API_KEY"], baseUrl: "https://api.novita.ai/openai", openaiCompatible: true },
  { id: "friendli", name: "Friendli", envVars: ["FRIENDLI_TOKEN"], baseUrl: "https://api.friendli.ai/serverless/v1", openaiCompatible: true },
  { id: "baseten", name: "Baseten", envVars: ["BASETEN_API_KEY"], baseUrl: "https://inference.baseten.co/v1", openaiCompatible: true },
  { id: "modal", name: "Modal", envVars: ["MODAL_PROXY_TOKEN"], baseUrl: "https://inference.us-west.modal.direct/v1", openaiCompatible: true },
  { id: "scaleway", name: "Scaleway", envVars: ["SCALEWAY_API_KEY"], baseUrl: "https://api.scaleway.ai/v1", openaiCompatible: true },
  { id: "ovhcloud", name: "OVHcloud AI Endpoints", envVars: ["OVHCLOUD_API_KEY"], baseUrl: "https://oai.endpoints.kepler.ai.cloud.ovh.net/v1", openaiCompatible: true },
  { id: "vultr", name: "Vultr", envVars: ["VULTR_API_KEY"], baseUrl: "https://api.vultrinference.com/v1", openaiCompatible: true },
  { id: "digitalocean", name: "DigitalOcean", envVars: ["DIGITALOCEAN_ACCESS_TOKEN"], baseUrl: "https://inference.do-ai.run/v1", openaiCompatible: true },
  { id: "salad-cloud", name: "SaladCloud AI Gateway", envVars: ["SALAD_CLOUD_API_KEY"], openaiCompatible: true },
  { id: "crusoe", name: "Crusoe", envVars: ["CRUSOE_API_KEY"], baseUrl: "https://api.inference.crusoecloud.com/v1", openaiCompatible: true },
  { id: "databricks", name: "Databricks", envVars: ["DATABRICKS_HOST", "DATABRICKS_TOKEN"], baseUrl: "https://${DATABRICKS_HOST}/ai-gateway/mlflow/v1", openaiCompatible: true },
  { id: "snowflake-cortex", name: "Snowflake Cortex", envVars: ["SNOWFLAKE_ACCOUNT", "SNOWFLAKE_CORTEX_PAT"], baseUrl: "https://${SNOWFLAKE_ACCOUNT}.snowflakecomputing.com/api/v2/cortex", openaiCompatible: true },
  { id: "watsonx", name: "watsonx.ai", envVars: ["WATSONX_AI_APIKEY", "WATSONX_AI_PROJECT_ID"], openaiCompatible: true },
  { id: "cloudflare-workers-ai", name: "Cloudflare Workers AI", envVars: ["CLOUDFLARE_ACCOUNT_ID", "CLOUDFLARE_API_KEY"], openaiCompatible: true },
  { id: "cloudflare-ai-gateway", name: "Cloudflare AI Gateway", envVars: ["CLOUDFLARE_API_TOKEN", "CLOUDFLARE_ACCOUNT_ID", "CLOUDFLARE_GATEWAY_ID"], openaiCompatible: true },

  // ── Chinese providers ──
  { id: "alibaba-cn", name: "Alibaba (China)", envVars: ["DASHSCOPE_API_KEY"], baseUrl: "https://dashscope.aliyuncs.com/compatible-mode/v1", openaiCompatible: true, runtimeId: "qwen" },
  { id: "alibaba-coding-plan", name: "Alibaba Coding Plan", envVars: ["ALIBABA_CODING_PLAN_API_KEY"], baseUrl: "https://coding-intl.dashscope.aliyuncs.com/v1", openaiCompatible: true, runtimeId: "qwen" },
  { id: "alibaba-coding-plan-cn", name: "Alibaba Coding Plan (China)", envVars: ["ALIBABA_CODING_PLAN_API_KEY"], baseUrl: "https://coding.dashscope.aliyuncs.com/v1", openaiCompatible: true, runtimeId: "qwen" },
  { id: "alibaba-token-plan-cn", name: "Alibaba Token Plan (China)", envVars: ["ALIBABA_TOKEN_PLAN_API_KEY"], baseUrl: "https://token-plan.cn-beijing.maas.aliyuncs.com/compatible-mode/v1", openaiCompatible: true, runtimeId: "qwen" },
  { id: "minimax", name: "MiniMax (minimax.io)", envVars: ["MINIMAX_API_KEY"], baseUrl: "https://api.minimax.io/anthropic/v1", openaiCompatible: true },
  { id: "minimax-cn", name: "MiniMax (minimaxi.com)", envVars: ["MINIMAX_API_KEY"], baseUrl: "https://api.minimaxi.com/anthropic/v1", openaiCompatible: true },
  { id: "minimax-coding-plan", name: "MiniMax Token Plan (minimax.io)", envVars: ["MINIMAX_API_KEY"], baseUrl: "https://api.minimax.io/anthropic/v1", openaiCompatible: true },
  { id: "minimax-cn-coding-plan", name: "MiniMax Token Plan (minimaxi.com)", envVars: ["MINIMAX_API_KEY"], baseUrl: "https://api.minimaxi.com/anthropic/v1", openaiCompatible: true },
  { id: "moonshotai-cn", name: "Moonshot AI (China)", envVars: ["MOONSHOT_API_KEY"], baseUrl: "https://api.moonshot.cn/v1", openaiCompatible: true, runtimeId: "kimi" },
  { id: "kimi-for-coding", name: "Kimi For Coding", envVars: ["KIMI_API_KEY"], baseUrl: "https://api.kimi.com/coding/v1", openaiCompatible: true, runtimeId: "kimi" },
  { id: "zhipuai-coding-plan", name: "Zhipu AI Coding Plan", envVars: ["ZHIPU_API_KEY"], baseUrl: "https://open.bigmodel.cn/api/coding/paas/v4", openaiCompatible: true, runtimeId: "z-ai" },
  { id: "zai-coding-plan", name: "Z.AI Coding Plan", envVars: ["ZHIPU_API_KEY"], baseUrl: "https://api.z.ai/api/coding/paas/v4", openaiCompatible: true, runtimeId: "z-ai" },
  { id: "tencent-coding-plan", name: "Tencent Coding Plan (China)", envVars: ["TENCENT_CODING_PLAN_API_KEY"], baseUrl: "https://api.lkeap.cloud.tencent.com/coding/v3", openaiCompatible: true },
  { id: "tencent-tokenhub", name: "Tencent TokenHub", envVars: ["TENCENT_TOKENHUB_API_KEY"], baseUrl: "https://tokenhub.tencentmaas.com/v1", openaiCompatible: true },
  { id: "tencent-token-plan", name: "Tencent Token Plan", envVars: ["TENCENT_TOKEN_PLAN_API_KEY"], baseUrl: "https://api.lkeap.cloud.tencent.com/plan/v3", openaiCompatible: true },
  { id: "volcengine", name: "Volcengine Ark", envVars: ["ARK_API_KEY"], baseUrl: "https://ark.cn-beijing.volces.com/api/v3", openaiCompatible: true },
  { id: "volcengine-coding-plan", name: "Volcengine Ark Coding Plan", envVars: ["ARK_CODING_PLAN_API_KEY"], baseUrl: "https://ark.cn-beijing.volces.com/api/coding/v3", openaiCompatible: true },
  { id: "xiaomi", name: "Xiaomi", envVars: ["XIAOMI_API_KEY"], baseUrl: "https://api.xiaomimimo.com/v1", openaiCompatible: true },
  { id: "xiaomi-token-plan-ams", name: "Xiaomi Token Plan (Europe)", envVars: ["XIAOMI_API_KEY"], baseUrl: "https://token-plan-ams.xiaomimimo.com/v1", openaiCompatible: true },
  { id: "xiaomi-token-plan-cn", name: "Xiaomi Token Plan (China)", envVars: ["XIAOMI_API_KEY"], baseUrl: "https://token-plan-cn.xiaomimimo.com/v1", openaiCompatible: true },
  { id: "xiaomi-token-plan-sgp", name: "Xiaomi Token Plan (Singapore)", envVars: ["XIAOMI_API_KEY"], baseUrl: "https://token-plan-sgp.xiaomimimo.com/v1", openaiCompatible: true },
  { id: "stepfun", name: "StepFun (China)", envVars: ["STEPFUN_API_KEY"], baseUrl: "https://api.stepfun.com/v1", openaiCompatible: true },
  { id: "stepfun-ai", name: "StepFun (Global)", envVars: ["STEPFUN_API_KEY"], baseUrl: "https://api.stepfun.ai/v1", openaiCompatible: true },
  { id: "stepfun-ai-step-plan", name: "StepFun Step Plan (Global)", envVars: ["STEPFUN_API_KEY"], baseUrl: "https://api.stepfun.ai/step_plan/v1", openaiCompatible: true },
  { id: "stepfun-step-plan", name: "StepFun Step Plan (China)", envVars: ["STEPFUN_API_KEY"], baseUrl: "https://api.stepfun.com/step_plan/v1", openaiCompatible: true },
  { id: "sensenova", name: "SenseNova (China)", envVars: ["SENSENOVA_API_KEY"], baseUrl: "https://token.sensenova.cn/v1", openaiCompatible: true },
  { id: "modelscope", name: "ModelScope", envVars: ["MODELSCOPE_API_KEY"], baseUrl: "https://api-inference.modelscope.cn/v1", openaiCompatible: true },
  { id: "siliconflow-cn", name: "SiliconFlow (China)", envVars: ["SILICONFLOW_CN_API_KEY"], baseUrl: "https://api.siliconflow.cn/v1", openaiCompatible: true },
  { id: "scnet-token-plan", name: "SCNet Token Plan", envVars: ["SCNET_API_KEY"], baseUrl: "https://api.scnet.cn/api/llm/v1", openaiCompatible: true },
  { id: "qvac", name: "QVAC", envVars: ["QVAC_API_KEY"], openaiCompatible: true },
  { id: "drun", name: "D.Run (China)", envVars: ["DRUN_API_KEY"], baseUrl: "https://chat.d.run/v1", openaiCompatible: true },
  { id: "bailing", name: "Bailing", envVars: ["BAILING_API_TOKEN"], baseUrl: "https://api.tbox.cn/api/llm/v1/chat/completions", openaiCompatible: true },
  { id: "ebcloud", name: "EBCloud", envVars: ["EBCLOUD_API_KEY"], baseUrl: "https://maas-api.ebcloud.com/v1", openaiCompatible: true },
  { id: "jiekou", name: "Jiekou.AI", envVars: ["JIEKOU_API_KEY"], baseUrl: "https://api.jiekou.ai/openai", openaiCompatible: true },
  { id: "qihang-ai", name: "QiHang", envVars: ["QIHANG_API_KEY"], baseUrl: "https://api.qhaigc.net/v1", openaiCompatible: true },
  { id: "qiniu-ai", name: "Qiniu", envVars: ["QINIU_API_KEY"], baseUrl: "https://api.qnaigc.com/v1", openaiCompatible: true },

  // ── Gateway/router providers ──
  { id: "agentrouter", name: "AgentRouter", envVars: ["AGENTROUTER_API_KEY"], baseUrl: "https://agentrouter.org/v1", openaiCompatible: true },
  { id: "ai-router", name: "AI-ROUTER", envVars: ["AI_ROUTER_API_KEY"], baseUrl: "https://api.ai-router.dev/v1", openaiCompatible: true },
  { id: "llmgateway", name: "DevPass (LLM Gateway)", envVars: ["LLMGATEWAY_API_KEY"], baseUrl: "https://api.llmgateway.io/v1", openaiCompatible: true },
  { id: "llmgateway-providers", name: "LLM Gateway", envVars: ["LLMGATEWAY_API_KEY"], baseUrl: "https://api.llmgateway.io/v1", openaiCompatible: true },
  { id: "kilo", name: "Kilo Gateway", envVars: ["KILO_API_KEY"], baseUrl: "https://api.kilo.ai/api/gateway", openaiCompatible: true },
  { id: "tokenrouter", name: "TokenRouter", envVars: ["TOKENROUTER_API_KEY"], baseUrl: "https://api.tokenrouter.com/v1", openaiCompatible: true },
  { id: "trustedrouter", name: "TrustedRouter", envVars: ["TRUSTEDROUTER_API_KEY"], baseUrl: "https://api.trustedrouter.com/v1", openaiCompatible: true },
  { id: "orcarouter", name: "OrcaRouter", envVars: ["ORCAROUTER_API_KEY"], baseUrl: "https://api.orcarouter.ai/v1", openaiCompatible: true },
  { id: "unorouter", name: "UnoRouter", envVars: ["UNOROUTER_API_KEY"], baseUrl: "https://api.unorouter.com/v1", openaiCompatible: true },
  { id: "zenmux", name: "ZenMux", envVars: ["ZENMUX_AI_KEY"], baseUrl: "https://zenmux.ai/api/v1", openaiCompatible: true },
  { id: "merge-gateway", name: "Merge Gateway", envVars: ["MERGE_GATEWAY_API_KEY"], baseUrl: "https://api-gateway.merge.dev/v1/ai-sdk", openaiCompatible: true },
  { id: "fastrouter", name: "FastRouter", envVars: ["FASTROUTER_API_KEY"], baseUrl: "https://go.fastrouter.ai/api/v1", openaiCompatible: true },
  { id: "routing-run", name: "routing.run", envVars: ["ROUTING_RUN_API_KEY"], baseUrl: "https://api.routing.run/v1", openaiCompatible: true },
  { id: "mixlayer", name: "Mixlayer", envVars: ["MIXLAYER_API_KEY"], baseUrl: "https://models.mixlayer.ai/v1", openaiCompatible: true },
  { id: "helicone", name: "Helicone", envVars: ["HELICONE_API_KEY"], baseUrl: "https://ai-gateway.helicone.ai/v1", openaiCompatible: true },

  // ── Specialized providers ──
  { id: "github-copilot", name: "GitHub Copilot", envVars: ["GITHUB_TOKEN"], baseUrl: "https://api.githubcopilot.com", openaiCompatible: true },
  { id: "opencode", name: "OpenCode Zen", envVars: ["OPENCODE_API_KEY"], baseUrl: "https://opencode.ai/zen/v1", openaiCompatible: true, runtimeId: "zen" },
  { id: "opencode-go", name: "OpenCode Go", envVars: ["OPENCODE_API_KEY"], baseUrl: "https://opencode.ai/zen/go/v1", openaiCompatible: true, runtimeId: "zen" },
  { id: "lmstudio", name: "LMStudio", envVars: ["LMSTUDIO_API_KEY"], baseUrl: "http://127.0.0.1:1234/v1", openaiCompatible: true },
  { id: "ollama-cloud", name: "Ollama Cloud", envVars: ["OLLAMA_API_KEY"], baseUrl: "https://ollama.com/v1", openaiCompatible: true },
  { id: "poe", name: "Poe", envVars: ["POE_API_KEY"], baseUrl: "https://api.poe.com/v1", openaiCompatible: true },
  { id: "venice", name: "Venice AI", envVars: ["VENICE_API_KEY"], openaiCompatible: true },
  { id: "v0", name: "v0", envVars: ["V0_API_KEY"], openaiCompatible: true },
  { id: "wandb", name: "Weights & Biases", envVars: ["WANDB_API_KEY"], baseUrl: "https://api.inference.wandb.ai/v1", openaiCompatible: true },
  { id: "llama", name: "Llama", envVars: ["LLAMA_API_KEY"], baseUrl: "https://api.llama.com/compat/v1/", openaiCompatible: true },
  { id: "upstage", name: "Upstage", envVars: ["UPSTAGE_API_KEY"], baseUrl: "https://api.upstage.ai/v1/solar", openaiCompatible: true },
  { id: "poolside", name: "Poolside", envVars: ["POOLSIDE_API_KEY"], baseUrl: "https://inference.poolside.ai/v1", openaiCompatible: true },
  { id: "sakana", name: "Sakana AI", envVars: ["SAKANA_API_KEY"], baseUrl: "https://api.sakana.ai/v1", openaiCompatible: true },
  { id: "thinkingmachines", name: "Thinking Machines", envVars: ["TINKER_API_KEY"], baseUrl: "https://tinker.thinkingmachines.dev/services/tinker-prod/anthropic", openaiCompatible: true },
  { id: "arcee", name: "Arcee", envVars: ["ARCEE_API_KEY"], baseUrl: "https://api.arcee.ai/api/v1", openaiCompatible: true },
  { id: "sarvam", name: "Sarvam AI", envVars: ["SARVAM_API_KEY"], baseUrl: "https://api.sarvam.ai/v1", openaiCompatible: true },
  { id: "inception", name: "Inception", envVars: ["INCEPTION_API_KEY"], baseUrl: "https://api.inceptionlabs.ai/v1/", openaiCompatible: true },
  { id: "morph", name: "Morph", envVars: ["MORPH_API_KEY"], baseUrl: "https://api.morphllm.com/v1", openaiCompatible: true },
  { id: "longcat", name: "LongCat", envVars: ["LONGCAT_API_KEY"], baseUrl: "https://api.longcat.chat/openai", openaiCompatible: true },

  // ── Smaller/regional providers ──
  { id: "302ai", name: "302.AI", envVars: ["302AI_API_KEY"], baseUrl: "https://api.302.ai/v1", openaiCompatible: true },
  { id: "abacus", name: "Abacus", envVars: ["ABACUS_API_KEY"], baseUrl: "https://routellm.abacus.ai/v1", openaiCompatible: true },
  { id: "abliteration-ai", name: "abliteration.ai", envVars: ["ABLIT_KEY"], baseUrl: "https://api.abliteration.ai/v1", openaiCompatible: true },
  { id: "above", name: "above.dev", envVars: ["ABOVE_API_KEY"], baseUrl: "https://api.above.dev/v1", openaiCompatible: true },
  { id: "agnes", name: "Agnes AI", envVars: ["AGNES_API_KEY"], baseUrl: "https://apihub.agnes-ai.com/v1", openaiCompatible: true },
  { id: "aiand", name: "ai&", envVars: ["AIAND_API_KEY"], baseUrl: "https://api.aiand.com/v1", openaiCompatible: true },
  { id: "aihubmix", name: "AIHubMix", envVars: ["AIHUBMIX_API_KEY"], openaiCompatible: true },
  { id: "aixy", name: "Aixy", envVars: ["AIXY_API_KEY"], baseUrl: "https://api.aixy-gateway.com/v1", openaiCompatible: true },
  { id: "aki-io", name: "AKI.IO", envVars: ["AKI_IO_API_KEY"], baseUrl: "https://aki.io/v1", openaiCompatible: true },
  { id: "amd", name: "AMD", envVars: ["AMD_API_KEY"], baseUrl: "https://developer.amd.com.cn/radeon/api/v1", openaiCompatible: true },
  { id: "ambient", name: "Ambient", envVars: ["AMBIENT_API_KEY"], baseUrl: "https://api.ambient.xyz/v1", openaiCompatible: true },
  { id: "anyapi", name: "AnyAPI", envVars: ["ANYAPI_API_KEY"], baseUrl: "https://api.anyapi.ai/v1", openaiCompatible: true },
  { id: "atomic-chat", name: "Atomic Chat", envVars: ["ATOMIC_CHAT_API_KEY"], baseUrl: "http://127.0.0.1:1337/v1", openaiCompatible: true },
  { id: "auriko", name: "Auriko", envVars: ["AURIKO_API_KEY"], baseUrl: "https://api.auriko.ai/v1", openaiCompatible: true },
  { id: "azure-cognitive-services", name: "Azure Cognitive Services", envVars: ["AZURE_COGNITIVE_SERVICES_RESOURCE_NAME", "AZURE_COGNITIVE_SERVICES_API_KEY"], openaiCompatible: true },
  { id: "berget", name: "Berget.AI", envVars: ["BERGET_API_KEY"], baseUrl: "https://api.berget.ai/v1", openaiCompatible: true },
  { id: "blueclaw", name: "Blue Claw", envVars: ["BLUECLAW_API_KEY"], baseUrl: "https://openai.blueclaw.network/v1", openaiCompatible: true },
  { id: "bothub", name: "Bothub", envVars: ["BOTHUB_API_KEY"], baseUrl: "https://openai.bothub.ru/v1", openaiCompatible: true },
  { id: "chutes", name: "Chutes", envVars: ["CHUTES_API_KEY"], baseUrl: "https://llm.chutes.ai/v1", openaiCompatible: true },
  { id: "clarifai", name: "Clarifai", envVars: ["CLARIFAI_PAT"], baseUrl: "https://api.clarifai.com/v2/ext/openai/v1", openaiCompatible: true },
  { id: "claudinio", name: "Claudinio", envVars: ["CLAUDINIO_API_KEY"], baseUrl: "https://api.claudin.io/v1", openaiCompatible: true },
  { id: "cline-pass", name: "ClinePass", envVars: ["CLINE_API_KEY"], baseUrl: "https://api.cline.bot/api/v1", openaiCompatible: true },
  { id: "cloudferro-sherlock", name: "CloudFerro Sherlock", envVars: ["CLOUDFERRO_SHERLOCK_API_KEY"], baseUrl: "https://api-sherlock.cloudferro.com/openai/v1/", openaiCompatible: true },
  { id: "coralbricks", name: "CoralBricks", envVars: ["CORAL_API_KEY"], baseUrl: "https://inference.coralbricks.ai/v1", openaiCompatible: true },
  { id: "cortecs", name: "Cortecs", envVars: ["CORTECS_API_KEY"], baseUrl: "https://api.cortecs.ai/v1", openaiCompatible: true },
  { id: "crof", name: "CrofAI", envVars: ["CROF_API_KEY"], baseUrl: "https://crof.ai/v1", openaiCompatible: true },
  { id: "crossmodel", name: "CrossModel", envVars: ["CROSSMODEL_API_KEY"], baseUrl: "https://api.crossmodel.ai/v1", openaiCompatible: true },
  { id: "daoxe", name: "DaoXE", envVars: ["DAOXE_API_KEY"], baseUrl: "https://daoxe.com/v1", openaiCompatible: true },
  { id: "dinference", name: "DInference", envVars: ["DINFERENCE_API_KEY"], baseUrl: "https://api.dinference.com/v1", openaiCompatible: true },
  { id: "echo", name: "Echo", envVars: ["ECHO_API_KEY"], baseUrl: "https://echo.tracerml.ai/v1", openaiCompatible: true },
  { id: "edenai", name: "Eden AI", envVars: ["EDENAI_API_KEY"], baseUrl: "https://api.edenai.run/v3", openaiCompatible: true },
  { id: "empiriolabs", name: "EmpirioLabs AI", envVars: ["EMPIRIOLABS_API_KEY"], baseUrl: "https://api.empiriolabs.ai/v1", openaiCompatible: true },
  { id: "evroc", name: "evroc", envVars: ["EVROC_API_KEY"], baseUrl: "https://models.think.evroc.com/v1", openaiCompatible: true },
  { id: "freemodel", name: "FreeModel", envVars: ["FREEMODEL_API_KEY"], baseUrl: "https://cc.freemodel.dev/v1", openaiCompatible: true },
  { id: "frogbot", name: "FrogBot", envVars: ["FROGBOT_API_KEY"], baseUrl: "https://app.frogbot.ai/api/v1", openaiCompatible: true },
  { id: "gmicloud", name: "GMI Cloud", envVars: ["GMICLOUD_API_KEY"], baseUrl: "https://api.gmi-serving.com/v1", openaiCompatible: true },
  { id: "greenpt", name: "GreenPT", envVars: ["GREENPT_API_KEY"], baseUrl: "https://api.greenpt.ai/v1", openaiCompatible: true },
  { id: "hetzner", name: "Hetzner", envVars: ["HETZNER_API_KEY"], baseUrl: "https://inference.hetzner.com/api/v1", openaiCompatible: true },
  { id: "hpc-ai", name: "HPC-AI", envVars: ["HPC_AI_API_KEY"], baseUrl: "https://api.hpc-ai.com/inference/v1", openaiCompatible: true },
  { id: "hyper", name: "Charm Hyper", envVars: ["HYPER_API_KEY"], baseUrl: "https://hyper.charm.land/v1", openaiCompatible: true },
  { id: "iflowcn", name: "iFlow", envVars: ["IFLOW_API_KEY"], baseUrl: "https://apis.iflow.cn/v1", openaiCompatible: true },
  { id: "impossibl", name: "Impossibl", envVars: ["IMPOSSIBL_API_KEY"], baseUrl: "https://api.impossibl.com/v1", openaiCompatible: true },
  { id: "inceptron", name: "Inceptron", envVars: ["INCEPTRON_API_KEY"], baseUrl: "https://api.inceptron.io/v1", openaiCompatible: true },
  { id: "inference", name: "Inference", envVars: ["INFERENCE_API_KEY"], baseUrl: "https://inference.net/v1", openaiCompatible: true },
  { id: "inferx", name: "InferX", envVars: ["INFERX_API_KEY"], baseUrl: "https://model.inferx.net/endpoints/v1", openaiCompatible: true },
  { id: "infomaniak", name: "Infomaniak", envVars: ["INFOMANIAK_API_KEY", "INFOMANIAK_PRODUCT_ID"], baseUrl: "https://api.infomaniak.com/2/ai/${INFOMANIAK_PRODUCT_ID}/opena", openaiCompatible: true },
  { id: "io-net", name: "IO.NET", envVars: ["IOINTELLIGENCE_API_KEY"], baseUrl: "https://api.intelligence.io.solutions/api/v1", openaiCompatible: true },
  { id: "iteracompute", name: "IteraCompute", envVars: ["ITERACOMPUTE_API_KEY"], baseUrl: "https://api.iteracompute.com/v1", openaiCompatible: true },
  { id: "jalapeno", name: "Jalapeno Cloud", envVars: ["JALAPENO_API_KEY"], baseUrl: "https://api.jalapeno-cloud.ai/v1", openaiCompatible: true },
  { id: "kenari", name: "Kenari", envVars: ["KENARI_API_KEY"], baseUrl: "https://kenari.id/v1", openaiCompatible: true },
  { id: "klokintegration", name: "klokintegration.se", envVars: ["KLOKINTEGRATION_API_KEY"], baseUrl: "https://api-gw.klok.ipaas.se/proxy/kloker-key/v1", openaiCompatible: true },
  { id: "kosmik", name: "Kosmik Compute", envVars: ["KOSMIK_API_KEY"], baseUrl: "https://api.koscompute.com/v1", openaiCompatible: true },
  { id: "kuae-cloud-coding-plan", name: "KUAE Cloud Coding Plan", envVars: ["KUAE_API_KEY"], baseUrl: "https://coding-plan-endpoint.kuaecloud.net/v1", openaiCompatible: true },
  { id: "lilac", name: "Lilac", envVars: ["LILAC_API_KEY"], baseUrl: "https://api.getlilac.com/v1", openaiCompatible: true },
  { id: "llmtech", name: "LLM Tech", envVars: ["LLMTECH_API_KEY"], baseUrl: "https://api.llmtech.eu/v1", openaiCompatible: true },
  { id: "llmtr", name: "LLMTR", envVars: ["LLMTR_API_KEY"], baseUrl: "https://llmtr.com/v1", openaiCompatible: true },
  { id: "lucidquery", name: "LucidQuery", envVars: ["LUCIDQUERY_API_KEY"], baseUrl: "https://api.lucidquery.com/v1", openaiCompatible: true },
  { id: "lynkr", name: "Lynkr", envVars: ["LYNKR_API_KEY"], baseUrl: "http://127.0.0.1:8081/v1", openaiCompatible: true },
  { id: "meganova", name: "Meganova", envVars: ["MEGANOVA_API_KEY"], baseUrl: "https://api.meganova.ai/v1", openaiCompatible: true },
  { id: "modelis", name: "Modelis", envVars: ["MODELIS_API_KEY"], baseUrl: "https://modelishub.com/v1", openaiCompatible: true },
  { id: "model-oracle-ai", name: "Model Oracle AI", envVars: ["MODEL_ORACLE_API_KEY"], baseUrl: "https://api.modeloracle.com/api/v1", openaiCompatible: true },
  { id: "nan", name: "NaN", envVars: ["NAN_API_KEY"], baseUrl: "https://api.nan.builders/v1", openaiCompatible: true },
  { id: "nano-gpt", name: "NanoGPT", envVars: ["NANO_GPT_API_KEY"], baseUrl: "https://nano-gpt.com/api/v1", openaiCompatible: true },
  { id: "nearai", name: "NEAR AI Cloud", envVars: ["NEARAI_API_KEY"], baseUrl: "https://cloud-api.near.ai/v1", openaiCompatible: true },
  { id: "neon", name: "Neon", envVars: ["NEON_AI_GATEWAY_BASE_URL", "NEON_AI_GATEWAY_TOKEN"], baseUrl: "${NEON_AI_GATEWAY_BASE_URL}/v1", openaiCompatible: true },
  { id: "neosmith", name: "NeoSmith", envVars: ["NEOSMITH_API_KEY"], baseUrl: "https://router.neosmith.ai/v1", openaiCompatible: true },
  { id: "neuralwatt", name: "Neuralwatt", envVars: ["NEURALWATT_API_KEY"], baseUrl: "https://api.neuralwatt.com/v1", openaiCompatible: true },
  { id: "nova", name: "Nova", envVars: ["NOVA_API_KEY"], baseUrl: "https://api.nova.amazon.com/v1", openaiCompatible: true },
  { id: "ofox", name: "Ofox", envVars: ["OFOX_API_KEY"], baseUrl: "https://api.ofox.ai/v1", openaiCompatible: true },
  { id: "openreason", name: "OpenReason", envVars: ["OPENREASON_API_KEY"], baseUrl: "https://api.openreason.app/v1", openaiCompatible: true },
  { id: "opper", name: "Opper", envVars: ["OPPER_API_KEY"], baseUrl: "https://api.opper.ai/v3/compat", openaiCompatible: true },
  { id: "pendra", name: "Pendra", envVars: ["PENDRA_API_KEY"], baseUrl: "https://api.pendra.ai/api/v1", openaiCompatible: true },
  { id: "perplexity-agent", name: "Perplexity Agent", envVars: ["PERPLEXITY_API_KEY"], baseUrl: "https://api.perplexity.ai/v1", openaiCompatible: true, runtimeId: "perplexity" },
  { id: "pioneer", name: "Pioneer", envVars: ["PIONEER_API_KEY"], baseUrl: "https://api.pioneer.ai/v1", openaiCompatible: true },
  { id: "privatemode-ai", name: "Privatemode AI", envVars: ["PRIVATEMODE_API_KEY", "PRIVATEMODE_ENDPOINT"], baseUrl: "http://localhost:8080/v1", openaiCompatible: true },
  { id: "regolo-ai", name: "Regolo AI", envVars: ["REGOLO_API_KEY"], baseUrl: "https://api.regolo.ai/v1", openaiCompatible: true },
  { id: "requesty", name: "Requesty", envVars: ["REQUESTY_API_KEY"], baseUrl: "https://router.requesty.ai/v1", openaiCompatible: true },
  { id: "runinfra", name: "RunInfra", envVars: ["RUNINFRA_GATEWAY_KEY"], baseUrl: "https://api.runinfra.ai/v1", openaiCompatible: true },
  { id: "sap-ai-core", name: "SAP AI Core", envVars: ["AICORE_SERVICE_KEY"], openaiCompatible: true },
  { id: "scx-ai", name: "SCX.ai", envVars: ["SCX_API_KEY"], baseUrl: "https://api.scx.ai/v1", openaiCompatible: true },
  { id: "stackit", name: "STACKIT", envVars: ["STACKIT_API_KEY"], baseUrl: "https://api.openai-compat.model-serving.eu01.onstackit.cloud/v1", openaiCompatible: true },
  { id: "standardcompute", name: "Standard Compute", envVars: ["STANDARDCOMPUTE_API_KEY"], baseUrl: "https://api.stdcmpt.com/v1", openaiCompatible: true },
  { id: "subconscious", name: "Subconscious", envVars: ["SUBCONSCIOUS_API_KEY"], baseUrl: "https://api.subconscious.dev/v1", openaiCompatible: true },
  { id: "submodel", name: "submodel", envVars: ["SUBMODEL_INSTAGEN_ACCESS_KEY"], baseUrl: "https://llm.submodel.ai/v1", openaiCompatible: true },
  { id: "synthetic", name: "Synthetic", envVars: ["SYNTHETIC_API_KEY"], baseUrl: "https://api.synthetic.new/openai/v1", openaiCompatible: true },
  { id: "tensorx", name: "TensorX", envVars: ["TENSORX_API_KEY"], baseUrl: "https://api.tensorx.ai/v1", openaiCompatible: true },
  { id: "the-grid-ai", name: "The Grid AI", envVars: ["THEGRID_API_KEY"], baseUrl: "https://api.thegrid.ai/v1", openaiCompatible: true },
  { id: "tinfoil", name: "Tinfoil", envVars: ["TINFOIL_API_KEY"], baseUrl: "https://inference.tinfoil.sh/v1", openaiCompatible: true },
  { id: "tokengo", name: "TokenGo", envVars: ["TOKENGO_API_KEY"], baseUrl: "https://api.tokengo.com/v1", openaiCompatible: true },
  { id: "umans-ai", name: "Umans AI", envVars: ["UMANS_AI_API_KEY"], baseUrl: "https://api.code.umans.ai/v1", openaiCompatible: true },
  { id: "umans-ai-coding-plan", name: "Umans AI Coding Plan", envVars: ["UMANS_AI_CODING_PLAN_API_KEY"], baseUrl: "https://api.code.umans.ai/v1", openaiCompatible: true },
  { id: "vancine", name: "Vancine", envVars: ["VANCINE_API_KEY"], baseUrl: "https://vancine.com/v1", openaiCompatible: true },
  { id: "vivgrid", name: "Vivgrid", envVars: ["VIVGRID_API_KEY"], baseUrl: "https://api.vivgrid.com/v1", openaiCompatible: true },
  { id: "wafer.ai", name: "Wafer", envVars: ["WAFER_API_KEY"], baseUrl: "https://pass.wafer.ai/v1", openaiCompatible: true },
  { id: "xpersona", name: "Xpersona", envVars: ["XPERSONA_API_KEY"], baseUrl: "https://www.xpersona.co/v1", openaiCompatible: true },
  { id: "zeldoc", name: "Zeldoc", envVars: ["ZELDOC_API_KEY"], baseUrl: "https://api.zeldoc.ai/v1", openaiCompatible: true },
  { id: "zenifra", name: "Zenifra", envVars: ["ZENIFRA_AI_KEY"], baseUrl: "https://ai.zenifra.com/v1", openaiCompatible: true },
  { id: "longcat", name: "LongCat", envVars: ["LONGCAT_API_KEY"], baseUrl: "https://api.longcat.chat/openai", openaiCompatible: true },
];

/**
 * Quick lookup: models.dev provider ID → ModelsDevProvider.
 */
export const MODELS_DEV_BY_ID: ReadonlyMap<string, ModelsDevProvider> = new Map(
  MODELS_DEV_PROVIDERS.map((p) => [p.id, p]),
);

/**
 * Runtime provider ID → ModelsDevProvider (for providers with a runtimeId mapping).
 */
export const MODELS_DEV_BY_RUNTIME_ID: ReadonlyMap<string, ModelsDevProvider> = new Map(
  MODELS_DEV_PROVIDERS.filter((p) => p.runtimeId).map((p) => [p.runtimeId!, p]),
);

/**
 * All env var names across all providers, for the /providers screen.
 */
export function allProviderEnvVars(): string[] {
  const seen = new Set<string>();
  const out: string[] = [];
  for (const p of MODELS_DEV_PROVIDERS) {
    for (const v of p.envVars) {
      if (!seen.has(v)) {
        seen.add(v);
        out.push(v);
      }
    }
  }
  return out;
}

/**
 * Check if a provider has a known env var set in the environment.
 */
export function isModelsDevProviderConfigured(
  provider: ModelsDevProvider,
  env: Record<string, string | undefined>,
): boolean {
  return provider.envVars.some((v) => {
    const val = env[v];
    return typeof val === "string" && val.trim().length > 0;
  });
}
