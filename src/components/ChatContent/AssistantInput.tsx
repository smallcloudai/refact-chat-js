import React from "react";
import { Markdown } from "../Markdown";

import { Container, Box } from "@radix-ui/themes";
import { ToolCall } from "../../services/refact";
import { ToolContent } from "./ToolsContent";

type ChatInputProps = {
  message: string | null;
  toolCalls?: ToolCall[] | null;
};

export const AssistantInput: React.FC<ChatInputProps> = ({
  message,
  toolCalls,
}) => {
  return (
    <Container position="relative">
      {message && (
        <Box py="4">
          <Markdown canHavePins={true}>{message}</Markdown>
        </Box>
      )}
      {toolCalls && <ToolContent toolCalls={toolCalls} />}
    </Container>
  );
};
