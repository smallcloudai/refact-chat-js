import React, { useCallback, useEffect, useState } from "react";
import { ChatForm, ChatFormProps } from "../ChatForm";
import { ChatContent } from "../ChatContent";
import { Flex, Button, Text, Card } from "@radix-ui/themes";
import {
  useAppSelector,
  useAppDispatch,
  useSendChatRequest,
  useAutoSend,
  useGetCapsQuery,
  useCapsForToolUse,
  useAgentUsage,
} from "../../hooks";
import { type Config } from "../../features/Config/configSlice";
import {
  enableSend,
  selectIsStreaming,
  selectIsWaiting,
  selectPreventSend,
  selectChatId,
  selectMessages,
  getSelectedToolUse,
} from "../../features/Chat/Thread";
import { ThreadHistoryButton } from "../Buttons";
import { push } from "../../features/Pages/pagesSlice";
import { DropzoneProvider } from "../Dropzone";
import { AgentUsage } from "../../features/AgentUsage";
import { setInformation } from "../../features/Errors/informationSlice";

export type ChatProps = {
  host: Config["host"];
  tabbed: Config["tabbed"];
  backFromChat: () => void;
  style?: React.CSSProperties;
  unCalledTools: boolean;
  maybeSendToSidebar: ChatFormProps["onClose"];
};

export const Chat: React.FC<ChatProps> = ({
  style,
  unCalledTools,
  maybeSendToSidebar,
}) => {
  const [isViewingRawJSON, setIsViewingRawJSON] = useState(false);
  const isStreaming = useAppSelector(selectIsStreaming);
  const isWaiting = useAppSelector(selectIsWaiting);
  const caps = useGetCapsQuery();

  const chatId = useAppSelector(selectChatId);
  const { submit, abort, retryFromIndex } = useSendChatRequest();

  const chatToolUse = useAppSelector(getSelectedToolUse);
  const dispatch = useAppDispatch();
  const messages = useAppSelector(selectMessages);
  const capsForToolUse = useCapsForToolUse();
  const { disableInput } = useAgentUsage();

  const [isDebugChatHistoryVisible, setIsDebugChatHistoryVisible] =
    useState(false);

  const preventSend = useAppSelector(selectPreventSend);
  const onEnableSend = () => {
    if (disableInput) {
      const action = setInformation(
        "You have exceeded the FREE usage limit, upgrade to PRO or switch to EXPLORE mode.",
      );
      dispatch(action);
      return;
    }
    dispatch(enableSend({ id: chatId }));
  };

  const handleSummit = useCallback(
    (value: string) => {
      submit({ question: value });
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

        <AgentUsage />
        {!isStreaming && preventSend && unCalledTools && (
          <Flex py="4">
            <Card style={{ width: "100%" }}>
              <Flex direction="column" align="center" gap="2" width="100%">
                Chat was interrupted with uncalled tools calls.
                <Button onClick={onEnableSend} disabled={disableInput}>
                  Resume
                </Button>
              </Flex>
            </Card>
          </Flex>
        )}

        <ChatForm
          key={chatId} // TODO: think of how can we not trigger re-render on chatId change (checkboxes)
          onSubmit={handleSummit}
          onClose={maybeSendToSidebar}
        />

        <Flex justify="between" pl="1" pr="1" pt="1">
          {/* Two flexboxes are left for the future UI element on the right side */}
          {messages.length > 0 && (
            <Flex align="center" justify="between" width="100%">
              <Flex align="center" gap="1">
                <Text size="1">
                  model:{" "}
                  {capsForToolUse.currentModel ||
                    caps.data?.code_chat_default_model}{" "}
                </Text>{" "}
                •{" "}
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
