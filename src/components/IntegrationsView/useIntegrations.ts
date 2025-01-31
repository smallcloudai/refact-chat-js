import { FormEvent, useCallback, useEffect, useMemo } from "react";
import {
  areAllFieldsBoolean,
  areIntegrationsNotConfigured,
  areToolConfirmation,
  areToolParameters,
  dockerApi,
  GroupedIntegrationWithIconRecord,
  Integration,
  integrationsApi,
  IntegrationWithIconRecord,
  IntegrationWithIconRecordAndAddress,
  IntegrationWithIconResponse,
  isDetailMessage,
  isNotConfiguredIntegrationWithIconRecord,
  isPrimitive,
  NotConfiguredIntegrationWithIconRecord,
} from "../../services/refact";
import {
  IntegrationsSetupPage,
  isIntegrationSetupPage,
  pop,
  popBackTo,
  selectCurrentPage,
} from "../../features/Pages/pagesSlice";
import { useAppDispatch, useAppSelector } from "../../hooks";
import { debugIntegrations } from "../../debugConfig";
import isEqual from "lodash.isequal";
import { convertRawIntegrationFormValues } from "../../features/Integrations/convertRawIntegrationFormValues";
import { validateSnakeCase } from "../../utils/validateSnakeCase";
import {
  clearInformation,
  getInformationMessage,
  setInformation,
} from "../../features/Errors/informationSlice";
import { clearError } from "../../features/FIM";
import { getErrorMessage, setError } from "../../features/Errors/errorsSlice";
import { toPascalCase } from "../../utils/toPascalCase";
import { useSaveIntegrationData } from "../../hooks/useSaveIntegrationData";
import { useDeleteIntegrationByPath } from "../../hooks/useDeleteIntegrationByPath";
import { FetchBaseQueryError } from "@reduxjs/toolkit/query";
import { selectThemeMode } from "../../features/Config/configSlice";
import { iconMap } from "./icons/iconMap";
import {
  selectAvailabilityValues,
  selectConfirmationRules,
  selectCurrentIntegration,
  selectCurrentIntegrationSchema,
  selectCurrentIntegrationValues,
  selectCurrentNotConfiguredIntegration,
  selectIsApplyingIntegrationForm,
  selectIsDisabledIntegrationForm,
  selectIsDeletingIntegration,
  selectToolParameters,
  setCurrentIntegration,
  setCurrentIntegrationSchema,
  setCurrentIntegrationValues,
  setCurrentNotConfiguredIntegration,
  setIsApplyingIntegrationForm,
  setIsDisabledIntegrationForm,
  setIsDeletingIntegration,
  resetIntegrationsState,
} from "../../features/Integrations/integrationsSlice";

type useIntegrationsViewArgs = {
  integrationsMap?: IntegrationWithIconResponse;
  handleIfInnerIntegrationWasSet?: (state: boolean) => void;
  goBack?: () => void;
};

export const INTEGRATIONS_WITH_TERMINAL_ICON = ["cmdline", "service", "mcp"];

