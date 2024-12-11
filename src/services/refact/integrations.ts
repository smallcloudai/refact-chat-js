import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { RootState } from "../../app/store";
import { isLspChatMessage, LspChatMessage } from "./chat";
import {
  INTEGRATION_GET_URL,
  INTEGRATION_SAVE_URL,
  INTEGRATIONS_URL,
} from "./consts";
import { debugIntegrations } from "../../debugConfig";

// TODO: Cache invalidation logic.
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
        const url = `http://127.0.0.1:${port}${INTEGRATION_GET_URL}`;
        const response = await baseQuery({
          url,
          method: "POST",
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

    saveIntegration: builder.mutation<
      unknown,
      { filePath: string; values: Integration["integr_values"] }
    >({
      invalidatesTags: (_result, _error, args) => [
        { type: "INTEGRATION", id: args.filePath },
      ],
      async queryFn(arg, api, extraOptions, baseQuery) {
        const state = api.getState() as RootState;
        const port = state.config.lspPort;
        const url = `http://127.0.0.1:${port}${INTEGRATION_SAVE_URL}`;
        const response = await baseQuery({
          ...extraOptions,
          url,
          method: "POST",
          body: {
            integr_config_path: arg.filePath,
            integr_values: arg.values,
          },
        });

        return response;
      },
    }),
  }),
});

export type IntegrationPrimitive = string | number | boolean | null;
export function isPrimitive(json: unknown): json is IntegrationPrimitive {
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
  integr_values: Record<
    string,
    IntegrationPrimitive | Record<string, boolean> | Record<string, unknown>
  >;
  error_log: null | YamlError[];
};

function isIntegration(json: unknown): json is Integration {
  if (!json) {
    return false;
  }
  if (typeof json !== "object") {
    return false;
  }

  if (!("project_path" in json)) {
    return false;
  }
  if (typeof json.project_path !== "string") {
    return false;
  }

  if (!("integr_name" in json)) {
    return false;
  }
  if (typeof json.integr_name !== "string") {
    return false;
  }

  if (!("integr_config_path" in json)) {
    return false;
  }
  if (typeof json.integr_config_path !== "string") {
    return false;
  }

  if (!("integr_schema" in json)) {
    return false;
  }
  if (!isIntegrationSchema(json.integr_schema)) {
    return false;
  }

  if (!("integr_values" in json)) {
    return false;
  }
  if (!json.integr_values) {
    return false;
  }
  if (!(typeof json.integr_values === "object")) {
    return false;
  }
  const integrValues = json.integr_values as Record<string, unknown>;
  debugIntegrations("integrValues:", integrValues); // Log the integrValues

  function isValidNestedObject(value: unknown): boolean {
    if (isPrimitive(value)) {
      return true;
    }
    if (typeof value === "object" && value !== null) {
      return Object.values(value).every(isValidNestedObject);
    }
    return false;
  }

  if (!Object.values(integrValues).every(isValidNestedObject)) {
    debugIntegrations(`[DEBUG]: integr_values are not valid json`);
    return false;
  }

  if (!("error_log" in json)) {
    return false;
  }
  if (!json.error_log) {
    return false;
  }
  if (!(typeof json.error_log === "object")) {
    return false;
  }
  if (!Array.isArray(json.error_log)) {
    return false;
  }
  if (!json.error_log.every(isYamlError)) {
    return false;
  }

  return true;
}

type DockerFilter = {
  filter_label: string;
  filter_image: string;
};

type SchemaDockerContainer = {
  image: string;
  environment: DockerEnvironment;
};

export type SchemaDocker = DockerFilter & {
  new_container_default: SchemaDockerContainer;
  smartlinks: SmartLink[];
  smartlinks_for_each_container?: SmartLink[];
};

type DockerEnvironment = Record<string, IntegrationPrimitive>;

type IntegrationSchema = {
  description?: string;
  fields: Record<string, IntegrationField<NonNullable<IntegrationPrimitive>>>;
  available: Record<string, boolean>;
  smartlinks?: SmartLink[];
  docker?: SchemaDocker;
};

function isDockerFilter(json: unknown): json is DockerFilter {
  if (!json) {
    return false;
  }
  if (typeof json !== "object") {
    return false;
  }
  if (!("filter_label" in json)) {
    return false;
  }
  if (typeof json.filter_label !== "string") {
    return false;
  }
  if (!("filter_image" in json)) {
    return false;
  }
  if (typeof json.filter_image !== "string") {
    return false;
  }
  return true;
}

