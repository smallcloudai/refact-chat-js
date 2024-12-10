import React, { useCallback, useMemo } from "react";
import {
  diffApi,
  isUserMessage,
  linksApi,
  LspChatMessage,
  type ChatLink,
} from "..//services/refact";
import { useAppDispatch } from "./useAppDispatch";
import { useAppSelector } from "./useAppSelector";
import { useEventsBusForIDE } from "./useEventBusForIDE";
import { useGetCapsQuery } from "./useGetCapsQuery";
import { useSendChatRequest } from "./useSendChatRequest";
import {
  newIntegrationChat,
  selectChatId,
  selectIntegration,
  selectIsStreaming,
  selectIsWaiting,
  selectMessages,
  selectModel,
  selectThreadMode,
  setIntegrationData,
} from "../features/Chat";
import {
  popBackTo,
  push,
  selectCurrentPage,
} from "../features/Pages/pagesSlice";
import { isAbsolutePath } from "../utils";
import { formatMessagesForChat } from "../features/Chat/Thread/utils";
import { clearInformation } from "../features/Errors/informationSlice";

export function useLinksFromLsp() {
  const dispatch = useAppDispatch();
  const { queryPathThenOpenFile } = useEventsBusForIDE();
  const { submit } = useSendChatRequest();
  const currentPage = useAppSelector(selectCurrentPage);

  const [applyPatches, _applyPatchesResult] =
    diffApi.useApplyAllPatchesInMessagesMutation();

  const isStreaming = useAppSelector(selectIsStreaming);
  const isWaiting = useAppSelector(selectIsWaiting);
  const messages = useAppSelector(selectMessages);
  const chatId = useAppSelector(selectChatId);
  const maybeIntegration = useAppSelector(selectIntegration);
  const threadMode = useAppSelector(selectThreadMode);

  // TODO: add the model
  const caps = useGetCapsQuery();

  const model =
    useAppSelector(selectModel) || caps.data?.code_chat_default_model;

  const unCalledTools = React.useMemo(() => {
    if (messages.length === 0) return false;
    const last = messages[messages.length - 1];
    //TODO: handle multiple tool calls in last assistant message
    if (last.role !== "assistant") return false;
    const maybeTools = last.tool_calls;
    if (maybeTools && maybeTools.length > 0) return true;
    return false;
  }, [messages]);

  const handleGoTo = useCallback(
    (goto?: string) => {
      if (!goto) return;
      // TODO:  duplicated in smart links.
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
              // projectPath: isFile ? payload : "",
              integrationName:
                !isFile && payload !== "DEFAULT"
                  ? payload
                  : maybeIntegration?.name,
              integrationPath: isFile ? payload : maybeIntegration?.path,
              projectPath: maybeIntegration?.project,
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
    },
    [
      dispatch,
      maybeIntegration?.name,
      maybeIntegration?.path,
      maybeIntegration?.project,
      queryPathThenOpenFile,
    ],
  );

  const handleLinkAction = useCallback(
    (link: ChatLink) => {
      if (!("action" in link)) return;

      if (link.action === "goto" && "goto" in link) {
        handleGoTo(link.goto);
        return;
      }

      if (link.action === "patch-all") {
        void applyPatches(messages).then(() => {
          if ("goto" in link) {
            handleGoTo(link.goto);
          }
        });
        return;
      }

      if (link.action === "follow-up") {
        submit(link.text);
        return;
      }

      if (link.action === "summarize-project") {
        if ("current_config_file" in link && link.current_config_file) {
          dispatch(setIntegrationData({ path: link.current_config_file }));
          // set the integration data
        }
        submit(link.text, "PROJECT_SUMMARY");
        return;
      }

      // if (link.action === "commit") {
      //   // TODO: there should be an endpoint for this
      //   void applyPatches(messages).then(() => {
      //     if ("goto" in link && link.goto) {
      //       handleGoTo(link.goto);
      //     }
      //   });

      //   return;
      // }

      // eslint-disable-next-line no-console
      console.warn(`unknown action: ${JSON.stringify(link)}`);
    },
    [applyPatches, dispatch, handleGoTo, messages, submit],
  );

  const handleSmartLink = useCallback(
    (
      sl_chat: LspChatMessage[],
      integrationName: string,
      integrationPath: string,
      integrationProject: string,
    ) => {
      const messages = formatMessagesForChat(sl_chat);

      dispatch(clearInformation());
      dispatch(
        newIntegrationChat({
          integration: {
            name: integrationName,
            path: integrationPath,
            project: integrationProject,
          },
          messages,
        }),
      );
      dispatch(push({ name: "chat" }));
    },
    [dispatch],
  );

  const skipLinksRequest = useMemo(() => {
    if (currentPage?.name !== "chat") return true;
    const lastMessageIsUserMessage =
      messages.length > 0 && isUserMessage(messages[messages.length - 1]);
    if (!model) return true;
    if (!caps.data) return true;
    return (
      isStreaming || isWaiting || unCalledTools || lastMessageIsUserMessage
    );
  }, [
    caps.data,
    currentPage?.name,
    isStreaming,
    isWaiting,
    messages,
    model,
    unCalledTools,
  ]);

  const linksResult = linksApi.useGetLinksForChatQuery(
    {
      chat_id: chatId,
      messages,
      model: model ?? "",
      mode: threadMode, // TODO: Changing thread mode invalidates the cache.
      current_config_file: maybeIntegration?.path,
    },
    { skip: skipLinksRequest },
  );

  return {
    linksResult,
    handleLinkAction,
    handleSmartLink,
    handleGoTo,
    streaming: isWaiting || isStreaming || unCalledTools,
  };
}
