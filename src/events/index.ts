import {
  ChatMessages,
  ChatResponse,
  CapsResponse,
  isCapsResponse,
  ChatContextFile,
} from "../services/refact";

export enum EVENT_NAMES_FROM_CHAT {
  SAVE_CHAT = "save_chat_to_history",
  ASK_QUESTION = "chat_question",
  REQUEST_CAPS = "chat_request_caps",
  STOP_STREAMING = "chat_stop_streaming",
  REQUEST_FILES = "chat_request_for_file",
}

export enum EVENT_NAMES_TO_CHAT {
  CLEAR_ERROR = "chat_clear_error",
  RESTORE_CHAT = "restore_chat_from_history",
  CHAT_RESPONSE = "chat_response",
  BACKUP_MESSAGES = "back_up_messages",
  DONE_STREAMING = "chat_done_streaming",
  ERROR_STREAMING = "chat_error_streaming",
  NEW_CHAT = "create_new_chat",
  RECEIVE_CAPS = "receive_caps",
  RECEIVE_CAPS_ERROR = "receive_caps_error",
  SET_CHAT_MODEL = "chat_set_chat_model",
  SET_DISABLE_CHAT = "set_disable_chat",
  RECEIVE_FILES = "receive_context_file",
  REMOVE_FILES = "remove_context_file",
}

export type ChatThread = {
  id: string;
  messages: ChatMessages;
  title?: string;
  model: string;
};
interface BaseAction {
  type: EVENT_NAMES_FROM_CHAT | EVENT_NAMES_TO_CHAT;
  payload?: { id: string; [key: string]: unknown };
}

export interface ActionFromChat extends BaseAction {
  type: EVENT_NAMES_FROM_CHAT;
}

export function isActionFromChat(action: unknown): action is ActionFromChat {
  if (!action) return false;
  if (typeof action !== "object") return false;
  if (!("type" in action)) return false;
  if (typeof action.type !== "string") return false;
  const ALL_EVENT_NAMES: Record<string, string> = { ...EVENT_NAMES_FROM_CHAT };
  return Object.values(ALL_EVENT_NAMES).includes(action.type);
}

export interface RequestForFileFromChat extends ActionFromChat {
  type: EVENT_NAMES_FROM_CHAT.REQUEST_FILES;
  payload: { id: string };
}

export function isRequestForFileFromChat(
  action: unknown,
): action is RequestForFileFromChat {
  if (!isActionFromChat(action)) return false;
  return action.type === EVENT_NAMES_FROM_CHAT.REQUEST_FILES;
}

export interface QuestionFromChat extends ActionFromChat {
  type: EVENT_NAMES_FROM_CHAT.ASK_QUESTION;
  payload: ChatThread;
}

export function isQuestionFromChat(
  action: unknown,
): action is QuestionFromChat {
  if (!isAction(action)) return false;
  return action.type === EVENT_NAMES_FROM_CHAT.ASK_QUESTION;
}

export interface SaveChatFromChat extends ActionFromChat {
  type: EVENT_NAMES_FROM_CHAT.SAVE_CHAT;
  payload: ChatThread;
}

export function isSaveChatFromChat(
  action: unknown,
): action is SaveChatFromChat {
  if (!isAction(action)) return false;
  return action.type === EVENT_NAMES_FROM_CHAT.SAVE_CHAT;
}

export interface RequestCapsFromChat extends ActionFromChat {
  type: EVENT_NAMES_FROM_CHAT.REQUEST_CAPS;
  payload: { id: string };
}

export function isRequestCapsFromChat(
  action: unknown,
): action is RequestCapsFromChat {
  if (!isActionFromChat(action)) return false;
  return action.type === EVENT_NAMES_FROM_CHAT.REQUEST_CAPS;
}

export interface StopStreamingFromChat extends ActionFromChat {
  type: EVENT_NAMES_FROM_CHAT.STOP_STREAMING;
  payload: { id: string };
}

export function isStopStreamingFromChat(
  action: unknown,
): action is StopStreamingFromChat {
  if (!isActionFromChat(action)) return false;
  return action.type === EVENT_NAMES_FROM_CHAT.STOP_STREAMING;
}

export interface ActionToChat extends BaseAction {
  type: EVENT_NAMES_TO_CHAT;
}

export function isActionToChat(action: unknown): action is ActionToChat {
  if (!action) return false;
  if (typeof action !== "object") return false;
  if (!("type" in action)) return false;
  if (typeof action.type !== "string") return false;
  const EVENT_NAMES: Record<string, string> = { ...EVENT_NAMES_TO_CHAT };
  return Object.values(EVENT_NAMES).includes(action.type);
}

export interface ReceiveContextFile extends ActionToChat {
  type: EVENT_NAMES_TO_CHAT.RECEIVE_FILES;
  payload: {
    id: string;
    files: ChatContextFile[];
  };
}

export function isReceiveContextFile(
  action: unknown,
): action is ReceiveContextFile {
  if (!isActionToChat(action)) return false;
  return action.type === EVENT_NAMES_TO_CHAT.RECEIVE_FILES;
}

export interface RemoveContextFile extends ActionToChat {
  type: EVENT_NAMES_TO_CHAT.REMOVE_FILES;
  payload: { id: string };
}