function isSchemaDockerContainer(json: unknown): json is SchemaDockerContainer {
  if (!json) {
    return false;
  }
  if (typeof json !== "object") {
    return false;
  }
  if (!("image" in json)) {
    return false;
  }
  if (typeof json.image !== "string") {
    return false;
  }
  if (!("environment" in json)) {
    return false;
  }
  if (!json.environment) {
    return false;
  }
  if (!(typeof json.environment === "object")) {
    return false;
  }
  if (!Object.values(json.environment).every(isPrimitive)) {
    return false;
  }
  return true;
}

function isIntegrationSchema(json: unknown): json is IntegrationSchema {
  debugIntegrations("isIntegrationSchema called with:", json);

  if (!json) {
    debugIntegrations("isIntegrationSchema: json is falsy");
    return false;
  }
  if (typeof json !== "object") {
    debugIntegrations("isIntegrationSchema: json is not an object");
    return false;
  }

  if ("description" in json && typeof json.description !== "string") {
    debugIntegrations("isIntegrationSchema: description is not a string");
    return false;
  }

  if (!("fields" in json)) {
    debugIntegrations("isIntegrationSchema: fields is missing");
    return false;
  }
  if (!json.fields) {
    debugIntegrations("isIntegrationSchema: fields is falsy");
    return false;
  }
  if (!(typeof json.fields === "object")) {
    debugIntegrations("isIntegrationSchema: fields is not an object");
    return false;
  }
  if (!Object.values(json.fields).every(isIntegrationField)) {
    debugIntegrations("isIntegrationSchema: fields contains invalid values");
    return false;
  }
  if (!("available" in json)) {
    debugIntegrations("isIntegrationSchema: available is missing");
    return false;
  }
  if (!json.available) {
    debugIntegrations("isIntegrationSchema: available is falsy");
    return false;
  }
  if (!(typeof json.available === "object")) {
    debugIntegrations("isIntegrationSchema: available is not an object");
    return false;
  }
  if (!Object.values(json.available).every((d) => typeof d === "boolean")) {
    debugIntegrations("isIntegrationSchema: available contains invalid values");
    return false;
  }
  if ("smartlinks" in json) {
    if (!json.smartlinks) {
      debugIntegrations("isIntegrationSchema: smartlinks is falsy");
      return false;
    }
    if (!Array.isArray(json.smartlinks)) {
      debugIntegrations("isIntegrationSchema: smartlinks is not an array");
      return false;
    }
    if (!json.smartlinks.every(isSmartLink)) {
      debugIntegrations(
        "isIntegrationSchema: smartlinks contains invalid values",
      );
      return false;
    }
  }
  if ("docker" in json) {
    if (!json.docker) {
      debugIntegrations("isIntegrationSchema: docker is falsy");
      return false;
    }
    if (!(typeof json.docker === "object")) {
      debugIntegrations("isIntegrationSchema: docker is not an object");
      return false;
    }
    if (!isDockerFilter(json.docker)) {
      debugIntegrations("isIntegrationSchema: docker is invalid");
      return false;
    }
    if (!("new_container_default" in json.docker)) {
      debugIntegrations(
        "isIntegrationSchema: new_container_default is missing",
      );
      return false;
    }
    if (!isSchemaDockerContainer(json.docker.new_container_default)) {
      debugIntegrations(
        "isIntegrationSchema: new_container_default is invalid",
      );
      return false;
    }
    if (!("smartlinks" in json.docker)) {
      debugIntegrations("isIntegrationSchema: docker.smartlinks is missing");
      return false;
    }
    if (!Array.isArray(json.docker.smartlinks)) {
      debugIntegrations(
        "isIntegrationSchema: docker.smartlinks is not an array",
      );
      return false;
    }
    if (!json.docker.smartlinks.every(isSmartLink)) {
      debugIntegrations(
        "isIntegrationSchema: docker.smartlinks contains invalid values",
      );
      return false;
    }

    if ("smartlinks_for_each_container" in json.docker) {
      if (!Array.isArray(json.docker.smartlinks_for_each_container)) {
        debugIntegrations(
          "isIntegrationSchema: docker.smartlinks_for_each_container is not an array",
        );
        return false;
      }

      if (!json.docker.smartlinks_for_each_container.every(isSmartLink)) {
        debugIntegrations(
          "isIntegrationSchema: docker.smartlinks_for_each_container contains invalid values",
        );
        return false;
      }
    }
  }
  debugIntegrations("isIntegrationSchema: json is a valid IntegrationSchema");
  return true;
}

