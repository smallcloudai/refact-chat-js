import { ReactElement } from "react";
import { vi } from "vitest";
import "@testing-library/jest-dom/vitest";
import { render, RenderOptions } from "@testing-library/react";
import userEvent, { UserEvent } from "@testing-library/user-event";
import { Theme } from "@radix-ui/themes";
import { EVENT_NAMES_TO_CHAT } from "../events";
import { STUB_CAPS_RESPONSE } from "../__fixtures__";

const customRender = (
  ui: ReactElement,
  options?: Omit<RenderOptions, "wrapper">,
): ReturnType<typeof render> & { user: UserEvent } => {
  const user = userEvent.setup();
  return {
    ...render(ui, { wrapper: Theme, ...options }),
    user,
  };
};

// eslint-disable-next-line react-refresh/only-export-components
export * from "@testing-library/react";

export { customRender as render };

export function postMessage(data: unknown) {
  return window.dispatchEvent(
    new MessageEvent("message", { source: window, origin: "*", data }),
  );
}

export function setUpCapsForChat(chatId = "") {
  postMessage({
    type: EVENT_NAMES_TO_CHAT.RECEIVE_CAPS,
    payload: {
      id: chatId,
      caps: STUB_CAPS_RESPONSE,
    },
  });
}

export function stubResizeObserver() {
  const ResizeObserverMock = vi.fn(() => ({
    observe: vi.fn(),
    unobserve: vi.fn(),
    disconnect: vi.fn(),
  }));

  // Stub the global ResizeObserver
  vi.stubGlobal("ResizeObserver", ResizeObserverMock);
}
