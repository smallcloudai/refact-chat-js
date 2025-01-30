import { Box, Flex, Heading, Text, Grid } from "@radix-ui/themes";
import type { FC } from "react";
import { clearError, getErrorMessage } from "../../features/Errors/errorsSlice";
import {
  clearInformation,
  getInformationMessage,
} from "../../features/Errors/informationSlice";
import { useAppDispatch, useAppSelector } from "../../hooks";
import { IntegrationWithIconResponse } from "../../services/refact";
import { ErrorCallout } from "../Callout";
import { InformationCallout } from "../Callout/Callout";
import { Markdown } from "../Markdown";
import { Spinner } from "../Spinner";
import { IntegrationCard } from "./IntegrationCard";
import { IntegrationForm } from "./IntegrationForm";
import { IntegrationsHeader } from "./IntegrationsHeader";
import styles from "./IntegrationsView.module.css";
import { LeftRightPadding } from "../../features/Integrations/Integrations";
import { IntermediateIntegration } from "./IntermediateIntegration";
import { formatPathName } from "../../utils/formatPathName";
import { useIntegrations } from "./useIntegrations";

type IntegrationViewProps = {
  integrationsMap?: IntegrationWithIconResponse;
  leftRightPadding: LeftRightPadding;
  // integrationsIcons?: IntegrationIcon[];
  isLoading: boolean;
  goBack?: () => void;
  handleIfInnerIntegrationWasSet: (state: boolean) => void;
};

