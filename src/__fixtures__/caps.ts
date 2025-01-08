import { CapsResponse } from "../services/refact";

export const STUB_CAPS_RESPONSE: CapsResponse = {
  cloud_name: "Refact",
  endpoint_style: "openai",

  endpoint_template: "https://inference.smallcloud.ai/v1/completions",

  endpoint_chat_passthrough:
    "https://inference.smallcloud.ai/v1/chat/completions",
  tokenizer_path_template:
    "https://huggingface.co/$MODEL/resolve/main/tokenizer.json",
  tokenizer_rewrite_path: {
    "o1-mini": "Xenova/gpt-4o",
    "gpt-4-turbo-2024-04-09": "Xenova/gpt-4",
    "Refact/1.6B": "smallcloudai/Refact-1_6B-fim",
    "claude-3-5-sonnet-20240620": "Xenova/claude-tokenizer",
    "gpt-4-turbo": "Xenova/gpt-4",
    "qwen2.5/coder/1.5b/base": "Qwen/Qwen2.5-Coder-1.5B",
    "text-embedding-3-small": "Xenova/text-embedding-ada-002",
    "gpt-4": "Xenova/gpt-4",
    "claude-3-5-sonnet-20241022": "Xenova/claude-tokenizer",
    "claude-3-5-sonnet": "Xenova/claude-tokenizer",
    "gpt-3.5-turbo-0125": "Xenova/gpt-3.5-turbo-16k",
    "gpt-3.5-turbo": "Xenova/gpt-3.5-turbo-16k",
    "gpt-4o-mini-2024-07-18": "Xenova/gpt-4o",
    "gpt-4o-2024-08-06": "Xenova/gpt-4o",
    "gpt-3.5-turbo-1106": "Xenova/gpt-3.5-turbo-16k",
    "openai/gpt-4-turbo": "Xenova/gpt-4",
    "gpt-4o-2024-05-13": "Xenova/gpt-4o",
    "openai/gpt-4o-mini": "Xenova/gpt-4o",
    "openai/gpt-4o": "Xenova/gpt-4o",
    "gpt-4o-mini": "Xenova/gpt-4o",
    "openai/gpt-4": "Xenova/gpt-4",
    "gpt-4o": "Xenova/gpt-4o",
    "openai/gpt-3.5-turbo": "Xenova/gpt-3.5-turbo-16k",
    "cerebras-llama3.1-8b": "Xenova/Meta-Llama-3.1-Tokenizer",
    "groq-llama-3.1-8b": "Xenova/Meta-Llama-3.1-Tokenizer",
    "starcoder2/3b": "bigcode/starcoder2-3b",
  },
  telemetry_basic_dest: "https://www.smallcloud.ai/v1/telemetry-basic",

  code_completion_models: {
    "Refact/1.6B": {
      n_ctx: 4096,
      supports_scratchpads: {
        "FIM-SPM": {},
      },
      default_scratchpad: "FIM-SPM",
      similar_models: ["Refact/1.6B", "Refact/1.6B/vllm"],
      supports_tools: false,
      supports_multimodality: false,
      supports_clicks: false,
    },
    "groq-llama-3.1-8b": {
      n_ctx: 32000,
      supports_scratchpads: {
        REPLACE_PASSTHROUGH: {
          context_format: "chat",
          rag_ratio: 0.5,
        },
      },
      default_scratchpad: "",
      similar_models: [
        "groq-llama-3.1-70b",
        "groq-llama-3.2-1b",
        "groq-llama-3.2-3b",
        "groq-llama-3.2-11b-vision",
        "groq-llama-3.2-90b-vision",
      ],
      supports_tools: true,
      supports_multimodality: false,
      supports_clicks: false,
    },
    "qwen2.5/coder/1.5b/base": {
      n_ctx: 4096,
      supports_scratchpads: {
        "FIM-PSM": {
          fim_prefix: "<|fim_prefix|>",
          fim_suffix: "<|fim_suffix|>",
          fim_middle: "<|fim_middle|>",
          eot: "<|endoftext|>",
          extra_stop_tokens: ["<|repo_name|>", "<|file_sep|>", "<|fim_pad|>"],
          context_format: "qwen2.5",
          rag_ratio: 0.5,
        },
      },
      default_scratchpad: "FIM-PSM",
      similar_models: [
        "qwen2.5/coder/1.5b/base",
        "qwen2.5/coder/3b/base",
        "qwen2.5/coder/7b/base",
        "qwen2.5/coder/14b/base",
        "qwen2.5/coder/32b/base",
        "qwen2.5/coder/0.5b/base/vllm",
        "qwen2.5/coder/1.5b/base/vllm",
        "qwen2.5/coder/3b/base/vllm",
        "qwen2.5/coder/7b/base/vllm",
        "qwen2.5/coder/14b/base/vllm",
        "qwen2.5/coder/32b/base/vllm",
      ],
      supports_tools: false,
      supports_multimodality: false,
      supports_clicks: false,
    },
    "gpt-4o": {
      n_ctx: 32000,
      supports_scratchpads: {
        REPLACE_PASSTHROUGH: {
          context_format: "chat",
          rag_ratio: 0.5,
        },
      },
      default_scratchpad: "",
      similar_models: [
        "gpt-4o-2024-05-13",
        "gpt-4o-2024-08-06",
        "openai/gpt-4o",
      ],
      supports_tools: true,
      supports_multimodality: false,
      supports_clicks: false,
    },
    "gpt-4o-mini": {
      n_ctx: 32000,
      supports_scratchpads: {
        REPLACE_PASSTHROUGH: {
          context_format: "chat",
          rag_ratio: 0.5,
        },
      },
      default_scratchpad: "",
      similar_models: ["gpt-4o-mini-2024-07-18"],
      supports_tools: true,
      supports_multimodality: false,
      supports_clicks: false,
    },
    "smallcloudai/Refact-1_6B-fim": {
      n_ctx: 4096,
      supports_scratchpads: {
        "FIM-SPM": {},
      },
      default_scratchpad: "FIM-SPM",
      similar_models: ["Refact/1.6B", "Refact/1.6B/vllm"],
      supports_tools: false,
      supports_multimodality: false,
      supports_clicks: false,
    },
    "groq-llama-3.1-70b": {
      n_ctx: 32000,
      supports_scratchpads: {
        REPLACE_PASSTHROUGH: {
          context_format: "chat",
          rag_ratio: 0.5,
        },
      },
      default_scratchpad: "",
      similar_models: [
        "groq-llama-3.1-70b",
        "groq-llama-3.2-1b",
        "groq-llama-3.2-3b",
        "groq-llama-3.2-11b-vision",
        "groq-llama-3.2-90b-vision",
      ],
      supports_tools: true,
      supports_multimodality: false,
      supports_clicks: false,
    },
    "starcoder2/3b": {
      n_ctx: 4096,
      supports_scratchpads: {
        "FIM-PSM": {
          context_format: "starcoder",
          rag_ratio: 0.5,
        },
      },
      default_scratchpad: "FIM-PSM",
      similar_models: [
        "bigcode/starcoderbase",
        "starcoder/15b/base",
        "starcoder/15b/plus",
        "starcoder/1b/base",
        "starcoder/3b/base",
        "starcoder/7b/base",
        "wizardcoder/15b",
        "starcoder/1b/vllm",
        "starcoder/3b/vllm",
        "starcoder/7b/vllm",
        "starcoder2/3b/base",
        "starcoder2/7b/base",
        "starcoder2/15b/base",
        "starcoder2/3b/vllm",
        "starcoder2/7b/vllm",
        "starcoder2/15b/vllm",
        "starcoder2/3b/neuron",
        "starcoder2/7b/neuron",
        "starcoder2/15b/neuron",
        "starcoder2/3b",
        "starcoder2/7b",
        "starcoder2/15b",
        "bigcode/starcoder2-3b",
        "bigcode/starcoder2-7b",
        "bigcode/starcoder2-15b",
      ],
      supports_tools: false,
      supports_multimodality: false,
      supports_clicks: false,
    },
  },
  code_completion_default_model: "qwen2.5/coder/1.5b/base",
  code_completion_n_ctx: 4000,
  code_chat_models: {
    "groq-llama-3.1-70b": {
      n_ctx: 32000,
      supports_scratchpads: {
        PASSTHROUGH: {},
      },
      default_scratchpad: "",
      similar_models: [
        "groq-llama-3.1-70b",
        "groq-llama-3.2-1b",
        "groq-llama-3.2-3b",
        "groq-llama-3.2-11b-vision",
        "groq-llama-3.2-90b-vision",
      ],
      supports_tools: true,
      supports_multimodality: false,
      supports_clicks: false,
    },
    "gpt-3.5-turbo": {
      n_ctx: 16000,
      supports_scratchpads: {
        PASSTHROUGH: {},
      },
      default_scratchpad: "",
      similar_models: [
        "gpt-3.5-turbo-1106",
        "gpt-3.5-turbo-0125",
        "gpt-4",
        "gpt-4-turbo",
        "gpt-4-turbo-2024-04-09",
        "openai/gpt-3.5-turbo",
        "openai/gpt-4",
        "openai/gpt-4-turbo",
      ],
      supports_tools: true,
      supports_multimodality: false,
      supports_clicks: false,
    },
    "gpt-4o": {
      n_ctx: 32000,
      supports_scratchpads: {
        PASSTHROUGH: {},
      },
      default_scratchpad: "",
      similar_models: [
        "gpt-4o-2024-05-13",
        "gpt-4o-2024-08-06",
        "openai/gpt-4o",
      ],
      supports_tools: true,
      supports_multimodality: true,
      supports_clicks: false,
    },
    "gpt-4o-mini": {
      n_ctx: 32000,
      supports_scratchpads: {
        PASSTHROUGH: {},
      },
      default_scratchpad: "",
      similar_models: ["gpt-4o-mini-2024-07-18"],
      supports_tools: true,
      supports_multimodality: true,
      supports_clicks: false,
    },
    "claude-3-5-sonnet": {
      n_ctx: 32000,
      supports_scratchpads: {
        PASSTHROUGH: {},
      },
      default_scratchpad: "",
      similar_models: ["claude-3-5-sonnet-20240620"],
      supports_tools: true,
      supports_multimodality: true,
      supports_clicks: false,
    },
    "groq-llama-3.1-8b": {
      n_ctx: 32000,
      supports_scratchpads: {
        PASSTHROUGH: {},
      },
      default_scratchpad: "",
      similar_models: [
        "groq-llama-3.1-70b",
        "groq-llama-3.2-1b",
        "groq-llama-3.2-3b",
        "groq-llama-3.2-11b-vision",
        "groq-llama-3.2-90b-vision",
      ],
      supports_tools: true,
      supports_multimodality: false,
      supports_clicks: false,
    },
    "gpt-4-turbo": {
      n_ctx: 16000,
      supports_scratchpads: {
        PASSTHROUGH: {},
      },
      default_scratchpad: "",
      similar_models: [
        "gpt-3.5-turbo-1106",
        "gpt-3.5-turbo-0125",
        "gpt-4",
        "gpt-4-turbo",
        "gpt-4-turbo-2024-04-09",
        "openai/gpt-3.5-turbo",
        "openai/gpt-4",
        "openai/gpt-4-turbo",
      ],
      supports_tools: true,
      supports_multimodality: false,
      supports_clicks: false,
    },
  },
  code_chat_default_model: "gpt-4o-mini",
  running_models: [
    "smallcloudai/Refact-1_6B-fim",
    "Refact/1.6B",
    "thenlper/gte-base",
    "starcoder2/3b",
    "qwen2.5/coder/1.5b/base",
    "gpt-3.5-turbo",
    "gpt-4-turbo",
    "gpt-4o",
    "gpt-4o-mini",
    "claude-3-5-sonnet",
    "groq-llama-3.1-8b",
    "groq-llama-3.1-70b",
  ],
  caps_version: 0,
};
