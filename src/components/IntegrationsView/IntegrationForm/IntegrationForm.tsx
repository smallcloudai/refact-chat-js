import { FC, FormEvent, useEffect } from "react";
import classNames from "classnames";
import { useGetIntegrationDataByPathQuery } from "../../../hooks/useGetIntegrationDataByPathQuery";
import { Spinner } from "../../Spinner";
import { Badge, Button, Flex, Grid, Heading, Text } from "@radix-ui/themes";
import { IntegrationDocker } from "../IntegrationDocker";
import { SmartLink } from "../../SmartLink";
import { IntegrationFormField } from "../../../features/Integrations/IntegrationFormField";
import { IntegrationAvailability } from "./IntegrationAvailability";
import { IntegrationDeletePopover } from "../IntegrationDeletePopover";
import { debugIntegrations } from "../../../debugConfig";
import { Confirmation } from "../Confirmation";
import { ExclamationTriangleIcon } from "@radix-ui/react-icons";
import { useEventsBusForIDE } from "../../../hooks";
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
  const { openFile } = useEventsBusForIDE();

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

  // Render helpers
  const renderErrorState = () => {
    if (!integration.data) return null;
    const { integr_name } = integration.data;
    const { error_msg, integr_config_path, error_line } =
      integration.data.error_log[0];
    return (
      <Flex width="100%" direction="column" align="start" gap="4">
        <Text size="2" color="gray">
          Whoops, this integration has a syntax error in the config file. You
          can fix this by editing the config file.
        </Text>
        <Badge size="2" color="red">
          <ExclamationTriangleIcon /> {error_msg}
        </Badge>
        <Flex align="center" gap="2">
          <Button
            variant="outline"
            color="gray"
            onClick={() =>
              openFile({
                file_name: integr_config_path,
                line: error_line === 0 ? 1 : error_line,
              })
            }
          >
            Open {integr_name}.yaml
          </Button>
          <IntegrationDeletePopover
            integrationName={integr_name}
            integrationConfigPath={integr_config_path}
            isApplying={isApplying}
            isDeletingIntegration={isDeletingIntegration}
            handleDeleteIntegration={handleDeleteIntegration}
          />
        </Flex>
      </Flex>
    );
  };

  const renderFormFields = () => {
    if (!integration.data) return null;
    const {
      integr_config_path,
      integr_name,
      integr_schema,
      integr_values,
      project_path,
    } = integration.data;

    return (
      <Grid gap="2" className={styles.gridContainer}>
        {Object.keys(importantFields).map((fieldKey) => (
          <IntegrationFormField
            key={`${fieldKey}-important`}
            fieldKey={fieldKey}
            values={integr_values}
            field={integr_schema.fields[fieldKey]}
            integrationName={integr_name}
            integrationPath={integr_config_path}
            integrationProject={project_path}
            isFieldVisible={areExtraFieldsRevealed}
            onToolParameters={handleToolParameters}
          />
        ))}
        {Object.keys(extraFields).map((fieldKey) => (
          <IntegrationFormField
            key={`${fieldKey}-extra`}
            fieldKey={fieldKey}
            values={integr_values}
            field={integr_schema.fields[fieldKey]}
            integrationName={integr_name}
            integrationPath={integr_config_path}
            integrationProject={project_path}
            isFieldVisible={areExtraFieldsRevealed}
            onToolParameters={handleToolParameters}
          />
        ))}
      </Grid>
    );
  };

  const renderSmartLinks = () => {
    if (!integration.data?.integr_schema.smartlinks?.length) return null;

    return (
      <Flex width="100%" direction="column" gap="1" mb="6">
        <Flex align="center" gap="3" mt="2" wrap="wrap">
          <Heading as="h6" size="2" weight="medium">
            Actions:
          </Heading>
          {integration.data.integr_schema.smartlinks.map((smartlink, idx) => {
            if (!integration.data) return null;
            const { integr_name, project_path, integr_config_path } =
              integration.data;
            return (
              <SmartLink
                key={`smartlink-${idx}`}
                smartlink={smartlink}
                integrationName={integr_name}
                integrationProject={project_path}
                integrationPath={integr_config_path}
                shouldBeDisabled={
                  smartlink.sl_enable_only_with_tool
                    ? !availabilityValues.on_your_laptop
                    : false
                }
              />
            );
          })}
        </Flex>
      </Flex>
    );
  };

  const renderAvailabilityAndDelete = () => {
    if (!integration.data?.integr_values) return null;

    return (
      <Flex align="start" justify="between">
        <Flex
          gap="4"
          mb="4"
          align="center"
          justify="between"
          className={styles.switchInline}
        >
          {integration.data.integr_values.available &&
            Object.keys(integration.data.integr_values.available).map((key) => (
              <IntegrationAvailability
                key={key}
                fieldName={key}
                value={availabilityValues[key]}
                onChange={handleAvailabilityChange}
              />
            ))}
        </Flex>
        <IntegrationDeletePopover
          integrationName={integration.data.integr_name}
          integrationConfigPath={integration.data.integr_config_path}
          isApplying={isApplying}
          isDeletingIntegration={isDeletingIntegration}
          handleDeleteIntegration={handleDeleteIntegration}
        />
      </Flex>
    );
  };

  // Loading and error states
  if (integration.isLoading) {
    return <Spinner spinning />;
  }

  if (!integration.data) {
    return <Text>No integration found</Text>;
  }

  if (integration.data.error_log.length > 0) {
    return renderErrorState();
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
            {renderAvailabilityAndDelete()}
            {renderSmartLinks()}
            {renderFormFields()}
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
