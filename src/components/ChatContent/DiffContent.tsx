import React, { useEffect } from "react";
import { Text, Container, Box, Flex, Switch, Button } from "@radix-ui/themes";
import { type DiffChunk } from "../../events";
import { ScrollArea } from "../ScrollArea";
import SyntaxHighlighter from "react-syntax-highlighter";
import classNames from "classnames";

import styles from "./ChatContent.module.css";
import hljsStyle from "react-syntax-highlighter/dist/esm/styles/hljs/agate";
import { type DiffChunkStatus } from "../../hooks";
import isEqual from "lodash.isequal";
import { filename } from "../../utils";
import * as Collapsible from "@radix-ui/react-collapsible";
import { Chevron } from "../Collapsible";
import { Reveal } from "../Reveal";

type DiffType = "apply" | "unapply" | "error" | "can not apply";

function toDiff(str: string, type: "add" | "remove"): string {
  const sign = type === "add" ? "+" : "-";

  const replaceEscapedEOL = str
    .split("\n")
    .filter((_) => _)
    .join("\n" + sign);

  return sign + replaceEscapedEOL;
}

const _Highlight: React.FC<{
  children: string;
  showLineNumbers?: boolean;
  startingLineNumber?: number;
  className: string;
}> = ({ children, className, ...rest }) => {
  return (
    <SyntaxHighlighter
      style={hljsStyle}
      PreTag={(props) => (
        <pre {...props} className={classNames(styles.diff_pre, className)} />
      )}
      language="diff"
      {...rest}
    >
      {children}
    </SyntaxHighlighter>
  );
};

const Highlight = React.memo(_Highlight);

type DiffProps = {
  diff: DiffChunk;
  type?: "apply" | "unapply" | "error" | "can not apply";
  value?: boolean;
  onChange?: (checked: boolean) => void;
};

const Diff: React.FC<DiffProps> = ({ diff, type, value, onChange }) => {
  const removeString = diff.lines_remove && toDiff(diff.lines_remove, "remove");
  const addString = diff.lines_add && toDiff(diff.lines_add, "add");
  const title = filename(diff.file_name);

  const lineCount =
    removeString.split("\n").length + addString.split("\n").length;
  return (
    <Box>
      <Flex justify="between" align="center" p="1">
        <Text size="1">{title}</Text>
        {type && (type === "apply" || type === "unapply") && (
          <Text as="label" size="1">
            {type}{" "}
            <Switch size="1" checked={value} onCheckedChange={onChange} />
          </Text>
        )}{" "}
        {type && type === "error" && <Text size="1">Failed to apply</Text>}
        {type && type === "can not apply" && (
          <Text size="1">Can not apply diff</Text>
        )}
      </Flex>
      <Reveal defaultOpen={lineCount < 9}>
        <ScrollArea scrollbars="horizontal" asChild>
          <Flex className={styles.diff} py="2" direction="column">
            {removeString && (
              <Highlight
                className={styles.diff_first}
                showLineNumbers={!!diff.line1}
                startingLineNumber={diff.line1}
              >
                {removeString}
              </Highlight>
            )}
            {addString && (
              <Highlight
                className={styles.diff_second}
                showLineNumbers={!!diff.line1}
                startingLineNumber={diff.line1}
              >
                {addString}
              </Highlight>
            )}
          </Flex>
        </ScrollArea>
      </Reveal>
    </Box>
  );
};

export type DiffContentProps = {
  diffs: DiffChunk[];
  appliedChunks: DiffChunkStatus | null;
  onSubmit: (toApply: boolean[]) => void;
};

export type DiffChunkWithTypeAndApply = DiffChunk & {
  type: DiffType;
  apply: boolean;
};

function diffFormState(
  diffs: DiffChunk[],
  appliedChunks: number[],
  canApply: boolean[],
): DiffChunkWithTypeAndApply[] {
  return diffs.map((diff, index) => {
    const c = canApply[index];
    const n = appliedChunks[index];

    const type = !c
      ? "can not apply"
      : n === 2
        ? "error"
        : n === 1
          ? "unapply"
          : "apply";
    return {
      type: type,
      apply: false,
      ...diff,
    };
  });
}

