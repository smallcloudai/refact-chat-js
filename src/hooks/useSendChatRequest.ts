import { useCallback, useEffect, useMemo } from "react";
import { useAppDispatch } from "./useAppDispatch";
import { useAppSelector } from "./useAppSelector";
import {
  getSelectedSystemPrompt,
  selectChatError,
  selectChatId,
  selectIsStreaming,
  selectIsWaiting,
  selectMessages,
  selectPreventSend,
  selectSendImmediately,
  selectToolUse,
} from "../features/Chat/Thread/selectors";
import {
  useCheckForConfirmationMutation,
  useGetToolsLazyQuery,
} from "./useGetToolsQuery";
import {
  ChatMessage,
  ChatMessages,
  isAssistantMessage,
} from "../services/refact/types";
import {
  backUpMessages,
  chatAskQuestionThunk,
  chatAskedQuestion,
  setToolUse,
} from "../features/Chat/Thread/actions";
import { isToolUse } from "../features/Chat";
import { useAbortControllers } from "./useAbortControllers";
import {
  clearPauseReasonsAndConfirmTools,
  getToolsConfirmationStatus,
  setPauseReasons,
} from "../features/ToolConfirmation/confirmationSlice";

let recallCounter = 0;

export const useSendChatRequest = () => {
  const dispatch = useAppDispatch();
  const hasError = useAppSelector(selectChatError);
  const abortControllers = useAbortControllers();

  const [triggerGetTools] = useGetToolsLazyQuery();
  const [triggerCheckForConfirmation] = useCheckForConfirmationMutation();

  const chatId = useAppSelector(selectChatId);
  const streaming = useAppSelector(selectIsStreaming);
  const chatError = useAppSelector(selectChatError);

  const errored: boolean = !!hasError || !!chatError;
  const preventSend = useAppSelector(selectPreventSend);
  const isWaiting = useAppSelector(selectIsWaiting);

  const currentMessages = useAppSelector(selectMessages);
  const systemPrompt = useAppSelector(getSelectedSystemPrompt);
  const sendImmediately = useAppSelector(selectSendImmediately);
  const toolUse = useAppSelector(selectToolUse);

  const areToolsConfirmed = useAppSelector(getToolsConfirmationStatus);

  const messagesWithSystemPrompt = useMemo(() => {
    const prompts = Object.entries(systemPrompt);
    if (prompts.length === 0) return currentMessages;
    const [key, prompt] = prompts[0];
    if (key === "default") return currentMessages;
    if (currentMessages.length === 0) {
      const message: ChatMessage = { role: "system", content: prompt.text };
      return [message];
    }
    return currentMessages;
  }, [currentMessages, systemPrompt]);

  const sendMessages = useCallback(
    async (messages: ChatMessages) => {
      console.log(`[DEBUG]: sendMsssages()`);
      let tools = await triggerGetTools(undefined).unwrap();
      if (isToolUse(toolUse)) {
        dispatch(setToolUse(toolUse));
      }
      if (toolUse === "quick") {
        tools = [];
      } else if (toolUse === "explore") {
        tools = tools.filter((t) => !t.function.agentic);
      }
      tools = tools.map((t) => {
        const { agentic: _, ...remaining } = t.function;
        return { ...t, function: { ...remaining } };
      });

      console.log(`[DEBUG]: messages: `, messages);

      const lastMessage = messages.slice(-1)[0];
      console.log(`[DEBUG]: lastMessage: `, lastMessage);
      if (
        !isWaiting &&
        !areToolsConfirmed &&
        isAssistantMessage(lastMessage) &&
        lastMessage.tool_calls
      ) {
        const toolCalls = lastMessage.tool_calls;
        const confirmationResponse =
          await triggerCheckForConfirmation(toolCalls).unwrap();
        console.log(`[DEBUG]: confirmationResponse: `, confirmationResponse);
        if (confirmationResponse.pause) {
          dispatch(setPauseReasons(confirmationResponse.pause_reasons));
          return;
        }
      }

      dispatch(backUpMessages({ id: chatId, messages }));
      dispatch(chatAskedQuestion({ id: chatId }));

      const action = chatAskQuestionThunk({
        messages,
        tools,
        chatId,
      });

      const dispatchedAction = dispatch(action);
      abortControllers.addAbortController(chatId, dispatchedAction.abort);
    },
    [
      triggerGetTools,
      triggerCheckForConfirmation,
      toolUse,
      dispatch,
      chatId,
      abortControllers,
      areToolsConfirmed,
      isWaiting,
    ],
  );

  const submit = useCallback(
    (question: string) => {
      const message: ChatMessage = { role: "user", content: question };
      const messages = messagesWithSystemPrompt.concat(message);
      void sendMessages(messages);
    },
    [messagesWithSystemPrompt, sendMessages],
  );

  const abort = useCallback(() => {
    abortControllers.abort(chatId);
  }, [abortControllers, chatId]);

  useEffect(() => {
    console.log(`[DEBUG]: currentMessages updated: `, currentMessages);
  }, [currentMessages]);

  useEffect(() => {
    if (sendImmediately) {
      void sendMessages(messagesWithSystemPrompt);
    }
  }, [sendImmediately, sendMessages, messagesWithSystemPrompt]);

  // TODO: Automatically calls tool calls. This means that this hook can only be used once :/
  // TODO: Think how to rebuild this that in that way, that resubmitting won't call sendMessages() twice
  useEffect(() => {
    if (!streaming && currentMessages.length > 0 && !errored && !preventSend) {
      const lastMessage = currentMessages.slice(-1)[0];
      if (
        isAssistantMessage(lastMessage) &&
        lastMessage.tool_calls &&
        lastMessage.tool_calls.length > 0
      ) {
        console.log(
          `[DEBUG]: useEffect(): sending currentMessages...`,
          currentMessages,
        );
        if (!areToolsConfirmed) {
          console.log(
            `[DEBUG]: tools are not confirmed, aborting! counter: ${recallCounter}`,
          );
          abort();
          if (recallCounter < 1) {
            console.log(
              `[DEBUG]: counter is less than 1, return. counter: ${recallCounter}`,
            );
            recallCounter++;
            return;
          }
        }
        void sendMessages(currentMessages);
        recallCounter = 0;
      }
    }
  }, [
    errored,
    currentMessages,
    preventSend,
    sendMessages,
    abort,
    streaming,
    areToolsConfirmed,
  ]);

  const retry = useCallback(
    (messages: ChatMessages) => {
      abort();
      dispatch(clearPauseReasonsAndConfirmTools(false));
      void sendMessages(messages);
    },
    [abort, sendMessages, dispatch],
  );

  const confirmToolUsage = useCallback(() => {
    abort();
    dispatch(clearPauseReasonsAndConfirmTools(true));
  }, [abort, dispatch]);

  const retryFromIndex = useCallback(
    (index: number, question: string) => {
      const messagesToKeep = currentMessages.slice(0, index);
      const messagesToSend = messagesToKeep.concat([
        { role: "user", content: question },
      ]);
      console.log(`[DEBUG]: messagesToSend: `, messagesToSend);
      retry(messagesToSend);
    },
    [currentMessages, retry],
  );

  return {
    submit,
    abort,
    retry,
    retryFromIndex,
    confirmToolUsage,
  };
};
