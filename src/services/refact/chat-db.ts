// import { RootState } from "../../app/store";
// import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

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

export function subscribeToChatThreads(
  args: { quicksearch?: string; limit?: number } = {},
  port?: number,
  apiKey?: string,
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

// export const chatDb = createApi({
//   reducerPath: "chatDb",
//   baseQuery: fetchBaseQuery({
//     prepareHeaders: (headers, api) => {
//       const getState = api.getState as () => RootState;
//       const state = getState();
//       const token = state.config.apiKey;
//       if (token) {
//         headers.set("Authorization", `Bearer ${token}`);
//       }
//       return headers;
//     },
//   }),

//   endpoints: (builder) => ({
//     getThreads: builder.query<
//       null,
//       { quicksearch?: string; limit?: number } | undefined
//     >({
//       queryFn: async (arg = {}, api, extraOptions, baseQuery) => {
//         const state = api.getState() as RootState;
//         const port = state.config.lspPort;
//         // const token = state.config.apiKey;
//         const url = `http://127.0.0.1:${port}/db_v1/cthreads`;
//         const response = await baseQuery({
//           url,
//           body: arg,
//           method: "POST",
//           ...extraOptions,
//         });
//         if (response.error) {
//           return { error: response.error };
//         }

//         return { data: response };
//       },
//       onCacheEntryAdded(arg, api) {
//         console.log("onCacheEntryAdded");
//         console.log({arg})

//       },
//     }),

//     //   queryFn(arg, api, extraOptions, baseQuery) {
//     //     const state = api.getState() as RootState;
//     //     const port = state.config.lspPort;
//     //     const url = `http://127.0.0.1:${port}/db_v1/cthreads-sub`;
//     //     const source = new EventSource(url, { withCredentials: true });
//     //   },
//     // }),
//   }),
// });
