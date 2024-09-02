import React from "react";
import { Box } from "@radix-ui/themes";
import { Text, TruncateLeft } from "../Text";
import { ChatContextFile } from "../../services/refact";
import { PlainText } from "../ChatContent/PlainText";
import styles from "./ChatForm.module.css";

export const FilesPreview: React.FC<{
  files: (ChatContextFile | string)[];
  // onRemovePreviewFile: (name: string) => void;
}> = ({ files }) => {
  if (files.length === 0) return null;
  return (
    <Box p="2" pb="0">
      {files.map((file, i) => {
        if (typeof file === "string") {
          return (
            <pre key={"plain_text_" + i} className={styles.file}>
              <Text size="1" className={styles.file_name}>
                <PlainText>{file}</PlainText>
              </Text>
            </pre>
          );
        }
        const lineText =
          file.line1 && file.line2 ? `:${file.line1}-${file.line2}` : "";
        return (
          <pre key={file.file_name + i} className={styles.file}>
            <Text
              size="1"
              title={file.file_content}
              className={styles.file_name}
            >
              📎{" "}
              <TruncateLeft>
                {file.file_name}
                {lineText}
              </TruncateLeft>
            </Text>
          </pre>
        );
      })}
    </Box>
  );
};
