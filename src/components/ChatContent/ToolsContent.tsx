import React from "react";
import * as Collapsible from "@radix-ui/react-collapsible";
import { Container, Flex, Text, Box, Button } from "@radix-ui/themes";
import { ChatContextFile, ToolCall, ToolResult } from "../../events";
import { ChevronDownIcon } from "@radix-ui/react-icons";
import classNames from "classnames";
import styles from "./ChatContent.module.css";
import { Markdown } from "../CommandLine/Markdown";
import { ContextFiles } from "./ContextFiles";

const Chevron: React.FC<{ open: boolean }> = ({ open }) => {
  return (
    <ChevronDownIcon
      className={classNames(styles.chevron, {
        [styles.chevron__open]: !open,
        [styles.chevron__close]: open,
      })}
    />
  );
};

const Result: React.FC<{ children: string }> = ({ children }) => {
  const lines = children.split("\n");
  const [open, setOpen] = React.useState(false);
  if (lines.length < 9 || open)
    return <Markdown className={styles.tool_result}>{children}</Markdown>;
  const toShow = lines.slice(0, 9).join("\n") + "\n ";
  return (
    <Button
      variant="ghost"
      onClick={() => setOpen(true)}
      asChild
      className={styles.tool_result_button}
    >
      <Flex direction="column" position="relative" align="start">
        <Markdown
          className={classNames(styles.tool_result, styles.tool_result_hidden)}
        >
          {toShow}
        </Markdown>
        <Flex position="absolute" bottom="2" width="100%" justify="center">
          Click for more
        </Flex>
      </Flex>
    </Button>
  );
};

const ToolMessage: React.FC<{
  toolCall: ToolCall;
  result?: ToolResult;
  files: ChatContextFile[];
}> = ({ toolCall, result, files }) => {
  const results = result?.content ?? "";
  const name = toolCall.function.name ?? "";

  const argsString = React.useMemo(() => {
    try {
      const json = JSON.parse(
        toolCall.function.arguments,
      ) as unknown as Parameters<typeof Object.entries>;
      if (Array.isArray(json)) {
        return json.join(", ");
      }
      return Object.entries(json)
        .map(([k, v]) => `${k}=${JSON.stringify(v)}`)
        .join(", ");
    } catch {
      return toolCall.function.arguments;
    }
  }, [toolCall.function.arguments]);

  const functionCalled = "```python\n" + name + "(" + argsString + ")\n```";

  const escapedBackticks = results.replace(/`+/g, (match) => {
    if (match === "```") return match;
    return "\\" + "`";
  });

  const content = functionCalled + "\n" + escapedBackticks;
  return (
    <Flex gap="2" direction="column">
      <Result>{content}</Result>
      <ContextFiles files={files} />
    </Flex>
  );
};

export const ToolContent: React.FC<{
  toolCalls: ToolCall[];
  results: Record<string, ToolResult>;
  files: ChatContextFile[];
}> = ({ toolCalls, results, files }) => {
  const [open, setOpen] = React.useState(false);

  if (toolCalls.length === 0) return null;

  const toolNames = toolCalls.reduce<string[]>((acc, toolCall) => {
    if (!toolCall.function.name) return acc;
    if (acc.includes(toolCall.function.name)) return acc;
    return [...acc, toolCall.function.name];
  }, []);

  return (
    <Container>
      <Collapsible.Root open={open} onOpenChange={setOpen}>
        <Collapsible.Trigger asChild>
          <Flex gap="2" align="center">
            <Text weight="light" size="1">
              🔨 {toolNames.join(", ")}
            </Text>
            <Chevron open={open} />
          </Flex>
        </Collapsible.Trigger>
        <Collapsible.Content>
          {toolCalls.map((toolCall) => {
            if (toolCall.id === undefined) return;
            const result = results[toolCall.id];
            const key = `${toolCall.id}-${toolCall.index}`;
            return (
              <Box key={key} py="2">
                <ToolMessage
                  toolCall={toolCall}
                  result={result}
                  files={files}
                />
              </Box>
            );
          })}
        </Collapsible.Content>
      </Collapsible.Root>
    </Container>
  );
};
