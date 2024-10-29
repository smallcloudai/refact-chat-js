import React from "react";
import { Card, Button, Text } from "@radix-ui/themes";
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
      <Text className={styles.ToolConfirmationText}>
        Do you really want to run {toolName} tool?
      </Text>
      <div className={styles.ToolConfirmationActions}>
        <Button className={styles.Button} onClick={onConfirm}>
          Yes
        </Button>
        <Button className={styles.Button} onClick={onCancel}>
          No
        </Button>
      </div>
    </Card>
  );
};
