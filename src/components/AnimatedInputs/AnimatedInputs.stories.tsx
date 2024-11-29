import type { Meta, StoryObj } from "@storybook/react";
import { AnimatedTextField } from "./AnimatedTextField";
import { Theme } from "@radix-ui/themes";

const meta = {
  title: "Components/AnimatedTextField",
  component: AnimatedTextField,
  decorators: [
    (Story) => (
      <Theme>
        <Story />
      </Theme>
    ),
  ],
} satisfies Meta<typeof AnimatedTextField>;

export default meta;

type Story = StoryObj<typeof AnimatedTextField>;

export const Default: Story = {
  args: {
    defaultValue: "World",
    fadeValue: "Hello",
    name: "test",
  },
};
