import React from "react";

import { useAgentUsage } from "../../hooks";

export const AgentUsage: React.FC = () => {
  const { usersUsage, shouldStop } = useAgentUsage();

  // wait until done streaming before notifying them they have reached the limit.

  return (
    <div>
      <h1>
        Agent Usage {usersUsage} {shouldStop ? "none left" : "some left"}
      </h1>
      <p>Agent Usage</p>
      <p>Agent Usage</p>
      <p>Agent Usage</p>
      <p>Agent Usage</p>
    </div>
  );
};
