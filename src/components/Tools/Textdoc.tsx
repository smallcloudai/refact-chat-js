import React, { useCallback, useMemo } from "react";
import {
  type CreateTextDocToolCall,
  type RawTextDocTool,
  UpdateTextDocToolCall,
  isCreateTextDocToolCall,
  // isReplaceTextDocToolCall,
  isUpdateTextDocToolCall,
  //   isUpdateRegexTextDocToolCall,
  parseRawTextDocToolCall,
} from "./types";
import { Box, Button, Card, Flex } from "@radix-ui/themes";
import { TruncateLeft } from "../Text";
import { Link } from "../Link";
import { useEventsBusForIDE } from "../../hooks/useEventBusForIDE";
import { Markdown } from "../Markdown";
import { filename } from "../../utils/filename";
import styles from "./Texdoc.module.css";
import { createPatch } from "diff";
import classNames from "classnames";
import { useAppSelector } from "../../hooks";
import {
  selectIsStreaming,
  selectIsWaiting,
} from "../../features/Chat/Thread/selectors";
import { selectCanPaste } from "../../features/Chat";

export const TextDocTool: React.FC<{ toolCall: RawTextDocTool }> = ({
  toolCall,
}) => {
  const {
    // diffPreview,
    // startFileAnimation,
    // stopFileAnimation,
    openFile,
    // writeResultsToFile,
    diffPasteBack,
    // newFile,
    createNewFile,
  } = useEventsBusForIDE();

  const isStreaming = useAppSelector(selectIsStreaming);
  const isWaiting = useAppSelector(selectIsWaiting);
  const canPaste = useAppSelector(selectCanPaste);

  const disabled = useMemo(
    () => isStreaming || isWaiting,
    [isStreaming, isWaiting],
  );

  const maybeTextDocToolCall = parseRawTextDocToolCall(toolCall);

  const handleOpenFile = useCallback(() => {
    if (!maybeTextDocToolCall?.function.arguments.path) return;
    openFile({ file_name: maybeTextDocToolCall.function.arguments.path });
  }, [maybeTextDocToolCall?.function.arguments.path, openFile]);

  const handleReplace = useCallback(
    (content: string) => {
      diffPasteBack(content);
    },
    [diffPasteBack],
  );

  if (!maybeTextDocToolCall) return false;

  // TODO: add reveal to the mardkown preview, add ide actions

  if (isCreateTextDocToolCall(maybeTextDocToolCall)) {
    return (
      <CreateTextDoc
        toolCall={maybeTextDocToolCall}
        onOpenFile={handleOpenFile}
        onApply={() => {
          createNewFile(
            maybeTextDocToolCall.function.arguments.path,
            maybeTextDocToolCall.function.arguments.content,
          );
        }}
        onReplace={() =>
          handleReplace(maybeTextDocToolCall.function.arguments.content)
        }
        disabled={
          disabled ||
          maybeTextDocToolCall.function.arguments.content.length === 0
        }
        canPaste={canPaste}
        // onApply={() => newFile()}
      />
    );
  }

  if (isUpdateTextDocToolCall(maybeTextDocToolCall)) {
    return (
      <UpdateTextDoc
        onOpenFile={handleOpenFile}
        toolCall={maybeTextDocToolCall}
      />
    );
  }

  // TODO: if(isReplaceTextDocToolCall(maybeTextDocToolCall)) {}; if(isUpdateRegexTextDocToolCall(maybeTextDocToolCall)) {}

  // return JSON.stringify(maybeTextDocToolCall, null, 2);

  // similar style to PinMessage in MArkdown.tsx

  return (
    <>
      <TextDocHeader
        filePath={maybeTextDocToolCall.function.arguments.path}
        onOpenFile={handleOpenFile}
        onApply={() => ({})}
        onReplace={() => ({})}
        disabled={disabled}
        canPaste={canPaste}
      />
    </>
  );
};

const TextDocHeader: React.FC<{
  filePath: string;
  onOpenFile: () => void;
  onApply?: () => void;
  onReplace: () => void;
  disabled?: boolean;
  canPaste?: boolean;
}> = ({ filePath, onOpenFile, onApply, onReplace, disabled, canPaste }) => {
  return (
    <Card size="1" variant="surface" mt="4" className={styles.textdoc__header}>
      <Flex gap="2" py="2" pl="2" justify="between">
        <TruncateLeft>
          <Link
            title="Open file"
            onClick={(event) => {
              event.preventDefault();
              onOpenFile();
            }}
          >
            {filePath}
          </Link>
        </TruncateLeft>{" "}
        <div style={{ flexGrow: 1 }} />
        <Button size="1" onClick={onApply} disabled={disabled} title={`Apply`}>
          ➕ Apply
        </Button>
        <Button
          size="1"
          onClick={onReplace}
          disabled={disabled ?? !canPaste}
          title="Replace the current selection in the ide."
        >
          ➕ Replace Selection
        </Button>
      </Flex>
    </Card>
  );
};

const CreateTextDoc: React.FC<{
  toolCall: CreateTextDocToolCall;
  onOpenFile: () => void;
  onApply: () => void;
  onReplace: () => void;
  disabled?: boolean;
  canPaste?: boolean;
}> = ({ toolCall, onOpenFile, onApply, disabled, canPaste, onReplace }) => {
  const code = useMemo(() => {
    const extension = getFileExtension(toolCall.function.arguments.path);
    return (
      "```" + extension + "\n" + toolCall.function.arguments.content + "\n```"
    );
  }, [toolCall.function.arguments.content, toolCall.function.arguments.path]);
  return (
    // TODO: move this box up a bit, or make it generic
    <Box className={styles.textdoc}>
      <TextDocHeader
        filePath={toolCall.function.arguments.path}
        onOpenFile={onOpenFile}
        onApply={onApply}
        disabled={disabled}
        canPaste={canPaste}
        onReplace={onReplace}
      />
      <Markdown>{code}</Markdown>
    </Box>
  );
};

const UpdateTextDoc: React.FC<{
  toolCall: UpdateTextDocToolCall;
  onOpenFile: () => void;
}> = ({ toolCall, onOpenFile }) => {
  const diff = useMemo(() => {
    const patch = createPatch(
      toolCall.function.arguments.path,
      toolCall.function.arguments.old_str,
      toolCall.function.arguments.replacement,
    );

    return "```diff\n" + patch + "\n```";
  }, [
    toolCall.function.arguments.replacement,
    toolCall.function.arguments.old_str,
    toolCall.function.arguments.path,
  ]);
  // TODO: don't use markdown for this, it's two bright
  return (
    <Box className={classNames(styles.textdoc, styles.textdoc__update)}>
      <TextDocHeader
        filePath={toolCall.function.arguments.path}
        onOpenFile={onOpenFile}
        onReplace={() => ({})}
        onApply={() => ({})}
      />
      <Box className={classNames(styles.textdoc__diffbox)}>
        <Markdown useInlineStyles={false}>{diff}</Markdown>
      </Box>
    </Box>
  );
};

function getFileExtension(filePath: string): string {
  const fileName = filename(filePath);
  if (fileName.toLocaleLowerCase().startsWith("dockerfile"))
    return "dockerfile";
  const parts = fileName.split(".");
  return parts[parts.length - 1].toLocaleLowerCase();
}
