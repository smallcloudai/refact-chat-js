import React from "react";
import { Text, Container, Box, Flex, Button, Link } from "@radix-ui/themes";
import {
  DiffMessage,
  DiffStateResponse,
  isDiffErrorResponseData,
  type DiffChunk,
} from "../../services/refact";
import { ScrollArea } from "../ScrollArea";
import styles from "./ChatContent.module.css";
import { filename } from "../../utils";
import * as Collapsible from "@radix-ui/react-collapsible";
import { Chevron } from "../Collapsible";
import groupBy from "lodash.groupby";
import { TruncateLeft } from "../Text";
import {
  useDiffApplyMutation,
  useDiffStateQuery,
  useConfig,
  useDiffPreview,
  useEventsBusForIDE,
  useAppDispatch,
  useAppSelector,
} from "../../hooks";
import {
  clearWarning,
  getWarningMessage,
  setWarning,
} from "../../features/Errors/warningSlice";
import { DiffWarningCallout } from "../Callout";
import { FetchBaseQueryError } from "@reduxjs/toolkit/query";

type DiffType = "apply" | "unapply" | "error" | "can not apply";

function toDiff(str: string): string {
  // const lines = str.split("\n");
  // const result: string[] = [];

  // for (let i = 0; i < lines.length; i++) {
  //   const line = lines[i];

  //   // Check for escaped end-of-line characters
  //   if (line.endsWith("\\") || line.endsWith("\\n")) {
  //     // Remove the escape character(s) and combine with the next line if it exists
  //     const nextLine = lines[i + 1] || ""; // Get the next line or an empty string if it doesn't exist
  //     const cleanedLine = line.slice(0, line.endsWith("\\n") ? -2 : -1);
  //     result.push(cleanedLine + nextLine); // Add the current line without the escape character(s) and the next line
  //     i++; // Skip the next line since it's already combined
  //   } else {
  //     result.push(line); // Add the current line as is
  //   }
  // }

  // // Remove the last line if it is empty
  // if (result[result.length - 1] === "") {
  //   result.pop();
  // }

  // return result.join("\n"); // Join the processed lines back into a single string
  return str;
}

const DiffLine: React.FC<{
  lineNumber?: number;
  sign: string;
  line: string;
}> = ({ lineNumber, sign, line }) => {
  const backgroundColorLeft = sign === "-" ? "#592e30" : "#3b5840";
  const backgroundColor = sign === "-" ? "#3e2628" : "#2c3e33";
  return (
    <Flex className={styles.diff_line} style={{ minWidth: "min-content" }}>
      <Text
        size="2"
        className={styles.diff_line_number}
        style={{ backgroundColor: backgroundColorLeft }}
      >
        {lineNumber ?? ""}
      </Text>
      <Text size="2" className={styles.diff_sign} style={{ backgroundColor }}>
        {sign}
      </Text>
      <Text
        size="2"
        className={styles.diff_line_content}
        style={{
          backgroundColor,
          whiteSpace: "pre",
          whiteSpaceTrim: "none",
          minWidth: "min-content",
        }}
      >
        {line}
      </Text>
    </Flex>
  );
};

const DiffHighlight: React.FC<{
  startLine?: number;
  sign: string;
  text: string;
}> = ({ startLine, sign, text }) => {
  const lines = text.split("\n");
  return (
    <Flex
      direction="column"
      style={{ minWidth: "min-content", alignSelf: "stretch", width: "100%" }}
    >
      {lines.map((line, index) => {
        return (
          <DiffLine
            key={index}
            line={line}
            sign={sign}
            lineNumber={startLine ? index + startLine : undefined}
          />
        );
      })}
    </Flex>
  );
};

type DiffProps = {
  diff: DiffChunk;
};

export const Diff: React.FC<DiffProps> = ({ diff }) => {
  const removeString = diff.lines_remove && toDiff(diff.lines_remove);
  const addString = diff.lines_add && toDiff(diff.lines_add);
  return (
    <Flex
      className={styles.diff}
      py="2"
      direction="column"
      style={{ minWidth: "min-content" }}
    >
      {removeString && (
        <DiffHighlight startLine={diff.line1} sign={"-"} text={removeString} />
      )}
      {addString && (
        <DiffHighlight startLine={diff.line1} sign={"+"} text={addString} />
      )}
    </Flex>
  );
};

const GranularDiff: React.FC<DiffProps> = ({ diff }) => {
  const { host } = useConfig();
  const status = useDiffStateQuery({ chunks: [diff] });
  const { onSubmit, result: _result } = useDiffApplyMutation();
  const { onPreview, previewResult: _previewResult } = useDiffPreview();

  // TODO: add loading state
  return status.data?.map((stat, index) => {
    return (
      <Flex key={`granular-diff-${index}`} direction="column" gap="2">
        <Flex justify="end" align="center" pr="2" pt="2" gap="2">
          {host === "vscode" && (
            <Button
              size="1"
              onClick={() => {
                void onPreview([stat.chunk], [!stat.state]);
              }}
            >
              Show
            </Button>
          )}
          <Button
            size="1"
            onClick={() => {
              void onSubmit({ chunks: [diff], toApply: [!stat.state] });
            }}
          >
            {stat.state ? "Unapply" : "Apply"}
          </Button>
        </Flex>
        <Box
          style={{
            background: "rgb(51, 51, 51)",
            minWidth: "min-content",
          }}
        >
          <Diff diff={diff} />
        </Box>
      </Flex>
    );
  });
};

