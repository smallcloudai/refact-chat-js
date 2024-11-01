import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { QUESTIONS_STUB } from "../../__fixtures__";
import { RootState } from "../../app/store";

export type User = {
  retcode: string;
  account: string;
  inference_url: string;
  inference: string;
  metering_balance: number;
};

function isUser(json: unknown): json is User {
  return (
    typeof json === "object" &&
    json !== null &&
    "retcode" in json &&
    typeof json.retcode === "string" &&
    "account" in json &&
    typeof json.account === "string" &&
    "inference_url" in json &&
    typeof json.inference_url === "string" &&
    "inference" in json &&
    typeof json.inference === "string"
  );
}

type GoodResponse = User & {
  secret_key: string;
  tooltip_message: string;
  login_message: string;
  "longthink-filters": unknown[];
  "longthink-functions-today": Record<string, LongThinkFunction>;
  "longthink-functions-today-v2": Record<string, LongThinkFunction>;
};

export function isGoodResponse(json: unknown): json is GoodResponse {
  if (!isUser(json)) return false;
  return "secret_key" in json && typeof json.secret_key === "string";
}

type BadResponse = {
  human_readable_message: string;
  retcode: "FAILED";
};

export type StreamedLoginResponse = GoodResponse | BadResponse;

export type LongThinkFunction = {
  label: string;
  model: string;
  selected_lines_min: number;
  selected_lines_max: number;
  metering: number;
  "3rd_party": boolean;
  supports_highlight: boolean;
  supports_selection: boolean;
  always_visible: boolean;
  mini_html: string;
  likes: number;
  supports_languages: string;
  is_liked: boolean;
  function_highlight: string;
  function_selection: string;
};

export type RadioOptions = {
  title: string;
  value: string;
};

export interface SurveyQuestion {
  type: string;
  name: string;
  question: string;
}

export interface RadioQuestion extends SurveyQuestion {
  type: "radio";
  options: RadioOptions[];
}

export function isRadioQuestion(
  question: SurveyQuestion,
): question is RadioQuestion {
  return question.type === "radio";
}

export type SurveyQuestions = (RadioQuestion | SurveyQuestion)[];

export const smallCloudApi = createApi({
  reducerPath: "smallcloud",
  baseQuery: fetchBaseQuery({
    baseUrl: "https://www.smallcloud.ai/v1",
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
  tagTypes: ["User", "Polling"],
  endpoints: (builder) => ({
    login: builder.query({
      providesTags: ["Polling"],
      queryFn: async (token, api, _extraOptions, baseQuery) => {
        return new Promise<ReturnType<typeof baseQuery>>((resolve, reject) => {
          const timeout = setInterval(() => {
            fetch(
              "https://www.smallcloud.ai/v1/streamlined-login-recall-ticket",
              {
                method: "GET",
                headers: {
                  Authorization: `codify-${token}`,
                  "Content-Type": "application/json",
                },
                redirect: "follow",
                cache: "no-cache",
                referrer: "no-referrer",
                signal: api.signal,
              },
            )
              .then((response) => {
                if (!response.ok) {
                  throw new Error(
                    "Invalid response from server: " + response.statusText,
                  );
                }
                return response.json() as unknown;
              })
              .then((json: unknown) => {
                if (isGoodResponse(json)) {
                  clearInterval(timeout);
                  resolve({ data: json });
                }
              })
              .catch((err: Error) => reject(err));
          }, 5000);
        });
      },
    }),
    getUser: builder.query<User, string>({
      query: (apiKey: string) => {
        return {
          url: "login",
          method: "GET",
          redirect: "follow",
          cache: "no-cache",
          // referrer: "no-referrer",
          headers: {
            "Content-Type": "application/json",
            Authorization: "Bearer " + apiKey,
          },
        };
      },
      transformResponse(response: unknown) {
        if (!isUser(response)) {
          throw new Error("Invalid response from server");
        }

        return response;
      },
      providesTags: ["User"],
    }),

    getSurvey: builder.query<SurveyQuestions, string>({
      queryFn: (_args, _api, _extraOptions, _baseQuery) => {
        return new Promise((resolve) => {
          resolve({ data: QUESTIONS_STUB });
        });
      },
    }),

    postSurvey: builder.query<unknown, Record<string, FormDataEntryValue>>({
      queryFn(arg, _api, extraOptions, baseQuery) {
        return baseQuery({
          ...extraOptions,
          url: "survey",
          method: "POST",
          body: arg,
        });
      },
    }),

    removeUserFromCache: builder.mutation<null, undefined>({
      queryFn: () => ({ data: null }),
      invalidatesTags: ["User", "Polling"],
    }),
  }),
});
