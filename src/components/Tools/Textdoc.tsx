import React, { useCallback, useMemo } from "react";
import {
  type CreateTextDocToolCall,
  type RawTextDocTool,
  ReplaceTextDocToolCall,
  TextDocToolCall,
  UpdateRegexTextDocToolCall,
  UpdateTextDocToolCall,
  isCreateTextDocToolCall,
  isReplaceTextDocToolCall,
  isUpdateRegexTextDocToolCall,
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
import { toolsApi } from "../../services/refact";

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
    sendToolEditToIde,
  } = useEventsBusForIDE();

  const [requestDryRun, dryRunResult] = toolsApi.useDryRunForEditToolMutation();

  const isStreaming = useAppSelector(selectIsStreaming);
  const isWaiting = useAppSelector(selectIsWaiting);
  const canPaste = useAppSelector(selectCanPaste);

  const maybeTextDocToolCall = parseRawTextDocToolCall(toolCall);

  const disabled = useMemo(
    () => isStreaming || isWaiting || dryRunResult.isLoading,
    [dryRunResult.isLoading, isStreaming, isWaiting],
  );

  const handleOpenFile = useCallback(() => {
    if (!maybeTextDocToolCall?.function.arguments.path) return;
    openFile({ file_name: maybeTextDocToolCall.function.arguments.path });
  }, [maybeTextDocToolCall?.function.arguments.path, openFile]);

  const handleApplyToolResult = useCallback(
    async (toolCall: TextDocToolCall) => {
      const results = await requestDryRun({
        toolName: toolCall.function.name,
        toolArgs: toolCall.function.arguments,
      });
      if (results.data) {
        sendToolEditToIde(results.data);
      }
    },
    [requestDryRun, sendToolEditToIde],
  );

  const handleCreateFile = useCallback(
    (filePath: string, content: string) => {
      createNewFile(filePath, content);
    },
    [createNewFile],
  );

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
        onApply={() =>
          handleCreateFile(
            maybeTextDocToolCall.function.arguments.path,
            maybeTextDocToolCall.function.arguments.content,
          )
        }
        onReplace={() =>
          handleReplace(maybeTextDocToolCall.function.arguments.content)
        }
        disabled={disabled}
        canPaste={canPaste}
        // onApply={() => newFile()}
      />
    );
  }

  if (isUpdateTextDocToolCall(maybeTextDocToolCall)) {
    return (
      <UpdateTextDoc
        onOpenFile={handleOpenFile}
        onApply={() => void handleApplyToolResult(maybeTextDocToolCall)}
        toolCall={maybeTextDocToolCall}
      />
    );
  }

  if (isReplaceTextDocToolCall(maybeTextDocToolCall)) {
    return (
      <ReplaceTextDoc
        toolCall={maybeTextDocToolCall}
        onApply={() => void handleApplyToolResult(maybeTextDocToolCall)}
        onOpenFile={handleOpenFile}
        onReplace={() =>
          handleReplace(maybeTextDocToolCall.function.arguments.replacement)
        }
        disabled={disabled}
        canPaste={canPaste}
      />
    );
  }

  if (isUpdateRegexTextDocToolCall(maybeTextDocToolCall)) {
    return (
      <UpdateRegexTextDoc
        toolCall={maybeTextDocToolCall}
        onApply={() => void handleApplyToolResult(maybeTextDocToolCall)}
        onOpenFile={handleOpenFile}
        disabled={disabled}
      />
    );
  }

  return false;
};

const TextDocHeader: React.FC<{
  filePath: string;
  onOpenFile: () => void;
  onApply?: () => void;
  onReplace?: () => void;
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
        {onReplace && (
          <Button
            size="1"
            onClick={onReplace}
            disabled={disabled ?? !canPaste}
            title="Replace the current selection in the ide."
          >
            ➕ Replace Selection
          </Button>
        )}
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

const ReplaceTextDoc: React.FC<{
  toolCall: ReplaceTextDocToolCall;
  onOpenFile: () => void;
  onApply: () => void;
  onReplace: () => void;
  disabled?: boolean;
  canPaste?: boolean;
}> = ({ toolCall, onOpenFile, onApply, disabled, canPaste, onReplace }) => {
  const code = useMemo(() => {
    const extension = getFileExtension(toolCall.function.arguments.path);
    return (
      "```" +
      extension +
      "\n" +
      toolCall.function.arguments.replacement +
      "\n```"
    );
  }, [
    toolCall.function.arguments.path,
    toolCall.function.arguments.replacement,
  ]);
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

const UpdateRegexTextDoc: React.FC<{
  toolCall: UpdateRegexTextDocToolCall;
  onOpenFile: () => void;
  onApply: () => void;
  disabled?: boolean;
}> = ({ toolCall, onOpenFile, onApply, disabled }) => {
  const code = useMemo(() => {
    return (
      "```py\nre.sub(" +
      toolCall.function.arguments.replacement +
      ", open(" +
      +toolCall.function.arguments.path +
      "))\n```"
    );
  }, [
    toolCall.function.arguments.path,
    toolCall.function.arguments.replacement,
  ]);

  return (
    <Box className={styles.textdoc}>
      <TextDocHeader
        filePath={toolCall.function.arguments.path}
        onOpenFile={onOpenFile}
        onApply={onApply}
        disabled={disabled}
        canPaste={false}
      />
      <Markdown>{code}</Markdown>
    </Box>
  );
};

const UpdateTextDoc: React.FC<{
  toolCall: UpdateTextDocToolCall;
  onOpenFile: () => void;
  onApply: () => void;
}> = ({ toolCall, onOpenFile, onApply }) => {
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
        onApply={onApply}
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
