import { Box, Button, Card, Container, Flex } from "@radix-ui/themes";
import { ScrollArea } from "../ScrollArea";
import { MarkdownCodeBlock } from "../Markdown/CodeBlock";
import { RootState } from "../../app/store";
import { useEffect, useState } from "react";
import styles from "./ChatRawJSON.module.css";
import classNames from "classnames";

type ChatHistoryProps = {
  thread: RootState["chat"]["thread"];
  copyHandler: () => void;
  handleClose: () => void;
};

export const ChatRawJSON = ({
  thread,
  copyHandler,
  handleClose,
}: ChatHistoryProps) => {
  const [isOpened, setIsOpened] = useState(false);

  const handleAnimatedClose = () => {
    if (isOpened) {
      setIsOpened(false);
      const timeoutId = setTimeout(() => {
        handleClose();
        clearTimeout(timeoutId);
      }, 600);
    }
  };

  useEffect(() => {
    const timeoutId = setTimeout(() => setIsOpened(true), 200);

    return () => {
      clearTimeout(timeoutId);
    };
  }, []);

  return (
    <Container
      py="2"
      bottom="0"
      className={classNames(styles.container, { [styles.opened]: isOpened })}
    >
      <Card>
        <Flex direction="column" align="center" gap="2">
          <ScrollArea scrollbars="both" asChild>
            <Box py="0" style={{ maxHeight: "35dvh" }}>
              <MarkdownCodeBlock>
                {JSON.stringify(thread, null, 2)}
              </MarkdownCodeBlock>
            </Box>
          </ScrollArea>
          <Flex gap="3" align="center" justify="center">
            <Button onClick={copyHandler}>Copy to clipboard</Button>
            <Button variant="outline" onClick={handleAnimatedClose}>
              Close
            </Button>
          </Flex>
        </Flex>
      </Card>
    </Container>
  );
};
