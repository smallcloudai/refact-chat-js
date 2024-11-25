import { useCallback, useEffect, useMemo, useState } from "react";
import type { FormEvent, FC } from "react";
import {
  // Badge,
  Box,
  Button,
  Card,
  Flex,
  Heading,
  // HoverCard,
  Text,
} from "@radix-ui/themes";
import {
  Integration,
  IntegrationWithIconResponse,
  isDetailMessage,
  // isDetailMessage,
} from "../../services/refact";
import { Spinner } from "../Spinner";
import { ErrorCallout } from "../Callout";
import { useAppDispatch, useAppSelector } from "../../hooks";
import { clearError, getErrorMessage } from "../../features/Errors/errorsSlice";
import styles from "./IntegrationsView.module.css";
// import { ExclamationTriangleIcon } from "@radix-ui/react-icons";

import "./JSONFormStyles.css";
import { useSaveIntegrationData } from "../../hooks/useSaveIntegrationData";
import { IntegrationForm } from "./IntegrationForm";
import { Markdown } from "../Markdown";
import { toPascalCase } from "../../utils/toPascalCase";
import {
  clearInformation,
  getInformationMessage,
  setInformation,
} from "../../features/Errors/informationSlice";
import { InformationCallout } from "../Callout/Callout";
import { FetchBaseQueryError } from "@reduxjs/toolkit/query";
import { ArrowLeftIcon } from "@radix-ui/react-icons";

// TODO: do we really need this?

// const WarningHoverCard: React.FC<{
//   label: React.ReactNode;
//   warning: string;
// }> = ({ label, warning }) => {
//   return (
//     <HoverCard.Root>
//       <HoverCard.Trigger>{label}</HoverCard.Trigger>
//       <HoverCard.Content
//         maxWidth="340px"
//         data-accent-color="orange"
//         className={styles.WarningHoverCardContent}
//       >
//         <Box>
//           <Flex justify="between" wrap="nowrap">
//             <ExclamationTriangleIcon />
//             <Text
//               size="1"
//               style={{
//                 maxWidth: "90%",
//               }}
//             >
//               {warning}
//             </Text>
//           </Flex>
//         </Box>
//       </HoverCard.Content>
//     </HoverCard.Root>
//   );
// };

type IntegrationViewProps = {
  integrationsMap?: IntegrationWithIconResponse;
  // integrationsIcons?: IntegrationIcon[];
  isLoading: boolean;
  goBack?: () => void;
  handleBackButtonVisibility: (state: boolean) => void;
};

