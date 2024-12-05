import type { Preview } from "@storybook/react";
import { Provider } from "react-redux";
import "@radix-ui/themes/styles.css";
import { initialize, mswLoader } from "msw-storybook-addon";

import { store } from "../src/app/store";


initialize();

const preview: Preview = {
  parameters: {
    actions: { argTypesRegex: "^on[A-Z].*" },
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
    },
    layout: "fullscreen",
  },
  loaders: [mswLoader],
  decorators: [
    (Story) => (
      <Provider store={store}>
        <Story />
      </Provider>
    ),
  ],
};

export default preview;
