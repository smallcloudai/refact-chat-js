import type { Meta, StoryObj } from "@storybook/react";

import { ChatForm } from "./ChatForm";
import { SYSTEM_PROMPTS } from "../../__fixtures__";
import { useDebounceCallback } from "usehooks-ts";

// const _testCommands = [
//   "@workspace",
//   "@help",
//   "@list",
//   "@web",
//   "@database",
//   "@?",
//   "@longlonglonglonglonglonglonglonglonglong",
//   "@refactor",
//   "@test",
//   "@Apple",
//   "@Banana",
//   "@Carrot",
//   "@Dill",
//   "@Elderberries",
//   "@Figs",
//   "@Grapes",
//   "@Honeydew",
//   "@Iced melon",
//   "@Jackfruit",
//   "@Kale",
//   "@Lettuce",
//   "@Mango",
//   "@Nectarines",
//   "@Oranges",
//   "@Pineapple",
//   "@Quince",
//   "@Raspberries",
//   "@Strawberries",
//   "@Turnips",
//   "@Ugli fruit",
//   "@Vanilla beans",
//   "@Watermelon",
//   "@Xigua",
//   "@Yuzu",
//   "@Zucchini",
// ];

const noop = () => ({});

const long = "long".repeat(30);

const meta: Meta<typeof ChatForm> = {
  title: "Chat Form",
  component: ChatForm,
  args: {
    onSubmit: (str) => {
      // eslint-disable-next-line no-console
      console.log("submit called with " + str);
    },
    onClose: () => {
      // eslint-disable-next-line no-console
      console.log("onclose called");
    },
    isStreaming: false,
    onSetChatModel: noop,
    caps: {
      fetching: false,
      default_cap: "foo",
      available_caps: {
        bar: {
          default_scratchpad: "",
          n_ctx: 2048,
          similar_models: [],
          supports_tools: false,
          supports_scratchpads: {},
        },
        [long]: {
          default_scratchpad: "",
          n_ctx: 2048,
          similar_models: [],
          supports_tools: false,
          supports_scratchpads: {},
        },
        baz: {
          default_scratchpad: "",
          n_ctx: 2048,
          similar_models: [],
          supports_tools: false,
          supports_scratchpads: {},
        },
      },
      error: "",
    },
    showControls: true,
    prompts: SYSTEM_PROMPTS,
    onSetSystemPrompt: noop,
  },
  decorators: [
    (Children) => {
      const requestCommandsCompletion = useDebounceCallback(() => ({}), 0);
      // TODO: use redux store
      // return (
      //   <ConfigProvider
      //     config={{ host: "vscode", features: { vecdb: true, ast: true } }}
      //   >
      //     <Children requestCommandsCompletion={requestCommandsCompletion} />
      //   </ConfigProvider>
      // );
      return <Children requestCommandsCompletion={requestCommandsCompletion} />;
    },
  ],
} satisfies Meta<typeof ChatForm>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Primary: Story = {
  args: {
    model: "foo",
  },
};
