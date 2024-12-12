import React from "react";
import type { Meta, StoryObj } from "@storybook/react";
import { setUpStore } from "../../app/store";
import { Provider } from "react-redux";
import { Theme } from "../Theme";
import { AgentUsage } from "./AgentUsage";
import { nonProUser } from "../../__fixtures__/msw";

const items = Array.from({ length: 100 }).map(() => ({
  user: "party@refact.ai",
  time: Date.now(),
}));

const Template: React.FC = () => {
  const store = setUpStore({
    tour: {
      type: "finished",
    },
    agentUsage: {
      items,
    },
    config: {
      apiKey: "foo",
      addressURL: "Refact",
      host: "web",
      lspPort: 8001,
      themeProps: {
        appearance: "dark",
      },
    },
  });

  return (
    <Provider store={store}>
      <Theme>
        <AgentUsage />
      </Theme>
    </Provider>
  );
};

const meta = {
  title: "Agent Usage",
  component: Template,
} satisfies Meta<typeof Template>;

export default meta;

type Story = StoryObj<typeof Template>;

export const Primary: Story = {
  parameters: {
    msw: {
      handlers: [nonProUser],
    },
  },
};
