import React, { useEffect, useState } from "react";
import {
  Badge,
  Box,
  Button,
  Card,
  Flex,
  Heading,
  HoverCard,
  Text,
} from "@radix-ui/themes";
import {
  isDetailMessage,
  type Integration,
  type IntegrationIcon,
  type IntegrationSchema,
  type ValidatedIntegration,
} from "../../services/refact";
import { Spinner } from "../Spinner";
import { ErrorCallout } from "../Callout";
import { useAppDispatch, useAppSelector } from "../../hooks";
import { clearError, getErrorMessage } from "../../features/Errors/errorsSlice";
import styles from "./IntegrationsView.module.css";
import { fetchSchema, validateSchema } from "../../utils/jsonSchemaVerifier";
// import Form from "@rjsf/core";
import { customizeValidator } from "@rjsf/validator-ajv8";
import type { ValidatorType } from "@rjsf/utils";
import { ExclamationTriangleIcon } from "@radix-ui/react-icons";
import { customFields, customWidgets } from "./CustomFieldsAndWidgets";
import { IntegrationsForm as Form } from "../IntegrationsForm/IntegrationsFrom";
import validator from "@rjsf/validator-ajv8";

// // eslint-disable-next-line @typescript-eslint/no-explicit-any
// const validator: ValidatorType<any, IntegrationSchema> = customizeValidator<
//   // eslint-disable-next-line @typescript-eslint/no-explicit-any
//   any,
//   IntegrationSchema
// >();

const WarningHoverCard: React.FC<{
  label: React.ReactNode;
  warning: string;
}> = ({ label, warning }) => {
  return (
    <HoverCard.Root>
      <HoverCard.Trigger>{label}</HoverCard.Trigger>
      <HoverCard.Content
        maxWidth="340px"
        data-accent-color="orange"
        className={styles.WarningHoverCardContent}
      >
        <Box>
          <Flex justify="between" wrap="nowrap">
            <ExclamationTriangleIcon />
            <Text
              size="1"
              style={{
                maxWidth: "90%",
              }}
            >
              {warning}
            </Text>
          </Flex>
        </Box>
      </HoverCard.Content>
    </HoverCard.Root>
  );
};

export const IntegrationsView: React.FC<{
  integrationsData?: Integration[];
  integrationsIcons?: IntegrationIcon[];
  isLoading: boolean;
  goBack?: () => void;
}> = ({ integrationsData, integrationsIcons, isLoading, goBack }) => {
  const dispatch = useAppDispatch();
  const error = useAppSelector(getErrorMessage);
  const [validatedIntegrations, setValidatedIntegrations] = useState<
    ValidatedIntegration[]
  >([]);

  const [currentIntegration, setCurrentIntegration] =
    useState<ValidatedIntegration | null>(null);

  // useEffect(() => {
  //   const validateIntegrations = async () => {
  //     if (integrationsData) {
  //       if (validatedIntegrations.length >= 1) {
  //         setValidatedIntegrations([]);
  //       }
  //       const validIntegrations: ValidatedIntegration[] = [];

  //       for (const integration of integrationsData) {
  //         try {
  //           const schema = await fetchSchema(integration.schema.$schema);
  //           if (!validateSchema(schema, integration.value)) {
  //             const maybeWarningMessage = isDetailMessage(integration.value)
  //               ? integration.value.detail
  //               : "Current tool has unexpected error, check your settings";

  //             validIntegrations.push({
  //               ...integration,
  //               warning: maybeWarningMessage,
  //             });
  //             continue;
  //           }
  //           validIntegrations.push(integration);
  //         } catch (err) {
  //           console.error(
  //             `Failed to validate integration ${integration.name}:`,
  //             err,
  //           );
  //         }
  //       }
  //       console.log(`[DEBUG]: validIntegrations: `, validIntegrations);
  //       setValidatedIntegrations(validIntegrations);
  //     }
  //   };

  //   void validateIntegrations();
  // }, [integrationsData, validatedIntegrations.length]);

  if (isLoading) {
    return <Spinner />;
  }

  const goBackAndClearError = () => {
    goBack && goBack();
    dispatch(clearError());
    setCurrentIntegration(null);
  };

  const handleIntegrationShowUp = (integration: ValidatedIntegration) => {
    // if (!validatedIntegrations.find((i) => i.name === integration.name)) {
    //   console.error(
    //     `[ERROR]: Integration is not valid. Error: ${
    //       integration.value.detail as string
    //     }`,
    //   );
    //   setCurrentIntegration(null);
    //   return;
    // }
    console.log(`[DEBUG]: open form: `, integration);
    setCurrentIntegration(integration);
  };

  const handleSubmit = (formData: unknown) => {
    console.log(`[DEBUG]: formData: `, formData);
  };

  // eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing
  if (error || !integrationsData || !integrationsIcons) {
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
          {currentIntegration
            ? `Setup ${currentIntegration.name}`
            : "Integrations Setup"}
        </Heading>
        {currentIntegration ? (
          <Flex direction="column" align="start">
            <Form
              schema={currentIntegration.schema}
              validator={validator}
              className={styles.IntegrationForm}
              onSubmit={(event) => handleSubmit(event.formData)}
              // fields={customFields}
              // widgets={customWidgets}
            >
              <Flex gap="3" mt="4">
                <Button color="green" variant="solid" type="submit">
                  Submit
                </Button>
                <Button
                  color="ruby"
                  onClick={() => setCurrentIntegration(null)}
                  type="button"
                >
                  Cancel
                </Button>
              </Flex>
            </Form>
            {currentIntegration.warning && (
              <WarningHoverCard
                label={
                  <Badge className={styles.IntegrationWarning} color="orange">
                    Has warnings
                  </Badge>
                }
                warning={currentIntegration.warning}
              />
            )}
          </Flex>
        ) : (
          <Flex align="start" justify="between" wrap="wrap" gap="4">
            {integrationsData.map((integration) => (
              <Card
                key={integration.name}
                className={styles.integrationCard}
                onClick={() => handleIntegrationShowUp(integration)}
              >
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
        )}
      </Flex>
    </Box>
  );
};
