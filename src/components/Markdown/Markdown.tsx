import React, { Key, useCallback, useMemo } from "react";
import ReactMarkdown, { Components } from "react-markdown";
import remarkBreaks from "remark-breaks";
import classNames from "classnames";
// import "./highlightjs.css";
import styles from "./Markdown.module.css";
import {
  MarkdownCodeBlock,
  type MarkdownControls,
  type MarkdownCodeBlockProps,
} from "./CodeBlock";
import {
  Text,
  Heading,
  Blockquote,
  Em,
  Kbd,
  Link,
  Quote,
  Strong,
  Button,
  Flex,
} from "@radix-ui/themes";
import rehypeKatex from "rehype-katex";
import remarkMath from "remark-math";
import "katex/dist/katex.min.css";
// TODO: move this to a hook
import { diffApi } from "../../services/refact";
import { useDiffApplyMutation, useEventsBusForIDE } from "../../hooks";
import { selectOpenFiles } from "../../features/OpenFiles/openFilesSlice";
import { useSelector } from "react-redux";
// import { TruncateLeft } from "../Text";

export type MarkdownProps = Pick<
  React.ComponentProps<typeof ReactMarkdown>,
  "children" | "allowedElements" | "unwrapDisallowed"
> &
  Partial<MarkdownControls> &
  Pick<
    MarkdownCodeBlockProps,
    "startingLineNumber" | "showLineNumbers" | "useInlineStyles" | "style"
  > & { canHavePins?: boolean };

const MaybePinButton: React.FC<{
  key?: Key | null;
  children?: React.ReactNode;
  getMarkdown: (pin: string) => string | undefined;
}> = ({ children, getMarkdown }) => {
  const { diffPreview } = useEventsBusForIDE();
  const { onSubmit, result: _result } = useDiffApplyMutation();
  const openFiles = useSelector(selectOpenFiles);
  const isPin = typeof children === "string" && children.startsWith("📍");
  const markdown = getMarkdown(String(children));

  const patch = diffApi.usePatchSingleFileFromTicketQuery(
    { pin: String(children), markdown: String(markdown) },
    { skip: !isPin || !markdown },
  );

  const handleShow = useCallback(() => {
    if (typeof children !== "string") return;
    if (!markdown) return;
    if (!patch.data) return;
    diffPreview(patch.data);
  }, [children, diffPreview, markdown, patch.data]);

  const handleApply = useCallback(() => {
    const results = patch.data?.results ?? [];
    const files = results.reduce<string[]>((acc, cur) => {
      const { file_name_add, file_name_delete, file_name_edit } = cur;
      if (file_name_add) acc.push(file_name_add);
      if (file_name_delete) acc.push(file_name_delete);
      if (file_name_edit) acc.push(file_name_edit);
      return acc;
    }, []);

    const fileIsOpen = files.some((file) => openFiles.includes(file));

    if (fileIsOpen) {
      handleShow();
    } else if (patch.data) {
      const chunks = patch.data.chunks;
      const toApply = chunks.map(() => true);
      void onSubmit({ chunks, toApply });
    }
  }, [handleShow, onSubmit, openFiles, patch.data]);

  // TODO: ui, handle small screens
  if (isPin) {
    return (
      <Flex my="2" gap="2" wrap="wrap">
        <Text
          as="p"
          wrap="wrap"
          style={{ lineBreak: "anywhere", wordBreak: "break-all" }}
        >
          {children}
        </Text>
        <Flex gap="2" justify="end" ml="auto">
          <Button
            size="1"
            loading={!patch.data}
            onClick={handleShow}
            title={"Show Patch"}
            disabled={!!patch.error}
          >
            Open
          </Button>
          <Button
            size="1"
            loading={!patch.data}
            onClick={handleApply}
            disabled={!!patch.error}
            title={patch.error ? "Patch applied" : "Apply patch"}
          >
            Apply
          </Button>
        </Flex>
      </Flex>
    );
  }

  return (
    <Text my="2" as="p">
      {children}
    </Text>
  );
};

