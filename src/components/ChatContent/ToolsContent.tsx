import React from "react";
import * as Collapsible from "@radix-ui/react-collapsible";
import { Container, Flex, Text, Box, Spinner, Avatar } from "@radix-ui/themes";
import {
  isMultiModalToolResult,
  MultiModalToolResult,
  ToolCall,
  ToolResult,
  ToolUsage,
} from "../../services/refact";
import styles from "./ChatContent.module.css";
import { CommandMarkdown, ResultMarkdown } from "../Command";
import { Chevron } from "../Collapsible";
import { Reveal } from "../Reveal";
import { useAppSelector } from "../../hooks";
import {
  selectManyToolResultsByIds,
  selectToolResultById,
} from "../../features/Chat/Thread/selectors";
import { ScrollArea } from "../ScrollArea";
import { partition, takeWhile } from "../../utils";

type ResultProps = {
  children: string;
  isInsideScrollArea?: boolean;
  hasImages: boolean;
};

const Result: React.FC<ResultProps> = ({
  children,
  isInsideScrollArea = false,
  hasImages,
}) => {
  const lines = children.split("\n");
  return (
    <Reveal defaultOpen={!hasImages && lines.length < 9}>
      <ResultMarkdown
        className={styles.tool_result}
        isInsideScrollArea={isInsideScrollArea}
      >
        {children}
      </ResultMarkdown>
    </Reveal>
  );
};

function resultToMarkdown(result?: ToolResult): string {
  if (!result) return "";
  if (!result.content) return "";

  if (typeof result.content === "string") {
    const escapedBackticks = result.content.replace(/`+/g, (match) => {
      if (match === "```") return match;
      return "\\" + "`";
    });

    return "```\n" + escapedBackticks + "\n```";
  }

  const images = result.content
    .filter((image) => image.m_type.startsWith("image/"))
    .map((image) => {
      const base64url = `data:${image.m_type};base64,${image.m_content}`;
      return `![](${base64url})`;
    });
  return images.join("\n");
}

// const SingleModelToolMessage: React.FC<{
//   toolCall: ToolCall;
//   toolResult: SingleModelToolResult;
// }> = ({ toolCall, toolResult }) => {};

const ToolMessage: React.FC<{
  toolCall: ToolCall;
}> = ({ toolCall }) => {
  const name = toolCall.function.name ?? "";

  // ToolResult could be multi modal
  // hoist this up
  const maybeResult = useAppSelector((state) =>
    selectToolResultById(state, toolCall.id),
  );

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

  if (maybeResult && isMultiModalToolResult(maybeResult)) {
    // TODO: handle this
    return null;
  }

  const results = resultToMarkdown(maybeResult);
  const hasImages = false;

  const functionCalled = "```python\n" + name + "(" + argsString + ")\n```";

  return (
    <Flex direction="column">
      <ScrollArea scrollbars="horizontal" style={{ width: "100%" }}>
        <Box>
          <CommandMarkdown isInsideScrollArea>{functionCalled}</CommandMarkdown>
        </Box>
      </ScrollArea>
      <ScrollArea scrollbars="horizontal" style={{ width: "100%" }} asChild>
        <Box>
          <Result hasImages={hasImages} isInsideScrollArea>
            {results}
          </Result>
        </Box>
      </ScrollArea>
    </Flex>
  );
};

const ToolUsageDisplay: React.FC<{
  functionName: string;
  amountOfCalls: number;
}> = ({ functionName, amountOfCalls }) => {
  return (
    <>
      {functionName}
      {amountOfCalls > 1 ? ` (${amountOfCalls})` : ""}
    </>
  );
};

