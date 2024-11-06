import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { RootState } from "../../app/store";

const INTEGRATIONS_URL = "/v1/integrations";
const INTEGRATIONS_SAVE_URL = "/v1/integrations-save";
const INTEGRATIONS_ICONS_URL = "/v1/integrations-icons";

export const integrationsApi = createApi({
  reducerPath: "integrationsApi",
  tagTypes: ["INTEGRATIONS"],
  baseQuery: fetchBaseQuery({
    prepareHeaders: (headers, api) => {
      const getState = api.getState as () => RootState;
      const state = getState();
      const token = state.config.apiKey;
      headers.set("credentials", "same-origin");
      if (token) {
        headers.set("Authorization", `Bearer ${token}`);
      }
      return headers;
    },
  }),
  endpoints: (builder) => ({
    getAllIntegrations: builder.query<Integration[], undefined>({
      providesTags: ["INTEGRATIONS"],
      async queryFn(_arg, api, extraOptions, baseQuery) {
        const state = api.getState() as RootState;
        const port = state.config.lspPort as unknown as number;
        const url = `http://127.0.0.1:${port}${INTEGRATIONS_URL}`;
        const response = await baseQuery({
          url,
          ...extraOptions,
        });

        if (response.error) {
          return { error: response.error };
        }

        if (!isIntegrations(response.data)) {
          return {
            error: {
              status: "CUSTOM_ERROR",
              error: "Failed to parse integrations response",
              data: response.data,
            },
          };
        }
        return { data: response.data };
      },
    }),
    saveIntegration: builder.mutation<unknown, Integration>({
      invalidatesTags: ["INTEGRATIONS"],
      async queryFn(arg, api, extraOptions, baseQuery) {
        const state = api.getState() as RootState;
        const port = state.config.lspPort as unknown as number;
        const url = `http://127.0.0.1:${port}${INTEGRATIONS_SAVE_URL}`;
        const response = await baseQuery({
          url,
          method: "POST",
          body: arg,
          ...extraOptions,
        });

        if (response.error) {
          return { error: response.error };
        }

        return { data: response.data };
      },
    }),
    getIntegrationIcons: builder.query<IntegrationIcon[], undefined>({
      async queryFn(arg, api, extraOptions, baseQuery) {
        const state = api.getState() as RootState;
        const port = state.config.lspPort as unknown as number;
        const url = `http://127.0.0.1:${port}${INTEGRATIONS_ICONS_URL}`;

        const response = await baseQuery({ url, ...extraOptions });

        if (response.error) {
          return { error: response.error };
        }

        if (!isIntegrationIcons(response.data)) {
          return {
            error: {
              status: "CUSTOM_ERROR",
              error: "Failed to parse integration icons response",
              data: response.data,
            },
          };
        }

        return { data: response.data };
      },
    }),
  }),
});

export function isIntegrationIcons(json: unknown): json is IntegrationIcon[] {
  if (!Array.isArray(json)) return false;
  return json.every(isIntegrationIcon);
}
export type IntegrationIcon = {
  name: string;
  value: string;
};

export function isIntegrationIcon(json: unknown): json is IntegrationIcon {
  if (!json) return false;
  if (typeof json !== "object") return false;
  if (!("name" in json)) return false;
  if (typeof json.name !== "string") return false;
  if (!("value" in json)) return false;
  if (typeof json.value !== "string") return false;
  return true;
}

export type Integration = {
  name: string;
  schema: null | Record<string, unknown>; // TODO: JSON schema
  value: {
    // Value = any json value :/
    [key: string]: unknown;
    detail?: string;
  };
};

function isIntegrations(json: unknown): json is Integration[] {
  if (!Array.isArray(json)) return false;
  return json.every(isIntegration);
}
export function isIntegration(json: unknown): json is Integration {
  if (!json) return false;
  if (typeof json !== "object") return false;
  if (!("name" in json)) return false;
  if (typeof json.name !== "string") return false;
  if (!("schema" in json)) return false;
  if (!("value" in json)) return false;
  return true;
}
