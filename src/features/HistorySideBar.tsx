import React from "react";
import { Sidebar } from "../components/Sidebar/Sidebar";
import { useChatHistory } from "../hooks/useChatHistory";

export const HistorySideBar: React.FC = () => {
  const { history, restoreChatFromHistory, createNewChat, deleteChat } =
    useChatHistory();
  return (
    <Sidebar
      history={history}
      onHistoryItemClick={restoreChatFromHistory}
      onCreateNewChat={createNewChat}
      onDeleteHistoryItem={deleteChat}
    />
  );
};
