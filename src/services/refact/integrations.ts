import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { RootState } from "../../app/store";
import { isLspChatMessage, LspChatMessage } from "./chat";

const INTEGRATIONS_URL = "/v1/integrations";
const INTEGRATIONS_GET_URL = "/v1/integrations-get";
// const INTEGRATIONS_SAVE_URL = "/v1/integrations-save";
// const INTEGRATIONS_ICONS_URL = "/v1/integrations-icons";

export const integrationsApi = createApi({
  reducerPath: "integrationsApi",
  tagTypes: ["INTEGRATIONS", "INTEGRATION"],
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
    getAllIntegrations: builder.query<IntegrationWithIconResponse, undefined>({
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

        if (!isIntegrationWithIconResponse(response.data)) {
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

    getIntegrationByPath: builder.query<Integration, string>({
      providesTags: (_result, _error, arg) => [
        { type: "INTEGRATION", id: arg },
      ],
      async queryFn(pathArg, api, extraOptions, baseQuery) {
        const state = api.getState() as RootState;
        const port = state.config.lspPort as unknown as number;
        const url = `http://127.0.0.1:${port}${INTEGRATIONS_GET_URL}`;
        const response = await baseQuery({
          url,
          body: {
            integr_config_path: pathArg,
          },
          ...extraOptions,
        });

        if (response.error) {
          return { error: response.error };
        }

        if (!isIntegration(response.data)) {
          return {
            error: {
              status: "CUSTOM_ERROR",
              error: "Failed to parse integration response for: " + pathArg,
              data: response.data,
            },
          };
        }

        return {
          data: response.data,
        };
      },
    }),

    // saveIntegration: builder.mutation<unknown, Integration>({
    //   // invalidatesTags: ["INTEGRATIONS"],
    //   async queryFn(arg, api, extraOptions, baseQuery) {
    //     const state = api.getState() as RootState;
    //     const port = state.config.lspPort as unknown as number;
    //     const url = `http://127.0.0.1:${port}${INTEGRATIONS_SAVE_URL}`;
    //     const response = await baseQuery({
    //       url,
    //       method: "POST",
    //       body: arg,
    //       ...extraOptions,
    //     });

    //     if (response.error) {
    //       return { error: response.error };
    //     }

    //     return { data: response.data };
    //   },
    // }),
    // getIntegrationIcons: builder.query<IntegrationIcon[], undefined>({
    //   async queryFn(_arg, api, extraOptions, baseQuery) {
    //     const state = api.getState() as RootState;
    //     const port = state.config.lspPort as unknown as number;
    //     const url = `http://127.0.0.1:${port}${INTEGRATIONS_ICONS_URL}`;

    //     const response = await baseQuery({ url, ...extraOptions });

    //     if (response.error) {
    //       return { error: response.error };
    //     }

    //     if (!isIntegrationIcons(response.data)) {
    //       return {
    //         error: {
    //           status: "CUSTOM_ERROR",
    //           error: "Failed to parse integration icons response",
    //           data: response.data,
    //         },
    //       };
    //     }

    //     return { data: response.data };
    //   },
    // }),
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

type IntegrationPrimitive = string | number | boolean | null;
function isPrimitive(json: unknown): json is IntegrationPrimitive {
  return (
    typeof json === "string" ||
    typeof json === "number" ||
    typeof json === "boolean" ||
    json === null
  );
}

export type Integration = {
  project_path: string;
  integr_name: string;
  integr_config_path: string;
  integr_schema: IntegrationSchema;
  integr_values: Record<string, IntegrationPrimitive>;
  error_log: null | YamlError[];
};

function isIntegration(json: unknown): json is Integration {
  if (!json) return false;
  if (typeof json !== "object") return false;

  if (!("project_path" in json)) return false;
  if (typeof json.project_path !== "string") return false;

  if (!("integr_name" in json)) return false;
  if (typeof json.integr_name !== "string") return false;

  if (!("integr_config_path" in json)) return false;
  if (typeof json.integr_config_path !== "string") return false;

  if (!("integr_schema" in json)) return false;
  if (!isIntegrationSchema(json.integr_schema)) return false;

  if (!("integr_values" in json)) return false;
  if (!json.integr_values) return false;
  if (!(typeof json.integr_values === "object")) return false;
  if (!Object.values(json.integr_values).every(isPrimitive)) return false;

  if (!("error_log" in json)) return false;
  if (!json.error_log) return false;
  if (!(typeof json.error_log === "object")) return false;
  if (!Array.isArray(json.error_log)) return false;
  if (!json.error_log.every(isYamlError)) return false;
  return true;
}

type IntegrationSchema = {
  fields: Record<string, IntegrationField<NonNullable<IntegrationPrimitive>>>;
  available: Record<string, boolean>;
  smartlinks: SmartLink[];
  docker: Record<string, DockerSetting> & { smartlinks: SmartLink[] };
};

function isIntegrationSchema(json: unknown): json is IntegrationSchema {
  if (!json) return false;
  if (typeof json !== "object") return false;
  if (!("fields" in json)) return false;
  if (!json.fields) return false;
  if (!(typeof json.fields === "object")) return false;
  if (!Object.values(json.fields).every(isIntegrationField)) return false;
  if (!("available" in json)) return false;
  if (!json.available) return false;
  if (!(typeof json.available === "object")) return false;
  if (!Object.values(json.available).every((d) => typeof d === "boolean")) {
    return false;
  }
  if (!("smartlinks" in json)) return false;
  if (!json.smartlinks) return false;
  if (!Array.isArray(json.smartlinks)) return false;
  if (!json.smartlinks.every(isSmartLink)) return false;
  if (!("docker" in json)) return false;
  if (!json.docker) return false;
  if (!(typeof json.docker === "object")) return false;
  if (!Object.values(json.docker).every(isDockerSetting)) return false;
  return true;
}

type IntegrationField<T extends IntegrationPrimitive> = {
  f_type: T;
  f_desc?: string;
  f_placeholder?: T; // should match f_type
  f_default?: T;
  smartlinks?: SmartLink[];
};

// TODO: check generic type?
function isIntegrationField<T extends IntegrationPrimitive>(
  json: unknown,
): json is IntegrationField<T> {
  if (!json) return false;
  if (typeof json !== "object") return false;
  if (!("f_type" in json)) return false;
  if (!isPrimitive(json.f_type)) return false;
  if ("f_desc" in json && typeof json.f_desc !== "string") return false;
  if ("f_placeholder" in json && !isPrimitive(json.f_placeholder)) return false;
  if ("f_default" in json && !isPrimitive(json.f_default)) return false;
  if ("smartlinks" in json && !Array.isArray(json.smartlinks)) return false;
  return true;
}

type SmartLink = {
  sl_label: string;
  sl_chat: LspChatMessage[];
};

function isSmartLink(json: unknown): json is SmartLink {
  if (!json) return false;
  if (typeof json !== "object") return false;
  if (!("sl_label" in json)) return false;
  if (typeof json.sl_label !== "string") return false;
  if (!("sl_chat" in json)) return false;
  if (!Array.isArray(json.sl_chat)) return false;
  if (!json.sl_chat.every(isLspChatMessage)) return false;
  return true;
}

type DockerSetting = {
  image: string;
  environment: Record<string, IntegrationPrimitive>;
};

function isDockerSetting(json: unknown): json is DockerSetting {
  if (!json) return false;
  if (typeof json !== "object") return false;
  if (!("image" in json)) return false;
  if (typeof json.image !== "string") return false;
  if (!("environment" in json)) return false;
  if (!json.environment) return false;
  if (!(typeof json.environment === "object")) return false;
  if (!Object.values(json.environment).every(isPrimitive)) return false;
  return true;
}

// export type Integration = {
//   name: string;
//   enabled: boolean;
//   schema: null | Record<string, unknown>; // TODO: JSON schema
//   value: {
//     // Value = any json value :/
//     [key: string]: unknown;
//     detail?: string;
//   };
// };

//  pub struct IntegrationWithIconResult {
//     pub integrations: Vec<IntegrationWithIconRecord>,
//     pub error_log: Vec<YamlError>,
// }

type IntegrationWithIconRecord = {
  project_path: string;
  integr_name: string;
  integr_configPath: string;
  integr_configExists: boolean;
  on_your_laptop: boolean;
  when_isolated: boolean;
  // unparsed: unknown;
};

function isInterIntegrationWithIconRecord(
  json: unknown,
): json is IntegrationWithIconRecord {
  if (!json) return false;
  if (typeof json !== "object") return false;
  if (!("project_path" in json)) return false;
  if (typeof json.project_path !== "string") return false;
  if (!("integr_name" in json)) return false;
  if (typeof json.integr_name !== "string") return false;
  if (!("integr_configPath" in json)) return false;
  if (typeof json.integr_configPath !== "string") return false;
  if (!("integr_configExists" in json)) return false;
  if (typeof json.integr_configExists !== "boolean") return false;
  if (!("on_your_laptop" in json)) return false;
  if (typeof json.on_your_laptop !== "boolean") return false;
  if (!("when_isolated" in json)) return false;
  if (typeof json.when_isolated !== "boolean") return false;
  return true;
}

type YamlError = {
  integr_config_path: string;
  error_line: number; // starts with 1, zero if invalid
  error_msg: string;
};

function isYamlError(json: unknown): json is YamlError {
  if (!json) return false;
  if (typeof json !== "object") return false;
  if (!("integr_config_path" in json)) return false;
  if (typeof json.integr_config_path !== "string") return false;
  if (!("error_line" in json)) return false;
  if (typeof json.error_line !== "number") return false;
  if (!("error_msg" in json)) return false;
  if (typeof json.error_msg !== "string") return false;
  return true;
}

type IntegrationWithIconResponse = {
  integrations: IntegrationWithIconRecord[];
  error_log: YamlError[];
};

export function isIntegrationWithIconResponse(
  json: unknown,
): json is IntegrationWithIconResponse {
  if (!json) return false;
  if (typeof json !== "object") return false;
  if (!("integrations" in json)) return false;
  if (!Array.isArray(json.integrations)) return false;
  if (!json.integrations.every(isInterIntegrationWithIconRecord)) return false;
  if (!("error_log" in json)) return false;
  if (!Array.isArray(json.error_log)) return false;
  if (!json.error_log.every(isYamlError)) return false;
  return true;
}

// pub struct IntegrationWithIconRecord {
//   pub project_path: String,
//   pub integr_name: String,
//   pub integr_config_path: String,
//   pub integr_config_exists: bool,
//   pub on_your_laptop: bool,
//   pub when_isolated: bool,
//   // pub unparsed:
// }

// function isIntegrations(json: unknown): json is Integration[] {
//   if (!Array.isArray(json)) return false;
//   return json.every(isIntegration);
// }
// export function isIntegration(json: unknown): json is Integration {
//   if (!json) return false;
//   if (typeof json !== "object") return false;
//   if (!("name" in json)) return false;
//   if (typeof json.name !== "string") return false;
//   if (!("enabled" in json)) return false;
//   if (!("schema" in json)) return false;
//   if (!("value" in json)) return false;
//   return true;
// }
