import { RootState } from "../../app/store";
import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { consumeStream } from "../../features/Chat/Thread/utils";
import { parseOrElse } from "../../utils";
import {
  KNOWLEDGE_ADD_URL,
  KNOWLEDGE_LIST_URL,
  KNOWLEDGE_REMOVE_URL,
  KNOWLEDGE_SEARCH_URL,
  KNOWLEDGE_SUB_URL,
  KNOWLEDGE_UPDATE_USED_URL,
} from "./consts";

/**
 * vecdb
 * .route("/vdb-search", telemetry_post!(handle_v1_vecdb_search))
 * .route("/vdb-status", telemetry_get!(handle_v1_vecdb_status))
 * .route("/mem-query", telemetry_post!(handle_mem_query))
 * .route("/mem-add", telemetry_post!(handle_mem_add))
 * .route("/mem-erase", telemetry_post!(handle_mem_erase))
 * .route("/mem-update-used", telemetry_post!(handle_mem_update_used))
 * .route("/mem-block-until-vectorized", telemetry_get!(handle_mem_block_until_vectorized))
 * .route("/mem-list", telemetry_get!(handle_mem_list))
 * .route("/mem-sub", telemetry_get!(handle_mem_sub))
 *
 *
 */

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
  pubevent_json: string; // stringified MemRcord
};

