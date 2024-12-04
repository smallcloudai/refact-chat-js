import { Button, Flex, Heading, IconButton } from "@radix-ui/themes";
import { useWindowDimensions } from "../../hooks/useWindowDimensions";
import type { FC } from "react";
import { ArrowLeftIcon } from "@radix-ui/react-icons";
import styles from "./IntegrationsHeader.module.css";

type IntegrationsHeaderProps = {
  handleFormReturn: () => void;
  integrationName: string;
  icon: string;
};

export const IntegrationsHeader: FC<IntegrationsHeaderProps> = ({
  handleFormReturn,
  integrationName,
  icon,
}) => {
  const { width } = useWindowDimensions();

  return (
    <Flex className={styles.IntegrationsHeader}>
      <Flex align="center" justify="between" width="100%">
        <Flex
          gap={{
            initial: "4",
            xs: "6",
          }}
          align="center"
        >
          {width > 500 ? (
            <Button size="1" variant="surface" onClick={handleFormReturn}>
              <ArrowLeftIcon width="16" height="16" />
              Configurations
            </Button>
          ) : (
            <IconButton size="2" variant="surface" onClick={handleFormReturn}>
              <ArrowLeftIcon width="16" height="16" />
            </IconButton>
          )}
          <Heading as="h5" size="5">
            Setup {integrationName}
          </Heading>
        </Flex>
        <img
          src={icon}
          className={styles.IntegrationsHeaderIcon}
          alt={integrationName}
        />
      </Flex>
    </Flex>
  );
};
