import { Meta, StoryObj } from "@storybook/react";

import { ChatLinks } from "./ChatLinks";
import { setUpStore } from "../../app/store";
import { Provider } from "react-redux";
import { Theme } from "../Theme";

const Template = () => {
  const store = setUpStore();
  return (
    <Provider store={store}>
      <Theme>
        <ChatLinks />
      </Theme>
    </Provider>
  );
};

const meta = {
  title: "Components/ChatLinks",
  component: Template,
  argTypes: {
    //...
  },
} satisfies Meta<typeof Template>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};
