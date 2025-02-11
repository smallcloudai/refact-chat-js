import React, { useEffect } from "react";
import type { Config } from "../Config/configSlice";
import { Chat as ChatComponent } from "../../components/Chat";
import { useAppDispatch, useAppSelector } from "../../hooks";
import {
  newChatAction,
  restoreChat,
  selectChatFromCacheOrHistory,
  selectMessages,
  selectThread,
} from "./Thread";
import { useNavigate, useParams } from "react-router";

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
  const dispatch = useAppDispatch();
  const messages = useAppSelector(selectMessages);
  const maybeChatId = useParams().chatId;
  const cached = useAppSelector(selectChatFromCacheOrHistory(maybeChatId));
  const thread = useAppSelector(selectThread);
  // const navigate = useNavigate();
  useEffect(() => {
    // TODO: create a new chat and navigate to it
    // if (maybeChatId === undefined) {
    //   dispatch(newChatAction());
    // } else
    if (thread.id !== maybeChatId && cached) {
      dispatch(restoreChat(cached));
    }
  }, [cached, dispatch, maybeChatId, thread.id]);

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
      // style not used
      style={style}
      // host not used
      host={host}
      // tabbed not used
      tabbed={tabbed}
      // back ... can be a link
      backFromChat={backFromChat}
      unCalledTools={unCalledTools}
    />
  );
};
