import { useCallback, useEffect, useReducer } from "react";
import { usePostMessage } from "./usePostMessage";
import { useEffectOnce } from "./useEffectOnce";
import * as Events from "../events/FIMDebug";
import {
  FimDebugData,
  isFIMAction,
  FIMAction,
  isClearFIMDebugError,
  ClearFIMDebugError,
  isRequestFIMData,
  isReceiveFIMDebugData,
} from "../events";

type FIMDebugState = {
  data: FimDebugData | null;
  error: string | null;
  fetching: boolean;
};

const initialState: FIMDebugState = {
  data: null,
  error: null,
  fetching: false,
};

const reducer = (state: FIMDebugState, action: FIMAction) => {
  if (isClearFIMDebugError(action)) {
    return {
      ...state,
      error: null,
    };
  }

  if (isRequestFIMData(action)) {
    return {
      ...state,
      error: null,
      fetching: true,
    };
  }

  if (isReceiveFIMDebugData(action)) {
    return {
      ...state,
      error: null,
      fetching: false,
      data: action.payload,
    };
  }

  return state;
};

export const useEventBysForFIMDebug = () => {
  const postMessage = usePostMessage();

  const [state, dispatch] = useReducer(reducer, initialState);

  useEffect(() => {
    const listener = (event: MessageEvent) => {
      if (isFIMAction(event.data)) {
        dispatch(event.data);
      }
    };

    window.addEventListener("message", listener);

    return () => window.removeEventListener("message", listener);
  }, []);

  useEffectOnce(() => {
    const message: Events.FIMDebugReady = {
      type: Events.FIM_EVENT_NAMES.READY,
    };
    postMessage(message);
  });

  const clearErrorMessage = useCallback(() => {
    const message: ClearFIMDebugError = {
      type: Events.FIM_EVENT_NAMES.CLEAR_ERROR,
    };
    dispatch(message);
  }, [dispatch]);

  return {
    state,
    clearErrorMessage,
  };
};