import React from "react";
import { Markdown, MarkdownProps } from "../Markdown";

import { Container, Box } from "@radix-ui/themes";
import {
  ChatContextFile,
  ChatMessages,
  ToolCall,
  ToolResult,
  isChatContextFileMessage,
  isToolMessage,
} from "../../events";
import { ToolContent } from "./ToolsContent";

type ChatInputProps = Pick<
  MarkdownProps,
  "onNewFileClick" | "onPasteClick" | "canPaste"
> & {
  message: string | null;
  toolCalls?: ToolCall[] | null;
  auxMessages?: ChatMessages;
};

function fallbackCopying(text: string) {
  const textArea = document.createElement("textarea");
  textArea.value = text;

  textArea.style.top = "0";
  textArea.style.left = "0";
  textArea.style.position = "fixed";

  document.body.appendChild(textArea);
  textArea.focus();
  textArea.select();

  document.execCommand("copy");
  document.body.removeChild(textArea);
}

export const AssistantInput: React.FC<ChatInputProps> = (props) => {
  const messages = props.auxMessages ?? [];

  const results = messages.reduce<Record<string, ToolResult>>(
    (acc, message) => {
      if (isToolMessage(message)) {
        const result = message[1];
        return {
          ...acc,
          [result.tool_call_id]: result,
        };
      }
      return acc;
    },
    {},
  );

  const files = messages.reduce<ChatContextFile[]>((acc, message) => {
    if (!isChatContextFileMessage(message)) return acc;
    return [...acc, ...message[1]];
  }, []);
  return (
    <Container position="relative">
      {props.message && (
        <Box py="4">
          <Markdown
            onCopyClick={(text: string) => {
              // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
              if (window.navigator?.clipboard?.writeText) {
                window.navigator.clipboard.writeText(text).catch(() => {
                  // eslint-disable-next-line no-console
                  console.log("failed to copy to clipboard");
                });
              } else {
                fallbackCopying(text);
              }
            }}
            onNewFileClick={props.onNewFileClick}
            onPasteClick={props.onPasteClick}
            canPaste={props.canPaste}
          >
            {props.message}
          </Markdown>
        </Box>
      )}
      <ToolContent
        toolCalls={props.toolCalls ?? []}
        results={results}
        files={files}
      />
    </Container>
  );
};