export const IntegrationsView: FC<IntegrationViewProps> = ({
  integrationsMap,
  isLoading,
  leftRightPadding,
  goBack,
  handleIfInnerIntegrationWasSet,
}) => {
  const dispatch = useAppDispatch();
  const globalError = useAppSelector(getErrorMessage);
  const information = useAppSelector(getInformationMessage);
  const {
    currentIntegration,
    availableIntegrationsToConfigure,
    currentNotConfiguredIntegration,
    confirmationRules,
    availabilityValues,
    handleIntegrationFormChange,
    handleSubmit,
    handleDeleteIntegration,
    handleNotConfiguredIntegrationSubmit,
    handleNavigateToIntegrationSetup,
    handleSetCurrentIntegrationSchema,
    handleSetCurrentIntegrationValues,
    handleFormReturn,
    setAvailabilityValues,
    setConfirmationRules,
    goBackAndClearError,
    handleIntegrationShowUp,
    setToolParameters,
    isDisabledIntegrationForm,
    isApplyingIntegrationForm,
    isDeletingIntegration,
    globalIntegrations,
    groupedProjectIntegrations,
    integrationLogo,
  } = useIntegrations({
    integrationsMap,
    handleIfInnerIntegrationWasSet,
    goBack,
  });

  if (isLoading) {
    return <Spinner spinning />;
  }

  if (!integrationsMap) {
    return (
      <ErrorCallout
        className={styles.popup}
        mx="0"
        onClick={goBackAndClearError}
      >
        fetching integrations.
      </ErrorCallout>
    );
  }

  return (
    <Box
      style={{
        width: "inherit",
        height: "100%",
      }}
    >
      <Flex
        direction="column"
        style={{
          width: "100%",
          height: "100%",
        }}
      >
        {(currentIntegration ?? currentNotConfiguredIntegration) && (
          <IntegrationsHeader
            leftRightPadding={leftRightPadding}
            handleFormReturn={handleFormReturn}
            handleInstantReturn={goBackAndClearError}
            instantBackReturnment={
              currentNotConfiguredIntegration
                ? currentNotConfiguredIntegration.wasOpenedThroughChat
                : currentIntegration
                  ? currentIntegration.wasOpenedThroughChat
                  : false
            }
            integrationName={
              currentIntegration
                ? currentIntegration.integr_name
                : currentNotConfiguredIntegration
                  ? currentNotConfiguredIntegration.integr_name
                  : ""
            }
            icon={integrationLogo}
          />
        )}
        {currentNotConfiguredIntegration && (
          <Flex
            direction="column"
            align="start"
            justify="between"
            height="100%"
          >
            <IntermediateIntegration
              handleSubmit={(event) =>
                handleNotConfiguredIntegrationSubmit(event)
              }
              integration={currentNotConfiguredIntegration}
            />
          </Flex>
        )}
        {currentIntegration && (
          <Flex
            direction="column"
            align="start"
            justify="between"
            height="100%"
          >
            <IntegrationForm
              // TODO: on smart link click or pass the name down
              handleSubmit={(event) => void handleSubmit(event)}
              handleDeleteIntegration={(path: string, name: string) =>
                void handleDeleteIntegration(path, name)
              }
              integrationPath={currentIntegration.integr_config_path}
              isApplying={isApplyingIntegrationForm}
              isDeletingIntegration={isDeletingIntegration}
              isDisabled={isDisabledIntegrationForm}
              onSchema={handleSetCurrentIntegrationSchema}
              onValues={handleSetCurrentIntegrationValues}
              handleChange={handleIntegrationFormChange}
              availabilityValues={availabilityValues}
              confirmationRules={confirmationRules}
              setAvailabilityValues={setAvailabilityValues}
              setConfirmationRules={setConfirmationRules}
              setToolParameters={setToolParameters}
              handleSwitchIntegration={handleNavigateToIntegrationSetup}
            />
            {information && (
              <InformationCallout
                timeout={isDeletingIntegration ? 1000 : 3000}
                mx="0"
                onClick={() => dispatch(clearInformation())}
                className={styles.popup}
              >
                {information}
              </InformationCallout>
            )}
            {globalError && (
              <ErrorCallout
                mx="0"
                timeout={3000}
                onClick={() => dispatch(clearError())}
                className={styles.popup}
              >
                {globalError}
              </ErrorCallout>
            )}
          </Flex>
        )}
        {!currentIntegration && !currentNotConfiguredIntegration && (
          <Flex direction="column" width="100%" gap="4">
            <Text my="2">
              Integrations allow Refact.ai Agent to interact with other services
              and tools
            </Text>
            <Flex
              align="start"
              direction="column"
              justify="between"
              gap="4"
              width="100%"
            >
              <Heading
                as="h4"
                size="3"
                style={{
                  width: "100%",
                }}
              >
                ⚙️ Globally configured{" "}
                {globalIntegrations ? globalIntegrations.length : 0}{" "}
                {globalIntegrations &&
                  (globalIntegrations.length > 1 ||
                  globalIntegrations.length === 0
                    ? "integrations"
                    : "integration")}
              </Heading>
              <Text size="2" color="gray">
                Global configurations are shared in your IDE and available for
                all your projects.
              </Text>
              {globalIntegrations && (
                <Flex direction="column" align="start" gap="3" width="100%">
                  {globalIntegrations.map((integration, index) => (
                    <IntegrationCard
                      key={`${index}-${integration.integr_config_path}`}
                      integration={integration}
                      handleIntegrationShowUp={handleIntegrationShowUp}
                    />
                  ))}
                </Flex>
              )}
            </Flex>
            {groupedProjectIntegrations &&
              Object.entries(groupedProjectIntegrations).map(
                ([projectPath, integrations], index) => {
                  const formattedProjectName = formatPathName(
                    projectPath,
                    "```.../",
                    "/```",
                  );

                  return (
                    <Flex
                      key={`project-group-${index}`}
                      direction="column"
                      gap="4"
                      align="start"
                    >
                      <Heading as="h4" size="3">
                        <Flex
                          align="start"
                          gapX="3"
                          gapY="1"
                          justify="start"
                          wrap="wrap"
                        >
                          ⚙️ In
                          <Markdown>{formattedProjectName}</Markdown>
                          configured {integrations.length}{" "}
                          {integrations.length > 1 || integrations.length === 0
                            ? "integrations"
                            : "integration"}
                        </Flex>
                      </Heading>
                      <Text size="2" color="gray">
                        Folder-specific integrations are local integrations,
                        which are shared only in folder-specific scope.
                      </Text>
                      <Flex
                        direction="column"
                        align="start"
                        gap="2"
                        width="100%"
                      >
                        {integrations.map((integration, subIndex) => (
                          <IntegrationCard
                            key={`project-${index}-${subIndex}-${integration.integr_config_path}`}
                            integration={integration}
                            handleIntegrationShowUp={handleIntegrationShowUp}
                          />
                        ))}
                      </Flex>
                    </Flex>
                  );
                },
              )}
            <Flex direction="column" gap="4" align="start">
              <Heading as="h4" size="3">
                <Flex align="start" gap="3" justify="center">
                  Add new integration
                </Flex>
              </Heading>
              <Grid
                align="stretch"
                gap="3"
                columns={{ initial: "2", xs: "3", sm: "4", md: "5" }}
                width="100%"
              >
                {availableIntegrationsToConfigure &&
                  Object.entries(availableIntegrationsToConfigure).map(
                    ([_projectPath, integration], index) => {
                      return (
                        <IntegrationCard
                          isNotConfigured
                          key={`project-${index}-${JSON.stringify(
                            integration.integr_config_path,
                          )}`}
                          integration={integration}
                          handleIntegrationShowUp={handleIntegrationShowUp}
                        />
                      );
                    },
                  )}
              </Grid>
            </Flex>
          </Flex>
        )}
      </Flex>
    </Box>
  );
};
