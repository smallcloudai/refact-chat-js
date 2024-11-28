import { Integration } from "../services/refact/integrations";

export const INTEGRATION_GET_RESPONSE: Integration = {
  project_path: "",
  integr_name: "postgres",
  integr_config_path: "/Users/marc/.config/refact/integrations.d/postgres.yaml",
  integr_schema: {
    fields: {
      host: {
        f_type: "string_long",
        f_desc:
          "Connect to this host, for example 127.0.0.1 or docker container name.",
        f_placeholder: "marketing_db_container",
      },
      port: {
        f_type: "string_short",
        f_desc: "Which port to use.",
        f_default: "5432",
      },
      user: {
        f_type: "string_short",
        f_placeholder: "john_doe",
      },
      password: {
        f_type: "string_short",
        f_default: "$POSTGRES_PASSWORD",
        smartlinks: [
          {
            sl_label: "Open passwords.yaml",
            sl_goto: "EDITOR:passwords.yaml",
          },
        ],
      },
      database: {
        f_type: "string_short",
        f_placeholder: "marketing_db",
      },
      psql_binary_path: {
        f_type: "string_long",
        f_desc:
          "If it can't find a path to `psql` you can provide it here, leave blank if not sure.",
        f_placeholder: "psql",
      },
    },
    available: {
      on_your_laptop_possible: true,
      when_isolated_possible: true,
    },
    smartlinks: [
      {
        sl_label: "Test",
        sl_chat: [
          {
            role: "user",
            content:
              "🔧 The postgres tool should be visible now. To test the tool, list the tables available, briefly desctibe the tables and express\nsatisfaction and relief if it works, and change nothing. If it doesn't work or the tool isn't available, go through the usual plan in the system prompt.\nThe current config file is %CURRENT_CONFIG%.\n",
          },
        ],
      },
    ],
    docker: {
      new_container_default: {
        image: "postgres:13",
        environment: {
          POSTGRES_DB: "marketing_db",
          POSTGRES_USER: "john_doe",
          POSTGRES_PASSWORD: "$POSTGRES_PASSWORD",
        },
      },
      smartlinks: [
        {
          sl_label: "Add Database Container",
          sl_chat: [
            {
              role: "user",
              content:
                '🔧 Your job is to create a new section under "docker" that will define a new postgres container, inside the current config file %CURRENT_CONFIG%. Follow the system prompt.\n',
            },
          ],
        },
      ],
    },
  },
  integr_values: {
    psql_binary_path: "/usr/bin/psql",
    host: "localhost",
    port: "5432",
    user: "postgres",
    password: "$POSTGRES_PASSWORD",
    database: "test_db",
    available: {
      on_your_laptop: true,
      when_isolated: false,
    },
  },
  error_log: [],
};
