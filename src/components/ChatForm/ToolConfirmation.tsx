import React from "react";
import { Card, Button, Text, Flex } from "@radix-ui/themes";
import styles from "./ToolConfirmation.module.css";

type ToolConfirmationProps = {
  toolName: string;
  onConfirm: () => void;
  onCancel: () => void;
};

export const ToolConfirmation: React.FC<ToolConfirmationProps> = ({
  toolName,
  onConfirm,
  onCancel,
}) => {
  return (
    <Card className={styles.ToolConfirmationCard}>
      <Text className={styles.ToolConfirmationHeading}>
        🔨 Tool Usage Confirmation
      </Text>
      <Flex align="center" justify="between" wrap="wrap" gap="2">
        <Text className={styles.ToolConfirmationText}>
          Do you really want to run{" "}
          <span className={styles.ToolConfirmationTool}>{toolName}</span> tool?
        </Text>
        <Flex align="center" justify="center" gap="1" direction="row">
          <Button color="grass" variant="surface" size="1" onClick={onConfirm}>
            Yes
          </Button>
          <Button variant="surface" color="tomato" size="1" onClick={onCancel}>
            No
          </Button>
        </Flex>
      </Flex>
    </Card>
  );
};
