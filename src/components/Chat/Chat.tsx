import React, { useCallback, useEffect, useState } from "react";
import { ChatForm, ChatFormProps } from "../ChatForm";
import { ChatContent } from "../ChatContent";
import { Flex, Button, Text, Container, Card } from "@radix-ui/themes";
import {
  useAppSelector,
  useAppDispatch,
  useSendChatRequest,
  useGetPromptsQuery,
  useAutoSend,
} from "../../hooks";
import type { Config } from "../../features/Config/configSlice";
import {
  enableSend,
  getSelectedChatModel,
  selectIsStreaming,
  selectIsWaiting,
  setChatModel,
  selectPreventSend,
  selectChatId,
  selectMessages,
  getSelectedToolUse,
  getSelectedSystemPrompt,
  setSystemPrompt,
  ToolUse,
} from "../../features/Chat/Thread";
import { ThreadHistoryButton } from "../Buttons";
import { push } from "../../features/Pages/pagesSlice";
import { DropzoneProvider } from "../Dropzone";
import { CodeChatModel, SystemPrompts } from "../../services/refact";

export type ChatProps = {
  host: Config["host"];
  tabbed: Config["tabbed"];
  backFromChat: () => void;
  style?: React.CSSProperties;
  unCalledTools: boolean;
  // TODO: update this
  caps: ChatFormProps["caps"];
  maybeSendToSidebar: ChatFormProps["onClose"];
};

export const Chat: React.FC<ChatProps> = ({
  style,
  unCalledTools,
  caps,
  maybeSendToSidebar,
}) => {
  const [isViewingRawJSON, setIsViewingRawJSON] = useState(false);
  const isStreaming = useAppSelector(selectIsStreaming);
  const isWaiting = useAppSelector(selectIsWaiting);

  const chatId = useAppSelector(selectChatId);
  const { submit, abort, retryFromIndex, confirmToolUsage } =
    useSendChatRequest();
  const chatModel = useAppSelector(getSelectedChatModel);
  const chatToolUse = useAppSelector(getSelectedToolUse);
  const dispatch = useAppDispatch();
  const messages = useAppSelector(selectMessages);

  const promptsRequest = useGetPromptsQuery();
  const selectedSystemPrompt = useAppSelector(getSelectedSystemPrompt);
  const onSetSelectedSystemPrompt = (prompt: SystemPrompts) =>
    dispatch(setSystemPrompt(prompt));
  const [isDebugChatHistoryVisible, setIsDebugChatHistoryVisible] =
    useState(false);

  const onSetChatModel = useCallback(
    (value: string) => {
      const model = caps.default_cap === value ? "" : value;
      dispatch(setChatModel(model));
    },
    [caps.default_cap, dispatch],
  );
  const preventSend = useAppSelector(selectPreventSend);
  const onEnableSend = () => dispatch(enableSend({ id: chatId }));

  const handleSummit = useCallback(
    (value: string) => {
      submit(value);
      if (isViewingRawJSON) {
        setIsViewingRawJSON(false);
      }
    },
    [submit, isViewingRawJSON],
  );

  const focusTextarea = useCallback(() => {
    const textarea = document.querySelector<HTMLTextAreaElement>(
      '[data-testid="chat-form-textarea"]',
    );
    if (textarea) {
      textarea.focus();
    }
  }, []);

  const handleThreadHistoryPage = useCallback(() => {
    dispatch(push({ name: "thread history page", chatId }));
  }, [chatId, dispatch]);

  useEffect(() => {
    if (!isWaiting && !isStreaming) {
      focusTextarea();
    }
  }, [isWaiting, isStreaming, focusTextarea]);

  useAutoSend();

  // TODO: ideally this could be set when the chat is created.
  useEffect(() => {
    if (chatToolUse === "agent" && !modelSupportsAgent(chatModel)) {
      const modelToUse = modelForMode(chatModel, caps, chatToolUse);
      onSetChatModel(modelToUse);
    }
  }, [caps, chatModel, chatToolUse, onSetChatModel]);

  return (
    <DropzoneProvider asChild>
      <Flex
        style={style}
        direction="column"
        flexGrow="1"
        width="100%"
        overflowY="auto"
        justify="between"
        px="1"
      >
        <ChatContent
          key={`chat-content-${chatId}`}
          onRetry={retryFromIndex}
          onStopStreaming={abort}
        />
        {!isStreaming && preventSend && unCalledTools && (
          <Container py="4" bottom="0" style={{ justifyContent: "flex-end" }}>
            <Card>
              <Flex direction="column" align="center" gap="2">
                Chat was interrupted with uncalled tools calls.
                <Button onClick={onEnableSend}>Resume</Button>
              </Flex>
            </Card>
          </Container>
        )}

        <ChatForm
          key={chatId} // TODO: think of how can we not trigger re-render on chatId change (checkboxes)
          chatId={chatId}
          isStreaming={isStreaming}
          showControls={messages.length === 0 && !isStreaming}
          onSubmit={handleSummit}
          model={chatModel}
          onSetChatModel={onSetChatModel}
          caps={{
            ...caps,
            available_caps: capOptionsForMode(caps.available_caps, chatToolUse),
          }}
          onClose={maybeSendToSidebar}
          prompts={promptsRequest.data ?? {}}
          onSetSystemPrompt={onSetSelectedSystemPrompt}
          selectedSystemPrompt={selectedSystemPrompt}
          onToolConfirm={confirmToolUsage}
        />

        <Flex justify="between" pl="1" pr="1" pt="1">
          {/* Two flexboxes are left for the future UI element on the right side */}
          {messages.length > 0 && (
            <Flex align="center" justify="between" width="100%">
              <Flex align="center" gap="1">
                <Text size="1">model: {chatModel || caps.default_cap} </Text> •{" "}
                <Text
                  size="1"
                  onClick={() => setIsDebugChatHistoryVisible((prev) => !prev)}
                >
                  mode: {chatToolUse}{" "}
                </Text>
              </Flex>
              {messages.length !== 0 &&
                !isStreaming &&
                isDebugChatHistoryVisible && (
                  <ThreadHistoryButton
                    title="View history of current thread"
                    size="1"
                    onClick={handleThreadHistoryPage}
                  />
                )}
            </Flex>
          )}
        </Flex>
      </Flex>
    </DropzoneProvider>
  );
};

const AGENT_ALLOW_LIST = ["gpt-4o", "claude-3-5-sonnet"];
function modelForMode(
  model: string,
  caps: ChatFormProps["caps"],
  toolUse?: ToolUse,
) {
  if (toolUse !== "agent") return model;

  if (AGENT_ALLOW_LIST.includes(model)) return model;

  const available = Object.keys(caps.available_caps);

  const hasModels = AGENT_ALLOW_LIST.find((agent) => available.includes(agent));
  if (hasModels) return hasModels;

  return model || caps.default_cap;
}

function modelSupportsAgent(model: string) {
  return AGENT_ALLOW_LIST.includes(model);
}

function capOptionsForMode(
  caps: Record<string, CodeChatModel>,
  toolUse?: string,
) {
  if (toolUse !== "agent") return caps;
  const agentEntries = Object.entries(caps).filter(([key]) =>
    AGENT_ALLOW_LIST.includes(key),
  );

  if (agentEntries.length === 0) return caps;

  return Object.fromEntries(agentEntries);
}
