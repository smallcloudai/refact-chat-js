import React, { useCallback } from "react";

import { useAgentUsage, useAppDispatch, useGetUser } from "../../hooks";
import { Dialog, Link, Button, Flex } from "@radix-ui/themes";
import { setToolUse } from "../../features/Chat";

export const AgentUsage: React.FC = () => {
  const dispatch = useAppDispatch();
  const userRequest = useGetUser();
  const { usersUsage: _, shouldShow, MAX_FREE_USAGE } = useAgentUsage();
  const handleClose = useCallback(() => {
    void userRequest
      .refetch()
      .unwrap()
      .then((user) => {
        if (user.inference !== "PRO") {
          dispatch(setToolUse("explore"));
        }
      })
      .catch(() => {
        return;
      });
  }, [dispatch, userRequest]);

  if (!userRequest.data) return null;
  if (!shouldShow) return null; // stop the agent

  return (
    <Dialog.Root defaultOpen={shouldShow} onOpenChange={handleClose}>
      <Dialog.Content>
        <Dialog.Title>Daily Free Tier Agent Usage Limit Exceeded</Dialog.Title>
        <Dialog.Description>
          Refact allows you to use agents for {MAX_FREE_USAGE} chat requests per
          day.
        </Dialog.Description>
        <Dialog.Description>
          To continue using agents today, you will need to{" "}
          <Link target="_blank" href="https://refact.smallcloud.ai/">
            Upgrade to our pro plan
          </Link>
        </Dialog.Description>

        <Flex gap="3" mt="4" justify="end">
          <Dialog.Close>
            <Button variant="soft" color="gray">
              Close
            </Button>
          </Dialog.Close>
        </Flex>
      </Dialog.Content>
    </Dialog.Root>
  );
};
