import { createAction, createAsyncThunk } from "@reduxjs/toolkit";
import {
  type PayloadWithIdAndTitle,
  type ChatThread,
  type PayloadWithId,
  type ToolUse,
  IntegrationMeta,
} from "./types";
import {
  isAssistantMessage,
  isCDInstructionMessage,
  isChatGetTitleResponse,
  isSystemMessage,
  isToolCallMessage,
  isToolMessage,
  ToolCall,
  ToolMessage,
  type ChatMessages,
  type ChatResponse,
} from "../../../services/refact/types";
import type { AppDispatch, RootState } from "../../../app/store";
import { type SystemPrompts } from "../../../services/refact/prompts";
import { formatMessagesForLsp, consumeStream } from "./utils";
import { generateChatTitle, sendChat } from "../../../services/refact/chat";
import { ToolCommand } from "../../../services/refact/tools";
import { scanFoDuplicatesWith, takeFromEndWhile } from "../../../utils";

export const newChatAction = createAction("chatThread/new");

export const newIntegrationChat = createAction<{
  integration: IntegrationMeta;
  messages: ChatMessages;
}>("chatThread/newIntegrationChat");

export const chatResponse = createAction<PayloadWithId & ChatResponse>(
  "chatThread/response",
);

export const chatAskedQuestion = createAction<PayloadWithId>(
  "chatThread/askQuestion",
);

export const backUpMessages = createAction<
  PayloadWithId & {
    messages: ChatThread["messages"];
  }
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

export const saveTitle = createAction<PayloadWithIdAndTitle>(
  "chatThread/saveTitle",
);

export const setSendImmediately = createAction<boolean>(
  "chatThread/setSendImmediately",
);

// TODO: This is the circular dep when imported from hooks :/
const createAppAsyncThunk = createAsyncThunk.withTypes<{
  state: RootState;
  dispatch: AppDispatch;
}>();

export const chatGenerateTitleThunk = createAppAsyncThunk<
  unknown,
  {
    messages: ChatMessages;
    chatId: string;
  }
>("chatThread/generateTitle", ({ messages, chatId }, thunkAPI) => {
  const state = thunkAPI.getState();

  const messagesToSend = messages
    .filter((msg) => !isToolMessage(msg) && msg.content !== "")
    .map((msg) => {
      if (isAssistantMessage(msg)) {
        return {
          role: msg.role,
          content: msg.content,
        };
      }
      return msg;
    });

  const messagesForLsp = formatMessagesForLsp([
    ...messagesToSend,
    {
      role: "user",
      content:
        "Generate a short 2-3 word title for the current chat that reflects the context of the user's query. The title should be specific, avoiding generic terms, and should relate to relevant files, symbols, or objects. If user message contains filename, please make sure that filename remains inside of a generated title. Please ensure the answer is strictly 2-3 words, not paragraphs of text.\nOutput should be STRICTLY 2-3 words, not explanation.",
    },
  ]);

  return generateChatTitle({
    messages: messagesForLsp,
    model: state.chat.thread.model,
    stream: false,
    chatId,
    apiKey: state.config.apiKey,
    port: state.config.lspPort,
  })
    .then((response) => {
      if (!response.ok) {
        return Promise.reject(new Error(response.statusText));
      }
      return response.json();
    })
    .then((data) => {
      if (!isChatGetTitleResponse(data)) {
        return;
      }

      const title = data.choices[0].message.content;
      const cleanedTitle = title.replace(/"/g, "");

      // Dispatching saveTitle action for a chatThread
      thunkAPI.dispatch(
        saveTitle({ id: chatId, title: cleanedTitle, isTitleGenerated: true }),
      );
      return { title: cleanedTitle, chatId: state.chat.thread.id };
    })
    .catch((err: Error) => {
      // console.log("Catch called");
      thunkAPI.dispatch(chatError({ id: chatId, message: err.message }));
      return thunkAPI.rejectWithValue(err.message);
    });
});

function checkForToolLoop(message: ChatMessages): boolean {
  const assistantOrToolMessages = takeFromEndWhile(message, (message) => {
    return (
      isToolMessage(message) ||
      isToolCallMessage(message) ||
      isCDInstructionMessage(message)
    );
  });

  if (assistantOrToolMessages.length === 0) return false;

  const toolCalls = assistantOrToolMessages.reduce<ToolCall[]>((acc, cur) => {
    if (!isToolCallMessage(cur)) return acc;
    return acc.concat(cur.tool_calls);
  }, []);

  if (toolCalls.length === 0) return false;

  const toolResults = assistantOrToolMessages.filter(isToolMessage);

  const hasDuplicates = scanFoDuplicatesWith(toolCalls, (a, b) => {
    const aResult: ToolMessage | undefined = toolResults.find(
      (message) => message.content.tool_call_id === a.id,
    );

    const bResult: ToolMessage | undefined = toolResults.find(
      (message) => message.content.tool_call_id === b.id,
    );

    return (
      a.function.name === b.function.name &&
      a.function.arguments === b.function.arguments &&
      !!aResult &&
      !!bResult &&
      aResult.content.content === bResult.content.content
    );
  });

  return hasDuplicates;
}
// TODO: add props for config chat
export const chatAskQuestionThunk = createAppAsyncThunk<
  unknown,
  {
    messages: ChatMessages;
    chatId: string;
    tools: ToolCommand[] | null;
    // TODO: make a separate function for this... and it'll need to be saved.
  }
>("chatThread/sendChat", ({ messages, chatId, tools }, thunkAPI) => {
  const state = thunkAPI.getState();

  const thread =
    chatId in state.chat.cache
      ? state.chat.cache[chatId]
      : state.chat.thread.id === chatId
        ? state.chat.thread
        : null;

  const onlyDeterministicMessages =
    checkForToolLoop(messages) || !messages.some(isSystemMessage);

  const messagesForLsp = formatMessagesForLsp(messages);

  return sendChat({
    messages: messagesForLsp,
    model: state.chat.thread.model,
    tools,
    stream: true,
    abortSignal: thunkAPI.signal,
    chatId,
    apiKey: state.config.apiKey,
    port: state.config.lspPort,
    onlyDeterministicMessages,
    integration: thread?.integration,
  })
    .then((response) => {
      if (!response.ok) {
        return Promise.reject(new Error(response.statusText));
      }

      const reader = response.body?.getReader();
      if (!reader) return;
      const onAbort = () => thunkAPI.dispatch(setPreventSend({ id: chatId }));
      const onChunk = (json: Record<string, unknown>) => {
        const action = chatResponse({ ...(json as ChatResponse), id: chatId });
        return thunkAPI.dispatch(action);
      };
      return consumeStream(reader, thunkAPI.signal, onAbort, onChunk);
    })
    .catch((err: Error) => {
      // console.log("Catch called");
      thunkAPI.dispatch(doneStreaming({ id: chatId }));
      thunkAPI.dispatch(chatError({ id: chatId, message: err.message }));
      return thunkAPI.rejectWithValue(err.message);
    })
    .finally(() => {
      thunkAPI.dispatch(doneStreaming({ id: chatId }));
    });
});
