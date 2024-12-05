import type { Meta, StoryObj } from "@storybook/react";
import {IntegrationForm, IntegrationFormProps} from "./IntegrationForm"

const props:IntegrationFormProps = {
  integrationPath: "/Users/nikolai.frolov/.config/refact/integrations.d/postgres.yaml",
  availabilityValues:  {
    "on_your_laptop": false,
    "when_isolated": false
  },
  setAvailabilityValues: () => {},
  getIntegrationFormSchema: (path:string) => {
    const result = {
      "integration": {
    "data": {
        "project_path": "",
        "integr_name": "postgres",
        "integr_config_path": path,
        "integr_schema": {
            "fields": {
                "host": {
                    "f_type": "string_long",
                    "f_desc": "Connect to this host, for example 127.0.0.1 or docker container name.",
                    "f_placeholder": "marketing_db_container_from_stories"
                },
                "port": {
                    "f_type": "string_short",
                    "f_desc": "Which port to use.",
                    "f_default": "5432"
                },
                "user": {
                    "f_type": "string_short",
                    "f_placeholder": "john_doe"
                },
                "password": {
                    "f_type": "string_short",
                    "f_default": "$POSTGRES_PASSWORD",
                    "smartlinks": [
                        {
                            "sl_label": "Open passwords.yaml",
                            "sl_goto": "EDITOR:passwords.yaml"
                        }
                    ]
                },
                "database": {
                    "f_type": "string_short",
                    "f_placeholder": "marketing_db"
                },
                "psql_binary_path": {
                    "f_type": "string_long",
                    "f_desc": "If it can't find a path to `psql` you can provide it here, leave blank if not sure.",
                    "f_placeholder": "psql",
                    "f_label": "PSQL Binary Path",
                    "f_extra": true
                }
            },
            "description": "The Postgres tool is for the AI model to call, when it wants to look at data inside your database, or make any changes.\nOn this page you can also see Docker containers with Postgres servers.\nYou can ask model to create a new container with a new database for you,\nor ask model to configure the tool to use an existing container with existing database.\n",
            "available": {
                "on_your_laptop_possible": true,
                "when_isolated_possible": true
            },
            "smartlinks": [
                {
                    "sl_label": "Test",
                    "sl_chat": [
                        {
                            "role": "user",
                            "content": "🔧 The postgres tool should be visible now. To test the tool, list the tables available, briefly desctibe the tables and express\nsatisfaction and relief if it works, and change nothing. If it doesn't work or the tool isn't available, go through the usual plan in the system prompt.\nThe current config file is %CURRENT_CONFIG%.\n"
                        }
                    ]
                }
            ],
            "docker": {
                "filter_label": "",
                "filter_image": "postgres",
                "new_container_default": {
                    "image": "postgres:13",
                    "environment": {
                        "POSTGRES_DB": "marketing_db",
                        "POSTGRES_USER": "john_doe",
                        "POSTGRES_PASSWORD": "$POSTGRES_PASSWORD"
                    }
                },
                "smartlinks": [
                    {
                        "sl_label": "Add Database Container",
                        "sl_chat": [
                            {
                                "role": "user",
                                "content": "🔧 Your job is to create a postgres container, using the image and environment from new_container_default section in the current config file: %CURRENT_CONFIG%. Follow the system prompt.\n"
                            }
                        ]
                    }
                ],
                "smartlinks_for_each_container": [
                    {
                        "sl_label": "Use for integration",
                        "sl_chat": [
                            {
                                "role": "user",
                                "content": "🔧 Your job is to modify postgres connection config in the current file to match the variables from the container, use docker tool to inspect the container if needed. Current config file: %CURRENT_CONFIG%.\n"
                            }
                        ]
                    }
                ]
            }
        },
        "integr_values": {
            "psql_binary_path": "",
            "host": "",
            "port": "",
            "user": "",
            "password": "",
            "database": "",
            "available": {
                "on_your_laptop": false,
                "when_isolated": false
            }
        },
        "error_log": []
    }
  }}
  return result
  }
};

const meta = {
  title: "Integrations/IntegrationsForm",
  component: IntegrationForm,
  args: {...props},
} satisfies Meta<typeof IntegrationForm>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Primary: Story = {};

//export const isApplying: Story = {isApplying: true};