function processPinAndMarkdown(message?: string | null): Map<string, string> {
  if (!message) return new Map<string, string>();

  const regexp = /📍[\s\S]*?\n```\n/g;

  const results = message.match(regexp) ?? [];

  const pinsAndMarkdown = results.map<[string, string]>((result) => {
    const firstNewLine = result.indexOf("\n");
    const pin = result.slice(0, firstNewLine);
    const markdown = result.slice(firstNewLine + 1);
    return [pin, markdown];
  });

  const hashMap = new Map(pinsAndMarkdown);

  return hashMap;
}

// TODO: MaybePinButton is exclusive to assistant messages
const _Markdown: React.FC<MarkdownProps> = ({
  children,
  allowedElements,
  unwrapDisallowed,
  canHavePins,
  ...rest
}) => {
  const pinsAndMarkdown = useMemo<Map<string, string>>(
    () => processPinAndMarkdown(children),
    [children],
  );

  const getMarkDownForPin = useCallback(
    (pin: string) => {
      return pinsAndMarkdown.get(pin);
    },
    [pinsAndMarkdown],
  );

  const components: Partial<Components> = useMemo(() => {
    return {
      ol(props) {
        return (
          <ol {...props} className={classNames(styles.list, props.className)} />
        );
      },
      ul(props) {
        return (
          <ul {...props} className={classNames(styles.list, props.className)} />
        );
      },
      code({ style: _style, ...props }) {
        return <MarkdownCodeBlock {...props} {...rest} />;
      },
      p({ color: _color, ref: _ref, node: _node, ...props }) {
        if (canHavePins) {
          return <MaybePinButton {...props} getMarkdown={getMarkDownForPin} />;
        }
        return <Text my="2" as="p" {...props} />;
      },
      h1({ color: _color, ref: _ref, node: _node, ...props }) {
        return <Heading my="6" size="8" as="h1" {...props} />;
      },
      h2({ color: _color, ref: _ref, node: _node, ...props }) {
        return <Heading my="6" size="7" as="h2" {...props} />;
      },
      h3({ color: _color, ref: _ref, node: _node, ...props }) {
        return <Heading my="6" size="6" as="h3" {...props} />;
      },
      h4({ color: _color, ref: _ref, node: _node, ...props }) {
        return <Heading my="5" size="5" as="h4" {...props} />;
      },
      h5({ color: _color, ref: _ref, node: _node, ...props }) {
        return <Heading my="4" size="4" as="h5" {...props} />;
      },
      h6({ color: _color, ref: _ref, node: _node, ...props }) {
        return <Heading my="3" size="3" as="h6" {...props} />;
      },
      blockquote({ color: _color, ref: _ref, node: _node, ...props }) {
        return <Blockquote {...props} />;
      },
      em({ color: _color, ref: _ref, node: _node, ...props }) {
        return <Em {...props} />;
      },
      kbd({ color: _color, ref: _ref, node: _node, ...props }) {
        return <Kbd {...props} />;
      },
      a({ color: _color, ref: _ref, node: _node, ...props }) {
        return <Link {...props} />;
      },
      q({ color: _color, ref: _ref, node: _node, ...props }) {
        return <Quote {...props} />;
      },
      strong({ color: _color, ref: _ref, node: _node, ...props }) {
        return <Strong {...props} />;
      },
      b({ color: _color, ref: _ref, node: _node, ...props }) {
        return <Text {...props} weight="bold" />;
      },
      i({ color: _color, ref: _ref, node: _node, ...props }) {
        return <Em {...props} />;
      },
    };
  }, [getMarkDownForPin, rest, canHavePins]);
  return (
    <ReactMarkdown
      className={styles.markdown}
      remarkPlugins={[remarkBreaks, remarkMath]}
      rehypePlugins={[rehypeKatex]}
      allowedElements={allowedElements}
      unwrapDisallowed={unwrapDisallowed}
      components={components}
    >
      {children}
    </ReactMarkdown>
  );
};

export const Markdown = React.memo(_Markdown);
