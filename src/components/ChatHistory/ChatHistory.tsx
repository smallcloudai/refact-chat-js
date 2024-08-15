import React from "react";
import { Flex, Box } from "@radix-ui/themes";
import { ScrollArea } from "../ScrollArea";
import { HistoryItem } from "./HistoryItem";
// import type { ChatHistoryItem } from "../../hooks/useChatHistory";
import type { ChatHistoryItem } from "../../features/History/historySlice";
import type { ChatThread } from "../../features/Chat/chatThread";

export type ChatHistoryProps = {
  history: ChatHistoryItem[];
  onHistoryItemClick: (id: ChatThread) => void;
  onDeleteHistoryItem: (id: string) => void;
  onOpenChatInTab?: (id: string) => void;
  currentChatId?: string;
};

export const ChatHistory: React.FC<ChatHistoryProps> = ({
  history,
  onHistoryItemClick,
  onDeleteHistoryItem,
  onOpenChatInTab,
  currentChatId,
}) => {
  return (
    <Box
      style={{
        overflow: "hidden",
      }}
      pb="2"
      flexGrow="1"
    >
      <ScrollArea scrollbars="vertical">
        <Flex justify="center" align="center" pl="2" pr="2" direction="column">
          {history.map((item) => (
            <HistoryItem
              onClick={() => onHistoryItemClick(item)}
              onOpenInTab={onOpenChatInTab}
              onDelete={onDeleteHistoryItem}
              key={item.id}
              historyItem={item}
              disabled={item.id === currentChatId}
            />
          ))}
        </Flex>
      </ScrollArea>
    </Box>
  );
};
