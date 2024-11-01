import React from "react";
import { Card, Button, Text, Flex } from "@radix-ui/themes";
import styles from "./ToolConfirmation.module.css";
import { PauseReason } from "../../features/ToolConfirmation/confirmationSlice";

type ToolConfirmationProps = {
  pauseReasons: PauseReason[];
  onConfirm: () => void;
};

export const ToolConfirmation: React.FC<ToolConfirmationProps> = ({
  pauseReasons,
  onConfirm,
}) => {
  const commands = pauseReasons.map((reason) => reason.command);
  const rules = pauseReasons.map((reason) => reason.rule);
  const types = pauseReasons.map((reason) => reason.type);
  const toolCallIds = pauseReasons.map((reason) => reason.tool_call_id);
  return (
    <Card className={styles.ToolConfirmationCard}>
      <Flex align="end" justify="between" wrap="wrap" gap="4">
        {commands.map((command, i) => (
          <Flex key={toolCallIds[i]} align="start" direction="column" gap="3">
            <Text className={styles.ToolConfirmationHeading}>
              🔨 Tool Usage{" "}
              {types[i] === "confirmation" ? "Confirmation" : "Denial"}
            </Text>
            <Text className={styles.ToolConfirmationText}>
              Do you really want to run{" "}
              <span className={styles.ToolConfirmationTool}>{command}</span>{" "}
              command?
            </Text>
            <Text className={styles.ToolConfirmationText}>
              Following command{" "}
              {types[i] === "confirmation" ? "needs confirmation" : "is denied"}{" "}
              due to{" "}
              <span className={styles.ToolConfirmationTool}>{rules[i]}</span>{" "}
              rule
            </Text>
          </Flex>
        ))}
        <Flex align="end" justify="center" gap="1" direction="row">
          <Button color="grass" variant="surface" size="1" onClick={onConfirm}>
            Confirm
          </Button>
        </Flex>
      </Flex>
    </Card>
  );
};