export type DiffChunkWithTypeAndApply = DiffChunk & {
  type: DiffType;
  apply: boolean;
};

export const DiffTitle: React.FC<{
  diffs: Record<string, DiffStateResponse[]>;
}> = ({ diffs }): React.ReactNode[] => {
  const entries = Object.entries(diffs);

  function process(
    items: [string, DiffStateResponse[]][],
    memo: React.ReactNode[] = [],
  ): React.ReactNode[] {
    if (items.length === 0) return memo;
    const [head, ...tail] = items;
    const [fullPath, diffForFile] = head;
    const name = filename(fullPath);
    const addLength = diffForFile.reduce<number>((acc, diff) => {
      return (
        acc +
        (diff.chunk.lines_add ? diff.chunk.lines_add.split("\n").length : 0)
      );
    }, 0);
    const removeLength = diffForFile.reduce<number>((acc, diff) => {
      return (
        acc +
        (diff.chunk.lines_remove
          ? diff.chunk.lines_remove.split("\n").length
          : 0)
      );
    }, 0);
    const adds = "+".repeat(addLength);
    const removes = "-".repeat(removeLength);
    const element = (
      <Text
        style={{ display: "inline-block" }}
        key={fullPath + "-" + diffForFile.length}
      >
        {name}{" "}
        <Text color="red" wrap="wrap">
          {removes}
        </Text>
        <Text color="green" wrap="wrap">
          {adds}
        </Text>
      </Text>
    );
    const nextMemo = memo.length > 0 ? [...memo, ", ", element] : [element];

    return process(tail, nextMemo);
  }

  return process(entries);
};

export const DiffContent: React.FC<{
  diffs: Record<string, DiffStateResponse[]>;
}> = ({ diffs }) => {
  const [open, setOpen] = React.useState(false);

  return (
    <Collapsible.Root open={open} onOpenChange={setOpen}>
      <Collapsible.Trigger asChild>
        <Flex gap="2" align="center">
          <Text weight="light" size="1">
            <DiffTitle diffs={diffs} />
          </Text>
          <Chevron open={open} />
        </Flex>
      </Collapsible.Trigger>
      <Collapsible.Content>
        <DiffForm diffs={diffs} />
      </Collapsible.Content>
    </Collapsible.Root>
  );
};

export type DiffWithStatus = DiffChunk & {
  state?: 0 | 1 | 2;
  can_apply: boolean;
  applied: boolean;
  index: number;
};

