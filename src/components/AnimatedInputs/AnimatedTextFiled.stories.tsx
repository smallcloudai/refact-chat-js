import type { Meta, StoryObj } from "@storybook/react";
import { AnimatedTextField } from "./AnimatedTextField";
import { Theme, Container } from "@radix-ui/themes";

const meta = {
  title: "Components/AnimatedInputs/AnimatedTextField",
  component: AnimatedTextField,
  decorators: [
    (Story) => (
      <Theme>
        <Container p="8">
          <Story />
        </Container>
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
