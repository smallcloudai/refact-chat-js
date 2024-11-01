import type { RootState, AppDispatch } from "./store";
import {
  createListenerMiddleware,
  isAnyOf,
  isRejected,
} from "@reduxjs/toolkit";
import {
  chatAskQuestionThunk,
  newChatAction,
  restoreChat,
} from "../features/Chat/Thread";
import { statisticsApi } from "../services/refact/statistics";
import { capsApi, isCapsErrorResponse } from "../services/refact/caps";
import { promptsApi } from "../services/refact/prompts";
import { toolsApi } from "../services/refact/tools";
import { commandsApi, isDetailMessage } from "../services/refact/commands";
import { diffApi } from "../services/refact/diffs";
import { pingApi } from "../services/refact/ping";
import { clearError, setError } from "../features/Errors/errorsSlice";
import { updateConfig } from "../features/Config/configSlice";

export const listenerMiddleware = createListenerMiddleware();
const startListening = listenerMiddleware.startListening.withTypes<
  RootState,
  AppDispatch
>();

startListening({
  // TODO: figure out why this breaks the tests when it's not a function :/
  matcher: isAnyOf(
    (d: unknown): d is ReturnType<typeof newChatAction> =>
      newChatAction.match(d),
    (d: unknown): d is ReturnType<typeof restoreChat> => restoreChat.match(d),
  ),
  effect: (_action, listenerApi) => {
    [
      statisticsApi.util.resetApiState(),
      capsApi.util.resetApiState(),
      promptsApi.util.resetApiState(),
      toolsApi.util.resetApiState(),
      commandsApi.util.resetApiState(),
      diffApi.util.resetApiState(),
      pingApi.util.resetApiState(),
    ].forEach((api) => listenerApi.dispatch(api));

    listenerApi.dispatch(clearError());
  },
});

startListening({
  // TODO: figure out why this breaks the tests when it's not a function :/
  matcher: isAnyOf(isRejected),
  effect: (action, listenerApi) => {
    if (
      capsApi.endpoints.getCaps.matchRejected(action) &&
      !action.meta.condition
    ) {
      const message = isCapsErrorResponse(action.payload?.data)
        ? action.payload.data.detail
        : `fetching caps from lsp`;
      listenerApi.dispatch(setError(message));
    }
    if (
      toolsApi.endpoints.getTools.matchRejected(action) &&
      !action.meta.condition
    ) {
      const errorMessage = isDetailMessage(action.payload?.data)
        ? action.payload.data.detail
        : "fetching tools from lsp.";
      listenerApi.dispatch(setError(errorMessage));
    }
    if (
      promptsApi.endpoints.getPrompts.matchRejected(action) &&
      !action.meta.condition
    ) {
      const errorMessage = isDetailMessage(action.payload?.data)
        ? action.payload.data.detail.split("\n").slice(0, 2).join("\n")
        : `fetching system prompts.`;
      listenerApi.dispatch(setError(errorMessage));
    }

    if (
      chatAskQuestionThunk.rejected.match(action) &&
      !action.meta.aborted &&
      typeof action.payload === "string"
    ) {
      const errorMessage = "Unknown error occured on submitting request";
      listenerApi.dispatch(setError(errorMessage));
    }
  },
});

startListening({
  actionCreator: updateConfig,
  effect: (action, listenerApi) => {
    const state = listenerApi.getState();
    if (
      action.payload.apiKey !== state.config.apiKey ||
      action.payload.addressURL !== state.config.addressURL ||
      action.payload.lspPort !== state.config.lspPort
    ) {
      pingApi.util.resetApiState();
    }
  },
});
