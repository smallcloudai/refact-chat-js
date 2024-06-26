import React from "react";
import { Sidebar } from "../components/Sidebar/Sidebar";
import { useChatHistory } from "../hooks/useChatHistory";

export const HistorySideBar: React.FC<{
  takingNotes: boolean;
  currentChatId: string;
}> = ({ takingNotes, currentChatId }) => {
  const { history, restoreChatFromHistory, createNewChat, deleteChat } =
    useChatHistory();
  return (
    <Sidebar
      takingNotes={takingNotes}
      history={history}
      onHistoryItemClick={restoreChatFromHistory}
      onCreateNewChat={createNewChat}
      onDeleteHistoryItem={deleteChat}
      currentChatId={currentChatId}
    />
  );
};
