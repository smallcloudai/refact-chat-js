import React from "react";
import type { Meta, StoryObj } from "@storybook/react";
import { ChatContent } from ".";
import { Provider } from "react-redux";
import { setUpStore } from "../../app/store";
import { Theme } from "../Theme";
import { AbortControllerProvider } from "../../contexts/AbortControllers";
import { MarkdownMessage } from "../../__fixtures__/markdown";
import { ChatMessages } from "../../events";
import {
  CHAT_FUNCTIONS_MESSAGES,
  CHAT_WITH_DIFF_ACTIONS,
  CHAT_WITH_DIFFS,
  FROG_CHAT,
  LARGE_DIFF,
} from "../../__fixtures__";

const MockedStore: React.FC<{
  children: React.ReactNode;
  messages?: ChatMessages;
}> = ({ children, messages = [] }) => {
  const store = setUpStore({
    chat: {
      streaming: false,
      prevent_send: false,
      waiting_for_response: false,
      tool_use: "quick",
      send_immediately: false,
      error: null,
      cache: {},
      system_prompt: {},
      thread: {
        id: "test",
        model: "test",
        messages,
      },
    },
  });
  return (
    <Provider store={store}>
      <Theme>
        <AbortControllerProvider>{children}</AbortControllerProvider>
      </Theme>
    </Provider>
  );
};

const meta = {
  title: "Chat Content",
  component: ChatContent,
  args: {},
  // decorators: [
  //   (Story) => (
  //     <Provider store={store}>
  //       <Theme>
  //         <AbortControllerProvider>
  //           <Story />
  //         </AbortControllerProvider>
  //       </Theme>
  //     </Provider>
  //   ),
  // ],
} satisfies Meta<typeof ChatContent>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Primary: Story = {
  decorators: [
    (Story) => (
      <MockedStore>
        <Story />
      </MockedStore>
    ),
  ],
};

export const WithFunctions: Story = {
  args: {
    ...meta.args,
    // messages: CHAT_FUNCTIONS_MESSAGES,
  },
  decorators: [
    (Story) => (
      <MockedStore messages={CHAT_FUNCTIONS_MESSAGES}>
        <Story />
      </MockedStore>
    ),
  ],
};

export const Notes: Story = {
  args: {
    // messages: FROG_CHAT.messages,
  },
  decorators: [
    (Story) => (
      <MockedStore messages={FROG_CHAT.messages}>
        <Story />
      </MockedStore>
    ),
  ],
};

export const WithDiffs: Story = {
  args: {
    // messages: CHAT_WITH_DIFFS,
  },
  decorators: [
    (Story) => (
      <MockedStore messages={CHAT_WITH_DIFFS}>
        <Story />
      </MockedStore>
    ),
  ],
};

export const WithDiffActions: Story = {
  args: {
    // messages: CHAT_WITH_DIFF_ACTIONS.messages,
    // getDiffByIndex: (key: string) => CHAT_WITH_DIFF_ACTIONS.applied_diffs[key],
  },
  decorators: [
    (Story) => (
      <MockedStore messages={CHAT_WITH_DIFF_ACTIONS.messages}>
        <Story />
      </MockedStore>
    ),
  ],
};

export const LargeDiff: Story = {
  args: {
    // messages: LARGE_DIFF.messages,
    // getDiffByIndex: (key: string) => LARGE_DIFF.applied_diffs[key],
  },
  decorators: [
    (Story) => (
      <MockedStore messages={LARGE_DIFF.messages}>
        <Story />
      </MockedStore>
    ),
  ],
};

export const Empty: Story = {
  args: {
    ...meta.args,
  },
  decorators: [
    // TODO: use redux store
    (Story) => (
      <MockedStore messages={[]}>
        <Story />
      </MockedStore>
    ),
  ],
};

export const AssistantMarkdown: Story = {
  args: {
    ...meta.args,
    // messages: [["assistant", MarkdownTest]],
  },
  decorators: [
    (Story) => {
      return (
        <MockedStore
          messages={[{ role: "assistant", content: MarkdownMessage }]}
        >
          <Story />
        </MockedStore>
      );
    },
  ],
};
