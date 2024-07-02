import type { Meta, StoryObj } from "@storybook/react";
import { InitialSetup } from ".";
import { Flex } from "@radix-ui/themes";

const meta: Meta<typeof InitialSetup> = {
  title: "Initial setup",
  component: InitialSetup,
  args: {
    onPressNext: (str) => {
      // eslint-disable-next-line no-console
      console.log("onPressNext called with " + str);
    },
  },
  decorators: [
    (Children) => (
      <Flex p="4">
        <Children />
      </Flex>
    ),
  ],
} satisfies Meta<typeof InitialSetup>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Primary: Story = {
  args: {},
};