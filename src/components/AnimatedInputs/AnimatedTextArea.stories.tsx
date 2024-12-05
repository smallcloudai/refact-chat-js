import type { Meta, StoryObj } from "@storybook/react";
import { AnimatedTextArea } from "./AnimatedTextArea";
import { Theme, Container } from "@radix-ui/themes";

const meta = {
  title: "Components/AnimatedInputs/AnimatedTextArea",
  component: AnimatedTextArea,
  decorators: [
    (Story) => (
      <Theme>
        <Container p="8">
          <Story />
        </Container>
      </Theme>
    ),
  ],
} satisfies Meta<typeof AnimatedTextArea>;

export default meta;

type Story = StoryObj<typeof AnimatedTextArea>;

export const Default: Story = {
  args: {
    defaultValue: "World",
    fadeValue: "Hello",
    name: "test",
  },
};
