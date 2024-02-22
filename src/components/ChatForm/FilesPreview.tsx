import React from "react";
import { Box, Text, Button } from "@radix-ui/themes";
import { ChatContextFile } from "../../events";
import styles from "./ChatForm.module.css";

export const FilesPreview: React.FC<{
  files: ChatContextFile[];
  onRemovePreviewFile: (name: string) => void;
}> = ({ files, onRemovePreviewFile }) => {
  if (files.length === 0) return null;
  return (
    <Box p="2">
      {files.map((file, i) => {
        const lineText =
          file.line1 && file.line2 ? `:${file.line1}-${file.line2}` : "";
        return (
          <pre key={file.file_name + i} className={styles.file}>
            <Text
              size="1"
              title={file.file_content}
              className={styles.file_name}
            >
              <Button
                onClick={(event) => {
                  event.preventDefault();
                  onRemovePreviewFile(file.file_name);
                }}
                variant="ghost"
                className={styles.removeFileButton}
              >
                📎
              </Button>
              <Text className={styles.file_name_ellipsis_rtl}>
                &lrm;{" "}
                <Text className={styles.file_name_ellipsis_ltr}>
                  {file.file_name}
                  {lineText}
                </Text>
              </Text>
            </Text>
          </pre>
        );
      })}
    </Box>
  );
};
