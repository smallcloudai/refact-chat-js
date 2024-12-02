import React, { useCallback, useRef, useMemo } from "react";
import {
  ChatMessages,
  diffApi,
  isAssistantMessage,
  isChatContextFileMessage,
  isDiffMessage,
  isToolMessage,
  UserMessage,
} from "../../services/refact";
import { UserInput } from "./UserInput";
import { ScrollArea } from "../ScrollArea";
import { Spinner } from "../Spinner";
import { Flex, Text, Container, Link, Button } from "@radix-ui/themes";
import styles from "./ChatContent.module.css";
import { ContextFiles } from "./ContextFiles";
import { AssistantInput } from "./AssistantInput";
import { useAutoScroll } from "./useAutoScroll";
import { PlainText } from "./PlainText";
import { useAppDispatch, useConfig, useEventsBusForIDE } from "../../hooks";
import { useAppSelector } from "../../hooks";
import {
  selectIsStreaming,
  selectIsWaiting,
  selectMessages,
  selectThread,
} from "../../features/Chat/Thread/selectors";
import { takeWhile } from "../../utils";
import { GroupedDiffs } from "./DiffContent";
import { ScrollToBottomButton } from "./ScrollToBottomButton";
import { currentTipOfTheDay } from "../../features/TipOfTheDay";
import { popBackTo } from "../../features/Pages/pagesSlice";
import { ChatLinks } from "../ChatLinks";

const TipOfTheDay: React.FC = () => {
  const tip = useAppSelector(currentTipOfTheDay);

  return (
    <Text>
      💡 <b>Tip of the day</b>: {tip}
    </Text>
  );
};

const PlaceHolderText: React.FC = () => {
  const config = useConfig();
  const hasVecDB = config.features?.vecdb ?? false;
  const hasAst = config.features?.ast ?? false;
  const { openSettings } = useEventsBusForIDE();

  const handleOpenSettings = useCallback(
    (event: React.MouseEvent<HTMLAnchorElement>) => {
      event.preventDefault();
      openSettings();
    },
    [openSettings],
  );

  if (config.host === "web") {
    <Flex direction="column" gap="4">
      <Text>Welcome to Refact chat!</Text>;
      <TipOfTheDay />
    </Flex>;
  }

  if (!hasVecDB && !hasAst) {
    return (
      <Flex direction="column" gap="4">
        <Text>Welcome to Refact chat!</Text>
        <Text>
          💡 You can turn on VecDB and AST in{" "}
          <Link onClick={handleOpenSettings}>settings</Link>.
        </Text>
        <TipOfTheDay />
      </Flex>
    );
  } else if (!hasVecDB) {
    return (
      <Flex direction="column" gap="4">
        <Text>Welcome to Refact chat!</Text>
        <Text>
          💡 You can turn on VecDB in{" "}
          <Link onClick={handleOpenSettings}>settings</Link>.
        </Text>
        <TipOfTheDay />
      </Flex>
    );
  } else if (!hasAst) {
    return (
      <Flex direction="column" gap="4">
        <Text>Welcome to Refact chat!</Text>
        <Text>
          💡 You can turn on AST in{" "}
          <Link onClick={handleOpenSettings}>settings</Link>.
        </Text>
        <TipOfTheDay />
      </Flex>
    );
  }

  return (
    <Flex direction="column" gap="4">
      <Text>Welcome to Refact chat.</Text>
      <TipOfTheDay />
    </Flex>
  );
};

export type ChatContentProps = {
  onRetry: (index: number, question: UserMessage["content"]) => void;
  onStopStreaming: () => void;
};

