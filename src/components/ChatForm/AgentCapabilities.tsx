import {
  MixerVerticalIcon,
  QuestionMarkCircledIcon,
} from "@radix-ui/react-icons";
import { Flex, HoverCard, IconButton, Popover, Text } from "@radix-ui/themes";
import {
  AgentRollbackSwitch,
  ApplyPatchSwitch,
  DeepseekReasoningSwitch,
} from "./ChatControls";
import { useLogin, useAppSelector } from "../../hooks";
import {
  selectAutomaticPatch,
  selectCheckpointsEnabled,
  selectThreadMode,
} from "../../features/Chat";
import { useMemo } from "react";

export const AgentCapabilities = () => {
  const { user } = useLogin();
  const isPatchAutomatic = useAppSelector(selectAutomaticPatch);
  const isAgentRollbackEnabled = useAppSelector(selectCheckpointsEnabled);
  const currentMode = useAppSelector(selectThreadMode);
  const isReasoningEnabled = useMemo(() => {
    return currentMode === "THINKING_AGENT" && user.data?.inference !== "FREE";
  }, [currentMode, user.data?.inference]);

  const agenticFeatures = useMemo(() => {
    return [
      {
        name: "Auto-patch",
        enabled: isPatchAutomatic,
      },
      { name: "Agent rollback", enabled: isAgentRollbackEnabled },
      { name: "Deepseek Reasoner", enabled: isReasoningEnabled },
    ];
  }, [isPatchAutomatic, isAgentRollbackEnabled, isReasoningEnabled]);

  return (
    <Flex mb="2" gap="2" align="center">
      <Popover.Root>
        <Popover.Trigger>
          <IconButton variant="soft" size="1">
            <MixerVerticalIcon />
          </IconButton>
        </Popover.Trigger>
        <Popover.Content side="top" alignOffset={-10} sideOffset={20}>
          <Flex gap="2" direction="column">
            <ApplyPatchSwitch />
            <AgentRollbackSwitch />
            {user.data?.inference !== "FREE" && <DeepseekReasoningSwitch />}
          </Flex>
        </Popover.Content>
      </Popover.Root>
      <Text size="2">
        Agent capabilities:
        <Text color="gray">
          {" "}
          {agenticFeatures
            .filter((feature) => feature.enabled)
            .map((feature) => feature.name)
            .join(", ") || "None"}
        </Text>
      </Text>
      <HoverCard.Root>
        <HoverCard.Trigger>
          <QuestionMarkCircledIcon style={{ marginLeft: 4 }} />
        </HoverCard.Trigger>
        <HoverCard.Content size="2" maxWidth="280px">
          <Text as="p" size="2">
            Here you can control special features that affect working flow of
            Agent. Some features might lead to slower responses, some features
            might speed up the process, but you will lose some control over
            execution.
          </Text>
        </HoverCard.Content>
      </HoverCard.Root>
    </Flex>
  );
};
