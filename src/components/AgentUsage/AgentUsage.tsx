import React from "react";

import { useAgentUsage, useGetUser } from "../../hooks";
import { Dialog, Text, Link } from "@radix-ui/themes";

export const AgentUsage: React.FC = () => {
  const userRequest = useGetUser();
  const { usersUsage: _, shouldShow, MAX_FREE_USAGE } = useAgentUsage();
  if (!userRequest.data) return null;
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
        <Dialog.Title>Daily Free Tier Agent Usage Limit Exceeded</Dialog.Title>
        <Dialog.Description>
          <Text>
            Refact allows you to use agents for {MAX_FREE_USAGE} tokens per day.
          </Text>
          <Text>
            To continue using agents today, you will need to{" "}
            <Link target="_blank" href="https://refact.smallcloud.ai/">
              Upgrade to our pro plan
            </Link>
          </Text>
        </Dialog.Description>

        <Dialog.Close>
          <div>Close</div>
        </Dialog.Close>
      </Dialog.Content>
    </Dialog.Root>
  );
};
