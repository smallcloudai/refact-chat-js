import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { RootState } from "../../app/store";
import { STUB_LINKS_FOR_CHAT_RESPONSE } from "../../__fixtures__";
type ChatLink =
  | { text: string; goto: string; action: string }
  | { text: string; goto: string; action: undefined }
  | { text: string; goto: undefined; action: string };

function isChatLink(json: unknown): json is ChatLink {
  if (!json || typeof json !== "object") return false;

  if (!("text" in json)) return false;
  if (typeof json.text !== "string") return false;

  if ("goto" in json && typeof json.goto === "string") return true;

  if ("action" in json && typeof json.action === "string") return true;

  return false;
}

export type LinksForChatResponse = {
  links: ChatLink[];
};

function isLinksForChatResponse(json: unknown): json is LinksForChatResponse {
  if (!json || typeof json !== "object") return false;
  if (!("links" in json)) return false;
  if (!Array.isArray(json.links)) return false;
  return json.links.every(isChatLink);
}

export const linksApi = createApi({
  reducerPath: "linksApi",
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
    getLinksForChat: builder.query<LinksForChatResponse, null>({
      async queryFn(_arg, _api, _extraOptions, _baseQuery) {
        if (!isLinksForChatResponse(STUB_LINKS_FOR_CHAT_RESPONSE)) {
          return {
            error: {
              error: "Invalid response for chat links",
              data: STUB_LINKS_FOR_CHAT_RESPONSE,
              status: "CUSTOM_ERROR",
            },
          };
        }
        return Promise.resolve({ data: STUB_LINKS_FOR_CHAT_RESPONSE });
      },
    }),
  }),
});
