import { Badge, Card, Flex, Text } from "@radix-ui/themes";
import { toPascalCase } from "../../utils/toPascalCase";
import styles from "./IntegrationCard.module.css";
import {
  IntegrationWithIconRecord,
  NotConfiguredIntegrationWithIconRecord,
} from "../../services/refact";
import { FC } from "react";
import classNames from "classnames";
import { iconMap } from "./icons/iconMap";

type IntegrationCardProps = {
  integration:
    | IntegrationWithIconRecord
    | NotConfiguredIntegrationWithIconRecord;
  handleIntegrationShowUp: (integration: IntegrationWithIconRecord) => void;
  handleNotConfiguredIntegrationShowUp?: (
    integration: NotConfiguredIntegrationWithIconRecord,
  ) => void;
  isNotConfigured?: boolean;
};

const INTEGRATIONS_WITH_TERMINAL_ICON = ["cmdline", "service"];

export const IntegrationCard: FC<IntegrationCardProps> = ({
  integration,
  handleIntegrationShowUp,
  handleNotConfiguredIntegrationShowUp,
  isNotConfigured = false,
}) => {
  const integrationLogo = INTEGRATIONS_WITH_TERMINAL_ICON.includes(
    integration.integr_name.split("_")[0],
  )
    ? iconMap.cmdline
    : iconMap[integration.integr_name];

  return (
    <Card
      className={classNames(styles.integrationCard, {
        [styles.integrationCardInline]: isNotConfigured,
      })}
      onClick={() =>
        isNotConfigured && handleNotConfiguredIntegrationShowUp
          ? handleNotConfiguredIntegrationShowUp(
              integration as NotConfiguredIntegrationWithIconRecord,
            )
          : handleIntegrationShowUp(integration as IntegrationWithIconRecord)
      }
    >
      <Flex
        gap="4"
        direction={isNotConfigured ? "column" : "row"}
        align={"center"}
      >
        <img
          src={integrationLogo}
          className={styles.integrationIcon}
          alt={integration.integr_name}
        />
        <Flex
          align="center"
          justify="between"
          gap={isNotConfigured ? "0" : "2"}
          width={isNotConfigured ? "auto" : "100%"}
        >
          <Text
            size="3"
            weight="medium"
            align={isNotConfigured ? "center" : "left"}
          >
            {/* {toPascalCase(
              integration.integr_name.startsWith("cmdline")
                ? integration.integr_name.split("_")[0]
                : integration.integr_name,
            )} */}
            {toPascalCase(integration.integr_name)}
          </Text>
          {!isNotConfigured && (
            <Badge
              color={
                integration.on_your_laptop || integration.when_isolated
                  ? "jade"
                  : "gray"
              }
              variant="soft"
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
