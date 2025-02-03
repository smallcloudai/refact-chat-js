import { FC, FormEvent, useEffect } from "react";
import classNames from "classnames";
import { useGetIntegrationDataByPathQuery } from "../../../hooks/useGetIntegrationDataByPathQuery";
import { Spinner } from "../../Spinner";
import { Button, Flex, Grid, Text } from "@radix-ui/themes";
import { IntegrationDocker } from "../IntegrationDocker";
import { debugIntegrations } from "../../../debugConfig";
import { Confirmation } from "../Confirmation";
import { useFormFields } from "./hooks/useFormFields";
import { useFormAvailability } from "./hooks/useFormAvailability";

import styles from "./IntegrationForm.module.css";
import {
  areAllFieldsBoolean,
  areToolConfirmation,
  type Integration,
  type ToolConfirmation,
} from "../../../services/refact";
import type { ToolParameterEntity } from "../../../services/refact";
import { FormFields } from "./FormFields";
import { ErrorState } from "./ErrorState";
import { FormSmartlinks } from "./FormSmartlinks";
import { FormAvailabilityAndDelete } from "./FormAvailabilityAndDelete";

type IntegrationFormProps = {
  integrationPath: string;
  isApplying: boolean;
  isDisabled: boolean;
  isDeletingIntegration: boolean;
  availabilityValues: Record<string, boolean>;
  confirmationRules: ToolConfirmation;
  handleSubmit: (event: FormEvent<HTMLFormElement>) => void;
  handleDeleteIntegration: (path: string, name: string) => void;
  handleChange: (event: FormEvent<HTMLFormElement>) => void;
  onSchema: (schema: Integration["integr_schema"]) => void;
  onValues: (values: Integration["integr_values"]) => void;
  setAvailabilityValues: React.Dispatch<
    React.SetStateAction<Record<string, boolean>>
  >;
  setConfirmationRules: React.Dispatch<React.SetStateAction<ToolConfirmation>>;
  setToolParameters: React.Dispatch<
    React.SetStateAction<ToolParameterEntity[] | null>
  >;
  handleSwitchIntegration: (
    integrationName: string,
    integrationConfigPath: string,
  ) => void;
};

export const IntegrationForm: FC<IntegrationFormProps> = ({
  integrationPath,
  isApplying,
  isDisabled,
  isDeletingIntegration,
  availabilityValues,
  confirmationRules,
  handleSubmit,
  handleDeleteIntegration,
  handleChange,
  onSchema,
  onValues,
  setAvailabilityValues,
  setConfirmationRules,
  setToolParameters,
  handleSwitchIntegration,
}) => {
  const { integration } = useGetIntegrationDataByPathQuery(integrationPath);

  const {
    importantFields,
    extraFields,
    areExtraFieldsRevealed,
    toggleExtraFields,
  } = useFormFields(integration.data?.integr_schema.fields);
  const {
    handleAvailabilityChange,
    handleConfirmationChange,
    handleToolParameters,
  } = useFormAvailability({
    setAvailabilityValues,
    setConfirmationRules,
    setToolParameters,
  });

  // Set initial values from integration data
  useEffect(() => {
    if (integration.data?.integr_schema) {
      onSchema(integration.data.integr_schema);
    }
    if (integration.data?.integr_values) {
      onValues(integration.data.integr_values);
    }

    debugIntegrations("[DEBUG]: integration.data: ", integration);
  }, [integration, onSchema, onValues, handleAvailabilityChange]);

  useEffect(() => {
    if (
      integration.data?.integr_values?.available &&
      areAllFieldsBoolean(integration.data.integr_values.available)
    ) {
      Object.entries(integration.data.integr_values.available).forEach(
        ([fieldKey, value]) => {
          handleAvailabilityChange(fieldKey, value);
        },
      );
    }
  }, [integration, handleAvailabilityChange]);

  if (integration.isLoading) {
    return <Spinner spinning />;
  }

  if (!integration.data) {
    return <Text>No integration found</Text>;
  }

  if (integration.data.error_log.length > 0) {
    return (
      <ErrorState
        integration={integration.data}
        onDelete={handleDeleteIntegration}
        isApplying={isApplying}
        isDeletingIntegration={isDeletingIntegration}
      />
    );
  }

  return (
    <Flex width="100%" direction="column" gap="2" pb="8">
      {integration.data.integr_schema.description && (
        <Text size="2" color="gray" mb="3">
          {integration.data.integr_schema.description}
        </Text>
      )}

      <form
        onSubmit={handleSubmit}
        onChange={handleChange}
        id={`form-${integration.data.integr_name}`}
      >
        <Flex direction="column" gap="2">
          <Grid mb="0">
            <FormAvailabilityAndDelete
              integration={integration.data}
              availabilityValues={availabilityValues}
              handleAvailabilityChange={handleAvailabilityChange}
              isApplying={isApplying}
              isDeletingIntegration={isDeletingIntegration}
              onDelete={handleDeleteIntegration}
            />
            <FormSmartlinks
              integration={integration.data}
              smartlinks={integration.data.integr_schema.smartlinks}
              availabilityValues={availabilityValues}
            />
            <FormFields
              integration={integration.data}
              importantFields={importantFields}
              extraFields={extraFields}
              areExtraFieldsRevealed={areExtraFieldsRevealed}
              onToolParameters={handleToolParameters}
            />
          </Grid>

          {Object.keys(extraFields).length > 0 && (
            <Button
              variant="soft"
              type="button"
              color="gray"
              size="2"
              onClick={toggleExtraFields}
              mb="1"
              mt={{ initial: "3", xs: "0" }}
              className={styles.advancedButton}
            >
              {areExtraFieldsRevealed
                ? "Hide advanced configuration"
                : "Show advanced configuration"}
            </Button>
          )}

          {!integration.data.integr_schema.confirmation.not_applicable && (
            <Flex gap="4" mb="3">
              <Confirmation
                confirmationByUser={confirmationRules}
                confirmationFromValues={
                  areToolConfirmation(
                    integration.data.integr_values?.confirmation,
                  )
                    ? integration.data.integr_values.confirmation
                    : null
                }
                defaultConfirmationObject={
                  integration.data.integr_schema.confirmation
                }
                onChange={handleConfirmationChange}
              />
            </Flex>
          )}

          <Flex
            justify="end"
            width="100%"
            position="fixed"
            bottom="4"
            right="8"
          >
            <Flex gap="4">
              <Button
                color="green"
                variant="solid"
                type="submit"
                size="2"
                title={isDisabled ? "Cannot apply, no changes made" : "Apply"}
                className={classNames(styles.button, styles.applyButton, {
                  [styles.disabledButton]: isApplying || isDisabled,
                })}
                disabled={isDisabled}
              >
                {isApplying ? "Applying..." : "Apply"}
              </Button>
            </Flex>
          </Flex>
        </Flex>
      </form>

      {integration.data.integr_schema.docker && (
        <Flex mt="6" direction="column" align="start" gap="5">
          <IntegrationDocker
            dockerData={integration.data.integr_schema.docker}
            integrationName={integration.data.integr_name}
            integrationProject={integration.data.project_path}
            integrationPath={integration.data.integr_config_path}
            handleSwitchIntegration={handleSwitchIntegration}
          />
        </Flex>
      )}
    </Flex>
  );
};