export const IntegrationsView: FC<IntegrationViewProps> = ({
  integrationsMap,
  isLoading,
  goBack,
  handleBackButtonVisibility,
}) => {
  const dispatch = useAppDispatch();
  const globalError = useAppSelector(getErrorMessage);
  const information = useAppSelector(getInformationMessage);
  const { saveIntegrationMutationTrigger } = useSaveIntegrationData();

  const [currentIntegration, setCurrentIntegration] = useState<
    IntegrationWithIconResponse["integrations"][number] | null
  >(null);

  const [currentIntegrationSchema, setCurrentIntegrationSchema] = useState<
    Integration["integr_schema"] | null
  >(null);

  const [currentIntegrationValues, setCurrentIntegrationValues] = useState<
    Integration["integr_values"] | null
  >(null);

  const [isApplyingIntegrationForm, setIsApplyingIntegrationForm] =
    useState<boolean>(false);

  const [isDisabledIntegrationForm, setIsDisabledIntegrationForm] =
    useState<boolean>(true);

  const [localError, setLocalError] = useState<string>("");

  useEffect(() => {
    console.log(`[DEBUG]: integrationsData: `, integrationsMap);
  }, [integrationsMap]);

  useEffect(() => {
    if (currentIntegration) {
      handleBackButtonVisibility(false);
    } else {
      handleBackButtonVisibility(true);
    }
  }, [currentIntegration, handleBackButtonVisibility]);

  const globalIntegrations = useMemo(() => {
    if (integrationsMap?.integrations) {
      return integrationsMap.integrations.filter(
        (integration) => integration.project_path === "",
      );
    }
  }, [integrationsMap]);

  const projectSpecificIntegrations = useMemo(() => {
    if (integrationsMap?.integrations) {
      return integrationsMap.integrations.filter(
        (integration) => integration.project_path !== "",
      );
    }
  }, [integrationsMap]);

  const groupedProjectIntegrations = useMemo(() => {
    if (projectSpecificIntegrations) {
      return projectSpecificIntegrations.reduce<
        Record<string, IntegrationWithIconResponse["integrations"]>
      >((acc, integration) => {
        // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
        if (!acc[integration.project_path]) {
          acc[integration.project_path] = [];
        }
        acc[integration.project_path].push(integration);
        return acc;
      }, {});
    }
  }, [projectSpecificIntegrations]);

  const handleSetCurrentIntegrationSchema = (
    schema: Integration["integr_schema"],
  ) => {
    if (!currentIntegration) return;

    setCurrentIntegrationSchema(schema);
  };

  const handleSetCurrentIntegrationValues = (
    values: Integration["integr_values"],
  ) => {
    if (!currentIntegration) return;

    setCurrentIntegrationValues(values);
  };

  const handleFormReturn = useCallback(() => {
    currentIntegration && setCurrentIntegration(null);
    information && dispatch(clearInformation());
    globalError && dispatch(clearError());
    localError && setLocalError("");
  }, [dispatch, localError, globalError, information, currentIntegration]);

  const handleFormCancel = useCallback(() => {
    if (!currentIntegration) return;
    if (!currentIntegrationSchema) return;

    const form = document.getElementById(
      `form-${currentIntegration.integr_name}`,
    ) as HTMLFormElement | undefined;
    if (!form) return;

    const formElements = form.elements;

    Object.keys(currentIntegrationSchema.fields).forEach((key) => {
      const field = currentIntegrationSchema.fields[key];
      const input = formElements.namedItem(key) as HTMLInputElement | null;
      if (input) {
        let value = field.f_default;

        if (currentIntegrationValues && key in currentIntegrationValues) {
          const currentValue = currentIntegrationValues[key];
          if (
            typeof currentValue === "object" &&
            !Array.isArray(currentValue) &&
            currentValue
          ) {
            // Handle Record<string, boolean>
            value = Object.entries(currentValue)
              .filter(([, isChecked]) => isChecked)
              .map(([subKey]) => subKey)
              .join(", ");
          } else {
            // Handle IntegrationPrimitive
            value = currentValue as string;
          }
        }

        input.value = value?.toString() ?? "";
      }
    });

    setIsDisabledIntegrationForm(true);
  }, [currentIntegrationSchema, currentIntegration, currentIntegrationValues]);

  const handleSubmit = useCallback(
    async (event: FormEvent<HTMLFormElement>) => {
      if (!currentIntegration) return;
      console.log(`[DEBUG]: schema: `, currentIntegrationSchema);
      if (!currentIntegrationSchema) return;
      event.preventDefault();
      setIsApplyingIntegrationForm(true);

      console.log(`[DEBUG]: event: `, event);

      const formData = new FormData(event.currentTarget);
      const rawFormValues = Object.fromEntries(formData.entries());

      // Adjust types of data based on f_type of each field in schema
      const formValues: Integration["integr_values"] = Object.keys(
        rawFormValues,
      ).reduce<Integration["integr_values"]>((acc, key) => {
        const field = currentIntegrationSchema.fields[key];
        switch (field.f_type) {
          case "int":
            acc[key] = parseInt(rawFormValues[key] as string, 10);
            break;
          case "string":
          default:
            acc[key] = rawFormValues[key] as string;
            break;
        }
        return acc;
      }, {});

      console.log(`[DEBUG]: formValues: `, formValues);

      const response = await saveIntegrationMutationTrigger({
        filePath: currentIntegration.integr_config_path,
        values: formValues,
      });

      console.log(`[DEBUG]: response: `, response);
      if (response.error) {
        const error = response.error as FetchBaseQueryError;
        console.log(`[DEBUG]: error is present, error: `, error);
        setLocalError(
          isDetailMessage(error.data)
            ? error.data.detail
            : `something went wrong while saving configuration for ${currentIntegration.integr_name} integration`,
        );
      } else {
        console.log(`[DEBUG]: all good, save success`);
        dispatch(
          setInformation(
            `Integration ${currentIntegration.integr_name} saved successfully.`,
          ),
        );
        setIsDisabledIntegrationForm(true);
      }
      setIsApplyingIntegrationForm(false);
    },
    [
      currentIntegration,
      saveIntegrationMutationTrigger,
      currentIntegrationSchema,
      dispatch,
    ],
  );

  const handleIntegrationFormChange = useCallback(
    (event: FormEvent<HTMLFormElement>) => {
      if (!currentIntegration) return;
      if (!currentIntegrationSchema) return;
      if (!currentIntegrationValues) return;
      event.preventDefault();

      const formData = new FormData(event.currentTarget);
      const rawFormValues = Object.fromEntries(formData.entries());

      // Adjust types of data based on f_type of each field in schema
      const formValues: Integration["integr_values"] = Object.keys(
        rawFormValues,
      ).reduce<Integration["integr_values"]>((acc, key) => {
        const field = currentIntegrationSchema.fields[key];
        switch (field.f_type) {
          case "int":
            acc[key] = parseInt(rawFormValues[key] as string, 10);
            break;
          case "string":
          default:
            acc[key] = rawFormValues[key] as string;
            break;
        }
        return acc;
      }, {});

      const maybeDisabled = Object.entries(formValues).every(
        ([fieldKey, fieldValue]) => {
          return (
            fieldKey in currentIntegrationValues &&
            fieldValue === currentIntegrationValues[fieldKey]
          );
        },
      );

      if (isDisabledIntegrationForm !== maybeDisabled) {
        console.log(`[DEBUG]: values did change, enabling form`);
      } else {
        console.log(`[DEBUG]: form didn't change, form stays disabled`);
      }

      setIsDisabledIntegrationForm(maybeDisabled);
    },
    [
      currentIntegration,
      currentIntegrationValues,
      currentIntegrationSchema,
      isDisabledIntegrationForm,
    ],
  );

  if (isLoading) {
    return <Spinner spinning />;
  }

  const goBackAndClearError = () => {
    goBack && goBack();
    dispatch(clearError());
    setCurrentIntegration(null);
  };

  const handleIntegrationShowUp = (
    integration: IntegrationWithIconResponse["integrations"][number],
  ) => {
    console.log(`[DEBUG]: open form: `, integration);
    setCurrentIntegration(integration);
  };

  // eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing
  if (globalError || !integrationsMap) {
    return (
      <ErrorCallout mx="0" onClick={goBackAndClearError}>
        {globalError ?? "fetching integrations."}
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
        {currentIntegration ? (
          <>
            <Flex gap="2" pb="3">
              <Button variant="surface" onClick={handleFormReturn}>
                <ArrowLeftIcon width="16" height="16" />
                Back
              </Button>
            </Flex>
            <Heading as="h3" className={styles.SetupTitle} mb="4">
              {/* <img
              src={
                integrationsMap.integrations.find(
                  (integration) =>
                    integration.integr_name === currentIntegration.integr_name,
                )?.project_path ?? ""
              }
              className={styles.SetupIcon}
              alt={currentIntegration.integr_name}
            /> */}
              Setup {currentIntegration.integr_name}
            </Heading>
          </>
        ) : (
          <Heading as="h3" align="center" mb="5">
            Integrations Setup
          </Heading>
        )}
        {currentIntegration ? (
          <Flex
            direction="column"
            align="start"
            justify="between"
            height="100%"
          >
            <IntegrationForm
              handleSubmit={(event) => void handleSubmit(event)}
              integrationPath={currentIntegration.integr_config_path}
              isApplying={isApplyingIntegrationForm}
              isDisabled={isDisabledIntegrationForm}
              onCancel={handleFormCancel}
              onSchema={handleSetCurrentIntegrationSchema}
              onValues={handleSetCurrentIntegrationValues}
              handleChange={handleIntegrationFormChange}
            />
            {information && (
              <InformationCallout
                // timeout={3000}
                mx="0"
                onClick={() => dispatch(clearInformation())}
                className={styles.popup}
              >
                {information}
              </InformationCallout>
            )}
            {localError && (
              <ErrorCallout
                mx="0"
                timeout={3000}
                onClick={() => setLocalError("")}
              >
                {localError}
              </ErrorCallout>
            )}
          </Flex>
        ) : (
          <>
            <Flex
              align="start"
              direction="column"
              justify="between"
              wrap="wrap"
              gap="4"
              width="100%"
              mb="8"
            >
              <Heading
                as="h5"
                size="4"
                align="center"
                mb="2"
                style={{
                  width: "100%",
                }}
              >
                Global Configurations
              </Heading>
              {!!globalIntegrations &&
                globalIntegrations.map((integration, index) => {
                  return (
                    <Card
                      key={`${index}-${integration.integr_config_path}`}
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
                          src={"https://placehold.jp/150x150.png"}
                          className={styles.SetupIcon}
                          alt={integration.integr_name}
                        />
                        <Text>{toPascalCase(integration.integr_name)}</Text>
                      </Flex>
                    </Card>
                  );
                })}
            </Flex>
            {groupedProjectIntegrations &&
              Object.entries(groupedProjectIntegrations).map(
                ([projectPath, integrations], index) => {
                  const formattedProjectName =
                    "```" +
                    projectPath.split("\\")[
                      projectPath.split("\\").length - 1
                    ] +
                    "```";

                  return (
                    <Flex
                      key={`project-group-${index}`}
                      mb="4"
                      direction="column"
                    >
                      <Heading as="h5" size="4" align="center" mb="2">
                        <Flex align="center" gap="3" justify="center">
                          Project
                          <Markdown>{formattedProjectName}</Markdown>
                        </Flex>
                      </Heading>
                      <Flex align="start" justify="between" wrap="wrap" gap="4">
                        {integrations.map((integration, subIndex) => (
                          <Card
                            key={`project-${index}-${subIndex}-${integration.integr_config_path}`}
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
                                src={"https://placehold.jp/150x150.png"}
                                className={styles.SetupIcon}
                                alt={integration.integr_name}
                              />
                              <Text>
                                {toPascalCase(integration.integr_name)}
                              </Text>
                            </Flex>
                          </Card>
                        ))}
                      </Flex>
                    </Flex>
                  );
                },
              )}
          </>
        )}
      </Flex>
    </Box>
  );
};
