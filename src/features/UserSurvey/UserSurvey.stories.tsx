import type { Meta, StoryObj } from "@storybook/react";
import { UserSurvey } from "./UserSurvey";
import { Provider } from "react-redux";
import { setUpStore } from "../../app/store";
import { Theme } from "../../components/Theme";
import { http, HttpResponse } from "msw";

const Component = () => {
  const store = setUpStore({
    config: {
      apiKey: "test-key",
      host: "web",
      lspPort: 8001,
      addressURL: "Refact",
      themeProps: { appearance: "dark" },
    },
  });
  return (
    <Provider store={store}>
      <Theme>
        <UserSurvey />
      </Theme>
    </Provider>
  );
};

const meta = {
  title: "User Survey",
  component: Component,
  parameters: {
    msw: {
      handlers: [
        http.get("http://127.0.0.1:8001/v1/ping", () => {
          return HttpResponse.text("pong");
        }),
      ],
    },
  },
} satisfies Meta<typeof UserSurvey>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Primary: Story = {};
