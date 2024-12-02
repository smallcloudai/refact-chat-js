import React from "react";
import { Flex, Button } from "@radix-ui/themes";
import {
  linksApi,
  type ChatLink,
  ChatLinkActions,
} from "../../services/refact/links";
import { diffApi } from "../../services/refact";
import { useAppSelector, useEventsBusForIDE } from "../../hooks";
import {
  selectChatId,
  selectIsStreaming,
  selectIsWaiting,
  selectMessages,
} from "../../features/Chat";
import { popBackTo } from "../../features/Pages/pagesSlice";

function maybeConcatActionAndGoToStrings(
  action?: string,
  goto?: string,
): string | undefined {
  if (!action && !goto) return "";
  if (action && goto) return `action: ${action}\ngoto: ${goto}`;
  return action ?? goto;
}

const isAbsolutePath = (path: string) => {
  const absolutePathRegex = /^(?:[a-zA-Z]:\\|\/|\\\\|\/\/).*/;
  return absolutePathRegex.test(path);
};

export const ChatLinks: React.FC = () => {
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
    // TODO: handle goto, duplicated in smart links.
    const [action, payload] = goto.split(":");

    switch (action.toLowerCase()) {
      case "editor": {
        void queryPathThenOpenFile({ file_name: payload });
        return;
      }
      case "settings": {
        const isFile = isAbsolutePath(payload);
        popBackTo({
          name: "integrations page",
          projectPath: isFile ? payload : undefined,
          integrationName: !isFile ? payload : undefined,
        });
        // TODO: open in the integrations
        return;
      }
      default: {
        console.log(`[DEBUG]: unexpected action, doing nothing`);
        // detect if name or file.
        return;
      }
    }
  };
  const handleLinkAction = (link: ChatLink) => {
    switch (link.action) {
      case undefined: {
        return;
      }
      case ChatLinkActions.Goto: {
        // will have "goto"
        // handle goto
        handleGoTo(link.goto);
        return;
      }
      case ChatLinkActions.PatchAll: {
        // "/v1/patch-apply-all"
        void applyPatches(messages);
        return;
      }
      case ChatLinkActions.Commit: {
        // "/v1/git-stage-and-commit"
        return;
      }
      case ChatLinkActions.FollowUp: {
        return;
      }
      case ChatLinkActions.SummarizeProject: {
        return;
      }
      default: {
        // eslint-disable-next-line no-console
        console.warn(`unknown action: ${link.action}`);
      }
    }
  };
  const handleClick = (link: ChatLink) => {
    if (!link.action && link.goto) {
      handleGoTo(link.goto);
    } else {
      handleLinkAction(link);
    }
  };

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
        return <ChatLinkButton key={key} link={link} onClick={handleClick} />;
      })}
    </Flex>
  );
};

const ChatLinkButton: React.FC<{
  link: ChatLink;
  onClick: (link: ChatLink) => void;
}> = ({ link, onClick }) => {
  const title = maybeConcatActionAndGoToStrings(link.action, link.goto);
  const handleClick = React.useCallback(() => onClick(link), [link, onClick]);

  return (
    <Button size="1" radius="full" title={title} onClick={handleClick}>
      {link.text}
    </Button>
  );
};
