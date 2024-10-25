import React from "react";
import type { Config } from "../Config/configSlice";
import { Chat as ChatComponent } from "../../components/Chat";
import { useAppSelector } from "../../hooks";
import { useGetCapsQuery } from "../../hooks/useGetCapsQuery";
import { selectMessages } from "./Thread";

export type ChatProps = {
  host: Config["host"];
  tabbed: Config["tabbed"];
  style?: React.CSSProperties;
  backFromChat: () => void;
};

export const Chat: React.FC<ChatProps> = ({
  style,
  backFromChat,
  host,
  tabbed,
}) => {
  const capsRequest = useGetCapsQuery();

  const messages = useAppSelector(selectMessages);

  const sendToSideBar = () => {
    // TODO:
  };

  const maybeSendToSideBar =
    host === "vscode" && tabbed ? sendToSideBar : undefined;

  // can be a selector
  const unCalledTools = React.useMemo(() => {
    if (messages.length === 0) return false;
    const last = messages[messages.length - 1];
    if (last.role !== "assistant") return false;
    const maybeTools = last.tool_calls;
    if (maybeTools && maybeTools.length > 0) return true;
    return false;
  }, [messages]);

  return (
    <ChatComponent
      style={style}
      host={host}
      tabbed={tabbed}
      backFromChat={backFromChat}
      unCalledTools={unCalledTools}
      // TODO: This could be moved lower in the component tree
      caps={{
        error: capsRequest.error ? "error fetching caps" : null,
        fetching: capsRequest.isFetching,
        default_cap: capsRequest.data?.code_chat_default_model ?? "",
        available_caps: capsRequest.data?.code_chat_models ?? {},
      }}
      maybeSendToSidebar={maybeSendToSideBar}
      // TODO: This can be removed
      // requestPreviewFiles={() => ({})}
    />
  );
};
