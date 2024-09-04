import { createAction, createAsyncThunk } from "@reduxjs/toolkit";
import {
  checkForDetailMessage,
  type ChatThread,
  type PayloadWithId,
  type ToolUse,
} from "./types";
import type {
  ChatMessages,
  ChatResponse,
} from "../../../services/refact/types";
import type { AppDispatch, RootState } from "../../../app/store";
import type { SystemPrompts } from "../../../services/refact/prompts";
import { parseOrElse } from "../../../utils/parseOrElse";
import { formatMessagesForLsp } from "./utils";
import { sendChat } from "../../../services/refact/chat";
import { ToolCommand } from "../../../services/refact/tools";

export const newChatAction = createAction("chatThread/new");

export const chatResponse = createAction<PayloadWithId & ChatResponse>(
  "chatThread/response",
);

export const chatAskedQuestion = createAction<PayloadWithId>(
  "chatThread/askQuestion",
);

export const backUpMessages = createAction<
  PayloadWithId & { messages: ChatThread["messages"] }
>("chatThread/backUpMessages");

// TODO: add history actions to this, maybe not used any more
export const chatError = createAction<PayloadWithId & { message: string }>(
  "chatThread/error",
);

// TODO: include history actions with this one, this could be done by making it a thunk, or use reduce-reducers.
export const doneStreaming = createAction<PayloadWithId>(
  "chatThread/doneStreaming",
);

export const setChatModel = createAction<string>("chatThread/setChatModel");
export const getSelectedChatModel = (state: RootState) =>
  state.chat.thread.model;

export const setSystemPrompt = createAction<SystemPrompts>(
  "chatThread/setSystemPrompt",
);

export const removeChatFromCache = createAction<PayloadWithId>(
  "chatThread/removeChatFromCache",
);

export const restoreChat = createAction<ChatThread>("chatThread/restoreChat");

export const clearChatError = createAction<PayloadWithId>(
  "chatThread/clearError",
);

export const enableSend = createAction<PayloadWithId>("chatThread/enableSend");
export const setPreventSend = createAction<PayloadWithId>(
  "chatThread/preventSend",
);

export const setToolUse = createAction<ToolUse>("chatThread/setToolUse");

// TODO: This is the circular dep when imported from hooks :/
const createAppAsyncThunk = createAsyncThunk.withTypes<{
  state: RootState;
  dispatch: AppDispatch;
}>();

export const chatAskQuestionThunk = createAppAsyncThunk<
  unknown,
  {
    messages: ChatMessages;
    chatId: string;
    tools: ToolCommand[] | null;
  }
>("chatThread/sendChat", async ({ messages, chatId, tools }, thunkAPI) => {
  const state = thunkAPI.getState();

  const messagesForLsp = formatMessagesForLsp(messages);
  try {
    const response = await sendChat({
      messages: messagesForLsp,
      model: state.chat.thread.model,
      tools,
      stream: true,
      abortSignal: thunkAPI.signal,
      chatId,
      apiKey: state.config.apiKey,
      port: state.config.lspPort,
    });

    if (!response.ok) {
      throw new Error(response.statusText);
    }

    const decoder = new TextDecoder();
    const reader = response.body?.getReader();
    if (!reader) return;

    const shouldContinue = Math.random() > -100.0;
    let streamAsString = "";
    // let deltaCounter = 0;
    while (shouldContinue) {
      const { done, value } = await reader.read();
      if (done) {
        break;
      }
      if (thunkAPI.signal.aborted) {
        thunkAPI.dispatch(setPreventSend({ id: chatId }));
        break;
      }

      streamAsString += decoder.decode(value, { stream: true });

      const deltaParts = streamAsString.split("\n\n");
      const deltas = deltaParts.slice(0, -1).filter((str) => str.length > 0);
      streamAsString = deltaParts[deltaParts.length - 1];

      // deltaCounter += 1;
      // let deltaCounter2 = 0;
      for (const delta of deltas) {
        // deltaCounter2 += 1;
        // console.warn(`delta${deltaCounter} thispacket${deltaCounter2}: ${delta}`);

        if (!delta.startsWith("data: ")) {
          const maybeError = checkForDetailMessage(delta);
          if (maybeError) {
            throw new Error(maybeError.detail);
          }
          // eslint-disable-next-line no-console
          console.log("Unexpected data in streaming buf: " + delta);
          continue;
        }

        const maybeJsonString = delta.substring(6);

        if (maybeJsonString === "[DONE]") return;

        if (maybeJsonString === "[ERROR]") {
          throw new Error("error from lsp");
        }

        const maybeErrorData = checkForDetailMessage(maybeJsonString);
        if (maybeErrorData) {
          throw new Error(
            typeof maybeErrorData.detail === "string"
              ? maybeErrorData.detail
              : JSON.stringify(maybeErrorData.detail),
          );
        }

        const json = parseOrElse<Record<string, unknown>>(maybeJsonString, {});

        thunkAPI.dispatch(
          chatResponse({ ...(json as ChatResponse), id: chatId }),
        );
      }
    }
  } catch (err) {
    thunkAPI.dispatch(doneStreaming({ id: chatId }));
    thunkAPI.dispatch(
      chatError({ id: chatId, message: (err as Error).message }),
    );
    return thunkAPI.rejectWithValue((err as Error).message);
  } finally {
    thunkAPI.dispatch(doneStreaming({ id: chatId }));
  }
});
