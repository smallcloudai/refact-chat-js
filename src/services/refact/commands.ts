import { RootState } from "../../app/store";
import { parseOrElse } from "../../utils";
import { AT_COMMAND_COMPLETION, AT_COMMAND_PREVIEW } from "./consts";
import { type ChatContextFile } from "./types";

import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

export type CompletionArgs = {
  query: string;
  cursor: number;
  top_n?: number;
};

export const commandsApi = createApi({
  reducerPath: "commands",
  baseQuery: fetchBaseQuery({
    prepareHeaders: (headers, api) => {
      const getState = api.getState as () => RootState;
      const state = getState();
      const token = state.config.apiKey;
      if (token) {
        headers.set("Authorization", `Bearer ${token}`);
      }
      return headers;
    },
  }),
  endpoints: (builder) => ({
    getCommandCompletion: builder.query<
      CommandCompletionResponse,
      CompletionArgs
    >({
      queryFn: async (args, api, _opts, baseQuery) => {
        const state = api.getState() as RootState;
        const port = state.config.lspPort as unknown as number;
        const url = `http://127.0.0.1:${port}${AT_COMMAND_COMPLETION}`;
        const response = await baseQuery({
          url,
          method: "POST",
          credentials: "same-origin",
          redirect: "follow",
          body: {
            query: args.query,
            cursor: args.cursor,
            top_n: args.top_n ?? 5,
          },
        });

        if (response.error) return { error: response.error };
        if (isCommandCompletionResponse(response.data)) {
          return { data: response.data };
        } else if (isDetailMessage(response.data)) {
          return {
            data: {
              completions: [],
              replace: [0, 0],
              is_cmd_executable: false,
            },
          };
        } else {
          return {
            error: {
              error: "Invalid response from command completion",
              data: response.data,
              status: "CUSTOM_ERROR",
            },
          };
        }
      },
    }),
    getCommandPreview: builder.query<(ChatContextFile | string)[], string>({
      queryFn: async (query, api, _opts, baseQuery) => {
        const state = api.getState() as RootState;
        const port = state.config.lspPort as unknown as number;
        const url = `http://127.0.0.1:${port}${AT_COMMAND_PREVIEW}`;
        const response = await baseQuery({
          url,
          method: "POST",
          credentials: "same-origin",
          redirect: "follow",
          body: { query },
        });

        if (response.error) return { error: response.error };
        // console.log(response);
        if (
          !isCommandPreviewResponse(response.data) &&
          !isDetailMessage(response.data)
        ) {
          return {
            error: {
              data: response.data,
              status: "CUSTOM_ERROR",
              error: "Invalid response from command preview",
            },
          };
        }

        if (isDetailMessage(response.data)) {
          return { data: [] };
        }

        const files = response.data.messages.reduce<
          (ChatContextFile | string)[]
        >((acc, message) => {
          // can be plain text
          if (isCommandFilePreview(message)) {
            const fileData = parseOrElse<ChatContextFile[]>(
              message.content,
              [],
            );
            return [...acc, ...fileData];
          }

          if (isCommandPlainTextPreview(message)) {
            // TODO: add name or something
            return [...acc, message.content];
          }
          return acc;
        }, []);

        return { data: files };
      },
    }),
  }),
  refetchOnMountOrArgChange: true,
});

export type CommandCompletionResponse = {
  completions: string[];
  replace: [number, number];
  is_cmd_executable: boolean;
};

export function isCommandCompletionResponse(
  json: unknown,
): json is CommandCompletionResponse {
  if (!json) return false;
  if (typeof json !== "object") return false;
  if (!("completions" in json)) return false;
  if (!("replace" in json)) return false;
  if (!("is_cmd_executable" in json)) return false;
  return true;
}
export type DetailMessage = {
  detail: string;
};
export function isDetailMessage(json: unknown): json is DetailMessage {
  if (!json) return false;
  if (typeof json !== "object") return false;
  if (!("detail" in json)) return false;
  return true;
}
type PreviewPlainText = {
  content: string;
  role: "plain_text";
};

type PreviewFile = {
  content: string;
  role: "context_file";
};

export type CommandPreviewContent = PreviewPlainText | PreviewFile;

function isCommandFilePreview(json: unknown): json is PreviewFile {
  if (!json) return false;
  if (typeof json !== "object") return false;
  if (!("role" in json)) return false;
  if (json.role !== "context_file") return false;
  if (!("content" in json)) return false;
  if (typeof json.content !== "string") return false;
  return true;
}

function isCommandPlainTextPreview(json: unknown): json is PreviewPlainText {
  if (!json) return false;
  if (typeof json !== "object") return false;
  if (!("role" in json)) return false;
  if (json.role !== "plain_text") return false;
  if (!("content" in json)) return false;
  if (typeof json.content !== "string") return false;
  return true;
}

function isCommandPreviewContent(json: unknown): json is CommandPreviewContent {
  if (isCommandFilePreview(json)) return true;
  if (isCommandPlainTextPreview(json)) return true;
  return false;
}

export type CommandPreviewResponse = {
  messages: CommandPreviewContent[];
};

export function isCommandPreviewResponse(
  json: unknown,
): json is CommandPreviewResponse {
  if (!json) return false;
  if (typeof json !== "object") return false;
  if (!("messages" in json)) return false;
  if (!Array.isArray(json.messages)) return false;

  if (!json.messages.length) return true;

  return json.messages.every((message) => isCommandPreviewContent(message));
}
