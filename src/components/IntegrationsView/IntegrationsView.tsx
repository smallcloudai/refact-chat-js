import React from "react";
import { Box, Card, Flex, Heading, Text } from "@radix-ui/themes";
import type { Integration, IntegrationIcon } from "../../services/refact";
import { Spinner } from "../Spinner";
import { ErrorCallout } from "../Callout";
import { useAppDispatch, useAppSelector } from "../../hooks";
import { clearError, getErrorMessage } from "../../features/Errors/errorsSlice";
import styles from "./IntegrationsView.module.css";

export const IntegrationsView: React.FC<{
  integrationsData?: Integration[];
  integrationsIcons?: IntegrationIcon[];
  isLoading: boolean;
  goBack?: () => void;
}> = ({ integrationsData, integrationsIcons, isLoading, goBack }) => {
  const dispatch = useAppDispatch();
  const error = useAppSelector(getErrorMessage);

  if (isLoading || !integrationsData || !integrationsIcons) {
    return <Spinner />;
  }

  const goBackAndClearError = () => {
    goBack && goBack();
    dispatch(clearError());
  };

  if (error) {
    return <ErrorCallout onClick={goBackAndClearError}>{error}</ErrorCallout>;
  }

  return (
    <Box
      style={{
        width: "inherit",
      }}
    >
      <Flex
        direction="column"
        style={{
          width: "inherit",
        }}
      >
        <Heading as="h3" align="center" mb="5">
          Integrations Setup
        </Heading>
        <Flex align="start" justify="between" wrap="wrap" gap="4">
          {/* TODO: Implement form here */}
          {integrationsData.map((integration) => (
            <Card key={integration.name} className={styles.integrationCard}>
              <Flex
                direction="column"
                align="center"
                justify="between"
                width="100%"
                height="100%"
              >
                <img
                  src={
                    integrationsIcons.find(
                      (icon) => icon.name === integration.name,
                    )?.value ?? ""
                  }
                  alt={integration.name}
                  className={styles.icon}
                />
                <Text>{integration.name}</Text>
              </Flex>
            </Card>
          ))}
        </Flex>
      </Flex>
    </Box>
  );
};

{
  /*        <Flex
              direction="column"
              wrap="wrap"
              align="start"
              maxWidth="100%"
              key={integration.name}
            >
              <Text>{integration.name}</Text>
              {integration.value.detail && (
                <Text style={{ maxWidth: "100%" }}>
                  {integration.value.detail}
                </Text>
              )}
            </Flex> */
}
