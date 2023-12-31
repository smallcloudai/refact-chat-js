import React from "react";
import ReactMarkdown from "react-markdown";
import SyntaxHighlighter from "react-syntax-highlighter";
import { Code } from "@radix-ui/themes";
import { RightButton } from "../Buttons/Buttons";
import { ScrollArea } from "../ScrollArea";
import remarkBreaks from "remark-breaks";
import classNames from "classnames";
import "./highlightjs.css";
import styles from "./Markdown.module.css";

const PreTagWithCopyButton: React.FC<
  React.PropsWithChildren<{
    onClick?: () => void;
  }>
> = ({ children, onClick, ...props }) => {
  if (!onClick) return <pre {...props}>{children}</pre>;

  return (
    <ScrollArea scrollbars="horizontal">
      <pre {...props}>
        <RightButton onClick={onClick}>Copy</RightButton>
        {children}
      </pre>
    </ScrollArea>
  );
};

export const Markdown: React.FC<
  Pick<React.ComponentProps<typeof ReactMarkdown>, "children"> & {
    onCopyClick?: (str: string) => void;
  }
> = ({ children, onCopyClick }) => {
  return (
    <ReactMarkdown
      remarkPlugins={[remarkBreaks]}
      components={{
        code(props) {
          const {
            children,
            className,
            node,
            color: _color,
            ref: _ref,
            ...rest
          } = props;
          const match = /language-(\w+)/.exec(className ?? "");

          const textWithOutTrailingNewLine = String(children).replace(
            /\n$/,
            "",
          );

          const renderedText = node?.children.reduce((acc, elem) => {
            if (elem.type === "text") {
              return acc + elem.value;
            }
            return acc;
          }, "");

          const PreTag: React.FC<React.PropsWithChildren> = (props) => (
            <PreTagWithCopyButton
              onClick={() => {
                if (renderedText && onCopyClick) onCopyClick(renderedText);
              }}
              {...props}
            />
          );

          return match ? (
            <SyntaxHighlighter
              className={className}
              PreTag={PreTag}
              language={match[1]}
              useInlineStyles={false}
              // wrapLines={true}
              // wrapLongLines
            >
              {textWithOutTrailingNewLine}
            </SyntaxHighlighter>
          ) : (
            <Code {...rest} className={classNames(styles.code, className)}>
              {children}
            </Code>
          );
        },
      }}
    >
      {children}
    </ReactMarkdown>
  );
};
