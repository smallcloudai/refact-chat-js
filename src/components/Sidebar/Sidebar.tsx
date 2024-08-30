import React, { useCallback } from "react";
import { Box, Flex, Button } from "@radix-ui/themes";
import { ChatHistory, type ChatHistoryProps } from "../ChatHistory";
import { DropdownNavigationOptions, Footer } from "./Footer";
import { Spinner } from "@radix-ui/themes";
import { useAppSelector, useAppDispatch } from "../../hooks";
import {
  getHistory,
  deleteChatById,
} from "../../features/History/historySlice";
import {
  newChatAction,
  restoreChat,
  type ChatThread,
} from "../../features/Chat/Thread";
import { useTourRefs } from "../../features/Tour";

export type SidebarProps = {
  takingNotes: boolean;
  className?: string;
  style?: React.CSSProperties;
  handleNavigation: (to: DropdownNavigationOptions | "chat") => void;
} & Omit<
  ChatHistoryProps,
  | "history"
  | "onDeleteHistoryItem"
  | "onCreateNewChat"
  | "onHistoryItemClick"
  | "currentChatId"
>;

export const Sidebar: React.FC<SidebarProps> = ({
  takingNotes,
  style,
  handleNavigation,
}) => {
  // TODO: these can be lowered.
  const dispatch = useAppDispatch();
  const history = useAppSelector(getHistory, {
    // TODO: selector issue here
    devModeChecks: { stabilityCheck: "never" },
  });

  const onDeleteHistoryItem = (id: string) => dispatch(deleteChatById(id));
  const onCreateNewChat = () => {
    dispatch(newChatAction());
    handleNavigation("chat");
  };
  const onHistoryItemClick = useCallback(
    (thread: ChatThread) => {
      dispatch(restoreChat(thread));
      handleNavigation("chat");
    },
    [dispatch, handleNavigation],
  );

  const refs = useTourRefs();

  return (
    <Flex direction="column" style={style}>
      <Flex mt="4" mb="4">
        <Box position="absolute" ml="5" mt="2">
          <Spinner loading={takingNotes} title="taking notes" />
        </Box>
        <Button
          variant="outline"
          ml="auto"
          mr="auto"
          onClick={onCreateNewChat}
          ref={(x) => refs.setNewChat(x)}
        >
          Start a new chat
        </Button>
      </Flex>
      <ChatHistory
        history={history}
        onHistoryItemClick={onHistoryItemClick}
        onDeleteHistoryItem={onDeleteHistoryItem}
      />
      <Flex p="2" pb="4">
        <Footer handleNavigation={handleNavigation} />
      </Flex>
    </Flex>
  );
};
