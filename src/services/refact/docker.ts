import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { RootState } from "../../app/store";

const DOCKER_CONTAINER_LIST = "/v1/docker-container-list";
const DOCKER_CONTAINER_ACTION = "/v1/docker-container-action";

export const dockerApi = createApi({
  reducerPath: "dockerApi",
  tagTypes: ["DOCKER"],
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
    getAllDockerContainers: builder.query<DockerContainersResponse, undefined>({
      providesTags: ["DOCKER"],
      async queryFn(_arg, api, extraOptions, baseQuery) {
        const state = api.getState() as RootState;
        const port = state.config.lspPort as unknown as number;
        const url = `http://127.0.0.1:${port}${DOCKER_CONTAINER_LIST}`;
        const response = await baseQuery({
          url,
          // LSP cannot handle regular GET request :/
          method: "POST",
          body: {},
          ...extraOptions,
        });

        if (response.error) {
          return { error: response.error };
        }

        if (!isDockerContainersResponse(response.data)) {
          return {
            error: {
              status: "CUSTOM_ERROR",
              error: "Failed to parse docker containers response",
              data: response.data,
            },
          };
        }
        return { data: response.data };
      },
    }),
    getDockerContainersByLabel: builder.query<DockerContainersResponse, string>(
      {
        providesTags: ["DOCKER"],
        async queryFn(label, api, extraOptions, baseQuery) {
          const state = api.getState() as RootState;
          const port = state.config.lspPort as unknown as number;
          const url = `http://127.0.0.1:${port}${DOCKER_CONTAINER_LIST}`;
          const response = await baseQuery({
            url,
            method: "POST",
            body: {
              label,
            },
            ...extraOptions,
          });

          if (response.error) {
            return { error: response.error };
          }

          if (!isDockerContainersResponse(response.data)) {
            return {
              error: {
                status: "CUSTOM_ERROR",
                error: "Failed to parse docker containers by labels response",
                data: response.data,
              },
            };
          }
          return { data: response.data };
        },
      },
    ),
    getDockerContainersByImage: builder.query<DockerContainersResponse, string>(
      {
        providesTags: ["DOCKER"],
        async queryFn(image, api, extraOptions, baseQuery) {
          const state = api.getState() as RootState;
          const port = state.config.lspPort as unknown as number;
          const url = `http://127.0.0.1:${port}${DOCKER_CONTAINER_LIST}`;
          const response = await baseQuery({
            url,
            method: "POST",
            body: {
              image,
            },
            ...extraOptions,
          });

          if (response.error) {
            return { error: response.error };
          }

          if (!isDockerContainersResponse(response.data)) {
            return {
              error: {
                status: "CUSTOM_ERROR",
                error: "Failed to parse docker containers by images response",
                data: response.data,
              },
            };
          }
          return { data: response.data };
        },
      },
    ),
    getDockerContainersByImageAndLabel: builder.query<
      DockerContainersResponse,
      DockerRequestBody
    >({
      providesTags: ["DOCKER"],
      async queryFn(args, api, extraOptions, baseQuery) {
        const state = api.getState() as RootState;
        const port = state.config.lspPort as unknown as number;
        const url = `http://127.0.0.1:${port}${DOCKER_CONTAINER_LIST}`;
        const response = await baseQuery({
          url,
          method: "POST",
          body: {
            image: args.image,
            label: args.label,
          },
          ...extraOptions,
        });

        if (response.error) {
          return { error: response.error };
        }

        if (!isDockerContainersResponse(response.data)) {
          return {
            error: {
              status: "CUSTOM_ERROR",
              error: "Failed to parse docker containers by images response",
              data: response.data,
            },
          };
        }
        return { data: response.data };
      },
    }),
    executeActionForDockerContainer: builder.mutation<
      DockerActionResponse,
      DockerActionPayload
    >({
      async queryFn(args, api, extraOptions, baseQuery) {
        const state = api.getState() as RootState;
        const port = state.config.lspPort as unknown as number;
        const url = `http://127.0.0.1:${port}${DOCKER_CONTAINER_ACTION}`;
        const response = await baseQuery({
          url,
          method: "POST",
          body: {
            action: args.action,
            container: args.container,
          },
          ...extraOptions,
        });

        if (response.error) {
          return { error: response.error };
        }

        if (!isDockerActionResponse(response.data)) {
          return {
            error: {
              status: "CUSTOM_ERROR",
              error: `Failed to execute ${args.action} for docker container with ${args.container} name/id!`,
              data: response.data,
            },
          };
        }
        return { data: response.data };
      },
    }),
  }),
});

type DockerActionResponse = {
  success: boolean;
  output: string;
};

/**
 * Represents the payload for a Docker action endpoints.
 * @param action Docker action for a specific operation (start, stop, kill, remove)
 * @param container This can be either the container name or the container ID.
 */
export type DockerActionPayload = {
  action: "start" | "stop" | "kill" | "remove";
  container: string;
};

function isDockerActionResponse(json: unknown): json is DockerActionResponse {
  if (!json) return false;
  if (typeof json !== "object") return false;
  if (!("success" in json)) return false;
  if (typeof json.success !== "boolean") return false;
  if (!("output" in json)) return false;
  if (typeof json.output !== "string") return false;
  return true;
}

