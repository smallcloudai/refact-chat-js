import React from "react";

import { useAgentUsage } from "../../hooks";
import { Dialog } from "@radix-ui/themes";

export const AgentUsage: React.FC = () => {
  const { usersUsage: _, shouldShow } = useAgentUsage();
  if (!shouldShow) return null; // stop the agent

  // wait until done streaming before notifying them they have reached the limit.

  //   return (
  //     <div>
  //       <h1>Agent Usage {usersUsage}</h1>
  //       <p>Agent Usage</p>
  //       <p>Agent Usage</p>
  //       <p>Agent Usage</p>
  //       <p>Agent Usage</p>
  //     </div>
  //   );
  return (
    <Dialog.Root defaultOpen={shouldShow}>
      <Dialog.Content>
        Some text about what to do
        <Dialog.Title>Daily Free Tier Agent Usage Limit Exceeded</Dialog.Title>
        <Dialog.Close>
          <div>Close</div>
        </Dialog.Close>
        <Dialog.Description>Some more info about what todo</Dialog.Description>
      </Dialog.Content>
    </Dialog.Root>
  );
};
