/* eslint-disable no-console */
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
  dockerApi,
  Integration,
  IntegrationWithIconRecord,
  IntegrationWithIconResponse,
  isDetailMessage,
  // isDetailMessage,
} from "../../services/refact";
import { Spinner } from "../Spinner";
import { ErrorCallout } from "../Callout";
import { useAppDispatch, useAppSelector } from "../../hooks";
import {
  clearError,
  getErrorMessage,
  setError,
} from "../../features/Errors/errorsSlice";
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
import { integrationsApi } from "../../services/refact";
import {
  isIntegrationSetupPage,
  pop,
  popBackTo,
  selectCurrentPage,
} from "../../features/Pages/pagesSlice";

type IntegrationViewProps = {
  integrationsMap?: IntegrationWithIconResponse;
  // integrationsIcons?: IntegrationIcon[];
  isLoading: boolean;
  goBack?: () => void;
  handleIfInnerIntegrationWasSet: (state: boolean) => void;
};

export const IntegrationsView: FC<IntegrationViewProps> = ({
  integrationsMap,
  isLoading,
  goBack,
  handleIfInnerIntegrationWasSet,
}) => {
  const dispatch = useAppDispatch();
  const globalError = useAppSelector(getErrorMessage);
  const information = useAppSelector(getInformationMessage);
  const { saveIntegrationMutationTrigger } = useSaveIntegrationData();
  // const currentThreadIntegration = useAppSelector(selectIntegration);
  const currentPage = useAppSelector(selectCurrentPage);
  const currentThreadIntegration = useMemo(() => {
    if (!currentPage) return null;
    if (!isIntegrationSetupPage(currentPage)) return null;
    return currentPage;
  }, [currentPage]);

  const maybeIntegration = useMemo(() => {
    if (!currentThreadIntegration) return null;
    if (!integrationsMap) return null;
    return (
      integrationsMap.integrations.find(
        (integration) =>
          integration.project_path === currentThreadIntegration.projectPath &&
          integration.integr_name === currentThreadIntegration.integrationName,
      ) ?? null
    );
  }, [currentThreadIntegration, integrationsMap]);

  // TBD: what if they went home then came back to integrations?

  const [currentIntegration, setCurrentIntegration] =
    useState<IntegrationWithIconRecord | null>(maybeIntegration);

  useEffect(() => {
    if (maybeIntegration) {
      setCurrentIntegration(maybeIntegration);
    }
  }, [maybeIntegration]);

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

  const [availabilityValues, setAvailabilityValues] = useState<
    Record<string, boolean>
  >({});

  useEffect(() => {
    console.log(`[DEBUG]: integrationsData: `, integrationsMap);
  }, [integrationsMap]);

  useEffect(() => {
    if (currentIntegration) {
      handleIfInnerIntegrationWasSet(true);
    } else {
      handleIfInnerIntegrationWasSet(false);
    }
  }, [currentIntegration, handleIfInnerIntegrationWasSet]);

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
    if (currentIntegration) {
      setCurrentIntegration(null);
      setIsDisabledIntegrationForm(true);
    }
    information && dispatch(clearInformation());
    globalError && dispatch(clearError());
    dispatch(integrationsApi.util.resetApiState());
    dispatch(dockerApi.util.resetApiState());
    // TODO: can cause a loop where integration pages goes back to form
    dispatch(pop());
    dispatch(popBackTo({ name: "integrations page" }));
  }, [dispatch, globalError, information, currentIntegration]);

  // const handleFormCancel = useCallback(() => {
  //   if (!currentIntegration) return;
  //   if (!currentIntegrationSchema) return;

  //   const form = document.getElementById(
  //     `form-${currentIntegration.integr_name}`,
  //   ) as HTMLFormElement | undefined;
  //   if (!form) return;

  //   const formElements = form.elements;

  //   Object.keys(currentIntegrationSchema.fields).forEach((key) => {
  //     const field = currentIntegrationSchema.fields[key];
  //     const input = formElements.namedItem(key) as HTMLInputElement | null;
  //     if (input) {
  //       let value = field.f_default;

  //       if (currentIntegrationValues && key in currentIntegrationValues) {
  //         const currentValue = currentIntegrationValues[key];
  //         if (
  //           typeof currentValue === "object" &&
  //           !Array.isArray(currentValue) &&
  //           currentValue
  //         ) {
  //           // Handle Record<string, boolean>
  //           value = Object.entries(currentValue)
  //             .filter(([, isChecked]) => isChecked)
  //             .map(([subKey]) => subKey)
  //             .join(", ");
  //         } else {
  //           // Handle IntegrationPrimitive
  //           value = currentValue as string;
  //         }
  //       }

  //       input.value = value?.toString() ?? "";
  //     }
  //   });

  //   if (
  //     currentIntegrationValues?.available &&
  //     typeof currentIntegrationValues.available === "object"
  //   ) {
  //     setAvailabilityValues(currentIntegrationValues.available);
  //   }

  //   setIsDisabledIntegrationForm(true);
  // }, [currentIntegrationSchema, currentIntegration, currentIntegrationValues]);

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
        const [f_type, _f_size] = (field.f_type as string).split("_");
        switch (f_type) {
          case "int":
            acc[key] = parseInt(rawFormValues[key] as string, 10);
            break;
          case "string":
            acc[key] = rawFormValues[key] as string;
            break;
          default:
            acc[key] = rawFormValues[key] as string;
            break;
        }
        return acc;
      }, {});

      console.log(`[DEBUG]: formValues: `, formValues);

      formValues.available = availabilityValues;

      const response = await saveIntegrationMutationTrigger(
        currentIntegration.integr_config_path,
        formValues,
      );

      if (response.error) {
        const error = response.error as FetchBaseQueryError;
        console.log(`[DEBUG]: error is present, error: `, error);
        dispatch(
          setError(
            isDetailMessage(error.data)
              ? error.data.detail
              : `something went wrong while saving configuration for ${currentIntegration.integr_name} integration`,
          ),
        );
      } else {
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
      availabilityValues,
    ],
  );

  const handleIntegrationFormChange = useCallback(
    (event: FormEvent<HTMLFormElement>) => {
      if (!currentIntegration) return;
      if (!currentIntegrationSchema) return;
      if (!currentIntegrationValues) return;
      if (!currentIntegrationValues.available) return;
      event.preventDefault();

      const formData = new FormData(event.currentTarget);
      const rawFormValues = Object.fromEntries(formData.entries());

      // Adjust types of data based on f_type of each field in schema
      const formValues: Integration["integr_values"] = Object.keys(
        rawFormValues,
      ).reduce<Integration["integr_values"]>((acc, key) => {
        const field = currentIntegrationSchema.fields[key];
        const [f_type, _f_size] = (field.f_type as string).split("_");
        switch (f_type) {
          case "int":
            acc[key] = parseInt(rawFormValues[key] as string, 10);
            break;
          case "string":
            acc[key] = rawFormValues[key] as string;
            break;
          default:
            acc[key] = rawFormValues[key] as string;
            break;
        }
        return acc;
      }, {});

      const eachFormValueIsNotChanged = Object.entries(formValues).every(
        ([fieldKey, fieldValue]) => {
          return (
            fieldKey in currentIntegrationValues &&
            fieldValue === currentIntegrationValues[fieldKey]
          );
        },
      );

      const eachAvailabilityOptionIsNotChanged = Object.entries(
        availabilityValues,
      ).every(([fieldKey, fieldValue]) => {
        const availableObj = currentIntegrationValues.available;
        if (availableObj && typeof availableObj === "object") {
          return (
            fieldKey in availableObj && fieldValue === availableObj[fieldKey]
          );
        }
        return false;
      });
      const maybeDisabled =
        eachFormValueIsNotChanged && eachAvailabilityOptionIsNotChanged;
      console.log(`[DEBUG]: maybeDisabled: `, maybeDisabled);

      setIsDisabledIntegrationForm(maybeDisabled);
    },
    [
      currentIntegration,
      currentIntegrationValues,
      currentIntegrationSchema,
      availabilityValues,
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
        {currentIntegration ? (
          <IntegrationsHeader
            handleFormReturn={handleFormReturn}
            integrationName={currentIntegration.integr_name}
            icon="https://placehold.jp/150x150.png"
          />
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
              // TODO: on smart link click or pass the name down
              handleSubmit={(event) => void handleSubmit(event)}
              integrationPath={currentIntegration.integr_config_path}
              isApplying={isApplyingIntegrationForm}
              isDisabled={isDisabledIntegrationForm}
              onSchema={handleSetCurrentIntegrationSchema}
              onValues={handleSetCurrentIntegrationValues}
              handleChange={handleIntegrationFormChange}
              availabilityValues={availabilityValues}
              setAvailabilityValues={setAvailabilityValues}
            />
            {information && (
              <InformationCallout
                timeout={3000}
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
              <Flex
                align="start"
                justify="between"
                wrap="wrap"
                gap="4"
                width="100%"
              >
                {!!globalIntegrations &&
                  globalIntegrations.map((integration, index) => (
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
                  ))}
              </Flex>
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

type IntegrationsHeaderProps = {
  handleFormReturn: () => void;
  integrationName: string;
  icon: string;
};

const IntegrationsHeader: FC<IntegrationsHeaderProps> = ({
  handleFormReturn,
  integrationName,
  icon,
}) => {
  return (
    <Flex className={styles.IntegrationsHeader}>
      <Flex align="center" justify="between" width="100%">
        <Flex gap="6" align="center">
          <Button size="1" variant="surface" onClick={handleFormReturn}>
            <ArrowLeftIcon width="16" height="16" />
            Configurations
          </Button>
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
