import { RootState } from "../../app/store";
import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { consumeStream } from "../../features/Chat/Thread/utils";

// TODO: rename to ChatThread, refactor current ChatThread... minor breaking change
export type CThread = {
  cthread_id: string;
  cthread_belongs_to_chore_event_id?: string;
  cthread_title: string;
  cthread_toolset: string;
  cthread_model: string;
  cthread_error: string;
  cthread_anything_new: boolean;
  cthread_created_ts: number;
  cthread_updated_ts: number;
  cthread_archived_ts: number;
};

//IDEA:  wrap this in createApi, using a dummy query for cache, and then `onCacheEntryAdded` to handle the requests?
export function subscribeToChatThreads(
  args: { quicksearch?: string; limit?: number } = {},
  port = 8001,
  apiKey?: string | null,
): Promise<Response> {
  const url = `http://127.0.0.1:${port}/db_v1/cthreads-sub`;
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
    body: JSON.stringify(args),
  });
}

// subscribe to db_v1/cmessages-sub arg {cmessage_belongs_to_cthread_id: string}
export function subscribeToChatMessages(
  threadId: string,
  port = 8001,
  apiKey?: string,
): Promise<Response> {
  const url = `http://127.0.0.1:${port}/db_v1/cmessages-sub`;
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
    body: JSON.stringify({ cmessage_belongs_to_cthread_id: threadId }),
  });
}
// subscribe to db_v1/chores-sub {quicksearch: String, limit: usize, only_archived: bool }

export function subscribeToChore(
  args: { quicksearch?: string; limit?: number; only_archived?: boolean } = {},
  port = 8001,
  apiKey: string,
): Promise<Response> {
  const url = `http://127.0.0.1:${port}/db_v1/chores-sub`;
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
    body: JSON.stringify(args),
  });
}

export const chatDb = createApi({
  reducerPath: "chatDb",
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
    getThreads: builder.query<
      { loaded: boolean; threads: CThread[] },
      { quicksearch?: string; limit?: number } | undefined
    >({
      queryFn() {
        return {
          data: {
            loaded: false,
            threads: [],
          },
        };
      },
      onCacheEntryAdded: async (args, api) => {
        console.log("onCacheEntryAdded");
        console.log({ args });

        const state = api.getState() as unknown as RootState;
        console.log({ state });
        const token = state.config.apiKey;
        const port = state.config.lspPort;

        const response = await subscribeToChatThreads(args, port, token);
        if (!response.body) return;

        const stream = response.body.getReader();
        const abortSignal = new AbortController();
        const onAbort = () => console.log("Aborted");
        const onChunk = (chunk: Record<string, unknown>) => {
          // validate the type
          console.log(chunk);
          api.updateCachedData((draft) => {
            draft.loaded = true;
            // TODO: types of chunk
            draft.threads.push(chunk as CThread);
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
  }),
});