export type IntegrationField<T extends IntegrationPrimitive> = {
  f_type: T;
  f_desc?: string;
  f_placeholder?: T; // should match f_type
  f_default?: T;
  f_label?: string;
  f_extra?: boolean; // rather the field is hidden by default or not
  smartlinks?: SmartLink[];
};

// TODO: check generic type?
function isIntegrationField<T extends IntegrationPrimitive>(
  json: unknown,
): json is IntegrationField<T> {
  if (!json) {
    return false;
  }
  if (typeof json !== "object") {
    return false;
  }
  if (!("f_type" in json)) {
    return false;
  }
  if (!isPrimitive(json.f_type)) {
    return false;
  }
  if ("f_desc" in json && typeof json.f_desc !== "string") {
    return false;
  }
  if ("f_label" in json && typeof json.f_label !== "string") {
    return false;
  }

  if ("f_extra" in json && typeof json.f_extra !== "boolean") {
    return false;
  }
  if ("f_placeholder" in json && !isPrimitive(json.f_placeholder)) {
    return false;
  }
  if ("f_default" in json && !isPrimitive(json.f_default)) {
    return false;
  }
  if ("smartlinks" in json && !Array.isArray(json.smartlinks)) {
    return false;
  }
  return true;
}

export type SmartLink = {
  sl_label: string;
  sl_chat?: LspChatMessage[];
  sl_goto?: string;
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

export type IntegrationWithIconRecord = {
  project_path: string;
  integr_name: string;
  integr_config_path: string;
  integr_config_exists: boolean;
  on_your_laptop: boolean;
  when_isolated: boolean;
  // unparsed: unknown;
};

export type NotConfiguredIntegrationWithIconRecord = {
  project_path: string[];
  integr_name: string;
  integr_config_path: string[];
  integr_config_exists: false;
  on_your_laptop: boolean;
  when_isolated: boolean;
  // unparsed: unknown;
};

export type GroupedIntegrationWithIconRecord = {
  project_path: string[];
  integr_name: string;
  integr_config_path: string[];
  integr_config_exists: boolean;
  on_your_laptop: boolean;
  when_isolated: boolean;
  // unparsed: unknown;
};

export function areIntegrationsNotConfigured(
  json: GroupedIntegrationWithIconRecord,
): json is NotConfiguredIntegrationWithIconRecord {
  return !json.integr_config_exists;
}

export function isNotConfiguredIntegrationWithIconRecord(
  json: unknown,
): json is NotConfiguredIntegrationWithIconRecord {
  if (!json) return false;
  if (typeof json !== "object") return false;
  if (!("project_path" in json)) return false;
  if (!Array.isArray(json.project_path)) return false;
  if (!json.project_path.every((item) => typeof item === "string"))
    return false;
  if (!("integr_name" in json)) return false;
  if (typeof json.integr_name !== "string") return false;
  if (!("integr_config_path" in json)) return false;
  if (!Array.isArray(json.integr_config_path)) return false;
  if (!json.integr_config_path.every((item) => typeof item === "string"))
    return false;
  if (!("integr_config_exists" in json)) return false;
  if (json.integr_config_exists !== false) return false;
  if (!("on_your_laptop" in json)) return false;
  if (typeof json.on_your_laptop !== "boolean") return false;
  if (!("when_isolated" in json)) return false;
  if (typeof json.when_isolated !== "boolean") return false;
  return true;
}

function isInterIntegrationWithIconRecord(
  json: unknown,
): json is IntegrationWithIconRecord {
  if (!json) return false;
  if (typeof json !== "object") return false;
  if (!("project_path" in json)) return false;
  if (typeof json.project_path !== "string") return false;
  if (!("integr_name" in json)) return false;
  if (typeof json.integr_name !== "string") return false;
  if (!("integr_config_path" in json)) return false;
  if (typeof json.integr_config_path !== "string") return false;
  if (!("integr_config_exists" in json)) return false;
  if (typeof json.integr_config_exists !== "boolean") return false;
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
  if (!json) {
    return false;
  }
  if (typeof json !== "object") {
    return false;
  }
  if (!("integr_config_path" in json)) {
    return false;
  }
  if (typeof json.integr_config_path !== "string") {
    return false;
  }
  if (!("error_line" in json)) {
    return false;
  }
  if (typeof json.error_line !== "number") {
    return false;
  }
  if (!("error_msg" in json)) {
    return false;
  }
  if (typeof json.error_msg !== "string") {
    return false;
  }
  return true;
}

export type IntegrationWithIconResponse = {
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
