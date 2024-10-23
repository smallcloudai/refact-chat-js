import React, { useCallback, useState } from "react";
import {
  Text,
  Container,
  Button,
  Flex,
  IconButton,
  Avatar,
} from "@radix-ui/themes";
import { Markdown } from "../Markdown";
import { RetryForm } from "../ChatForm";
import styles from "./ChatContent.module.css";
import { Pencil2Icon, ImageIcon } from "@radix-ui/react-icons";
import {
  ProcessedUserMessageContentWithImages,
  UserMessageContentWithImage,
  type UserMessage,
} from "../../services/refact";
import { takeWhile } from "../../utils";

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
            // TODO: should this work?
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

type UserInputArray = (
  | UserMessageContentWithImage
  | ProcessedUserMessageContentWithImages
)[];

const RenderUserInputArray: React.FC<{ children: UserInputArray }> = ({
  children,
}) => {
  const items = processUserInputArray(children);
  return (
    <Container position="relative" pt="1">
      <Flex direction="column">{items}</Flex>
    </Container>
  );
};

function isUserContentImage(
  item: UserMessageContentWithImage | ProcessedUserMessageContentWithImages,
) {
  return (
    ("m_type" in item && item.m_type.startsWith("image/")) ||
    ("type" in item && item.type === "image_url")
  );
}

function processUserInputArray(
  items: UserInputArray,
  memo: JSX.Element[] = [],
) {
  if (items.length === 0) return memo;
  const [head, ...tail] = items;

  if ("type" in head && head.type === "text") {
    const processedLines = processLines(head.text.split("\n"));
    return processUserInputArray(tail, memo.concat(processedLines));
  }

  if ("m_type" in head && head.m_type === "text") {
    const processedLines = processLines(head.m_content.split("\n"));
    return processUserInputArray(tail, memo.concat(processedLines));
  }

  const isImage = isUserContentImage(head);

  if (!isImage) return processUserInputArray(tail, memo);

  const imagesInTail = takeWhile(tail, isUserContentImage);
  const nextTail = tail.slice(imagesInTail.length);
  const images = [head, ...imagesInTail];
  const elem = (
    <Flex gap="2" wrap="wrap">
      {images.map((image, index) => {
        if ("type" in image && image.type === "image_url") {
          const key = `user-input${memo.length}-${image.type}-${index}`;
          const content = image.image_url.url;
          return (
            <Avatar key={key} src={content} size="8" fallback={<ImageIcon />} />
          );
        }
        if ("m_type" in image && image.m_type.startsWith("image/")) {
          const key = `user-input${memo.length}-${image.m_type}-${index}`;
          const content = `data:${image.m_type};base64,${image.m_content}`;
          return (
            <Avatar key={key} src={content} size="8" fallback={<ImageIcon />} />
          );
        }
        return null;
      })}
    </Flex>
  );

  return processUserInputArray(nextTail, memo.concat(elem));
}
