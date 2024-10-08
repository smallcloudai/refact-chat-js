import React, { useCallback, useState } from "react";
import { Text, Container, Button, Flex, IconButton } from "@radix-ui/themes";
import { Markdown } from "../Markdown";
import { RetryForm } from "../ChatForm";
import styles from "./ChatContent.module.css";
import { Pencil2Icon } from "@radix-ui/react-icons";

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
  children: string;
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
  const [showTextArea, setShowTextArea] = useState(false);
  const ref = React.useRef<HTMLButtonElement>(null);
  const handleSubmit = useCallback(
    (value: string) => {
      onRetry(messageIndex, value);
      setShowTextArea(false);
    },
    [messageIndex, onRetry],
  );

  const handleShowTextArea = (value: boolean) => {
    setShowTextArea(value);
  };

  const handleEditClick = () => {
    const selection = window.getSelection();
    if (selection?.type !== "Range") {
      setShowTextArea(true);
    }
  };

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
        <Flex direction="row" gap="2" align="end" my="1">
          <Button
            ref={ref}
            variant="soft"
            size="4"
            className={styles.userInput}
            asChild
          >
            <div>{elements}</div>
          </Button>
          <IconButton
            title="Edit message"
            variant="ghost"
            size="4"
            onClick={handleEditClick}
            mx="2"
            my="3"
          >
            <Pencil2Icon width={15} height={15} />
          </IconButton>
        </Flex>
      )}
    </Container>
  );
};
