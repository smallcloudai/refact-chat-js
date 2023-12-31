const CHAT_URL = `/v1/chat`;
const CAPS_URL = `/v1/caps`;

export type ChatRole = "user" | "assistant" | "context_file";

export type ChatContextFile = {
  file_name: string;
  file_content: string;
  line1?: number;
  line2?: number;
};

interface BaseMessage extends Array<string | ChatContextFile[]> {
  0: ChatRole;
  1: string | ChatContextFile[];
}

export interface ChatContextFileMessage extends BaseMessage {
  0: "context_file";
  1: ChatContextFile[];
}

export interface UserMessage extends BaseMessage {
  0: "user";
  1: string;
}

export interface AssistantMessage extends BaseMessage {
  0: "assistant";
  1: string;
}

export function isUserMessage(message: ChatMessage): message is UserMessage {
  return message[0] === "user";
}

export type ChatMessage =
  | UserMessage
  | AssistantMessage
  | ChatContextFileMessage;

export type ChatMessages = ChatMessage[];

export function isChatContextFileMessage(
  message: ChatMessage,
): message is ChatContextFileMessage {
  return message[0] === "context_file";
}

interface BaseDelta {
  role: ChatRole;
}

interface AssistantDelta extends BaseDelta {
  role: "assistant";
  content: string;
}
interface ChatContextFileDelta extends BaseDelta {
  role: "context_file";
  content: ChatContextFile[];
}

// interface UserDelta extends BaseDelta {
//   role: "user";
//   content: string;
// }

type Delta = AssistantDelta | ChatContextFileDelta;

export type ChatChoice = {
  delta: Delta;
  finish_reason: "stop" | "abort" | null;
  index: number;
};

export type ChatResponse = {
  choices: ChatChoice[];
  created: number;
  model: string;
  id: string;
};

export function sendChat(
  messages: ChatMessages,
  model: string,
  abortController: AbortController,
  lspUrl?: string,
) {
  const jsonMessages = messages.map(([role, textOrFile]) => {
    const content =
      typeof textOrFile === "string" ? textOrFile : JSON.stringify(textOrFile);
    return { role, content };
  });

  const body = JSON.stringify({
    messages: jsonMessages,
    model: model,
    parameters: {
      max_new_tokens: 1000,
    },
    stream: true,
  });

  const headers = {
    "Content-Type": "application/json",
  };
  const chatEndpoint = lspUrl
    ? `${lspUrl.replace(/\/*$/, "")}${CHAT_URL}`
    : CHAT_URL;

  return fetch(chatEndpoint, {
    method: "POST",
    headers,
    body,
    redirect: "follow",
    cache: "no-cache",
    referrer: "no-referrer",
    signal: abortController.signal,
  });
}

export async function getCaps(lspUrl?: string): Promise<CapsResponse> {
  const capsEndpoint = lspUrl
    ? `${lspUrl.replace(/\/*$/, "")}${CAPS_URL}`
    : CAPS_URL;

  const response = await fetch(capsEndpoint, {
    method: "GET",
    headers: {
      accept: "application/json",
    },
  });

  if (!response.ok) {
    throw new Error(response.statusText);
  }

  const json: unknown = await response.json();

  if (!isCapsResponse(json)) {
    throw new Error("Invalid response from caps");
  }

  return json;
}

type CodeChatModel = {
  default_scratchpad: string;
  n_ctx: number;
  similar_models: string[];
  supports_scratchpads: Record<
    string,
    {
      default_system_message: string;
    }
  >;
};

type CodeCompletionModel = {
  default_scratchpad: string;
  n_ctx: number;
  similar_models: string[];
  supports_scratchpads: Record<string, Record<string, unknown>>;
};

export function isCapsResponse(json: unknown): json is CapsResponse {
  if (!json) return false;
  if (typeof json !== "object") return false;
  if (!("code_chat_default_model" in json)) return false;
  if (typeof json.code_chat_default_model !== "string") return false;
  if (!("code_chat_models" in json)) return false;
  return true;
}

export type CapsResponse = {
  caps_version: number;
  cloud_name: string;
  code_chat_default_model: string;
  code_chat_models: Record<string, CodeChatModel>;
  code_completion_default_model: string;
  code_completion_models: Record<string, CodeCompletionModel>;
  code_completion_n_ctx: number;
  endpoint_chat_passthrough: string;
  endpoint_style: string;
  endpoint_template: string;
  running_models: string[];
  telemetry_basic_dest: string;
  telemetry_corrected_snippets_dest: string;
  tokenizer_path_template: string;
  tokenizer_rewrite_path: Record<string, unknown>;
};
