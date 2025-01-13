import React from "react";
import { IconButton, Box } from "@radix-ui/themes";
import { CheckIcon } from "@radix-ui/react-icons";
import classnames from "classnames";
import { knowledgeApi } from "../../services/refact/knowledge";
import { useAppSelector } from "../../hooks";
import {
  selectIsStreaming,
  selectIsWaiting,
  selectMessages,
} from "../../features/Chat";
import styles from "./LikeButton.module.css";

function useCreateMemory() {
  const messages = useAppSelector(selectMessages);
  const isStreaming = useAppSelector(selectIsStreaming);
  const isWaiting = useAppSelector(selectIsWaiting);
  const [onLike, likeResponse] =
    knowledgeApi.useCreateNewMemoryFromMessagesMutation();

  const submitLike = React.useCallback(() => {
    void onLike(messages);
  }, [messages, onLike]);

  const shouldShow = React.useMemo(() => {
    if (messages.length === 0) return false;
    if (isStreaming) return false;
    if (isWaiting) return false;
    return true;
  }, [messages, isStreaming, isWaiting]);

  return { submitLike, likeResponse, shouldShow };
}

export const LikeButton = () => {
  const { submitLike, likeResponse, shouldShow } = useCreateMemory();

  if (!shouldShow) return false;
  return (
    <Box position="absolute" top="0" right="0">
      <IconButton
        variant="ghost"
        size="1"
        onClick={submitLike}
        loading={likeResponse.isLoading}
        className={classnames(
          likeResponse.isSuccess && styles.like__button__success,
        )}
      >
        <CheckIcon />
      </IconButton>
    </Box>
  );
};
