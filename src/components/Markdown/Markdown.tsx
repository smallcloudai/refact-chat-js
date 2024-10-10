import React, { Key, useMemo } from "react";
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
  Card,
} from "@radix-ui/themes";
import rehypeKatex from "rehype-katex";
import remarkMath from "remark-math";
import "katex/dist/katex.min.css";
import { usePatchActions } from "../../hooks";

import { ErrorCallout, DiffWarningCallout } from "../Callout";

import { TruncateLeft } from "../Text";

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
}> = ({ children }) => {
  const isPin = typeof children === "string" && children.startsWith("📍");

  const {
    handleApply,
    handleShow,
    errorMessage,
    resetErrorMessage,
    disable,
    openFile,
  } = usePatchActions();

  if (isPin && children.startsWith("📍OTHER")) {
    return null;
  }

  if (isPin) {
    const [_cmd, _ticket, filePath, ..._rest] = children.split(" ");
    return (
      <Card className={styles.patch_title} size="1" variant="surface" mt="4">
        <Flex gap="2" py="2" pl="2">
          <TruncateLeft>
            <Link
              href=""
              title="Open file"
              onClick={(event) => {
                event.preventDefault();
                openFile({ file_name: filePath });
              }}
            >
              {filePath}
            </Link>
          </TruncateLeft>{" "}
          <Flex gap="2" justify="end" ml="auto">
            <Button
              size="1"
              onClick={() => handleShow(children)}
              disabled={disable}
              title={`Show: ${children}`}
            >
              Show
            </Button>
            <Button
              size="1"
              onClick={() => handleApply(children)}
              disabled={disable}
              title={`Apply: ${children}`}
            >
              Apply
            </Button>
          </Flex>
        </Flex>
        {errorMessage && errorMessage.type === "error" && (
          <ErrorCallout onClick={resetErrorMessage} timeout={5000}>
            {errorMessage.text}
          </ErrorCallout>
        )}
        {errorMessage && errorMessage.type === "warning" && (
          <DiffWarningCallout
            timeout={5000}
            onClick={resetErrorMessage}
            message={errorMessage.text}
          />
        )}
      </Card>
    );
  }

  return (
    <Text my="2" as="p">
      {children}
    </Text>
  );
};

const _Markdown: React.FC<MarkdownProps> = ({
  children,
  allowedElements,
  unwrapDisallowed,
  canHavePins,
  ...rest
}) => {
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
          return <MaybePinButton {...props} />;
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
  }, [rest, canHavePins]);
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
