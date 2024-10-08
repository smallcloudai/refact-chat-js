import React, { CSSProperties } from "react";
import SyntaxHighlighter, {
  type SyntaxHighlighterProps,
} from "react-syntax-highlighter";
import { Code, Text } from "@radix-ui/themes";
import classNames from "classnames";
import { PreTag, type PreTagProps } from "./Pre";
// import "./highlightjs.css";
import styles from "./Markdown.module.css";
import type { Element } from "hast";
import hljsStyle from "react-syntax-highlighter/dist/esm/styles/hljs/agate";
import { trimIndent } from "../../utils";
import { useDiffPreview } from "../../hooks";
import { convertMarkdownToDiffChunk } from "./convertMarkdownToDiffChunk";

export type MarkdownControls = {
  onCopyClick: (str: string) => void;
  onNewFileClick: (str: string) => void;
  onPasteClick: (str: string) => void;
  canPaste: boolean;
};

function useDiff(language: string, markdown: string) {
  const isDiff = language === "language-diff";
  const chunk = convertMarkdownToDiffChunk(markdown);
  const { onPreview } = useDiffPreview([chunk]);
  return { onPreview, isDiff };
}

export type MarkdownCodeBlockProps = React.JSX.IntrinsicElements["code"] &
  Partial<MarkdownControls> & {
    node?: Element | undefined;
    style?: Record<string, CSSProperties> | SyntaxHighlighterProps["style"];
  } & Pick<
    SyntaxHighlighterProps,
    "showLineNumbers" | "startingLineNumber" | "useInlineStyles"
  >;

const _MarkdownCodeBlock: React.FC<MarkdownCodeBlockProps> = ({
  children,
  className,
  onCopyClick,
  onNewFileClick,
  onPasteClick,
  canPaste,
  style = hljsStyle,
}) => {
  const codeRef = React.useRef<HTMLElement | null>(null);
  const match = /language-(\w+)/.exec(className ?? "");
  const textWithOutTrailingNewLine = String(children); //.replace(/\n$/, "");
  const textWithOutIndent = trimIndent(textWithOutTrailingNewLine);
  const { isDiff, onPreview } = useDiff(
    className ?? "",
    textWithOutTrailingNewLine,
  );
  const preTagProps: PreTagProps =
    onCopyClick && onNewFileClick && onPasteClick
      ? {
          onCopyClick: () => {
            if (codeRef.current?.textContent) {
              onCopyClick(codeRef.current.textContent);
            }
          },
          onNewFileClick: () => {
            if (codeRef.current?.textContent) {
              onNewFileClick(codeRef.current.textContent);
            }
          },
          onPasteClick: () => {
            if (isDiff) {
              void onPreview([true]);
            } else if (codeRef.current?.textContent) {
              onPasteClick(codeRef.current.textContent);
            }
          },
          canPaste: !!canPaste,
        }
      : {};

  if (match ?? String(children).includes("\n")) {
    const language: string = match && match.length > 0 ? match[1] : "text";
    return (
      <Text size="2">
        <SyntaxHighlighter
          style={style}
          className={className}
          PreTag={(props) => <PreTag {...props} {...preTagProps} />}
          CodeTag={(props) => (
            <Code
              {...props}
              className={classNames(styles.code, styles.code_block)}
              ref={codeRef}
            />
          )}
          language={language}
          // useInlineStyles={false}
        >
          {textWithOutIndent}
        </SyntaxHighlighter>
      </Text>
    );
  }

  return (
    <Code className={classNames(styles.code, styles.code_inline, className)}>
      {children}
    </Code>
  );
};

export const MarkdownCodeBlock = React.memo(_MarkdownCodeBlock);