const DiffForFile: React.FC<{
  fileName: string;
  diffsForFile: DiffStateResponse[];
}> = ({ fileName, diffsForFile }) => {
  const [showMore, setShowMore] = React.useState(false);
  const { onSubmit, result: _result } = useDiffApplyMutation();
  const { onPreview, previewResult: _previewResult } = useDiffPreview();
  const { openFile } = useEventsBusForIDE();
  const dispatch = useAppDispatch();
  const warning = useAppSelector(getWarningMessage);
  const onClearWarning = React.useCallback(
    () => dispatch(clearWarning()),
    [dispatch],
  );

  const { host } = useConfig();

  const applied = diffsForFile.every((diff) => diff.state || !diff.can_apply);
  const handleDiffApplySubmit = React.useCallback(
    (chunks: DiffChunk[], toApply: boolean[]) => {
      onSubmit({ chunks, toApply })
        .unwrap()
        .then((payload) => {
          let data = null;
          if (!Array.isArray(payload)) {
            return;
          }
          data = payload[0];

          if (isDiffErrorResponseData(data)) {
            if (data.detail) {
              const [warning, filePath] = data.detail.split("\n")[0].split("'");
              const normalizedPath = filePath.startsWith("\\\\?\\")
                ? filePath.substring(4).replace(/\\/g, "/")
                : filePath;

              const reason = data.detail.split("\n")[1];
              dispatch(
                setWarning([[warning, normalizedPath].join(" "), reason]),
              );
            }
          }
        })
        .catch((error: FetchBaseQueryError) => {
          if (error.status === "FETCH_ERROR") {
            dispatch(
              setWarning([
                "Failed to apply diff chunk",
                "Reason: Connection lost with LSP server",
              ]),
            );
          }
        });
    },
    [dispatch, onSubmit],
  );

  const handleToggle = React.useCallback(
    (diffs: DiffStateResponse[], apply: boolean) => {
      const chunks = diffs.map((diff) => diff.chunk);
      const toApply = diffs.map((_diff) => apply);
      handleDiffApplySubmit(chunks, toApply);
    },
    [handleDiffApplySubmit],
  );

  const handlePreview = React.useCallback(
    (diffs: DiffStateResponse[]) => {
      const chunks = diffs.map((diff) => diff.chunk);
      const toApply = diffs.map((diff) => diff.can_apply && !diff.state);
      void onPreview(chunks, toApply);
    },
    [onPreview],
  );

  return (
    <Box my="2">
      <Flex justify="between" align="center" p="1">
        <TruncateLeft size="1">
          <Link
            // TODO: check how ides treat this being "", undefined, or "#"
            href=""
            onClick={(event) => {
              event.preventDefault();
              const startLine = Math.min(
                ...diffsForFile.map((diff) => diff.chunk.line1),
              );
              openFile({
                file_name: fileName,
                line: startLine,
              });
            }}
          >
            {fileName}
          </Link>
        </TruncateLeft>

        <Text size="1" as="label">
          <Flex align="center" gap="2" pl="2">
            {/* {errored && "error"} */}
            {/* TODO: does this only work in vscode? */}
            {host === "vscode" && (
              <Button size="1" onClick={() => handlePreview(diffsForFile)}>
                Preview
              </Button>
            )}

            {diffsForFile.length > 1 && (
              <Button size="1" onClick={() => setShowMore((prev) => !prev)}>
                {showMore ? "Collapse" : "Expand"}
              </Button>
            )}
            <Button
              size="1"
              onClick={() => handleToggle(diffsForFile, !applied)}
            >
              {applied ? "Unapply" : "Apply"}
            </Button>
          </Flex>
        </Text>
      </Flex>
      <ScrollArea scrollbars="horizontal" asChild>
        <Box style={{ minWidth: "100%" }} position="relative">
          {warning && warning.length !== 0 && (
            <DiffWarningCallout
              onClick={onClearWarning}
              timeout={3000}
              itemType="warning"
              message={warning}
              style={{
                position: "absolute",
                top: 10,
                right: 0,
              }}
            />
          )}
          <Box
            style={{
              background: "rgb(51, 51, 51)",
              minWidth: "min-content",
            }}
          >
            {diffsForFile.map((diff, i) => {
              if (showMore && diffsForFile.length > 1)
                return (
                  <GranularDiff
                    key={`granular-diff-${fileName}-${i}`}
                    diff={diff.chunk}
                  />
                );
              return <Diff key={`${fileName}-${i}`} diff={diff.chunk} />;
            })}
          </Box>
        </Box>
      </ScrollArea>
    </Box>
  );
};

export const DiffForm: React.FC<{
  diffs: Record<string, DiffStateResponse[]>;
}> = ({ diffs }) => {
  return (
    <Flex direction="column" maxWidth="100%" py="2" gap="2">
      {Object.entries(diffs).map(([fullFileName, diffsForFile], index) => {
        const key = fullFileName + "-" + index;
        return (
          <DiffForFile
            key={key}
            fileName={fullFileName}
            diffsForFile={diffsForFile}
          />
        );
      })}
    </Flex>
  );
};

type GroupedDiffsProps = {
  diffs: DiffMessage[];
};

export const GroupedDiffs: React.FC<GroupedDiffsProps> = ({ diffs }) => {
  const { onSubmit, result: _result } = useDiffApplyMutation();
  const chunks = diffs.reduce<DiffMessage["content"]>(
    (acc, diff) => [...acc, ...diff.content],
    [],
  );

  const status = useDiffStateQuery({ chunks });
  const groupedByFileName = groupBy(
    status.data,
    (diff) => diff.chunk.file_name,
  );

  // TODO: try with partially applied diffs

  const onApplyAll = React.useCallback(() => {
    const data = status.data ?? [];
    const chunks = data.map((diff) => diff.chunk);
    const toApply = data.map((_diff) => true);
    void onSubmit({ chunks, toApply });
  }, [onSubmit, status.data]);

  // TODO: find a good project chat to test this on
  const onUnApplyAll = () => {
    const data = status.data ?? [];
    const chunks = data.map((diff) => diff.chunk);
    const toApply = data.map((_diff) => false);
    void onSubmit({ chunks, toApply });
  };

  const disableApplyAll =
    status.data?.length === 0 || status.data?.every((diff) => diff.state);

  const disableUnApplyAll =
    status.data?.length === 0 || status.data?.every((diff) => !diff.state);

  return (
    <Container>
      <Flex direction="column" gap="4" py="4">
        <DiffContent diffs={groupedByFileName} />
        <Flex gap="2">
          <Button onClick={onUnApplyAll} disabled={disableUnApplyAll}>
            Unapply All
          </Button>
          <Button onClick={onApplyAll} disabled={disableApplyAll}>
            Apply All
          </Button>
        </Flex>
      </Flex>
    </Container>
  );
};
