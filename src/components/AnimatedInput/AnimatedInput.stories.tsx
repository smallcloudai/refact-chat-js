import type { Meta, StoryObj } from "@storybook/react";
import { AnimatedInput } from "./AnimatedInput";

const meta = {
  title: "Components/AnimatedInput",
  component: AnimatedInput,
} satisfies Meta<typeof AnimatedInput>;

export default meta;

type Story = StoryObj<typeof AnimatedInput>;

export const Default: Story = {};
