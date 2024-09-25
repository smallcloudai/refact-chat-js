import { RootState } from "../../app/store";
import { PATCH_URL } from "./consts";
import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

type PatchState = {
  chunk_id: number;
  applied: boolean;
  can_unapply: boolean;
  success: boolean;
  detail: null | string;
};

function isPatchState(json: unknown): json is PatchState {
  if (!json || typeof json !== "object") return false;
  if (!("chunk_id" in json)) return false;
  if (typeof json.chunk_id !== "number") return false;
  if (!("applied" in json)) return false;
  if (typeof json.applied !== "boolean") return false;
  if (!("can_unapply" in json)) return false;
  if (typeof json.can_unapply !== "boolean") return false;
  if (!("success" in json)) return false;
  if (typeof json.success !== "boolean") return false;
  return true;
}

type PatchResult = {
  file_text: string;
  file_name_edit: string | null;
  file_name_delete: string | null;
  file_name_add: string | null;
};

function isPatchResult(json: unknown): json is PatchResult {
  if (!json || typeof json !== "object") return false;
  if (!("file_text" in json)) return false;
  if (typeof json.file_text !== "string") return false;
  if (!("file_name_edit" in json)) return false;
  if (typeof json.file_name_edit !== "string" && json.file_name_edit !== null)
    return false;
  if (!("file_name_delete" in json)) return false;
  if (
    typeof json.file_name_delete !== "string" &&
    json.file_name_delete !== null
  )
    return false;
  if (!("file_name_add" in json)) return false;
  if (typeof json.file_name_add !== "string" && json.file_name_add !== null)
    return false;
  return true;
}
type PatchResponse = {
  state: PatchState[];
  results: PatchResult[];
};

function isPatchResponse(json: unknown): json is PatchResponse {
  if (!json || typeof json !== "object") return false;
  if (!("state" in json)) return false;
  if (!Array.isArray(json.state)) return false;
  if (!json.state.every(isPatchState)) return false;
  if (!("results" in json)) return false;
  if (!Array.isArray(json.results)) return false;
  if (!json.results.every(isPatchResult)) return false;
  return true;
}

type PatchRequest = {
  pin: string;
  markdown: string;
};

export const patchApi = createApi({
  reducerPath: "patchApi",
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
    patchSingleFileFromTicket: builder.query<
      { state: PatchState; result: PatchResult },
      PatchRequest
    >({
      async queryFn(args, api, _extraOptions, baseQuery) {
        const state = api.getState() as RootState;
        const port = state.config.lspPort as unknown as number;
        const url = `http://127.0.0.1:${port}${PATCH_URL}`;

        const ticket = args.pin.split(" ")[1] ?? "";
        const messages = [
          { role: "assistant", content: args.pin + "\n" + args.markdown },
        ];

        const result = await baseQuery({
          url,
          credentials: "same-origin",
          redirect: "follow",
          method: "POST",
          body: {
            messages,
            ticket_ids: [ticket],
          },
        });

        if (result.error) return { error: result.error };

        if (!isPatchResponse(result.data)) {
          return {
            error: {
              status: "CUSTOM_ERROR",
              error: "Failed to parse patch response",
              data: result.data,
            },
          };
        }

        if (
          result.data.state.length === 0 ||
          result.data.results.length === 0
        ) {
          return {
            error: {
              status: "CUSTOM_ERROR",
              error: "Patch results state or results is empty",
              data: result.data,
            },
          };
        }

        return {
          data: { state: result.data.state[0], result: result.data.results[0] },
        };
      },
    }),
  }),
});