const DiffsWithoutForm: React.FC<{ diffs: DiffChunk[] }> = ({ diffs }) => {
  return (
    <Flex direction="column" display="inline-flex" maxWidth="100%">
      {diffs.map((diff, i) => (
        <Diff key={i} diff={diff} />
      ))}
    </Flex>
  );
};

const DiffTitle: React.FC<{ diffs: DiffChunk[] }> = ({
  diffs,
}): React.ReactNode[] => {
  function process(
    diffs: DiffChunk[],
    memo: React.ReactNode[] = [],
  ): React.ReactNode[] {
    if (diffs.length === 0) return memo;
    const [head, ...tail] = diffs;
    const name = filename(head.file_name);
    const addLength = head.lines_add ? head.lines_add.split("\n").length : 0;
    const removeLength = head.lines_remove
      ? head.lines_remove.split("\n").length
      : 0;
    const adds = "+".repeat(addLength);
    const removes = "-".repeat(removeLength);
    const element = (
      <Text key={head.file_name + "-" + memo.length}>
        {name} <Text color="green">{adds}</Text>
        <Text color="red">{removes}</Text>
      </Text>
    );

    const nextMemo = memo.length > 0 ? [...memo, ", ", element] : [element];
    return process(tail, nextMemo);
  }

  return process(diffs);
};

export const DiffContent: React.FC<DiffContentProps> = ({
  diffs,
  appliedChunks,
  onSubmit,
}) => {
  const [open, setOpen] = React.useState(false);
  const status = React.useMemo(
    () =>
      diffFormState(
        diffs,
        appliedChunks?.state ?? [],
        appliedChunks?.can_apply ?? [],
      ),
    [appliedChunks?.state, diffs, appliedChunks?.can_apply],
  );

  // TODO: handle loading
  // TODO: handle errors

  return (
    <Container>
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
          {!appliedChunks?.state ? (
            <DiffsWithoutForm diffs={diffs} />
          ) : (
            <DiffForm
              onSubmit={onSubmit}
              diffs={status}
              canRemove={
                appliedChunks.state.length > 0 &&
                appliedChunks.state.includes(1)
              }
              canAdd={
                appliedChunks.state.length === 0 ||
                appliedChunks.state.includes(0)
              }
              isLoading={appliedChunks.fetching}
            />
          )}
        </Collapsible.Content>
      </Collapsible.Root>
    </Container>
  );
};

const DiffForm: React.FC<{
  diffs: DiffChunkWithTypeAndApply[];
  onSubmit: (chunks: boolean[]) => void;
  canRemove: boolean;
  canAdd: boolean;
  isLoading: boolean;
}> = ({ diffs, onSubmit, canRemove, canAdd, isLoading }) => {
  const [state, setState] = React.useState<DiffChunkWithTypeAndApply[]>(diffs);

  useEffect(() => {
    setState(diffs);
  }, [diffs]);

  const handleToggle = (index: number, checked: boolean) => {
    setState((prev) => {
      const next = prev.slice(0);
      if (!next[index]) return next;
      next[index] = { ...next[index], apply: checked };
      return next;
    });
  };

  const hasNotChanged = React.useMemo(() => {
    return isEqual(state, diffs);
  }, [state, diffs]);

  const applyDiff = React.useCallback(() => {
    const toApply = state.map((diff) => diff.apply);
    onSubmit(toApply);
  }, [onSubmit, state]);

  const [disableAdd, setDisableAdd] = React.useState(false);

  useEffect(() => {
    if (isLoading) {
      setDisableAdd(true);
    } else {
      setDisableAdd(!canAdd || hasNotChanged);
    }
  }, [isLoading, canAdd, canRemove, hasNotChanged]);

  return (
    <Flex direction="column" display="inline-flex" maxWidth="100%">
      {state.map((diff, i) => (
        <Diff
          key={i}
          diff={diff}
          type={diff.type}
          value={diff.apply}
          onChange={(checked: boolean) => handleToggle(i, checked)}
        />
      ))}
      <Flex gap="2" py="2">
        <Button disabled={disableAdd} onClick={applyDiff}>
          Add Changes
        </Button>
      </Flex>
    </Flex>
  );
};
