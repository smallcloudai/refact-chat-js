import React, { useEffect } from "react";
import { Flex, Button } from "@radix-ui/themes";
import { linksApi, type ChatLink } from "../../services/refact/links";
import { diffApi, isUserMessage } from "../../services/refact";
import {
  useAppDispatch,
  useAppSelector,
  useEventsBusForIDE,
} from "../../hooks";
import {
  selectChatId,
  selectIsStreaming,
  selectIsWaiting,
  selectMessages,
} from "../../features/Chat";
import { popBackTo } from "../../features/Pages/pagesSlice";

function maybeConcatActionAndGoToStrings(link: ChatLink): string | undefined {
  const hasAction = "action" in link;
  const hasGoTo = "goto" in link;
  if (!hasAction && !hasGoTo) return "";
  if (hasAction && hasGoTo) return `action: ${link.action}\ngoto: ${link.goto}`;
  if (hasAction) return `action: ${link.action}`;
  return `goto: ${link.goto}`;
}

const isAbsolutePath = (path: string) => {
  const absolutePathRegex = /^(?:[a-zA-Z]:\\|\/|\\\\|\/\/).*/;
  return absolutePathRegex.test(path);
};

export const ChatLinks: React.FC = () => {
  const dispatch = useAppDispatch();
  const { queryPathThenOpenFile } = useEventsBusForIDE();

  const [applyPatches, _applyPatchesResult] =
    diffApi.useApplyAllPatchesInMessagesMutation();

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

  const handleGoTo = (goto?: string) => {
    if (!goto) return;
    // TODO:  uplicated in smart links.
    const [action, payload] = goto.split(":");

    switch (action.toLowerCase()) {
      case "editor": {
        void queryPathThenOpenFile({ file_name: payload });
        return;
      }
      case "settings": {
        const isFile = isAbsolutePath(payload);
        dispatch(
          popBackTo({
            name: "integrations page",
            projectPath: isFile ? payload : undefined,
            integrationName: !isFile ? payload : undefined,
          }),
        );
        // TODO: open in the integrations
        return;
      }
      default: {
        // eslint-disable-next-line no-console
        console.log(`[DEBUG]: unexpected action, doing nothing`);
        return;
      }
    }
  };
  const handleLinkAction = (link: ChatLink) => {
    if (!("action" in link)) return;
    if (link.action === "goto" && "goto" in link) {
      handleGoTo(link.goto);
      return;
    }
    if (link.action === "patch-all") {
      void applyPatches(messages);
      return;
    }

    if (link.action === "commit") {
      return;
    }

    if (link.action === "follow-up") {
      return;
    }

    if (link.action === "summarize-project") {
      return;
    }

    // eslint-disable-next-line no-console
    console.warn(`unknown action: ${JSON.stringify(link)}`);
  };
  const handleClick = (link: ChatLink) => {
    if (!("action" in link) && "goto" in link) {
      handleGoTo(link.goto);
    } else {
      handleLinkAction(link);
    }
  };

  const [linksRequest, linksResult] = linksApi.useGetLinksForChatMutation();

  useEffect(() => {
    if (
      !isStreaming &&
      !isWaiting &&
      !unCalledTools &&
      messages.length > 0 &&
      !isUserMessage(messages[messages.length - 1])
    ) {
      void linksRequest({ chat_id: chatId, messages: messages });
    }
  }, [chatId, isStreaming, isWaiting, linksRequest, messages, unCalledTools]);

  // TODO: waiting, errors, maybe add a title

  if (!linksResult.data) return null;

  return (
    <Flex gap="2" wrap="wrap" direction="column" align="start">
      {linksResult.data.links.map((link, index) => {
        const key = `chat-link-${index}`;
        return <ChatLinkButton key={key} link={link} onClick={handleClick} />;
      })}
    </Flex>
  );
};

const ChatLinkButton: React.FC<{
  link: ChatLink;
  onClick: (link: ChatLink) => void;
}> = ({ link, onClick }) => {
  const title = maybeConcatActionAndGoToStrings(link);
  const handleClick = React.useCallback(() => onClick(link), [link, onClick]);

  return (
    <Button size="1" radius="full" title={title} onClick={handleClick}>
      {link.text}
    </Button>
  );
};
