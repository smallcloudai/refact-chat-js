import { Box, Flex, IconButton, Text } from "@radix-ui/themes";
import { Link } from "../Link";
import { Cross2Icon } from "@radix-ui/react-icons";
import {
  newChatAction,
  selectChatId,
  setIsNewChatSuggested,
} from "../../features/Chat";
import { useAppDispatch, useAppSelector } from "../../hooks";
import { useCallback } from "react";
import { clearPauseReasonsAndHandleToolsStatus } from "../../features/ToolConfirmation/confirmationSlice";
import { popBackTo, push } from "../../features/Pages/pagesSlice";
import { telemetryApi } from "../../services/refact";

type SuggestNewChatProps = {
  shouldBeVisible?: boolean;
};

export const SuggestNewChat = ({
  shouldBeVisible = false,
}: SuggestNewChatProps) => {
  const dispatch = useAppDispatch();
  const chatId = useAppSelector(selectChatId);
  const [sendTelemetryEvent] =
    telemetryApi.useLazySendTelemetryChatEventQuery();

  const handleClose = () => {
    dispatch(setIsNewChatSuggested({ chatId, value: false }));
    void sendTelemetryEvent({
      scope: `dismissedNewChatSuggestionWarning`,
      success: true,
      error_message: "",
    });
  };

  const onCreateNewChat = useCallback(() => {
    const actions = [
      newChatAction(),
      clearPauseReasonsAndHandleToolsStatus({
        wasInteracted: false,
        confirmationStatus: true,
      }),
      popBackTo({ name: "history" }),
      push({ name: "chat" }),
      setIsNewChatSuggested({ chatId, value: false }),
    ];

    actions.forEach((action) => dispatch(action));
    void sendTelemetryEvent({
      scope: `openNewChat`,
      success: true,
      error_message: "",
    });
  }, [dispatch, sendTelemetryEvent, chatId]);

  return (
    <Box
      py="2"
      pl="4"
      pr="2"
      mx="2"
      mb="-1"
      style={{
        backgroundColor: "var(--violet-a2)",
        borderRadius: "var(--radius-3)",
        border: "1px solid var(--violet-a5)",
        borderBottom: "none",
        transform: shouldBeVisible ? "translateY(0%)" : "translateY(100%)",
        opacity: shouldBeVisible ? 1 : 0,
        transition: "all 0.3s ease-in-out",
      }}
    >
      <Flex align="center" justify="between">
        <Text size="1">
          <Text weight="bold">Tip:</Text> Long chats cause you to reach your
          usage limits faster.
        </Text>
        <Flex align="center" gap="3">
          <Link
            size="1"
            style={{ whiteSpace: "nowrap" }}
            onClick={onCreateNewChat}
          >
            Start a new chat
          </Link>
          <IconButton
            asChild
            variant="ghost"
            color="violet"
            size="1"
            onClick={handleClose}
          >
            <Cross2Icon />
          </IconButton>
        </Flex>
      </Flex>
    </Box>
  );
};
