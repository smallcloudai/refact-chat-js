import { expect, vi, describe, it, afterEach, beforeEach } from "vitest";
import {
  render,
  waitFor,
  postMessage,
  setUpCapsForChat,
  stubResizeObserver,
  cleanup,
} from "../utils/test-utils";
import { Chat } from "./Chat";
import {
  EVENT_NAMES_TO_CHAT,
  EVENT_NAMES_FROM_CHAT,
  RestoreChat,
  CreateNewChatThread,
  ChatErrorStreaming,
  ChatReceiveCapsError,
} from "../events";
import { MARS_ROVER_CHAT, STUB_CAPS_RESPONSE } from "../__fixtures__";

describe("Chat", () => {
  beforeEach(() => {
    stubResizeObserver();
  });

  afterEach(() => {
    cleanup();
    vi.restoreAllMocks();
  });

  it("should send and receive messages from the window", async () => {
    vi.mock("uuid", () => ({ v4: () => "foo" }));

    const postMessageSpy = vi.spyOn(window, "postMessage");
    const windowSpy = vi.fn();
    window.addEventListener("message", windowSpy);

    const { user, ...app } = render(<Chat />);

    expect(postMessageSpy).toHaveBeenCalledWith(
      { type: EVENT_NAMES_FROM_CHAT.REQUEST_CAPS, payload: { id: "foo" } },
      "*",
    );

    setUpCapsForChat("foo");

    const select = await app.findByTitle("chat model");
    expect(select.textContent).toContain("gpt-3.5-turbo");

    const textarea: HTMLTextAreaElement | null =
      app.container.querySelector("textarea");

    expect(textarea).not.toBeNull();
    if (textarea) {
      await user.type(textarea, "hello");
      await user.type(textarea, "{enter}");
    }

    expect(postMessageSpy).toHaveBeenLastCalledWith(
      {
        type: EVENT_NAMES_FROM_CHAT.ASK_QUESTION,
        payload: {
          id: "foo",
          messages: [["user", "hello"]],
          model: "gpt-3.5-turbo",
          title: "",
        },
      },
      "*",
    );

    postMessage({
      type: EVENT_NAMES_TO_CHAT.CHAT_RESPONSE,
      payload: {
        id: "foo",
        choices: [
          {
            delta: {
              content: "",
              role: "assistant",
            },
            finish_reason: null,
            index: 0,
          },
        ],
        created: 1702552152.03,
        model: "gpt-3.5-turbo",
      },
    });

    postMessage({
      type: EVENT_NAMES_TO_CHAT.CHAT_RESPONSE,
      payload: {
        id: "foo",
        choices: [
          {
            delta: {
              content: "hello there",
              role: "assistant",
            },
            finish_reason: null,
            index: 0,
          },
        ],
        created: 1702552152.03,
        model: "gpt-3.5-turbo",
      },
    });

    postMessage({
      type: EVENT_NAMES_TO_CHAT.DONE_STREAMING,
      payload: { id: "foo" },
    });

    await waitFor(() => {
      expect(app.getAllByText("hello there")).not.toBeNull();
    });
  });

  it("can restore a chat", async () => {
    const app = render(<Chat />);

    const restoreChatAction: RestoreChat = {
      type: EVENT_NAMES_TO_CHAT.RESTORE_CHAT,
      payload: MARS_ROVER_CHAT,
    };

    postMessage(restoreChatAction);

    const firstMessage = MARS_ROVER_CHAT.messages[0][1] as string;

    postMessage(restoreChatAction);

    await waitFor(() => expect(app.queryByText(firstMessage)).not.toBeNull());

    await waitFor(() => expect(app.queryByText(/Certainly!/)).not.toBeNull());
  });

  it("when creating a new chat I can select which model to use", async () => {
    vi.mock("uuid", () => ({ v4: () => "foo" }));

    // Missing props in jsdom
    // window.PointerEvent = class PointerEvent extends Event {};
    window.HTMLElement.prototype.scrollIntoView = vi.fn();
    window.HTMLElement.prototype.hasPointerCapture = vi.fn();
    window.HTMLElement.prototype.releasePointerCapture = vi.fn();

    const postMessageSpy = vi.spyOn(window, "postMessage");

    const { user, ...app } = render(<Chat />);

    const restoreChatAction: RestoreChat = {
      type: EVENT_NAMES_TO_CHAT.RESTORE_CHAT,
      payload: {
        id: "bar",
        messages: [
          ["user", "hello"],
          ["assistant", "hello there"],
        ],
        title: "hello",
        model: "gpt-3.5-turbo",
      },
    };

    postMessage(restoreChatAction);

    const userInput = await app.findByText("hello");
    expect(userInput.textContent).toContain("hello");

    expect(app.queryByTitle("chat model")).toBeNull();

    const createNewChatAction: CreateNewChatThread = {
      type: EVENT_NAMES_TO_CHAT.NEW_CHAT,
    };

    postMessage(createNewChatAction);

    setUpCapsForChat("foo");

    await new Promise((resolve) => setTimeout(resolve, 1000));

    await waitFor(() => expect(app.queryByTitle("chat model")).not.toBeNull());
    await waitFor(() =>
      expect(
        app.queryByText(STUB_CAPS_RESPONSE.code_chat_default_model),
      ).not.toBeNull(),
    );

    await user.click(app.getByTitle("chat model"));

    await user.click(app.getByRole("option", { name: /test-model/i }));

    await waitFor(() => expect(app.queryByText("test-model")).not.toBeNull());

    const textarea: HTMLTextAreaElement | null =
      app.container.querySelector("textarea");

    expect(textarea).not.toBeNull();
    if (textarea) {
      await user.type(textarea, "hello");
      await user.type(textarea, "{enter}");
    }

    expect(postMessageSpy).toHaveBeenLastCalledWith(
      {
        type: EVENT_NAMES_FROM_CHAT.ASK_QUESTION,
        payload: {
          id: "foo",
          messages: [["user", "hello"]],
          model: "test-model",
          title: "",
        },
      },
      "*",
    );
  });

  it("retry chat", async () => {
    const postMessageSpy = vi.spyOn(window, "postMessage");

    const { user, ...app } = render(<Chat />);

    const restoreChatAction: RestoreChat = {
      type: EVENT_NAMES_TO_CHAT.RESTORE_CHAT,
      payload: {
        id: "bar",
        messages: [
          ["user", "hello"],
          ["assistant", "hello there"],
          ["user", "how are you?"],
          ["assistant", "fine"],
        ],
        title: "hello",
        model: "gpt-3.5-turbo",
      },
    };

    postMessage(restoreChatAction);

    await waitFor(() => expect(app.queryByText("hello")).not.toBeNull());

    const retryButtons = app.queryAllByText("Retry");

    expect(retryButtons.length).toBe(2);

    await user.click(retryButtons[0]);

    const textarea: HTMLTextAreaElement | null =
      app.container.querySelector("textarea");

    expect(textarea).not.toBeNull();
    if (textarea) {
      textarea.setSelectionRange(0, textarea.value.length);
      await user.type(textarea, " there.{enter}");
    }

    expect(postMessageSpy).toHaveBeenLastCalledWith(
      {
        type: EVENT_NAMES_FROM_CHAT.ASK_QUESTION,
        payload: {
          id: "bar",
          messages: [["user", "hello there."]],
          title: "hello",
          model: "gpt-3.5-turbo",
        },
      },
      "*",
    );
  });

  it("chat error streaming", async () => {
    const chatId = "foo";
    vi.mock("uuid", () => ({ v4: () => "foo" }));

    const app = render(<Chat />);

    const chatError: ChatErrorStreaming = {
      type: EVENT_NAMES_TO_CHAT.ERROR_STREAMING,
      payload: {
        id: chatId,
        message: "whoops",
      },
    };

    postMessage(chatError);

    await waitFor(() => expect(app.queryByText(/whoops/)).not.toBeNull());
  });

  it("char error getting caps", async () => {
    const chatId = "foo";
    vi.mock("uuid", () => ({ v4: () => "foo" }));

    const app = render(<Chat />);

    const chatError: ChatReceiveCapsError = {
      type: EVENT_NAMES_TO_CHAT.RECEIVE_CAPS_ERROR,
      payload: {
        id: chatId,
        message: "whoops error getting caps",
      },
    };

    postMessage(chatError);

    await waitFor(() => expect(app.queryByText(/whoops/)).not.toBeNull());
  });
});
