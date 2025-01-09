import React from "react";
import type { Meta, StoryObj } from "@storybook/react";
import { KnowledgeList } from "./KnowledgeList";
import { Provider } from "react-redux";
import { Theme } from "../../components/Theme";
import { TourProvider } from "../Tour";
import { AbortControllerProvider } from "../../contexts/AbortControllers";
import { setUpStore } from "../../app/store";
import { knowLedgeLoading } from "../../__fixtures__/msw";

const Template: React.FC = () => {
  const store = setUpStore();
  return (
    <Provider store={store}>
      <Theme>
        <TourProvider>
          <AbortControllerProvider>
            <KnowledgeList />
          </AbortControllerProvider>
        </TourProvider>
      </Theme>
    </Provider>
  );
};

const meta: Meta<typeof KnowledgeList> = {
  title: "Components/KnowledgeList",
  component: Template,
  parameters: {
    msw: {
      handlers: [knowLedgeLoading],
    },
  },
};

export default meta;

type Story = StoryObj<typeof KnowledgeList>;

export const Primary: Story = {};