export function isRemoveContext(action: unknown): action is RemoveContextFile {
  if (!isActionToChat(action)) return false;
  return action.type === EVENT_NAMES_TO_CHAT.REMOVE_FILES;
}

export interface SetChatDisable extends ActionToChat {
  type: EVENT_NAMES_TO_CHAT.SET_DISABLE_CHAT;
  payload: { id: string; disable: boolean };
}

export function isSetDisableChat(action: unknown): action is SetChatDisable {
  if (!isActionToChat(action)) return false;
  return action.type === EVENT_NAMES_TO_CHAT.SET_DISABLE_CHAT;
}
export interface SetChatModel extends ActionToChat {
  type: EVENT_NAMES_TO_CHAT.SET_CHAT_MODEL;
  payload: {
    id: string;
    model: string;
  };
}

export function isSetChatModel(action: unknown): action is SetChatModel {
  if (!isActionToChat(action)) return false;
  return action.type === EVENT_NAMES_TO_CHAT.SET_CHAT_MODEL;
}
export interface ResponseToChat extends ActionToChat {
  type: EVENT_NAMES_TO_CHAT.CHAT_RESPONSE;
  payload: ChatResponse;
}

export function isResponseToChat(action: unknown): action is ResponseToChat {
  if (!isActionToChat(action)) return false;
  return action.type === EVENT_NAMES_TO_CHAT.CHAT_RESPONSE;
}

export interface BackUpMessages extends ActionToChat {
  type: EVENT_NAMES_TO_CHAT.BACKUP_MESSAGES;
  payload: {
    id: string;
    messages: ChatMessages;
  };
}

export function isBackupMessages(action: unknown): action is BackUpMessages {
  if (!isActionToChat(action)) return false;
  return action.type === EVENT_NAMES_TO_CHAT.BACKUP_MESSAGES;
}

export interface RestoreChat extends ActionToChat {
  type: EVENT_NAMES_TO_CHAT.RESTORE_CHAT;
  payload: ChatThread;
}

export function isRestoreChat(action: unknown): action is RestoreChat {
  if (!isActionToChat(action)) return false;
  return action.type === EVENT_NAMES_TO_CHAT.RESTORE_CHAT;
}

export interface CreateNewChatThread extends ActionToChat {
  type: EVENT_NAMES_TO_CHAT.NEW_CHAT;
}

export function isCreateNewChat(
  action: unknown,
): action is CreateNewChatThread {
  if (!isActionToChat(action)) return false;
  return action.type === EVENT_NAMES_TO_CHAT.NEW_CHAT;
}

export interface ChatDoneStreaming extends ActionToChat {
  type: EVENT_NAMES_TO_CHAT.DONE_STREAMING;
}

export function isChatDoneStreaming(
  action: unknown,
): action is ChatDoneStreaming {
  if (!isActionToChat(action)) return false;
  return action.type === EVENT_NAMES_TO_CHAT.DONE_STREAMING;
}

export interface ChatErrorStreaming extends ActionToChat {
  type: EVENT_NAMES_TO_CHAT.ERROR_STREAMING;
  payload: {
    id: string;
    message: string;
  };
}

export function isChatErrorStreaming(
  action: unknown,
): action is ChatErrorStreaming {
  if (!isActionToChat(action)) return false;
  if (action.type !== EVENT_NAMES_TO_CHAT.ERROR_STREAMING) return false;
  if (!("payload" in action)) return false;
  if (typeof action.payload !== "object") return false;
  if (!("id" in action.payload)) return false;
  if (typeof action.payload.id !== "string") return false;
  if (!("message" in action.payload)) return false;
  if (typeof action.payload.message !== "string") return false;
  return true;
}

export interface ChatClearError extends ActionToChat {
  type: EVENT_NAMES_TO_CHAT.CLEAR_ERROR;
}

export function isChatClearError(action: unknown): action is ChatClearError {
  if (!isActionToChat(action)) return false;
  return action.type === EVENT_NAMES_TO_CHAT.CLEAR_ERROR;
}

export interface ChatReceiveCaps extends ActionToChat {
  type: EVENT_NAMES_TO_CHAT.RECEIVE_CAPS;
  payload: {
    id: string;
    caps: CapsResponse;
  };
}

export function isChatReceiveCaps(action: unknown): action is ChatReceiveCaps {
  if (!isActionToChat(action)) return false;
  if (!("payload" in action)) return false;
  if (typeof action.payload !== "object") return false;
  if (!("caps" in action.payload)) return false;
  if (!isCapsResponse(action.payload.caps)) return false;
  return action.type === EVENT_NAMES_TO_CHAT.RECEIVE_CAPS;
}

export interface ChatReceiveCapsError extends ActionToChat {
  type: EVENT_NAMES_TO_CHAT.RECEIVE_CAPS_ERROR;
  payload: {
    id: string;
    message: string;
  };
}

export function isChatReceiveCapsError(
  action: unknown,
): action is ChatReceiveCapsError {
  if (!isActionToChat(action)) return false;
  return action.type === EVENT_NAMES_TO_CHAT.RECEIVE_CAPS_ERROR;
}

export type Actions = ActionToChat | ActionFromChat;

export function isAction(action: unknown): action is Actions {
  return isActionFromChat(action) || isActionToChat(action);
}