// Use this for a single tool results
export const SingleModelToolContent: React.FC<{
  toolCalls: ToolCall[];
}> = ({ toolCalls }) => {
  const [open, setOpen] = React.useState(false);

  if (toolCalls.length === 0) return null;

  const toolNames = toolCalls.reduce<string[]>((acc, toolCall) => {
    // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
    if (toolCall === null) {
      // eslint-disable-next-line no-console
      console.error("toolCall is null");
      return acc;
    }
    if (!toolCall.function.name) return acc;
    if (acc.includes(toolCall.function.name)) return acc;
    return [...acc, toolCall.function.name];
  }, []);

  /*
    Calculates the usage amount of each tool by mapping over the unique tool names
    and counting how many times each tool has been called in the toolCalls array.
  */
  const toolUsageAmount = toolNames.map<ToolUsage>((toolName) => {
    return {
      functionName: toolName,
      amountOfCalls: toolCalls.filter(
        (toolCall) => toolCall.function.name === toolName,
      ).length,
    };
  });

  const subchat: string | undefined = toolCalls
    .map((toolCall) => toolCall.subchat)
    .filter((x) => x)[0];
  const attachedFiles = toolCalls
    .map((toolCall) => toolCall.attached_files)
    .filter((x) => x)
    .flat();
  const shownAttachedFiles = attachedFiles.slice(-4);
  const hiddenFiles = attachedFiles.length - 4;

  // Use this for single tool result
  return (
    <Container>
      <Collapsible.Root open={open} onOpenChange={setOpen}>
        <Collapsible.Trigger asChild>
          {/**TODO: reuse this */}
          <Flex gap="2" align="end">
            <Flex gap="1" align="start" direction="column">
              <Text weight="light" size="1">
                🔨{" "}
                {toolUsageAmount.map(
                  ({ functionName, amountOfCalls }, index) => (
                    <span key={functionName}>
                      <ToolUsageDisplay
                        functionName={functionName}
                        amountOfCalls={amountOfCalls}
                      />
                      {index === toolUsageAmount.length - 1 ? "" : ", "}
                    </span>
                  ),
                )}
              </Text>
              {hiddenFiles > 0 && (
                <Text weight="light" size="1" ml="4">
                  {`🔎 <${hiddenFiles} files hidden>`}
                </Text>
              )}
              {shownAttachedFiles.map((file, index) => (
                <Text weight="light" size="1" key={index} ml="4">
                  🔎 {file}
                </Text>
              ))}
              {subchat && (
                <Flex ml="4">
                  <Spinner />
                  <Text weight="light" size="1" ml="4px">
                    {subchat}
                  </Text>
                </Flex>
              )}
            </Flex>
            <Chevron open={open} />
          </Flex>
        </Collapsible.Trigger>
        <Collapsible.Content>
          {toolCalls.map((toolCall) => {
            // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
            if (toolCall === null) {
              // eslint-disable-next-line no-console
              console.error("toolCall is null");
              return;
            }
            if (toolCall.id === undefined) return;
            const key = `${toolCall.id}-${toolCall.index}`;
            return (
              <Box key={key} py="2">
                <ToolMessage toolCall={toolCall} />
              </Box>
            );
          })}
        </Collapsible.Content>
      </Collapsible.Root>
    </Container>
  );
};

export type ToolContentProps = {
  toolCalls: ToolCall[];
};

export const ToolContent: React.FC<ToolContentProps> = ({ toolCalls }) => {
  const ids = toolCalls
    .map((toolCall) => toolCall.id)
    .filter((id) => id !== undefined);
  const allToolResults = useAppSelector(selectManyToolResultsByIds(ids));

  return processToolCalls(toolCalls, allToolResults);
};

function processToolCalls(
  toolCalls: ToolCall[],
  toolResults: ToolResult[],
  processed: React.ReactNode[] = [],
) {
  if (toolCalls.length === 0) return processed;
  const [head, ...tail] = toolCalls;
  const result = toolResults.find((result) => result.tool_call_id === head.id);

  if (result && isMultiModalToolResult(result)) {
    // TODO: render multi-modal tool call and result.
    const elem = <MultiModalToolContent toolCall={head} toolResult={result} />;
    return processToolCalls(tail, toolResults, [...processed, elem]);
  }

  const restInTail = takeWhile(tail, (toolCall) => {
    const item = toolResults.find(
      (result) => result.tool_call_id === toolCall.id,
    );
    return item === undefined || !isMultiModalToolResult(item);
  });
  const nextTail = tail.slice(restInTail.length);

  const elem = <SingleModelToolContent toolCalls={[head, ...restInTail]} />;
  return processToolCalls(nextTail, toolResults, [...processed, elem]);
}

const MultiModalToolContent: React.FC<{
  toolCall: ToolCall;
  toolResult: MultiModalToolResult;
}> = ({ toolCall, toolResult }) => {
  const [open, setOpen] = React.useState(false);
  const [texts, images] = partition(toolResult.content, (content) =>
    content.m_type.startsWith("image/"),
  );

  const text = texts
    .filter((text) => text.m_type === "text")
    .map((text) => text.m_content)
    .join("\n");

  return (
    <Container>
      <Collapsible.Root open={open} onOpenChange={setOpen}>
        <Collapsible.Trigger asChild>
          <Flex gap="2" align="end">
            <Flex gap="1" align="start" direction="column">
              <Text weight="light" size="1">
                🔨{" "}
                <ToolUsageDisplay
                  functionName={toolCall.function.name ?? ""}
                  amountOfCalls={1}
                />
              </Text>
            </Flex>
            <Chevron open={open} />
          </Flex>
        </Collapsible.Trigger>

        <Collapsible.Content>
          <ResultMarkdown>{text}</ResultMarkdown>
        </Collapsible.Content>
      </Collapsible.Root>
      <Flex gap="2">
        {images.map((image, i) => {
          const dataUrl = `data:${image.m_type};base64,${image.m_content}`;
          return (
            <Avatar size="8" key={`image-${i}`} src={dataUrl} fallback={""} />
          );
        })}
      </Flex>

      {/* <Flex>
        <Result hasImages={false}>{text}</Result>
      </Flex> */}
    </Container>
  );
};
