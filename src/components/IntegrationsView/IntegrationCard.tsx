import { Badge, Card, Flex, Text } from "@radix-ui/themes";
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
      <Flex gap="4" direction={isInline ? "column" : "row"} align={"center"}>
        <img
          src={"https://placehold.jp/150x150.png"}
          className={styles.integrationIcon}
          alt={integration.integr_name}
        />
        <Flex
          align="center"
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
            <Badge
              color={
                integration.on_your_laptop || integration.when_isolated
                  ? "jade"
                  : "red"
              }
              variant={
                integration.on_your_laptop || integration.when_isolated
                  ? "soft"
                  : "solid"
              }
              radius="medium"
            >
              {integration.on_your_laptop || integration.when_isolated
                ? "On"
                : "Off"}
            </Badge>
          )}
        </Flex>
      </Flex>
    </Card>
  );
};
