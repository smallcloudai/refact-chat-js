import { useCallback, useMemo } from "react";
import {
  addAgentUsageItem,
  selectTodaysItemsForUser,
} from "../features/AgentUsage/agentUsageSlice";
import { useGetUser } from "./useGetUser";
import { useAppSelector } from "./useAppSelector";
import { selectThreadToolUse } from "../features/Chat";
import { ChatMessages, isUserMessage } from "../events";

const MAX_FREE_USAGE = 20;

export function useAgentUsage() {
  const user = useGetUser();
  const toolUse = useAppSelector(selectThreadToolUse);
  const allUsersUsageCount = useAppSelector(selectTodaysItemsForUser);

  const usersUsage = useMemo(() => {
    if (!user.data?.account) return 0;

    const total = allUsersUsageCount.filter(
      (item) => item.user === user.data?.account,
    ).length;

    return total;
  }, [allUsersUsageCount, user.data]);

  const increment = useCallback(() => {
    // TODO: check this
    if (
      user.data &&
      user.data.retcode === "OK" &&
      user.data.inference !== "PRO" &&
      toolUse === "agent"
    ) {
      addAgentUsageItem({ user: user.data.account });
    }
  }, [toolUse, user.data]);

  const incrementIfLastMessageIsFromUser = useCallback(
    (messages: ChatMessages) => {
      if (messages.length > 0) return;
      const lastMessage = messages[messages.length - 1];
      if (isUserMessage(lastMessage)) {
        increment();
      }
      return;
    },
    [increment],
  );

  const shouldStop = useMemo(() => {
    return usersUsage >= MAX_FREE_USAGE;
  }, [usersUsage]);

  return {
    incrementIfLastMessageIsFromUser,
    usersUsage,
    shouldStop,
  };
}