function isMenudbSubEvent(obj: unknown): obj is MemdbSubEvent {
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

function subscribeToMemories(
  port = 8001,
  apiKey?: string | null,
): Promise<Response> {
  const url = `http://127.0.0.1:${port}${KNOWLEDGE_SUB_URL}`;
  const headers = new Headers();
  headers.append("Content-Type", "application/json");
  if (apiKey) {
    headers.append("Authorization", `Bearer ${apiKey}`);
  }

  return fetch(url, {
    method: "GET",
    headers,
    redirect: "follow",
    cache: "no-cache",
  });
}

export type MemAddRequest = {
  mem_type: string;
  goal: string;
  project: string;
  payload: string;
  origin: string;
};

export function isAddMemoryRequest(obj: unknown): obj is MemAddRequest {
  if (!obj) return false;
  if (typeof obj !== "object") return false;
  if (!("mem_type" in obj) || typeof obj.mem_type !== "string") return false;
  if (!("goal" in obj) || typeof obj.goal !== "string") return false;
  if (!("project" in obj) || typeof obj.project !== "string") return false;
  if (!("payload" in obj) || typeof obj.payload !== "string") return false;
  if (!("origin" in obj) || typeof obj.origin !== "string") return false;
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
  project: string;
  top_n: number;
};

export type MemoSearchResult = {
  query_text: string;
  results: MemoRecord[];
};

function isMemoSearchResult(obj: unknown): obj is MemoSearchResult {
  if (!obj) return false;
  if (typeof obj !== "object") return false;
  if (!("query_text" in obj) || typeof obj.query_text !== "string")
    return false;
  if (!("results" in obj) || !Array.isArray(obj.results)) return false;
  return obj.results.every(isMemoRecord);
}

export type MemUpdateUsedRequest = {
  memid: string;
  correct: number;
  relevant: number;
};

type ListResponse = {
  data: MemoRecord[];
};

function isListResponse(obj: unknown): obj is ListResponse {
  if (!obj) return false;
  if (typeof obj !== "object") return false;
  if (!("data" in obj) || !Array.isArray(obj.data)) return false;
  // TODO: other checks
  return obj.data.every(isMemoRecord);
}

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
    listAllAndSubscribe: builder.query<Record<string, MemoRecord>, undefined>({
      async queryFn(_arg, api, extraOptions, baseQuery) {
        console.log("knowledgeApi.listAllAndSubscribe.queryFn");
        const state = api.getState() as RootState;
        const port = state.config.lspPort;
        const response = await baseQuery({
          ...extraOptions,
          url: `http://127.0.0.1:${port}${KNOWLEDGE_LIST_URL}`,
        });

        if (response.error) {
          return { error: response.error };
        }

        if (!isListResponse(response)) {
          return {
            error: {
              error: "Invalid response",
              status: "CUSTOM_ERROR",
              data: response.data,
            },
          };
        }

        const data = Object.fromEntries(
          response.data.map((memoRecord) => [memoRecord.memid, memoRecord]),
        );

        return { data };
      },
      onCacheEntryAdded: async (_args, api) => {
        console.log("knowledgeApi.listAllAndSubscribe.onCacheEntryAdded");

        const state = api.getState() as unknown as RootState;
        const token = state.config.apiKey;
        const port = state.config.lspPort;

        const response = await subscribeToMemories(port, token);
        if (!response.body) return;

        const stream = response.body.getReader();
        const abortSignal = new AbortController();
        const onAbort = () => console.log("Aborted");
        const onChunk = (chunk: Record<string, unknown>) => {
          // validate the type
          console.log("mem-db chunk");
          console.log(chunk);
          if (!isMenudbSubEvent(chunk)) {
            return;
          }
          const data = parseOrElse<MemoRecord | null>(
            chunk.pubevent_json,
            null,
            isMemoRecord,
          );
          api.updateCachedData((draft) => {
            if (data === null) {
              return draft;
            } else if (chunk.pubevent_action === "DELETE") {
              draft = removeFromObject(draft, data.memid);
            } else if (chunk.pubevent_action === "INSERT") {
              draft[data.memid] = data;
            } else if (chunk.pubevent_action === "UPDATE") {
              draft[data.memid] = data;
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
    }),
    listAll: builder.query<MemoRecord[], undefined>({
      async queryFn(_arg, api, extraOptions, baseQuery) {
        const state = api.getState() as RootState;
        const port = state.config.lspPort;
        const response = await baseQuery({
          ...extraOptions,
          url: `http://127.0.0.1:${port}${KNOWLEDGE_LIST_URL}`,
        });

        if (response.error) {
          return { error: response.error };
        }

        if (!isListResponse(response)) {
          return {
            error: {
              error: "Invalid response",
              status: "CUSTOM_ERROR",
              data: response.data,
            },
          };
        }

        return { data: response.data };
      },
    }),
    subscribe: builder.query<
      {
        loaded: boolean;
        memories: Record<string, MemoRecord>;
      },
      undefined
    >({
      queryFn() {
        return {
          data: {
            loaded: false,
            memories: {},
          },
        };
      },
      onCacheEntryAdded: async (_args, api) => {
        console.log("knowledgeApi.subscribe.onCacheEntryAdded");
        const state = api.getState() as unknown as RootState;
        const token = state.config.apiKey;
        const port = state.config.lspPort;

        const response = await subscribeToMemories(port, token);
        if (!response.body) return;

        const stream = response.body.getReader();
        const abortSignal = new AbortController();
        const onAbort = () => console.log("Aborted");
        const onChunk = (chunk: Record<string, unknown>) => {
          // validate the type
          console.log("mem-db chunk");
          console.log(chunk);
          if (!isMenudbSubEvent(chunk)) {
            return;
          }
          const data = parseOrElse<MemoRecord | null>(
            chunk.pubevent_json,
            null,
            isMemoRecord,
          );
          api.updateCachedData((draft) => {
            draft.loaded = true;
            if (data === null) {
              return;
            } else if (chunk.pubevent_action === "DELETE") {
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
          body: arg,
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

    searchMemories: builder.query<MemoSearchResult, MemQuery>({
      async queryFn(arg, api, extraOptions, baseQuery) {
        const state = api.getState() as RootState;
        const port = state.config.lspPort as unknown as number;
        const url = `http://127.0.0.1:${port}${KNOWLEDGE_SEARCH_URL}`;
        const response = await baseQuery({
          ...extraOptions,
          url,
          method: "POST",
          body: { memid: arg },
        });

        if (response.error) {
          return { error: response.error };
        }

        if (!isMemoSearchResult(response.data)) {
          return {
            error: {
              status: "CUSTOM_ERROR",
              error: `Invalid response from ${url}`,
              data: response.data,
            },
          };
        }
        return { data: response.data };
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
  }),
});

function removeFromObject<T extends Record<string, unknown>>(
  obj: T,
  key: string,
): T {
  const entries = Object.entries(obj).filter(([k, _]) => k !== key);
  return Object.fromEntries(entries) as T;
}
