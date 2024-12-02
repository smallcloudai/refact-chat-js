import React from "react";
import { Flex, Button } from "@radix-ui/themes";
import { linksApi } from "../../services/refact/links";
import { useAppSelector } from "../../hooks";
import {
  selectChatId,
  selectIsStreaming,
  selectIsWaiting,
  selectMessages,
} from "../../features/Chat";

export const ChatLinks: React.FC = () => {
  const isStreaming = useAppSelector(selectIsStreaming);
  const isWaiting = useAppSelector(selectIsWaiting);
  const messages = useAppSelector(selectMessages);
  const chatId = useAppSelector(selectChatId);

  const unCalledTools = React.useMemo(() => {
    if (messages.length === 0) return false;
    const last = messages[messages.length - 1];
    //TODO: handle multiple tool calls in last assistant message
    if (last.role !== "assistant") return false;
    const maybeTools = last.tool_calls;
    if (maybeTools && maybeTools.length > 0) return true;
    return false;
  }, [messages]);

  const linksRequest = linksApi.useGetLinksForChatQuery(
    { chat_id: chatId, messages: messages },
    {
      skip: isStreaming || isWaiting || unCalledTools,
    },
  );

  // TODO: loading state
  // TODO: similar code for handling goto: here https://github.com/smallcloudai/refact-chat-js/pull/185/files#diff-2bd903c64449082f680be3f2a6202399a322a44b1a16c023432962e9491a00e8R244-R283

  // TODO: error state

  if (!linksRequest.data) return null;

  return (
    <Flex gap="2" wrap="wrap" direction="column" align="start">
      {linksRequest.data.links.map((link, index) => {
        const key = `chat-link-${index}`;
        return (
          <Button
            size="1"
            radius="full"
            key={key}
            title={link.action ?? link.goto}
          >
            {link.text}
          </Button>
        );
      })}
    </Flex>
  );
};