type DockerRequestBody = {
  label?: string;
  image?: string;
};

export type DockerContainer = {
  id: string;
  status: string;
  created: string;
  user: string;
  env: string[];
  command: string[];
  image: string;
  working_dir: string;
  labels: DockerLabels;
  ports: DockerPorts;
};

type DockerLabels = {
  "com.docker.compose.config-hash": string;
  "com.docker.compose.container-number": string;
  "com.docker.compose.depends_on": string;
  "com.docker.compose.image": string;
  "com.docker.compose.oneoff": string;
  "com.docker.compose.project": string;
  "com.docker.compose.project.config_files": string;
  "com.docker.compose.project.working_dir": string;
  "com.docker.compose.replace"?: string;
  "com.docker.compose.service": string;
  "com.docker.compose.version": string;
  "org.opencontainers.image.authors"?: string;
  "org.opencontainers.image.description"?: string;
  "org.opencontainers.image.documentation"?: string;
  "org.opencontainers.image.licenses"?: string;
  "org.opencontainers.image.source"?: string;
  "org.opencontainers.image.title"?: string;
  "org.opencontainers.image.url"?: string;
  "org.opencontainers.image.vendor"?: string;
  "org.opencontainers.image.version"?: string;
};

// TODO: make types for ports
type DockerPorts = NonNullable<unknown>;

// TODO: make type guards better
type DockerContainersResponse = {
  containers: DockerContainer[];
};

function isDockerContainersResponse(
  json: unknown,
): json is DockerContainersResponse {
  if (
    !json ||
    typeof json !== "object" ||
    !Array.isArray((json as DockerContainersResponse).containers)
  ) {
    return false;
  }
  const containers = (json as DockerContainersResponse).containers;
  return containers.every(isDockerContainer);
}

function isDockerContainer(json: unknown): json is DockerContainer {
  if (!json || typeof json !== "object") return false;

  const container = json as DockerContainer;

  if (typeof container.id !== "string") return false;
  if (typeof container.status !== "string") return false;
  if (typeof container.created !== "string") return false;
  if (typeof container.user !== "string") return false;
  if (
    !Array.isArray(container.env) ||
    !container.env.every((e) => typeof e === "string")
  )
    return false;

  if (
    !Array.isArray(container.command) ||
    !container.command.every((c) => typeof c === "string")
  )
    return false;

  if (typeof container.image !== "string") return false;
  if (typeof container.working_dir !== "string") return false;
  if (!isDockerLabels(container.labels)) return false;
  if (!isDockerPorts(container.ports)) return false;
  return true;
}

function isDockerLabels(json: unknown): json is DockerLabels {
  if (!json || typeof json !== "object") return false;

  const labels = json as DockerLabels;

  if (typeof labels["com.docker.compose.config-hash"] !== "string")
    return false;
  if (typeof labels["com.docker.compose.container-number"] !== "string")
    return false;
  if (typeof labels["com.docker.compose.depends_on"] !== "string") return false;
  if (typeof labels["com.docker.compose.image"] !== "string") return false;
  if (typeof labels["com.docker.compose.oneoff"] !== "string") return false;
  if (typeof labels["com.docker.compose.project"] !== "string") return false;
  if (typeof labels["com.docker.compose.project.config_files"] !== "string")
    return false;
  if (typeof labels["com.docker.compose.project.working_dir"] !== "string")
    return false;
  if (
    labels["com.docker.compose.replace"] &&
    typeof labels["com.docker.compose.replace"] !== "string"
  )
    return false;
  if (typeof labels["com.docker.compose.service"] !== "string") return false;
  if (typeof labels["com.docker.compose.version"] !== "string") return false;
  if (
    labels["org.opencontainers.image.authors"] &&
    typeof labels["org.opencontainers.image.authors"] !== "string"
  )
    return false;
  if (
    labels["org.opencontainers.image.description"] &&
    typeof labels["org.opencontainers.image.description"] !== "string"
  )
    return false;
  if (
    labels["org.opencontainers.image.documentation"] &&
    typeof labels["org.opencontainers.image.documentation"] !== "string"
  )
    return false;
  if (
    labels["org.opencontainers.image.licenses"] &&
    typeof labels["org.opencontainers.image.licenses"] !== "string"
  )
    return false;
  if (
    labels["org.opencontainers.image.source"] &&
    typeof labels["org.opencontainers.image.source"] !== "string"
  )
    return false;
  if (
    labels["org.opencontainers.image.title"] &&
    typeof labels["org.opencontainers.image.title"] !== "string"
  )
    return false;
  if (
    labels["org.opencontainers.image.url"] &&
    typeof labels["org.opencontainers.image.url"] !== "string"
  )
    return false;
  if (
    labels["org.opencontainers.image.vendor"] &&
    typeof labels["org.opencontainers.image.vendor"] !== "string"
  )
    return false;
  if (
    labels["org.opencontainers.image.version"] &&
    typeof labels["org.opencontainers.image.version"] !== "string"
  )
    return false;

  return true;
}

function isDockerPorts(json: unknown): json is DockerPorts {
  // Since DockerPorts is defined as NonNullable<unknown>, we don't have specific structure to validate. Just checking, that it's not null | undefined
  return json !== null && json !== undefined;
}
