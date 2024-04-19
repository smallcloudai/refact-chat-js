import React from "react";
import { Flex, Text, Box, Heading } from "@radix-ui/themes";
import type { FimDebugData } from "../../services/refact";
import { SearchContext } from "./SearchContext";
import { ScrollArea } from "../ScrollArea";

export type FimDebugProps = { data: FimDebugData };

export const FIMDebug: React.FC<FimDebugProps> = ({ data }) => {
  return (
    <ScrollArea scrollbars="vertical" fullHeight>
      {/** change scrollbars to both to remove word wrap */}
      <Flex direction="column" px="2" py="2" height="100%">
        <Heading size="4" wrap="nowrap" style={{ overflow: "hidden" }}>
          Code Completion Context
        </Heading>
        {data.context ? (
          <SearchContext data={data.context} />
        ) : (
          <Box py="2" overflow="hidden">
            <Text wrap="nowrap" size="2">
              Completion Context{" "}
              {data.cached ? "Cache Used." : "Cache Not Used."}
            </Text>
          </Box>
        )}

        <Box mt="auto" overflow="hidden">
          <Text wrap="nowrap" style={{ overflow: "hidden" }} size="1">
            {data.context?.fim_ms !== undefined && (
              <div>milliseconds: {data.context.fim_ms}</div>
            )}
            {data.context?.n_ctx !== undefined && (
              <div>context size: {data.context.n_ctx}</div>
            )}
            <div>model: {data.model}</div>
          </Text>
        </Box>
      </Flex>
    </ScrollArea>
  );
};
