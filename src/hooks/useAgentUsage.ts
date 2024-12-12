import { useCallback, useMemo } from "react";
import {
  addAgentUsageItem,
  selectAgentUsageItems,
} from "../features/AgentUsage/agentUsageSlice";
import { useGetUser } from "./useGetUser";
import { useAppSelector } from "./useAppSelector";
import { selectThreadToolUse } from "../features/Chat";
import { ChatMessages, isUserMessage } from "../events";
import { useAppDispatch } from "./useAppDispatch";

const MAX_FREE_USAGE = 1;
const ONE_DAT_IN_MS = 1000 * 60 * 60 * 24;

export function useAgentUsage() {
  const user = useGetUser();
  const toolUse = useAppSelector(selectThreadToolUse);
  const allAgentUsageItems = useAppSelector(selectAgentUsageItems);
  const dispatch = useAppDispatch();

  const usersUsage = useMemo(() => {
    if (!user.data?.account) return 0;

    // TODO: date.now() can change the result of memo
    const agentUsageForToday = allAgentUsageItems.filter(
      (item) =>
        item.time + ONE_DAT_IN_MS > Date.now() &&
        item.user === user.data?.account,
    );

    return agentUsageForToday.length;
  }, [allAgentUsageItems, user.data?.account]);

  const increment = useCallback(() => {
    if (
      user.data &&
      user.data.retcode === "OK" &&
      user.data.inference !== "PRO" &&
      toolUse === "agent"
    ) {
      dispatch(addAgentUsageItem({ user: user.data.account }));
    }
  }, [dispatch, toolUse, user.data]);

  const incrementIfLastMessageIsFromUser = useCallback(
    (messages: ChatMessages) => {
      if (messages.length === 0) return;
      const lastMessage = messages[messages.length - 1];
      if (isUserMessage(lastMessage)) {
        increment();
      }
      return;
    },
    [increment],
  );

  const shouldStop = useMemo(() => {
    if (user.data?.inference === "PRO") return false;
    return usersUsage >= MAX_FREE_USAGE;
  }, [user.data?.inference, usersUsage]);

  return {
    incrementIfLastMessageIsFromUser,
    usersUsage,
    shouldStop,
  };
}
