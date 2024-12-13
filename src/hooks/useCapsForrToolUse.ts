import { useCallback, useMemo } from "react";
import { selectThreadToolUse } from "../features/Chat/Thread/selectors";
import {
  useAppSelector,
  useGetCapsQuery,
  useGetUser,
  useAgentUsage,
  useAppDispatch,
} from ".";

import { getSelectedChatModel, setChatModel } from "../features/Chat";

// TODO: some shared logic for changing the tool use mode.
const PAID_AGENT_LIST = ["gpt-4o", "claude-3-5-sonnet"];

export function useCapsForToolUse() {
  const caps = useGetCapsQuery();
  const toolUse = useAppSelector(selectThreadToolUse);
  const usage = useAgentUsage();
  const user = useGetUser();
  const dispatch = useAppDispatch();

  const defaultCap = caps.data?.code_chat_default_model ?? "";

  const selectedModel = useAppSelector(getSelectedChatModel);

  const currentModel = selectedModel || defaultCap;

  const setCapModel = useCallback(
    (value: string) => {
      const model = caps.data?.code_chat_default_model === value ? "" : value;
      const action = setChatModel(model);
      dispatch(action);
    },
    [caps.data?.code_chat_default_model, dispatch],
  );

  // TODO: causes a loop, handle changing the model on an old chat, this works with a new one, but isn't mounted on an existing chat.
  //   useEffect(() => {
  //     if (
  //       user.data?.inference !== "PRO" &&
  //       usage.aboveUsageLimit &&
  //       AGENT_PAY_LIST.includes(currentModel)
  //     ) {
  //       setCapModel(caps.data?.code_chat_default_model ?? "");
  //     }
  //   }, [
  //     caps.data?.code_chat_default_model,
  //     currentModel,
  //     setCapModel,
  //     usage.aboveUsageLimit,
  //     user.data?.inference,
  //   ]);

  const usableModels = useMemo(() => {
    const models = caps.data?.code_chat_models ?? {};
    const items = Object.entries(models).reduce<string[]>(
      (acc, [key, value]) => {
        if (toolUse !== "agent") return [...acc, key];
        if (value.supports_agent) return [...acc, key];
        return acc;
      },
      [],
    );
    return items;
  }, [caps.data?.code_chat_models, toolUse]);

  const usableModelsForPlan = useMemo(() => {
    if (user.data?.inference === "PRO") return usableModels;
    if (!usage.aboveUsageLimit) return usableModels;
    return usableModels.map((model) => {
      if (!PAID_AGENT_LIST.includes(model)) return model;
      return { value: model, disabled: true, textValue: `${model} Pro` };
    });
  }, [user.data?.inference, usableModels, usage.aboveUsageLimit]);

  return {
    usableModels,
    usableModelsForPlan,
    currentModel,
    setCapModel,
    loading: caps.isFetching || caps.isLoading,
  };
}

// Shared logic for setting the mode.
// const AGENT_ALLOW_LIST = ["gpt-4o", "claude-3-5-sonnet"];
// function modelForMode(
//   model: string,
//   caps: ChatFormProps["caps"],
//   toolUse?: ToolUse,
// ) {
//   if (toolUse !== "agent") return model;
//   // check if paid then they can use any

//   if (AGENT_ALLOW_LIST.includes(model)) return model;

//   const available = Object.keys(caps.available_caps);

//   const hasModels = AGENT_ALLOW_LIST.find((agent) => available.includes(agent));
//   if (hasModels) return hasModels;

//   return model || caps.default_cap;
// }

// function modelSupportsAgent(
//   model: string,
//   caps: Record<string, CodeChatModel>,
// ) {
//   // return AGENT_ALLOW_LIST.includes(model);
//   if (!(model in caps)) return false;
//   return caps[model].supports_agent;
// }

// function capOptionsForMode(
//   caps: Record<string, CodeChatModel>,
//   toolUse?: string,
// ) {
//   if (toolUse !== "agent") return caps;
//   const agentEntries = Object.entries(caps).filter(
//     ([_key, value]) => value.supports_agent,
//   );

//   if (agentEntries.length === 0) return caps;

//   return Object.fromEntries(agentEntries);
// }