export const useIntegrations = ({
  integrationsMap,
  handleIfInnerIntegrationWasSet,
  goBack,
}: useIntegrationsViewArgs) => {
  const dispatch = useAppDispatch();
  const globalError = useAppSelector(getErrorMessage);
  const information = useAppSelector(getInformationMessage);

  const currentIntegration = useAppSelector(selectCurrentIntegration);
  const currentIntegrationSchema = useAppSelector(
    selectCurrentIntegrationSchema,
  );
  const currentIntegrationValues = useAppSelector(
    selectCurrentIntegrationValues,
  );
  const currentNotConfiguredIntegration = useAppSelector(
    selectCurrentNotConfiguredIntegration,
  );
  const confirmationRules = useAppSelector(selectConfirmationRules);
  const toolParameters = useAppSelector(selectToolParameters);
  const availabilityValues = useAppSelector(selectAvailabilityValues);
  const isApplyingIntegrationForm = useAppSelector(
    selectIsApplyingIntegrationForm,
  );
  const isDeletingIntegration = useAppSelector(selectIsDeletingIntegration);
  const isDisabledIntegrationForm = useAppSelector(
    selectIsDisabledIntegrationForm,
  );

  const { saveIntegrationMutationTrigger } = useSaveIntegrationData();
  // const currentThreadIntegration = useAppSelector(selectIntegration);

  const { deleteIntegrationTrigger } = useDeleteIntegrationByPath();

  const currentPage = useAppSelector(selectCurrentPage);
  const currentThreadIntegration = useMemo(() => {
    if (!currentPage) return null;
    if (!isIntegrationSetupPage(currentPage)) return null;
    return currentPage;
  }, [currentPage]);

  const isTemplateIntegration = useCallback(
    (
      integrationName: string | undefined,
      type: "cmdline" | "service",
    ): boolean => {
      return integrationName?.startsWith(type) ?? false;
    },
    [],
  );

  const getCommandName = useCallback(
    (
      integrationName: string | undefined,
      isCmdline: boolean,
      isService: boolean,
    ): string | undefined => {
      if (!integrationName || (!isCmdline && !isService)) return undefined;
      return integrationName.split("_").slice(1).join("_");
    },
    [],
  );

  const findIntegration = useCallback(
    (
      integrationsMap: IntegrationWithIconResponse,
      threadIntegration: IntegrationsSetupPage,
    ): IntegrationWithIconRecord | null => {
      const { integrationName, integrationPath, shouldIntermediatePageShowUp } =
        threadIntegration;
      const isCmdline = isTemplateIntegration(integrationName, "cmdline");
      const isService = isTemplateIntegration(integrationName, "service");

      // Handle template cases first
      if (!integrationPath && (isCmdline || isService)) {
        const templateName = `${isCmdline ? "cmdline" : "service"}_TEMPLATE`;
        return (
          integrationsMap.integrations.find(
            (i) => i.integr_name === templateName,
          ) ?? null
        );
      }

      // Handle regular integration search
      return (
        integrationsMap.integrations.find((integration) => {
          if (!shouldIntermediatePageShowUp) {
            return integrationName
              ? integration.integr_name === integrationName &&
                  integration.integr_config_path === integrationPath
              : integration.integr_config_path === integrationPath;
          }

          return integrationName
            ? integration.integr_name === integrationName
            : integration.integr_config_path === integrationPath;
        }) ?? null
      );
    },
    [isTemplateIntegration],
  );

  const maybeIntegration = useMemo(() => {
    if (!currentThreadIntegration || !integrationsMap) return null;

    debugIntegrations(
      `[DEBUG LINKS]: currentThreadIntegration: `,
      currentThreadIntegration,
    );

    const integration = findIntegration(
      integrationsMap,
      currentThreadIntegration,
    );

    if (!integration) {
      debugIntegrations(`[DEBUG INTEGRATIONS] not found integration`);
      return null;
    }

    const isCmdline = isTemplateIntegration(
      currentThreadIntegration.integrationName,
      "cmdline",
    );
    const isService = isTemplateIntegration(
      currentThreadIntegration.integrationName,
      "service",
    );

    const integrationWithFlag: IntegrationWithIconRecordAndAddress = {
      ...integration,
      commandName: getCommandName(
        currentThreadIntegration.integrationName,
        isCmdline,
        isService,
      ),
      shouldIntermediatePageShowUp:
        currentThreadIntegration.shouldIntermediatePageShowUp ?? false,
      wasOpenedThroughChat:
        currentThreadIntegration.wasOpenedThroughChat ?? false,
    };

    debugIntegrations(
      `[DEBUG NAVIGATE]: integrationWithFlag: `,
      integrationWithFlag,
    );

    return integrationWithFlag;
  }, [
    currentThreadIntegration,
    integrationsMap,
    findIntegration,
    getCommandName,
    isTemplateIntegration,
  ]);

  const theme = useAppSelector(selectThemeMode);
  const icons = iconMap(
    theme ? (theme === "inherit" ? "light" : theme) : "light",
  );

  const integrationLogo = useMemo(() => {
    if (!currentIntegration && !currentNotConfiguredIntegration) {
      return "https://placehold.jp/150x150.png";
    }
    return INTEGRATIONS_WITH_TERMINAL_ICON.includes(
      currentIntegration
        ? currentIntegration.integr_name.split("_")[0]
        : currentNotConfiguredIntegration
          ? currentNotConfiguredIntegration.integr_name.split("_")[0]
          : "https://placehold.jp/150x150.png",
    )
      ? icons.cmdline
      : icons[
          currentIntegration
            ? currentIntegration.integr_name
            : currentNotConfiguredIntegration
              ? currentNotConfiguredIntegration.integr_name
              : ""
        ];
  }, [currentIntegration, currentNotConfiguredIntegration, icons]);

  // TODO: uncomment when ready
  useEffect(() => {
    if (!maybeIntegration) return;

    if (maybeIntegration.shouldIntermediatePageShowUp) {
      const similarIntegrations = integrationsMap?.integrations.filter(
        (integr) => integr.integr_name === maybeIntegration.integr_name,
      );

      if (!similarIntegrations) {
        dispatch(setCurrentNotConfiguredIntegration(null));
        return;
      }

      const uniqueConfigPaths = Array.from(
        new Set(similarIntegrations.map((integr) => integr.integr_config_path)),
      );
      const uniqueProjectPaths = Array.from(
        new Set(similarIntegrations.map((integr) => integr.project_path)),
      );

      uniqueProjectPaths.sort((a, _b) => (a === "" ? -1 : 1));
      uniqueConfigPaths.sort((a, _b) => (a.includes(".config") ? -1 : 1));

      const integrationToConfigure: NotConfiguredIntegrationWithIconRecord = {
        ...maybeIntegration,
        commandName: maybeIntegration.commandName
          ? maybeIntegration.commandName
          : undefined,
        wasOpenedThroughChat: maybeIntegration.shouldIntermediatePageShowUp,
        integr_config_path: uniqueConfigPaths,
        project_path: uniqueProjectPaths,
        integr_config_exists: false,
      };
      dispatch(setCurrentNotConfiguredIntegration(integrationToConfigure));
      dispatch(setCurrentIntegration(null));
    } else {
      setCurrentIntegration(maybeIntegration);
      setCurrentNotConfiguredIntegration(null);
    }
  }, [dispatch, maybeIntegration, integrationsMap?.integrations]);

  useEffect(() => {
    debugIntegrations(`[DEBUG]: integrationsData: `, integrationsMap);
  }, [integrationsMap]);

  useEffect(() => {
    if (handleIfInnerIntegrationWasSet) {
      if (currentIntegration ?? currentNotConfiguredIntegration) {
        handleIfInnerIntegrationWasSet(true);
      } else {
        handleIfInnerIntegrationWasSet(false);
      }
    }
  }, [
    currentIntegration,
    currentNotConfiguredIntegration,
    handleIfInnerIntegrationWasSet,
  ]);

  const globalIntegrations = useMemo(() => {
    if (integrationsMap?.integrations) {
      return integrationsMap.integrations.filter(
        (integration) =>
          integration.project_path === "" && integration.integr_config_exists,
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
        if (integration.integr_config_exists) {
          if (!(integration.project_path in acc)) {
            acc[integration.project_path] = [];
          }
          acc[integration.project_path].push(integration);
        }
        return acc;
      }, {});
    }
  }, [projectSpecificIntegrations]);

  const availableIntegrationsToConfigure = useMemo(() => {
    if (integrationsMap?.integrations) {
      const groupedIntegrations = integrationsMap.integrations.reduce<
        Record<string, GroupedIntegrationWithIconRecord>
      >((acc, integration) => {
        if (!(integration.integr_name in acc)) {
          acc[integration.integr_name] = {
            ...integration,
            project_path: [integration.project_path],
            integr_config_path: [integration.integr_config_path],
          };
        } else {
          acc[integration.integr_name].project_path.push(
            integration.project_path,
          );
          acc[integration.integr_name].integr_config_path.push(
            integration.integr_config_path,
          );
        }
        return acc;
      }, {});

      const filteredIntegrations = Object.values(groupedIntegrations).filter(
        areIntegrationsNotConfigured,
      );

      // Sort paths so that paths containing ".config" are first
      Object.values(filteredIntegrations).forEach((integration) => {
        integration.project_path.sort((a, _b) => (a === "" ? -1 : 1));
        integration.integr_config_path.sort((a, _b) =>
          a.includes(".config") ? -1 : 1,
        );
      });

      return Object.values(filteredIntegrations);
    }
  }, [integrationsMap]);

  useEffect(() => {
    debugIntegrations(
      `[DEBUG]: availableIntegrationsToConfigure: `,
      availableIntegrationsToConfigure,
    );
  }, [availableIntegrationsToConfigure]);

  // TODO: make this one in better way, too much of code
  useEffect(() => {
    if (
      currentIntegration &&
      currentIntegrationSchema &&
      currentIntegrationValues
    ) {
      const toolParametersChanged =
        toolParameters && areToolParameters(currentIntegrationValues.parameters)
          ? !isEqual(toolParameters, currentIntegrationValues.parameters)
          : false;

      // Manually collecting data from the form
      const formElement = document.getElementById(
        `form-${currentIntegration.integr_name}`,
      ) as HTMLFormElement | null;

      if (!formElement) {
        dispatch(setIsDisabledIntegrationForm(true));
        return;
      }

      const formData = new FormData(formElement);
      const rawFormValues = Object.fromEntries(formData.entries());

      const formValues = convertRawIntegrationFormValues(
        rawFormValues,
        currentIntegrationSchema,
        currentIntegrationValues,
      );

      const otherFieldsChanged = !Object.entries(formValues).every(
        ([fieldKey, fieldValue]) => {
          if (isPrimitive(fieldValue)) {
            return (
              fieldKey in currentIntegrationValues &&
              fieldValue === currentIntegrationValues[fieldKey]
            );
          }
          if (typeof fieldValue === "object" || Array.isArray(fieldValue)) {
            return (
              fieldKey in currentIntegrationValues &&
              isEqual(fieldValue, currentIntegrationValues[fieldKey])
            );
          }
          return false;
        },
      );

      const confirmationRulesChanged = !isEqual(
        confirmationRules,
        currentIntegrationValues.confirmation,
      );

      debugIntegrations(
        `[DEBUG confirmationRulesChanged]: confirmationRulesChanged: `,
        confirmationRulesChanged,
      );

      const allToolParametersNamesInSnakeCase = toolParameters
        ? toolParameters.every((param) => validateSnakeCase(param.name))
        : true;

      let newIsDisabled = isDisabledIntegrationForm;

      if (!allToolParametersNamesInSnakeCase) {
        newIsDisabled = true; // Disabling form if any of tool parameters names are written not in snake case
      } else if (
        (toolParametersChanged || confirmationRulesChanged) &&
        isDisabledIntegrationForm
      ) {
        newIsDisabled = false; // Enable form if toolParameters changed and form was disabled
      } else if (
        otherFieldsChanged &&
        (toolParametersChanged || confirmationRulesChanged)
      ) {
        newIsDisabled = isDisabledIntegrationForm; // Keep the form in the same condition
      } else if (
        !otherFieldsChanged &&
        !toolParametersChanged &&
        !confirmationRulesChanged
      ) {
        newIsDisabled = true; // Disable form if all fields are back to original state
      }

      dispatch(setIsDisabledIntegrationForm(newIsDisabled));
    }
  }, [
    toolParameters,
    currentIntegrationValues,
    currentIntegrationSchema,
    confirmationRules,
    currentIntegration,
    isDisabledIntegrationForm,
    dispatch,
  ]);

  const handleSetCurrentIntegrationSchema = useCallback(
    (schema: Integration["integr_schema"]) => {
      if (!currentIntegration) return;

      setCurrentIntegrationSchema(schema);
    },
    [currentIntegration],
  );

  const handleSetCurrentIntegrationValues = useCallback(
    (values: Integration["integr_values"]) => {
      if (!currentIntegration) return;

      setCurrentIntegrationValues(values);
    },
    [currentIntegration],
  );

  const handleFormReturn = useCallback(() => {
    dispatch(resetIntegrationsState());
    information && dispatch(clearInformation());
    globalError && dispatch(clearError());
    dispatch(integrationsApi.util.resetApiState());
    dispatch(dockerApi.util.resetApiState());
    // TODO: can cause a loop where integration pages goes back to form
    dispatch(pop());
    dispatch(popBackTo({ name: "integrations page" }));
  }, [dispatch, globalError, information]);

  const handleSubmit = useCallback(
    async (event: FormEvent<HTMLFormElement>) => {
      if (!currentIntegration) return;
      debugIntegrations(`[DEBUG]: schema: `, currentIntegrationSchema);
      if (!currentIntegrationSchema) return;
      event.preventDefault();
      dispatch(setIsApplyingIntegrationForm(true));

      debugIntegrations(`[DEBUG]: event: `, event);

      const formData = new FormData(event.currentTarget);
      const rawFormValues = Object.fromEntries(formData.entries());
      debugIntegrations(`[DEBUG]: rawFormValues: `, rawFormValues);
      // Adjust types of data based on f_type of each field in schema

      const formValues = convertRawIntegrationFormValues(
        rawFormValues,
        currentIntegrationSchema,
        currentIntegrationValues,
      );

      debugIntegrations(`[DEBUG]: formValues: `, formValues);

      formValues.available = availabilityValues;
      if (
        currentIntegration.integr_name.includes("cmdline") ||
        currentIntegration.integr_name.includes("service")
      ) {
        formValues.parameters = toolParameters;
      }
      if (!currentIntegrationSchema.confirmation.not_applicable) {
        formValues.confirmation = confirmationRules;
      }

      const response = await saveIntegrationMutationTrigger(
        currentIntegration.integr_config_path,
        formValues,
      );

      if (response.error) {
        const error = response.error as FetchBaseQueryError;
        debugIntegrations(`[DEBUG]: error is present, error: `, error);
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
        dispatch(setIsDisabledIntegrationForm(true));
      }
      dispatch(setIsApplyingIntegrationForm(false));
    },
    [
      currentIntegration,
      saveIntegrationMutationTrigger,
      currentIntegrationSchema,
      currentIntegrationValues,
      dispatch,
      availabilityValues,
      confirmationRules,
      toolParameters,
    ],
  );

  const handleDeleteIntegration = useCallback(
    async (configurationPath: string, integrationName: string) => {
      // if (!currentIntegration) return;
      setIsDeletingIntegration(true);
      const response = await deleteIntegrationTrigger(configurationPath);
      debugIntegrations("[DEBUG]: response: ", response);
      if (response.error) {
        debugIntegrations(`[DEBUG]: delete error: `, response.error);
        return;
      }
      dispatch(
        setInformation(
          `${toPascalCase(
            integrationName,
          )} integration's configuration was deleted successfully!`,
        ),
      );
      const timeoutId = setTimeout(() => {
        dispatch(setIsDeletingIntegration(false));
        handleFormReturn();
        clearTimeout(timeoutId);
      }, 1200);
    },
    [dispatch, deleteIntegrationTrigger, handleFormReturn],
  );

  const handleIntegrationFormChange = useCallback(
    (event: FormEvent<HTMLFormElement>) => {
      if (!currentIntegration) return;
      if (!currentIntegrationSchema) return;
      // if (!currentIntegrationValues) return;
      // if (!currentIntegrationValues.available) return;
      event.preventDefault();

      const formData = new FormData(event.currentTarget);
      const rawFormValues = Object.fromEntries(formData.entries());

      // Adjust types of data based on f_type of each field in schema
      const formValues = convertRawIntegrationFormValues(
        rawFormValues,
        currentIntegrationSchema,
        currentIntegrationValues,
      );

      // formValues.parameters = toolParameters;

      const eachFormValueIsNotChanged = currentIntegrationValues
        ? Object.entries(formValues).every(([fieldKey, fieldValue]) => {
            if (isPrimitive(fieldValue)) {
              return (
                fieldKey in currentIntegrationValues &&
                fieldValue === currentIntegrationValues[fieldKey]
              );
            }
            if (typeof fieldValue === "object" || Array.isArray(fieldValue)) {
              return (
                fieldKey in currentIntegrationValues &&
                isEqual(fieldValue, currentIntegrationValues[fieldKey])
              );
            }
          })
        : false;

      debugIntegrations(
        `[DEBUG]: eachFormValueIsNotChanged: `,
        eachFormValueIsNotChanged,
      );

      const eachAvailabilityOptionIsNotChanged = currentIntegrationValues
        ? Object.entries(availabilityValues).every(([fieldKey, fieldValue]) => {
            const availableObj = currentIntegrationValues.available;
            if (availableObj && areAllFieldsBoolean(availableObj)) {
              return (
                fieldKey in availableObj &&
                fieldValue === availableObj[fieldKey]
              );
            }
            return false;
          })
        : true;

      const eachToolParameterIsNotChanged =
        toolParameters &&
        currentIntegrationValues &&
        areToolParameters(currentIntegrationValues.parameters)
          ? isEqual(currentIntegrationValues.parameters, toolParameters)
          : true;

      const eachToolConfirmationIsNotChanged =
        currentIntegrationValues &&
        areToolConfirmation(currentIntegrationValues.confirmation)
          ? isEqual(currentIntegrationValues.confirmation, confirmationRules)
          : true;
      debugIntegrations(`[DEBUG]: formValues: `, formValues);
      debugIntegrations(
        `[DEBUG]: currentIntegrationValues: `,
        currentIntegrationValues,
      );
      debugIntegrations(
        `[DEBUG]: eachAvailabilityOptionIsNotChanged: `,
        eachAvailabilityOptionIsNotChanged,
      );

      debugIntegrations(
        `[DEBUG]: eachToolParameterIsNotChanged: `,
        eachToolParameterIsNotChanged,
      );

      debugIntegrations(
        `[DEBUG]: eachToolConfirmationIsNotChanged: `,
        eachToolConfirmationIsNotChanged,
      );
      debugIntegrations(`[DEBUG]: availabilityValues: `, availabilityValues);
      const maybeDisabled =
        eachFormValueIsNotChanged &&
        eachAvailabilityOptionIsNotChanged &&
        eachToolParameterIsNotChanged &&
        eachToolConfirmationIsNotChanged;

      debugIntegrations(`[DEBUG CHANGE]: maybeDisabled: `, maybeDisabled);

      dispatch(
        setIsDisabledIntegrationForm(
          toolParameters
            ? toolParameters.every((param) => validateSnakeCase(param.name))
              ? maybeDisabled
              : true
            : maybeDisabled,
        ),
      );
    },
    [
      dispatch,
      currentIntegration,
      currentIntegrationValues,
      currentIntegrationSchema,
      availabilityValues,
      toolParameters,
      confirmationRules,
    ],
  );

  useEffect(() => {
    debugIntegrations(`[DEBUG PARAMETERS]: toolParameters: `, toolParameters);
  }, [toolParameters]);

  const handleNotConfiguredIntegrationSubmit = useCallback(
    (event: FormEvent<HTMLFormElement>) => {
      if (!integrationsMap) return;
      if (!currentNotConfiguredIntegration) return;
      event.preventDefault();
      debugIntegrations(`[DEBUG]: event: `, event);
      const formData = new FormData(event.currentTarget);
      const rawFormValues = Object.fromEntries(formData.entries());
      debugIntegrations(`[DEBUG]: rawFormValues: `, rawFormValues);
      const [type, rest] =
        currentNotConfiguredIntegration.integr_name.split("_");
      if (
        "integr_config_path" in rawFormValues &&
        typeof rawFormValues.integr_config_path === "string" &&
        "command_name" in rawFormValues &&
        typeof rawFormValues.command_name === "string"
      ) {
        // making integration-get call and setting the result as currentIntegration
        const commandName = rawFormValues.command_name;
        const configPath = rawFormValues.integr_config_path.replace(
          rest,
          commandName,
        );

        debugIntegrations(
          `[DEBUG INTERMEDIATE PAGE]: config path for \`v1/integration-get\`: `,
          configPath,
        );

        const customIntegration: IntegrationWithIconRecord = {
          when_isolated: false,
          on_your_laptop: false,
          integr_name: `${type}_${commandName}`,
          integr_config_path: configPath,
          project_path: rawFormValues.integr_config_path
            .toString()
            .includes(".config")
            ? ""
            : rawFormValues.integr_config_path.toString(),
          integr_config_exists: false,
        };

        dispatch(setCurrentIntegration(customIntegration));
        dispatch(setCurrentNotConfiguredIntegration(null));
        return;
      } else if ("integr_config_path" in rawFormValues) {
        // getting config path, opening integration
        const foundIntegration = integrationsMap.integrations.find(
          (integration) =>
            integration.integr_config_path === rawFormValues.integr_config_path,
        );
        if (!foundIntegration) {
          debugIntegrations(`[DEBUG]: integration was not found, error!`);
          return;
        }
        dispatch(setCurrentIntegration(foundIntegration));
        dispatch(setCurrentNotConfiguredIntegration(null));
      } else {
        debugIntegrations(
          `[DEBUG]: Unexpected error occured. It's mostly a bug`,
        );
      }
    },
    [dispatch, currentNotConfiguredIntegration, integrationsMap],
  );

  // useEffect(() => {
  //   debugIntegrations(`[DEBUG]: currentIntegration: `, currentIntegration);
  // }, [currentIntegration]);

  const handleNavigateToIntegrationSetup = useCallback(
    (integrationName: string, integrationConfigPath: string) => {
      if (!integrationsMap) return;
      if (!currentIntegration) return;
      debugIntegrations(
        `[DEBUG]: integrationConfigPath: `,
        integrationConfigPath,
      );
      // TODO: this should be probably made not in hardcoded style, user needs to choose which docker he wants to setup
      const maybeIntegration = integrationsMap.integrations.find(
        (integration) =>
          integration.integr_name === integrationName &&
          integration.project_path === "",
      );
      if (!maybeIntegration) {
        debugIntegrations(
          `[DEBUG]: desired integration was not found in the list of all available ones :/`,
        );
        return;
      }
      dispatch(setIsDisabledIntegrationForm(true));
      dispatch(setCurrentIntegration(maybeIntegration));
    },
    [dispatch, currentIntegration, integrationsMap],
  );

  const goBackAndClearError = useCallback(() => {
    goBack && goBack();
    dispatch(clearError());
    dispatch(resetIntegrationsState());
  }, [dispatch, goBack]);

  const handleNotSetupIntegrationShowUp = useCallback(
    (integration: NotConfiguredIntegrationWithIconRecord) => {
      if (!integrationsMap) return;

      debugIntegrations(
        `[DEBUG]: open form for not configured integration: `,
        integration,
      );

      dispatch(setCurrentNotConfiguredIntegration(integration));
    },
    [dispatch, integrationsMap],
  );

  const handleIntegrationShowUp = useCallback(
    (
      integration:
        | IntegrationWithIconRecord
        | NotConfiguredIntegrationWithIconRecord,
    ) => {
      if (isNotConfiguredIntegrationWithIconRecord(integration)) {
        handleNotSetupIntegrationShowUp(integration);
        return;
      }
      dispatch(setCurrentIntegration(integration));
    },
    [dispatch, handleNotSetupIntegrationShowUp],
  );

  return {
    currentIntegration,
    currentIntegrationSchema,
    currentIntegrationValues,
    currentNotConfiguredIntegration,
    confirmationRules,
    toolParameters,
    availabilityValues,
    integrationLogo,
    handleFormReturn,
    handleIntegrationFormChange,
    handleSubmit,
    handleDeleteIntegration,
    handleNotConfiguredIntegrationSubmit,
    handleNavigateToIntegrationSetup,
    handleSetCurrentIntegrationSchema,
    handleSetCurrentIntegrationValues,
    goBackAndClearError,
    handleIntegrationShowUp,
    isDisabledIntegrationForm,
    isApplyingIntegrationForm,
    isDeletingIntegration,
    globalIntegrations,
    projectSpecificIntegrations,
    groupedProjectIntegrations,
    availableIntegrationsToConfigure,
  };
};
