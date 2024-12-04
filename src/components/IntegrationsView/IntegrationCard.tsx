import { Card, Checkbox, Flex, Text } from "@radix-ui/themes";
import { toPascalCase } from "../../utils/toPascalCase";
import styles from "./IntegrationCard.module.css";
import {
  IntegrationWithIconRecord,
  IntegrationWithIconResponse,
} from "../../services/refact";
import { FC } from "react";
import classNames from "classnames";

type IntegrationCardProps = {
  integration: IntegrationWithIconRecord;
  handleIntegrationShowUp: (
    integration: IntegrationWithIconResponse["integrations"][number],
  ) => void;
  isInline?: boolean;
};

export const IntegrationCard: FC<IntegrationCardProps> = ({
  integration,
  handleIntegrationShowUp,
  isInline = false,
}) => {
  return (
    <Card
      className={classNames(styles.integrationCard, {
        [styles.integrationCardInline]: isInline,
      })}
      onClick={() => handleIntegrationShowUp(integration)}
    >
      <Flex
        gap="4"
        direction={isInline ? "column" : "row"}
        align={isInline ? "center" : "start"}
      >
        <img
          src={"https://placehold.jp/150x150.png"}
          className={styles.integrationIcon}
          alt={integration.integr_name}
        />
        <Flex
          direction="column"
          align="start"
          justify="between"
          gap={isInline ? "0" : "2"}
          width={isInline ? "auto" : "100%"}
        >
          <Text size="3" weight="medium">
            {/* {toPascalCase(
              integration.integr_name.startsWith("cmdline")
                ? integration.integr_name.split("_")[0]
                : integration.integr_name,
            )} */}
            {toPascalCase(integration.integr_name)}
          </Text>
          {!isInline && (
            <Card
              size="1"
              style={{
                width: "100%",
              }}
            >
              <Flex direction="column" gap="3" width="100%">
                <Text size="1">
                  <Checkbox
                    checked={integration.on_your_laptop}
                    disabled
                    mr="1"
                    size="1"
                  />{" "}
                  Available on your laptop
                </Text>
                <Text size="1">
                  <Checkbox
                    checked={integration.when_isolated}
                    disabled
                    mr="1"
                    size="1"
                  />{" "}
                  When isolated
                </Text>
              </Flex>
            </Card>
          )}
        </Flex>
      </Flex>
    </Card>
  );
};