export const ChatContent: React.FC<ChatContentProps> = ({
  onStopStreaming,
  onRetry,
}) => {
  const dispatch = useAppDispatch();
  const scrollRef = useRef<HTMLDivElement>(null);
  const messages = useAppSelector(selectMessages);
  const isStreaming = useAppSelector(selectIsStreaming);
  const thread = useAppSelector(selectThread);
  const isConfig = !!thread.integration;
  const isWaiting = useAppSelector(selectIsWaiting);
  const [applyAll, applyAllResult] =
    diffApi.useApplyAllPatchesInMessagesMutation();

  const hasPins = useMemo(
    () =>
      messages.some((message) => {
        if (!isAssistantMessage(message)) return false;
        if (!message.content) return false;
        return message.content
          .split("\n")
          .some((line) => line.startsWith("📍"));
      }),
    [messages],
  );

  const {
    handleScroll,
    handleWheel,
    handleScrollButtonClick,
    showFollowButton,
  } = useAutoScroll({
    scrollRef,
  });

  const onRetryWrapper = (index: number, question: UserMessage["content"]) => {
    onRetry(index, question);
  };

  const handleReturnToConfigurationClick = useCallback(() => {
    // eslint-disable-next-line no-console
    console.log(`[DEBUG]: going back to configuration page`);
    // TBD: should it be allowed to run in the background?
    onStopStreaming();
    dispatch(
      popBackTo({
        name: "integrations page",
        projectPath: thread.integration?.path,
        integrationName: thread.integration?.name,
      }),
    );
  }, [
    dispatch,
    thread.integration?.name,
    thread.integration?.path,
    onStopStreaming,
  ]);

  const handleSaveAndReturn = useCallback(async () => {
    const result = await applyAll(messages);
    if (!result.error) {
      handleReturnToConfigurationClick();
    }
  }, [applyAll, handleReturnToConfigurationClick, messages]);

  return (
    <ScrollArea
      ref={scrollRef}
      style={{ flexGrow: 1, height: "auto", position: "relative" }}
      scrollbars="vertical"
      onScroll={handleScroll}
      onWheel={handleWheel}
      type={isWaiting || isStreaming ? "auto" : "hover"}
    >
      <Flex direction="column" className={styles.content} p="2" gap="1">
        {messages.length === 0 && <PlaceHolderText />}
        {renderMessages(messages, onRetryWrapper)}
        {/** isConfig could be calculate in ChatLinks */}
        {isConfig && <ChatLinks />}
        <Container py="4">
          <Spinner spinning={isWaiting} />
        </Container>
      </Flex>
      {showFollowButton && (
        <ScrollToBottomButton onClick={handleScrollButtonClick} />
      )}

      <Flex gap="3" style={{ position: "absolute", bottom: 15 }}>
        {isStreaming && (
          <Button
            ml="auto"
            color="red"
            title="stop streaming"
            onClick={onStopStreaming}
          >
            Stop
          </Button>
        )}
        {isConfig && (
          <Button
            ml="auto"
            color="gray"
            title="Return to configuration page"
            onClick={handleReturnToConfigurationClick}
          >
            Return
          </Button>
        )}

        {isConfig && hasPins && (
          <Button
            ml="auto"
            color="green"
            title="Save and return"
            disabled={isStreaming || applyAllResult.isLoading}
            onClick={() => {
              void handleSaveAndReturn();
            }}
          >
            Save
          </Button>
        )}
      </Flex>
    </ScrollArea>
  );
};

ChatContent.displayName = "ChatContent";

function renderMessages(
  messages: ChatMessages,
  onRetry: (index: number, question: UserMessage["content"]) => void,
  memo: React.ReactNode[] = [],
  index = 0,
) {
  if (messages.length === 0) return memo;
  const [head, ...tail] = messages;
  if (head.role === "tool") {
    return renderMessages(tail, onRetry, memo, index + 1);
  }

  if (head.role === "plain_text") {
    const key = "plain-text-" + index;
    const nextMemo = [...memo, <PlainText key={key}>{head.content}</PlainText>];
    return renderMessages(tail, onRetry, nextMemo, index + 1);
  }

  if (head.role === "assistant") {
    const key = "assistant-input-" + index;
    const nextMemo = [
      ...memo,
      <AssistantInput
        key={key}
        message={head.content}
        toolCalls={head.tool_calls}
      />,
    ];

    return renderMessages(tail, onRetry, nextMemo, index + 1);
  }

  if (head.role === "user") {
    const key = "user-input-" + index;

    const nextMemo = [
      ...memo,
      <UserInput onRetry={onRetry} key={key} messageIndex={index}>
        {head.content}
      </UserInput>,
    ];
    return renderMessages(tail, onRetry, nextMemo, index + 1);
  }

  if (isChatContextFileMessage(head)) {
    const key = "context-file-" + index;
    const nextMemo = [...memo, <ContextFiles key={key} files={head.content} />];
    return renderMessages(tail, onRetry, nextMemo, index + 1);
  }

  if (isDiffMessage(head)) {
    const restInTail = takeWhile(tail, (message) => {
      return isDiffMessage(message) || isToolMessage(message);
    });

    const nextTail = tail.slice(restInTail.length);
    const diffMessages = [head, ...restInTail.filter(isDiffMessage)];
    const key = "diffs-" + index;

    const nextMemo = [...memo, <GroupedDiffs key={key} diffs={diffMessages} />];

    return renderMessages(
      nextTail,
      onRetry,
      nextMemo,
      index + diffMessages.length,
    );
  }

  return renderMessages(tail, onRetry, memo, index + 1);
}
