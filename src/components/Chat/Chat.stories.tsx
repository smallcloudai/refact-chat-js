import React from "react";
import type { Meta, StoryObj } from "@storybook/react";
import { Chat } from "./Chat";
import { ChatThread } from "../../features/Chat/Thread/types";
import { setUpStore } from "../../app/store";
import { Provider } from "react-redux";
import { Theme } from "../Theme";
import { AbortControllerProvider } from "../../contexts/AbortControllers";
import { CHAT_CONFIG_THREAD } from "../../__fixtures__";

import {
  goodCaps,
  goodPing,
  goodPrompts,
  goodUser,
  chatLinks,
  noTools,
} from "../../__fixtures__/msw";
import { TourProvider } from "../../features/Tour";
import { Flex } from "@radix-ui/themes";

const Template: React.FC<{
  thread?: ChatThread;
}> = ({ thread }) => {
  const threadData = thread ?? {
    id: "test",
    model: "test",
    messages: [],
  };
  const store = setUpStore({
    tour: {
      type: "finished",
    },
    chat: {
      streaming: false,
      prevent_send: false,
      waiting_for_response: false,
      tool_use: "quick",
      send_immediately: false,
      error: null,
      cache: {},
      system_prompt: {},
      thread: threadData,
    },
  });

  return (
    <Provider store={store}>
      <Theme>
        <TourProvider>
          <AbortControllerProvider>
            <Flex direction="column" align="stretch" height="100dvh">
              <Chat
                unCalledTools={false}
                host="web"
                tabbed={false}
                backFromChat={() => ({})}
                caps={{
                  error: null,
                  fetching: false,
                  default_cap: "test-model",
                  available_caps: {},
                }}
                maybeSendToSidebar={() => ({})}
              />
            </Flex>
          </AbortControllerProvider>
        </TourProvider>
      </Theme>
    </Provider>
  );
};

const meta = {
  title: "Chat",
  component: Template,
  parameters: {
    msw: {
      handlers: [goodCaps, goodPing, goodPrompts, goodUser, chatLinks, noTools],
    },
  },
  argTypes: {},
} satisfies Meta<typeof Template>;

export default meta;

type Story = StoryObj<typeof Template>;

export const Primary: Story = {};

export const Configuration: Story = {
  args: {
    thread: CHAT_CONFIG_THREAD.thread,
  },

  //   parameters: {
  //     parameters: {
  //       msw: {
  //         handlers: [goodCaps, goodPing, goodPrompts, goodUser, chatLinks],
  //       },
  //     },
  //   },
};
