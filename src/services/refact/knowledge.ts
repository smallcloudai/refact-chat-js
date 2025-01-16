import { RootState } from "../../app/store";
import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import {
  consumeStream,
  formatMessagesForLsp,
} from "../../features/Chat/Thread/utils";
import {
  KNOWLEDGE_ADD_URL,
  KNOWLEDGE_REMOVE_URL,
  KNOWLEDGE_SUB_URL,
  KNOWLEDGE_UPDATE_USED_URL,
} from "./consts";
import type { ChatMessages } from ".";
import { parseOrElse } from "../../utils";

export type MemoRecord = {
  memid: string;
  thevec?: number[]; // are options nullable?
  distance?: number;
  m_type: string;
  m_goal: string;
  m_project: string;
  m_payload: string;
  m_origin: string;
  // mstat_correct: bigint,
  // mstat_relevant: bigint,
  mstat_correct: number;
  mstat_relevant: number;
  mstat_times_used: number;
};

function isMemoRecord(obj: unknown): obj is MemoRecord {
  if (!obj) return false;
  if (typeof obj !== "object") return false;
  if (!("memid" in obj) || typeof obj.memid !== "string") return false;
  // TODO: other checks
  return true;
}

export type MemdbSubEvent = {
  pubevent_id: number;
  pubevent_action: string;
  pubevent_json: MemoRecord;
};

function isMemdbSubEvent(obj: unknown): obj is MemdbSubEvent {
  if (!obj) return false;
  if (typeof obj !== "object") return false;
  if (!("pubevent_id" in obj) || typeof obj.pubevent_id !== "number") {
    return false;
  }
  if (!("pubevent_action" in obj) || typeof obj.pubevent_action !== "string") {
    return false;
  }
  if (!("pubevent_json" in obj) || !isMemoRecord(obj.pubevent_json)) {
    return false;
  }
  return true;
}

export type MemdbSubEventUnparsed = {
  pubevent_id: number;
  pubevent_action: string;
  pubevent_json: string;
};

function isMemdbSubEventUnparsed(obj: unknown): obj is MemdbSubEventUnparsed {
  if (!obj) return false;
  if (typeof obj !== "object") return false;
  if (!("pubevent_id" in obj) || typeof obj.pubevent_id !== "number") {
    return false;
  }
  if (!("pubevent_action" in obj) || typeof obj.pubevent_action !== "string") {
    return false;
  }
  if (!("pubevent_json" in obj) || typeof obj.pubevent_json !== "string") {
    return false;
  }
  return true;
}

export type SubscribeArgs =
  | {
      quick_search?: string;
      limit?: number;
    }
  | undefined;

function subscribeToMemories(
  port = 8001,
  args: SubscribeArgs,
  apiKey?: string | null,
): Promise<Response> {
  const url = `http://127.0.0.1:${port}${KNOWLEDGE_SUB_URL}`;
  const headers = new Headers();
  headers.append("Content-Type", "application/json");
  if (apiKey) {
    headers.append("Authorization", `Bearer ${apiKey}`);
  }

  return fetch(url, {
    method: "POST",
    headers,
    redirect: "follow",
    cache: "no-cache",
    body: args ? JSON.stringify(args) : undefined,
  });
}

export type MemAddRequest = {
  goal: string;
  payload: string;
  mem_type?: string;
  project?: string;
  origin?: string;
};

export function isAddMemoryRequest(obj: unknown): obj is MemAddRequest {
  if (!obj) return false;
  if (typeof obj !== "object") return false;
  // if (!("mem_type" in obj) || typeof obj.mem_type !== "string") return false;
  if (!("goal" in obj) || typeof obj.goal !== "string") return false;
  // if (!("project" in obj) || typeof obj.project !== "string") return false;
  if (!("payload" in obj) || typeof obj.payload !== "string") return false;
  // if (!("origin" in obj) || typeof obj.origin !== "string") return false;
  return true;
}

type MemAddResponse = {
  memid: string;
};
function isMemAddResponse(obj: unknown): obj is MemAddResponse {
  if (!obj) return false;
  if (typeof obj !== "object") return false;
  if (!("memid" in obj) || typeof obj.memid !== "string") return false;
  return true;
}

export type MemQuery = {
  goal: string;
  project?: string;
  top_n?: number;
};

export type MemUpdateUsedRequest = {
  memid: string;
  correct: number;
  relevant: number;
};

