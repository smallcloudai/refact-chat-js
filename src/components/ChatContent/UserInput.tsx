import React, { useCallback, useState } from "react";
import {
  Text,
  Container,
  Button,
  Flex,
  IconButton,
  // Inset,
  // Card,
  Avatar,
} from "@radix-ui/themes";
import { Markdown } from "../Markdown";
import { RetryForm } from "../ChatForm";
import styles from "./ChatContent.module.css";
import { Pencil2Icon } from "@radix-ui/react-icons";
import {
  ProcessedUserMessageContentWithImages,
  UserMessageContentWithImage,
  type UserMessage,
} from "../../services/refact";

function processLines(
  lines: string[],
  processedLinesMemo: JSX.Element[] = [],
): JSX.Element[] {
  if (lines.length === 0) return processedLinesMemo;

  const [head, ...tail] = lines;
  const nextBackTicksIndex = tail.findIndex((l) => l.startsWith("```"));
  const key = `line-${processedLinesMemo.length + 1}`;

  if (!head.startsWith("```") || nextBackTicksIndex === -1) {
    const processedLines = processedLinesMemo.concat(
      <Text
        size="2"
        as="div"
        key={key}
        wrap="balance"
        className={styles.break_word}
      >
        {head}
      </Text>,
    );
    return processLines(tail, processedLines);
  }

  const endIndex = nextBackTicksIndex + 1;

  const code = [head].concat(tail.slice(0, endIndex)).join("\n");
  const processedLines = processedLinesMemo.concat(
    <Markdown key={key}>{code}</Markdown>,
  );

  const next = tail.slice(endIndex);
  return processLines(next, processedLines);
}

export type UserInputProps = {
  children: UserMessage["content"];
  messageIndex: number;
  onRetry: (index: number, question: string) => void;
  // disableRetry?: boolean;
};

export const UserInput: React.FC<UserInputProps> = ({
  messageIndex,
  children,
  onRetry,
}) => {
  // const { retryFromIndex } = useSendChatRequest();

  // TODO: handle other types
  if (typeof children !== "string") {
    return <RenderUserInputArray>{children}</RenderUserInputArray>;
  }

  return (
    <RenderUserInputString messageIndex={messageIndex} onRetry={onRetry}>
      {children}
    </RenderUserInputString>
  );
};

const RenderUserInputString: React.FC<
  Omit<UserInputProps, "children"> & { children: string }
> = ({ messageIndex, children, onRetry }) => {
  // const { retryFromIndex } = useSendChatRequest();
  const [showTextArea, setShowTextArea] = useState(false);
  const [isEditButtonVisible, setIsEditButtonVisible] = useState(false);
  // const ref = React.useRef<HTMLButtonElement>(null);

  const handleSubmit = useCallback(
    (value: string) => {
      onRetry(messageIndex, value);
      setShowTextArea(false);
    },
    [messageIndex, onRetry],
  );

  const handleShowTextArea = useCallback(
    (value: boolean) => {
      setShowTextArea(value);
      if (isEditButtonVisible) {
        setIsEditButtonVisible(false);
      }
    },
    [isEditButtonVisible],
  );

  const lines = children.split("\n");
  const elements = processLines(lines);

  return (
    <Container position="relative" pt="1">
      {showTextArea ? (
        <RetryForm
          onSubmit={handleSubmit}
          value={children}
          onClose={() => handleShowTextArea(false)}
        />
      ) : (
        <Flex
          direction="row"
          // checking for the length of the lines to determine the position of the edit button
          gap={lines.length <= 2 ? "2" : "1"}
          align={lines.length <= 2 ? "center" : "end"}
          my="1"
          onMouseEnter={() => setIsEditButtonVisible(true)}
          onMouseLeave={() => setIsEditButtonVisible(false)}
        >
          <Button
            // ref={ref}
            variant="soft"
            size="4"
            className={styles.userInput}
            // onClick={() => handleShowTextArea(true)}
            asChild
          >
            <div>{elements}</div>
          </Button>
          <IconButton
            title="Edit message"
            variant="soft"
            size={"2"}
            onClick={() => handleShowTextArea(true)}
            style={{
              opacity: isEditButtonVisible ? 1 : 0,
              visibility: isEditButtonVisible ? "visible" : "hidden",
              transition: "opacity 0.15s, visibility 0.15s",
            }}
          >
            <Pencil2Icon width={15} height={15} />
          </IconButton>
        </Flex>
      )}
    </Container>
  );
};

type UserInputArray =
  | UserMessageContentWithImage[]
  | ProcessedUserMessageContentWithImages[];

const RenderUserInputArray: React.FC<{ children: UserInputArray }> = ({
  children,
}) => {
  const items = children.map((child, index) => {
    if ("type" in child && child.type === "text") {
      const key = `user-input-${child.type}-${index}`;
      return <div key={key}>{processLines(child.text.split("\n"))}</div>;
    }

    if ("m_type" in child && child.m_type === "text") {
      const key = `user-input-${child.m_type}-${index}`;
      return <div key={key}>{processLines(child.m_content.split("\n"))}</div>;
    }

    // TODO: use takeWhile to group images in a flex

    if ("m_type" in child && child.m_type.startsWith("image/")) {
      const key = `user-input-${child.m_type}-${index}`;
      const base64string = `data:${child.m_type};base64,${child.m_content}`;
      return <Avatar key={key} src={base64string} fallback="" size="8" />;
    }

    // TODO: there could be other types
    // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
    if ("type" in child && child.type === "image_url") {
      const key = `user-input-${child.type}-${index}`;
      const base64string = child.image_url.url;
      return <Avatar key={key} src={base64string} fallback="" size="8" />;
    }

    // TODO: handle images

    return null;
  });
  return (
    <Container position="relative" pt="1">
      <Flex direction="column">{items}</Flex>
    </Container>
  );
};
