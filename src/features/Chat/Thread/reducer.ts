import { createReducer } from "@reduxjs/toolkit";
import { Chat, ChatThread, ToolUse } from "./types";
import { v4 as uuidv4 } from "uuid";
import { chatResponse, chatAskedQuestion } from ".";
import {
  setToolUse,
  enableSend,
  clearChatError,
  setChatModel,
  setSystemPrompt,
  newChatAction,
  backUpMessages,
  chatError,
  doneStreaming,
  removeChatFromCache,
  restoreChat,
  setPreventSend,
  saveTitle,
  newIntegrationChat,
  setSendImmediately,
} from "./actions";
import { formatChatResponse } from "./utils";

const createChatThread = (
  tool_use: ToolUse,
  integration?: { name: string; path: string } | null,
): ChatThread => {
  const chat: ChatThread = {
    id: uuidv4(),
    messages: [],
    title: "",
    model: "",
    tool_use,
    integration,
  };
  return chat;
};

const createInitialState = (
  tool_use: ToolUse = "explore",
  integration?: { name: string; path: string } | null,
): Chat => {
  return {
    streaming: false,
    thread: createChatThread(tool_use, integration),
    error: null,
    prevent_send: false,
    waiting_for_response: false,
    cache: {},
    system_prompt: {},
    tool_use,
    send_immediately: false,
  };
};

const initialState = createInitialState();

export const chatReducer = createReducer(initialState, (builder) => {
  builder.addCase(setToolUse, (state, action) => {
    state.thread.tool_use = action.payload;
    state.tool_use = action.payload;
  });

  builder.addCase(setPreventSend, (state, action) => {
    if (state.thread.id !== action.payload.id) return state;
    state.prevent_send = true;
  });

  builder.addCase(enableSend, (state, action) => {
    if (state.thread.id !== action.payload.id) return state;
    state.prevent_send = false;
  });

  builder.addCase(clearChatError, (state, action) => {
    if (state.thread.id !== action.payload.id) return state;
    state.error = null;
  });

  builder.addCase(setChatModel, (state, action) => {
    state.thread.model = action.payload;
  });

  builder.addCase(setSystemPrompt, (state, action) => {
    state.system_prompt = action.payload;
  });

  builder.addCase(newChatAction, (state) => {
    const next = createInitialState(state.tool_use);
    next.cache = { ...state.cache };
    if (state.streaming) {
      next.cache[state.thread.id] = { ...state.thread, read: false };
    }
    next.thread.model = state.thread.model;
    next.system_prompt = state.system_prompt;
    return next;
  });

  builder.addCase(chatResponse, (state, action) => {
    if (
      action.payload.id !== state.thread.id &&
      !(action.payload.id in state.cache)
    ) {
      return state;
    }

    if (action.payload.id in state.cache) {
      const thread = state.cache[action.payload.id];
      // TODO: this might not be needed any more, because we can mutate the last message.
      const messages = formatChatResponse(thread.messages, action.payload);
      thread.messages = messages;
      return state;
    }

    const messages = formatChatResponse(state.thread.messages, action.payload);

    state.streaming = true;
    state.waiting_for_response = false;
    state.thread.messages = messages;
  });

  builder.addCase(backUpMessages, (state, action) => {
    // TODO: should it also save to history?
    state.error = null;
    // state.previous_message_length = state.thread.messages.length;
    state.thread.messages = action.payload.messages;
  });

  builder.addCase(chatError, (state, action) => {
    state.streaming = false;
    state.prevent_send = true;
    state.waiting_for_response = false;
    state.error = action.payload.message;
  });

  builder.addCase(doneStreaming, (state, action) => {
    if (state.thread.id !== action.payload.id) return state;
    state.streaming = false;
    state.thread.read = true;
    state.prevent_send = false;
  });

  builder.addCase(chatAskedQuestion, (state, action) => {
    if (state.thread.id !== action.payload.id) return state;
    state.send_immediately = false;
    state.waiting_for_response = true;
    state.streaming = true;
    state.thread.read = false;
    state.prevent_send = false;
  });

  builder.addCase(removeChatFromCache, (state, action) => {
    if (!(action.payload.id in state.cache)) return state;

    const cache = Object.entries(state.cache).reduce<
      Record<string, ChatThread>
    >((acc, cur) => {
      if (cur[0] === action.payload.id) return acc;
      return { ...acc, [cur[0]]: cur[1] };
    }, {});
    state.cache = cache;
  });

  builder.addCase(restoreChat, (state, action) => {
    if (state.thread.id === action.payload.id) return state;
    const mostUptoDateThread =
      action.payload.id in state.cache
        ? { ...state.cache[action.payload.id] }
        : { ...action.payload, read: true };

    state.error = null;
    state.waiting_for_response = false;

    if (state.streaming) {
      state.cache[state.thread.id] = { ...state.thread, read: false };
    }
    if (action.payload.id in state.cache) {
      const { [action.payload.id]: _, ...rest } = state.cache;
      state.cache = rest;
      state.streaming = true;
    } else {
      state.streaming = false;
    }
    state.prevent_send = true;
    state.thread = mostUptoDateThread;
    state.thread.tool_use = state.thread.tool_use ?? state.tool_use;
  });

  // New builder to save chat title within the current thread and not only inside of a history thread
  builder.addCase(saveTitle, (state, action) => {
    if (state.thread.id !== action.payload.id) return state;
    state.thread.title = action.payload.title;
    state.thread.isTitleGenerated = action.payload.isTitleGenerated;
  });

  builder.addCase(newIntegrationChat, (state, action) => {
    // TODO: find out about tool use
    const next = createInitialState("explore", action.payload.integration);
    next.thread.integration = action.payload.integration;
    next.thread.messages = action.payload.messages;
    // TODO: not this
    next.thread.model = "gpt-4o";

    next.cache = { ...state.cache };
    if (state.streaming) {
      next.cache[state.thread.id] = { ...state.thread, read: false };
    }
    // TBD: this might not be needed.
    // next.thread.model = state.thread.model;
    // next.system_prompt = state.system_prompt;
    return next;
  });

  builder.addCase(setSendImmediately, (state, action) => {
    state.send_immediately = action.payload;
  });
});
