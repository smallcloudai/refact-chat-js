import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { RootState } from "../../app/store";
import { ChatMessages } from "./types";
import { formatMessagesForLsp } from "../../features/Chat/Thread/utils";
import { CHAT_LINKS_URL } from "./consts";

export enum ChatLinkActions {
  PatchAll = "patch-all",
  FollowUp = "follow-up",
  Commit = "commit",
  Goto = "go-to",
  SummarizeProject = "summarize-project",
}
// goto: can be an integration file to open in settings, a file to open in an idea or a global integration.
export type ChatLink =
  | { text: string; goto: string; action: ChatLinkActions | string }
  | { text: string; goto: string; action: undefined }
  | { text: string; goto: undefined; action: ChatLinkActions | string }
  | { text: string; goto: string; action: ChatLinkActions.Goto };

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

export type LinksApiRequest = {
  chat_id: string;
  messages: ChatMessages;
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
    getLinksForChat: builder.query<LinksForChatResponse, LinksApiRequest>({
      async queryFn(args, _api, extraOptions, baseQuery) {
        const messageFotLsp = formatMessagesForLsp(args.messages);

        const response = await baseQuery({
          ...extraOptions,
          method: "POST",
          url: CHAT_LINKS_URL,
          body: {
            chat_id: args.chat_id,
            messages: messageFotLsp,
          },
        });

        if (response.error) {
          return { error: response.error };
        }

        if (!isLinksForChatResponse(response.data)) {
          return {
            error: {
              error: "Invalid response for chat links",
              data: response.data,
              status: "CUSTOM_ERROR",
            },
          };
        }
        return { data: response.data };
      },
    }),
  }),
});
