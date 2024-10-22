import { useCallback, useEffect, useMemo } from "react";
import { useAppDispatch } from "./useAppDispatch";
import { useAppSelector } from "./useAppSelector";
import {
  getSelectedSystemPrompt,
  selectChatError,
  selectChatId,
  selectIsStreaming,
  selectMessages,
  selectPreventSend,
  selectSendImmediately,
  selectToolUse,
} from "../features/Chat/Thread/selectors";
import { useGetToolsLazyQuery } from "./useGetToolsQuery";
import {
  ChatMessage,
  ChatMessages,
  isAssistantMessage,
  UserMessage,
  UserMessageContentWithImage,
} from "../services/refact/types";
import {
  backUpMessages,
  chatAskQuestionThunk,
  chatAskedQuestion,
  setToolUse,
} from "../features/Chat/Thread/actions";
import { isToolUse } from "../features/Chat";
import { useAbortControllers } from "./useAbortControllers";
import { selectAllImages } from "../features/AttachedImages";

export const useSendChatRequest = () => {
  const dispatch = useAppDispatch();
  const hasError = useAppSelector(selectChatError);
  const abortControllers = useAbortControllers();

  const [triggerGetTools] = useGetToolsLazyQuery();

  const chatId = useAppSelector(selectChatId);
  const streaming = useAppSelector(selectIsStreaming);
  const chatError = useAppSelector(selectChatError);

  const errored: boolean = !!hasError || !!chatError;
  const preventSend = useAppSelector(selectPreventSend);

  const currentMessages = useAppSelector(selectMessages);
  const systemPrompt = useAppSelector(getSelectedSystemPrompt);
  const sendImmediately = useAppSelector(selectSendImmediately);
  const toolUse = useAppSelector(selectToolUse);
  const attachedImages = useAppSelector(selectAllImages);

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
    [triggerGetTools, toolUse, dispatch, chatId, abortControllers],
  );

  const maybeAddImagesToQuestion = useCallback(
    (question: string): UserMessage => {
      if (attachedImages.length === 0)
        return { role: "user" as const, content: question };

      const images = attachedImages.reduce<UserMessageContentWithImage[]>(
        (acc, image) => {
          if (typeof image.content !== "string") return acc;
          return acc.concat({
            type: "image_url",
            image_url: { url: image.content },
          });
        },
        [],
      );

      if (images.length === 0) return { role: "user", content: question };

      return {
        role: "user",
        content: [{ type: "text", text: question }, ...images],
      };
    },
    [attachedImages],
  );

  const submit = useCallback(
    (question: string) => {
      // const message: ChatMessage = { role: "user", content: question };
      const message: UserMessage = maybeAddImagesToQuestion(question);
      const messages = messagesWithSystemPrompt.concat(message);
      void sendMessages(messages);
    },
    [maybeAddImagesToQuestion, messagesWithSystemPrompt, sendMessages],
  );

  useEffect(() => {
    if (sendImmediately) {
      void sendMessages(messagesWithSystemPrompt);
    }
  }, [sendImmediately, sendMessages, messagesWithSystemPrompt]);

  // TODO: Automatically calls tool calls. This means that this hook can only be used once :/
  useEffect(() => {
    if (!streaming && currentMessages.length > 0 && !errored && !preventSend) {
      const lastMessage = currentMessages.slice(-1)[0];
      if (
        isAssistantMessage(lastMessage) &&
        lastMessage.tool_calls &&
        lastMessage.tool_calls.length > 0
      ) {
        void sendMessages(currentMessages);
      }
    }
  }, [errored, currentMessages, preventSend, sendMessages, streaming]);

  const abort = useCallback(() => {
    abortControllers.abort(chatId);
  }, [abortControllers, chatId]);

  const retry = useCallback(
    (messages: ChatMessages) => {
      abort();
      void sendMessages(messages);
    },
    [abort, sendMessages],
  );

  const retryFromIndex = useCallback(
    (index: number, question: string) => {
      const messagesToKeep = currentMessages.slice(0, index);
      const messagesToSend = messagesToKeep.concat([
        { role: "user", content: question },
      ]);
      retry(messagesToSend);
    },
    [currentMessages, retry],
  );

  return {
    submit,
    abort,
    retry,
    retryFromIndex,
  };
};
