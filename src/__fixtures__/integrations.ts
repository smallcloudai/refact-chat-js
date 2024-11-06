import type { Integration } from "../services/refact";

export const INTEGRATIONS_RESPONSE: Integration[] = [
  {
    name: "github",
    enabled: true,
    schema: {
      $schema: "http://json-schema.org/draft-07/schema#",
      title: "IntegrationGitHub",
      type: "object",
      required: ["GH_TOKEN"],
      properties: {
        GH_TOKEN: {
          description: "GitHub token for authentication.",
          type: "string",
        },
        gh_binary_path: {
          description: "Path to the GitHub CLI binary.",
          type: ["string", "null"],
        },
      },
    },
    value: {
      detail:
        "Problem constructing tool from /Users/valaises/.cache/refact/integrations.d/github.yaml: missing field `GH_TOKEN`",
    },
  },
  {
    name: "gitlab",
    enabled: false,
    schema: {
      $schema: "http://json-schema.org/draft-07/schema#",
      title: "IntegrationGitLab",
      type: "object",
      required: ["GITLAB_TOKEN"],
      properties: {
        GITLAB_TOKEN: {
          description: "GitLab token for authentication.",
          type: "string",
        },
        glab_binary_path: {
          description: "Path to the GitLab CLI binary.",
          type: ["string", "null"],
        },
      },
    },
    value: {
      detail:
        "Problem constructing tool from /Users/valaises/.cache/refact/integrations.d/gitlab.yaml: missing field `GITLAB_TOKEN`",
    },
  },
  {
    name: "pdb",
    enabled: true,
    schema: {
      $schema: "http://json-schema.org/draft-07/schema#",
      title: "IntegrationPdb",
      type: "object",
      properties: {
        python_path: {
          description: "Path to the Python binary.",
          type: ["string", "null"],
        },
      },
    },
    value: {
      python_path: null,
    },
  },
  {
    name: "postgres",
    enabled: false,
    schema: {
      $schema: "http://json-schema.org/draft-07/schema#",
      title: "IntegrationPostgres",
      type: "object",
      required: ["connection_string"],
      properties: {
        connection_string: {
          description: "Connection string for the PostgreSQL database.",
          type: "string",
        },
        psql_binary_path: {
          description: "Path to the psql binary.",
          type: ["string", "null"],
        },
      },
    },
    value: {
      detail:
        "Problem constructing tool from /Users/valaises/.cache/refact/integrations.d/postgres.yaml: missing field `connection_string`",
    },
  },
  {
    name: "chrome",
    enabled: true,
    schema: {
      $schema: "http://json-schema.org/draft-07/schema#",
      title: "IntegrationChrome",
      type: "object",
      properties: {
        chrome_path: {
          description:
            "Path to the Chrome binary or WebSocket URL for remote debugging.",
          type: ["string", "null"],
        },
        idle_browser_timeout: {
          description: "Idle timeout for the Chrome browser in seconds.",
          type: ["integer", "null"],
          format: "uint32",
          minimum: 0.0,
        },
        window_size: {
          description:
            "Window size for the Chrome browser in the format [width, height].",
          type: ["array", "null"],
          items: {
            type: "integer",
            format: "uint32",
            minimum: 0.0,
          },
        },
      },
    },
    value: {
      chrome_path:
        "/Users/valaises/temp/chrome/mac_arm-130.0.6723.69/chrome-mac-arm64/Google Chrome for Testing.app/Contents/MacOS/Google Chrome for Testing",
      window_size: [1024, 768],
      idle_browser_timeout: 600,
    },
  },
];
