import type { Meta, StoryObj } from "@storybook/react";
import { IntegrationForm, IntegrationFormProps } from "./IntegrationForm";
import { Container } from "@radix-ui/themes";
import { fn } from "@storybook/test";
import { Provider } from "react-redux";
import { setUpStore } from "../../../app/store";
import { Theme } from "../../Theme";
import { AbortControllerProvider } from "../../../contexts/AbortControllers";
import { http, HttpResponse, type HttpHandler } from "msw";
import React from "react";
import {
  INTEGRATION_GET_RESPONSE,
  INTEGRATIONS_RESPONSE,
} from "../../../__fixtures__";

const Template: React.FC<IntegrationFormProps> = (props) => {
  const store = setUpStore({
    integrations: {
      cachedForms: {
        [INTEGRATION_GET_RESPONSE.integr_config_path]:
          INTEGRATIONS_RESPONSE.integr_values,
      },
    },
  });
  return (
    <Provider store={store}>
      <Theme>
        <AbortControllerProvider>
          <Container p="8">
            <IntegrationForm {...props} />
          </Container>
        </AbortControllerProvider>
      </Theme>
    </Provider>
  );
};

const meta: Meta<typeof IntegrationForm> = {
  title: "Integrations/IntegrationForm",
  component: Template,
  args: {
    integrationPath: "/path/to/integration",
    isApplying: false,
    isDisabled: false,
    availabilityValues: {},
    // onCancel: fn(),
    handleSubmit: fn(),
    handleChange: fn(),
    onSchema: fn(),
    onValues: fn(),
    setAvailabilityValues: fn(),
  },
  parameters: {
    msw: {
      handlers: [
        http.get("http://127.0.0.1:8001/v1/ping", () => {
          return HttpResponse.text("pong");
        }),

        http.post("http://127.0.0.1:8001/v1/integration-get", () => {
          return HttpResponse.json(INTEGRATION_GET_RESPONSE);
        }),
        // http.get("https://www.smallcloud.ai/v1/login", () => {
        //   return HttpResponse.json({
        //     retcode: "OK",
        //     account: "party@refact.ai",
        //     inference_url: "https://www.smallcloud.ai/v1",
        //     inference: "PRO",
        //     metering_balance: -100000,
        //     questionnaire: false,
        //   });
        // }),
      ],
    },
  },
} satisfies Meta<
  typeof IntegrationForm & { parameters: { msw: { handlers: HttpHandler[] } } }
>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Primary: Story = {
  args: {},
};
