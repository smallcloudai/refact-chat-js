import { Box, Button, Flex, Heading } from "@radix-ui/themes";
import { ScrollArea } from "../ScrollArea";
import { RootState } from "../../app/store";
import { MarkdownCodeBlock } from "../Markdown/CodeBlock";

type ChatRawJSONProps = {
  thread: RootState["chat"]["thread"];
  copyHandler: () => void;
};

export const ChatRawJSON = ({ thread, copyHandler }: ChatRawJSONProps) => {
  return (
    <Box
      style={{
        width: "100%",
      }}
    >
      <Flex
        direction="column"
        align={"start"}
        style={{
          width: "100%",
        }}
      >
        <Heading as="h3" align="center" mb="5">
          Thread History
        </Heading>
        <Flex
          align="start"
          justify="center"
          direction="column"
          style={{ maxWidth: "70.8dvw" }} // TODO: think about this better
        >
          {/* TODO: Place here all raw json code */}
          <ScrollArea
            scrollbars="horizontal"
            style={{ maxWidth: "100%", maxHeight: "60dvh" }}
          >
            <Box style={{ height: "100%" }}>
              <MarkdownCodeBlock>
                {JSON.stringify(thread, null, 2)}
              </MarkdownCodeBlock>
            </Box>
          </ScrollArea>
          <Flex mt="5" gap="3" align="center" justify="center">
            <Button onClick={copyHandler}>Copy to clipboard</Button>
          </Flex>
        </Flex>
      </Flex>
    </Box>
  );
};
