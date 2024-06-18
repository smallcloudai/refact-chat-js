import React, { useCallback, useMemo } from "react";
import {
  ChatMessages,
  ToolResult,
  isChatContextFileMessage,
  isToolMessage,
} from "../../services/refact";
import type { MarkdownProps } from "../Markdown";
import { UserInput } from "./UserInput";
import { ScrollArea } from "../ScrollArea";
import { Spinner } from "../Spinner";
import { Flex, Text } from "@radix-ui/themes";
import styles from "./ChatContent.module.css";
import { ContextFiles } from "./ContextFiles";
import { AssistantInput } from "./AssistantInput";
import { MemoryContent } from "./MemoryContent";
import { useAutoScroll } from "./useAutoScroll";
import { takeWhile } from "../../utils";

const PlaceHolderText: React.FC = () => (
  <Text>Welcome to Refact chat! How can I assist you today?</Text>
);

export type ChatContentProps = {
  messages: ChatMessages;
  onRetry: (question: ChatMessages) => void;
  isWaiting: boolean;
  canPaste: boolean;
  isStreaming: boolean;
} & Pick<MarkdownProps, "onNewFileClick" | "onPasteClick">;

export const ChatContent = React.forwardRef<HTMLDivElement, ChatContentProps>(
  (props, ref) => {
    const {
      messages,
      onRetry,
      isWaiting,
      onNewFileClick,
      onPasteClick,
      canPaste,
      isStreaming,
    } = props;

    const { innerRef, handleScroll } = useAutoScroll({
      ref,
      messages,
      isStreaming,
    });

    const handleRetry = useCallback(
      (count: number, question: string) => {
        const toSend = messages.slice(0, count).concat([["user", question]]);
        onRetry(toSend);
      },
      [messages, onRetry],
    );

    const elements = useMemo(
      () =>
        groupMessages(
          messages,
          handleRetry,
          isStreaming,
          isWaiting,
          onNewFileClick,
          onPasteClick,
          canPaste,
        ),
      [
        canPaste,
        handleRetry,
        isStreaming,
        isWaiting,
        messages,
        onNewFileClick,
        onPasteClick,
      ],
    );

    return (
      <ScrollArea
        style={{ flexGrow: 1, height: "auto" }}
        scrollbars="vertical"
        onScroll={handleScroll}
      >
        <Flex direction="column" className={styles.content} p="2" gap="2">
          {elements.length === 0 && <PlaceHolderText />}
          {elements}
          {isWaiting && <Spinner />}
          <div ref={innerRef} />
        </Flex>
      </ScrollArea>
    );
  },
);

ChatContent.displayName = "ChatContent";

function groupMessages(
  messages: ChatMessages,
  onRetry: (messageIndex: number, question: string) => void,
  isStreaming: boolean,
  isWaiting: boolean,
  onNewFileClick: MarkdownProps["onNewFileClick"],
  onPasteClick: MarkdownProps["onNewFileClick"],
  canPaste: boolean,
  memo: JSX.Element[] = [],
  toolCallsMap: Record<string, ToolResult> = {},
  count = 0,
): JSX.Element[] {
  if (messages.length === 0) return memo;
  const [head, ...tail] = messages;

  const key = `message-${head[0]}-${memo.length}`;

  const nextCall = (
    m: ChatMessages,
    p: JSX.Element[],
    toolCalls = toolCallsMap,
    nextCount = count + 1,
  ): JSX.Element[] =>
    groupMessages(
      m,
      onRetry,
      isStreaming,
      isWaiting,
      onNewFileClick,
      onPasteClick,
      canPaste,
      p,
      toolCalls,
      nextCount,
    );

  if (isToolMessage(head)) {
    const result = head[1];
    const toolCalls = { ...toolCallsMap, [result.tool_call_id]: result };

    return nextCall(tail, memo, toolCalls);
  }

  if (isChatContextFileMessage(head)) {
    const [, files] = head;
    const processed = memo.concat(<ContextFiles key={key} files={files} />);
    return nextCall(tail, processed);
  }

  if (head[0] === "context_memory") {
    const proccesed = memo.concat(<MemoryContent key={key} items={head[1]} />);
    return nextCall(tail, proccesed);
  }

  if (head[0] === "user") {
    const text = head[1];
    const proccesed = memo.concat(
      <UserInput
        onRetry={(question) => onRetry(count, question)}
        key={key}
        disableRetry={isStreaming || isWaiting}
      >
        {text}
      </UserInput>,
    );

    return nextCall(tail, proccesed);
  }

  if (head[0] === "assistant") {
    const text = head[1];
    const tools = head[2];

    const nextContextOrToolMessages = takeWhile(
      tail,
      (message) => message[0] === "context_file" || message[0] === "tool",
    );
    const nextTail = tail.slice(nextContextOrToolMessages.length);
    const nextCount = count + nextContextOrToolMessages.length;
    const proccesed = memo.concat(
      <AssistantInput
        onNewFileClick={onNewFileClick}
        onPasteClick={onPasteClick}
        canPaste={canPaste}
        key={key}
        message={text}
        toolCalls={tools}
        auxMessages={nextContextOrToolMessages}
      />,
    );

    return nextCall(nextTail, proccesed, toolCallsMap, nextCount);
  }

  return nextCall(tail, memo);
}
