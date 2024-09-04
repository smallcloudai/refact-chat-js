import React, { useCallback, useEffect } from "react";
import {
  ChatMessages,
  ToolResult,
  isChatContextFileMessage,
  isDiffMessage,
  isToolMessage,
} from "../../services/refact";
import type { MarkdownProps } from "../Markdown";
import { UserInput } from "./UserInput";
import { ScrollArea } from "../ScrollArea";
import { Spinner } from "../Spinner";
import { Flex, Text, Container, Link } from "@radix-ui/themes";
import styles from "./ChatContent.module.css";
import { ContextFiles } from "./ContextFiles";
import { AssistantInput } from "./AssistantInput";
import { MemoryContent } from "./MemoryContent";
import { useAutoScroll } from "./useAutoScroll";
import { DiffContent } from "./DiffContent";
import { PlainText } from "./PlainText";
import { useConfig } from "../../hooks";
import { useAppSelector, useAppDispatch } from "../../hooks";
import { RootState } from "../../app/store";
import { next } from "../../features/TipOfTheDay";
import { selectMessages } from "../../features/Chat/Thread/selectors";

export const TipOfTheDay: React.FC = () => {
  const dispatch = useAppDispatch();
  const config = useConfig();
  const state = useAppSelector((state: RootState) => state.tipOfTheDay);

  // TODO: find out what this is about.
  useEffect(() => {
    dispatch(next(config));
  }, [dispatch, config]);

  return (
    <Text>
      💡 <b>Tip of the day</b>: {state.tip}
    </Text>
  );
};

const PlaceHolderText: React.FC<{ onClick: () => void }> = ({ onClick }) => {
  const config = useConfig();
  const hasVecDB = config.features?.vecdb ?? false;
  const hasAst = config.features?.ast ?? false;

  const openSettings = useCallback(
    (event: React.MouseEvent<HTMLAnchorElement>) => {
      event.preventDefault();
      onClick();
    },
    [onClick],
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
          <Link onClick={openSettings}>settings</Link>.
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
          <Link onClick={openSettings}>settings</Link>.
        </Text>
        <TipOfTheDay />
      </Flex>
    );
  } else if (!hasAst) {
    return (
      <Flex direction="column" gap="4">
        <Text>Welcome to Refact chat!</Text>
        <Text>
          💡 You can turn on AST in <Link onClick={openSettings}>settings</Link>
          .
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
  // messages: ChatMessages;
  onRetry: (question: ChatMessages) => void;
  isWaiting: boolean;
  canPaste: boolean;
  isStreaming: boolean;
  openSettings: () => void;
  chatKey: string;
  onOpenFile: (file: { file_name: string; line?: number }) => void;
} & Pick<MarkdownProps, "onNewFileClick" | "onPasteClick">;

export const ChatContent = React.forwardRef<HTMLDivElement, ChatContentProps>(
  (props, ref) => {
    const {
      // messages,
      onRetry,
      isWaiting,
      onNewFileClick,
      onPasteClick,
      canPaste,
      isStreaming,
      openSettings,
      chatKey,
      onOpenFile,
    } = props;

    const messages = useAppSelector(selectMessages);

    const { innerRef, handleScroll } = useAutoScroll({
      ref,
      messages,
      isStreaming,
    });

    const toolResultsMap = React.useMemo(() => {
      return messages.reduce<Record<string, ToolResult>>((acc, message) => {
        if (!isToolMessage(message)) return acc;
        const result = message.content;
        return {
          ...acc,
          [result.tool_call_id]: result,
        };
      }, {});
    }, [messages]);

    return (
      <ScrollArea
        style={{ flexGrow: 1, height: "auto" }}
        scrollbars="vertical"
        onScroll={handleScroll}
      >
        <Flex direction="column" className={styles.content} p="2" gap="1">
          {messages.length === 0 && <PlaceHolderText onClick={openSettings} />}
          {messages.map((message, index) => {
            if (isChatContextFileMessage(message)) {
              const key = chatKey + "context-file-" + index;
              return (
                <ContextFiles
                  key={key}
                  files={message.content}
                  onOpenFile={onOpenFile}
                />
              );
            }

            if (isDiffMessage(message)) {
              const key = `diff-${message.tool_call_id}-${index}`;
              return (
                <DiffContent
                  key={key}
                  chunks={message.content}
                  toolCallId={message.tool_call_id}
                />
              );
            }

            // const [role, text] = message;

            if (message.role === "user") {
              const key = chatKey + "user-input-" + index;
              const handleRetry = (question: string) => {
                const toSend = messages
                  .slice(0, index)
                  .concat([{ role: "user", content: question }]);
                onRetry(toSend);
              };
              return (
                <UserInput
                  onRetry={handleRetry}
                  key={key}
                  disableRetry={isStreaming || isWaiting}
                >
                  {message.content}
                </UserInput>
              );
            } else if (message.role === "assistant") {
              const key = chatKey + "assistant-input-" + index;
              return (
                <AssistantInput
                  onNewFileClick={onNewFileClick}
                  onPasteClick={onPasteClick}
                  canPaste={canPaste}
                  key={key}
                  message={message.content}
                  toolCalls={message.tool_calls}
                  toolResults={toolResultsMap}
                />
              );
            } else if (message.role === "tool") {
              return null;
            } else if (message.role === "context_memory") {
              const key = chatKey + "context-memory-" + index;
              return <MemoryContent key={key} items={message.content} />;
            } else if (message.role === "plain_text") {
              const key = chatKey + "plain-text-" + index;
              return <PlainText key={key}>{message.content}</PlainText>;
            } else {
              return null;
              // return <Markdown key={index}>{text}</Markdown>;
            }
          })}
          {isWaiting && (
            <Container py="4">
              <Spinner />
            </Container>
          )}
          <div ref={innerRef} />
        </Flex>
      </ScrollArea>
    );
  },
);

ChatContent.displayName = "ChatContent";
