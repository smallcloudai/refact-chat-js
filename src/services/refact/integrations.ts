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
          console.log(`[DEBUG]: error: `, response.error);
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
      async queryFn(_arg, api, extraOptions, baseQuery) {
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

type IntegrationSchemaType =
  | "string"
  | "number"
  | "integer"
  | "boolean"
  | "object"
  | "array"
  | "null";

export type IntegrationSchema = {
  $schema: string;
  title: string;
  type: IntegrationSchemaType | IntegrationSchemaType[];
  required?: string[];
  properties: Record<
    string,
    {
      description: string;
      type: IntegrationSchemaType | IntegrationSchemaType[];
      items?: {
        type: IntegrationSchemaType | IntegrationSchemaType[];
        format?: string;
        minimum?: number;
      };
      format?: string;
      minimum?: number;
    }
  >;
};

export type Integration = {
  name: string;
  enabled: boolean;
  schema: IntegrationSchema;
  value: Record<string, unknown>;
};

export type ValidatedIntegration = {
  warning?: string;
} & Integration;

function isIntegrations(json: unknown): json is Integration[] {
  if (!Array.isArray(json)) return false;
  return json.every(isIntegration);
}
export function isIntegration(json: unknown): json is Integration {
  if (!json || typeof json !== "object") return false;

  const obj = json as Record<string, unknown>;

  if (typeof obj.name !== "string") return false;
  if (typeof obj.enabled !== "boolean") return false;
  if (!isIntegrationSchema(obj.schema)) return false;
  if (typeof obj.value !== "object" || obj.value === null) return false;

  return true;
}

function isIntegrationSchema(schema: unknown): schema is IntegrationSchema {
  if (!schema || typeof schema !== "object") return false;

  const schemaObj = schema as Record<string, unknown>;

  if (typeof schemaObj.$schema !== "string") return false;
  if (typeof schemaObj.title !== "string") return false;
  if (!isValidTypeOrArrayOfTypes(schemaObj.type)) return false;
  if (schemaObj.required && !Array.isArray(schemaObj.required)) return false;
  if (typeof schemaObj.properties !== "object" || schemaObj.properties === null)
    return false;

  const properties = schemaObj.properties as Record<string, unknown>;

  for (const key in properties) {
    const property = properties[key] as Record<string, unknown>;
    if (typeof property.description !== "string") return false;
    if (!isValidTypeOrArrayOfTypes(property.type)) return false;
    if (property.items && !isItemsSchema(property.items)) return false;
    if (property.format && typeof property.format !== "string") return false;
    if (property.minimum && typeof property.minimum !== "number") return false;
  }

  return true;
}

function isValidTypeOrArrayOfTypes(
  type: unknown,
): type is IntegrationSchemaType | IntegrationSchemaType[] {
  if (typeof type === "string") {
    return isValidType(type);
  } else if (Array.isArray(type)) {
    return type.every(isValidType);
  }
  return false;
}

function isValidType(type: unknown): type is IntegrationSchemaType {
  return (
    type === "string" ||
    type === "number" ||
    type === "integer" ||
    type === "boolean" ||
    type === "object" ||
    type === "array" ||
    type === "null"
  );
}

function isItemsSchema(items: unknown): items is {
  type: IntegrationSchemaType | IntegrationSchemaType[];
  format?: string;
  minimum?: number;
} {
  if (!items || typeof items !== "object") return false;

  const itemsObj = items as Record<string, unknown>;

  if (!isValidTypeOrArrayOfTypes(itemsObj.type)) return false;
  if (itemsObj.format && typeof itemsObj.format !== "string") return false;
  if (itemsObj.minimum && typeof itemsObj.minimum !== "number") return false;

  return true;
}