export const knowledgeApi = createApi({
  reducerPath: "knowledgeApi",
  baseQuery: fetchBaseQuery({
    prepareHeaders: (headers, { getState }) => {
      const token = (getState() as RootState).config.apiKey;
      if (token) {
        headers.set("Authorization", `Bearer ${token}`);
      }
      return headers;
    },
  }),
  endpoints: (builder) => ({
    subscribe: builder.query<
      {
        loaded: boolean;
        memories: Record<string, MemoRecord>;
      },
      SubscribeArgs
    >({
      queryFn() {
        // block until vecorized
        return {
          data: {
            loaded: false,
            memories: {},
          },
        };
      },
      onCacheEntryAdded: async (args, api) => {
        console.log("knowledgeApi.subscribe.onCacheEntryAdded");
        const state = api.getState() as unknown as RootState;
        const token = state.config.apiKey;
        const port = state.config.lspPort;

        const response = await subscribeToMemories(port, args, token);
        if (!response.body) return;

        const stream = response.body.getReader();
        const abortSignal = new AbortController();
        const onAbort = () => console.log("Aborted");
        const onChunk = (chunk: Record<string, unknown>) => {
          // validate the type
          console.log("mem-db chunk");
          console.log(chunk);
          if (!isMemdbSubEvent(chunk) && !isMemdbSubEventUnparsed(chunk)) {
            return;
          }

          const data: MemoRecord | null = isMemoRecord(chunk.pubevent_json)
            ? chunk.pubevent_json
            : parseOrElse(chunk.pubevent_json, null, isMemoRecord);

          if (data === null) {
            return;
          }

          api.updateCachedData((draft) => {
            draft.loaded = true;
            if (chunk.pubevent_action === "DELETE") {
              // delete draft.memories[data.memid]
              draft.memories = removeFromObject(draft.memories, data.memid);
            } else if (chunk.pubevent_action === "INSERT") {
              draft.memories[data.memid] = data;
            } else if (chunk.pubevent_action === "UPDATE") {
              draft.memories[data.memid] = data;
            } else {
              console.log("Unknown action", chunk.pubevent_action);
            }
          });
        };
        try {
          await api.cacheDataLoaded;
          await consumeStream(stream, abortSignal.signal, onAbort, onChunk);
        } catch {
          // no-op in case `cacheEntryRemoved` resolves before `cacheDataLoaded`,
          // in which case `cacheDataLoaded` will throw
        }

        await api.cacheEntryRemoved;

        await stream.cancel();
      },
      // transformResponse // use this to format the cache using memid
    }),

    addMemory: builder.mutation<MemAddResponse, MemAddRequest>({
      async queryFn(arg, api, extraOptions, baseQuery) {
        const state = api.getState() as RootState;
        const port = state.config.lspPort as unknown as number;
        const url = `http://127.0.0.1:${port}${KNOWLEDGE_ADD_URL}`;

        const response = await baseQuery({
          ...extraOptions,
          url,
          method: "POST",
          body: {
            mem_type: "",
            origin: "",
            project: "",
            ...arg,
          },
        });

        if (response.error) {
          return response;
        }

        if (!isMemAddResponse(response.data)) {
          return {
            error: {
              status: "CUSTOM_ERROR",
              error: `Invalid response from ${url}`,
              data: response.data,
            },
            meta: response.meta,
          };
        }

        return { data: response.data, meta: response.meta };
      },
      // TDOD: use the memid in the response to update the cache
    }),

    deleteMemory: builder.mutation<unknown, string>({
      async queryFn(arg, api, extraOptions, baseQuery) {
        const state = api.getState() as RootState;
        const port = state.config.lspPort as unknown as number;
        const url = `http://127.0.0.1:${port}${KNOWLEDGE_REMOVE_URL}`;
        const response = await baseQuery({
          ...extraOptions,
          url,
          method: "POST",
          body: { memid: arg },
        });
        return response;
      },
    }),

    updateMemoryUsage: builder.mutation<unknown, MemUpdateUsedRequest>({
      async queryFn(arg, api, extraOptions, baseQuery) {
        const state = api.getState() as RootState;
        const port = state.config.lspPort as unknown as number;
        const url = `http://127.0.0.1:${port}${KNOWLEDGE_UPDATE_USED_URL}`;
        const response = await baseQuery({
          ...extraOptions,
          url,
          method: "POST",
          body: arg,
        });
        return response;
      },
    }),

    createNewMemoryFromMessages: builder.mutation<unknown, ChatMessages>({
      async queryFn(messages, _api, _extraOptions, _baseQuery) {
        const messagesForLsp = formatMessagesForLsp(messages);
        console.log("Messages to make a memory out of");
        console.log(messagesForLsp);
        // TODO: add the call to the endpoint when it's there.
        await new Promise((resolve) => setTimeout(resolve, 3000));
        return { data: null };
      },
    }),
  }),
});

function removeFromObject<T extends Record<string, unknown>>(
  obj: T,
  key: string,
): T {
  const entries = Object.entries(obj).filter(([k, _]) => k !== key);
  return Object.fromEntries(entries) as T;
}
