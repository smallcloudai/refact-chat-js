import { useCallback, useMemo, useState } from "react";
import { debugIntegrations } from "../debugConfig";
import type {
  IntegrationWithIconRecord,
  NotConfiguredIntegrationWithIconRecord,
  IntegrationWithIconResponse,
  IntegrationWithIconRecordAndAddress,
  Integration,
} from "../services/refact";
import { useIntegrationFiltering } from "./useIntegrationFiltering";

interface UseIntegrationSelectionProps {
  integrationsMap?: IntegrationWithIconResponse;
  currentThreadIntegration: {
    integrationName?: string;
    integrationPath?: string;
    shouldIntermediatePageShowUp?: boolean;
    wasOpenedThroughChat?: boolean;
  } | null;
}

export function useIntegrationSelection({
  integrationsMap,
  currentThreadIntegration,
}: UseIntegrationSelectionProps) {
  const { availableIntegrationsToConfigure } = useIntegrationFiltering();

  const [currentIntegration, setCurrentIntegration] =
    useState<IntegrationWithIconRecord | null>(null);
  const [currentNotConfiguredIntegration, setCurrentNotConfiguredIntegration] =
    useState<NotConfiguredIntegrationWithIconRecord | null>(null);

  const [currentIntegrationSchema, setCurrentIntegrationSchema] = useState<
    Integration["integr_schema"] | null
  >(null);

  const [currentIntegrationValues, setCurrentIntegrationValues] = useState<
    Integration["integr_values"] | null
  >(null);

  const maybeIntegration = useMemo(() => {
    if (!currentThreadIntegration || !integrationsMap) return null;

    const { integrationName, integrationPath, shouldIntermediatePageShowUp } =
      currentThreadIntegration;

    const isCmdline = integrationName?.startsWith("cmdline");
    const isService = integrationName?.startsWith("service");

    const integration = integrationsMap.integrations.find((integration) => {
      if (!integrationPath) {
        if (isCmdline) return integration.integr_name === "cmdline_TEMPLATE";
        if (isService) return integration.integr_name === "service_TEMPLATE";
      }

      if (!shouldIntermediatePageShowUp) {
        return integrationName
          ? integration.integr_name === integrationName &&
              integration.integr_config_path === integrationPath
          : integration.integr_config_path === integrationPath;
      }

      return integrationName
        ? integration.integr_name === integrationName
        : integration.integr_config_path === integrationPath;
    });

    if (!integration) {
      debugIntegrations(`[DEBUG INTEGRATIONS] not found integration`);
      return null;
    }

    const integrationWithFlag: IntegrationWithIconRecordAndAddress = {
      ...integration,
      commandName:
        (isCmdline ?? isService) && integrationName
          ? integrationName.split("_").slice(1).join("_")
          : undefined,
      shouldIntermediatePageShowUp: shouldIntermediatePageShowUp ?? false,
      wasOpenedThroughChat:
        currentThreadIntegration.wasOpenedThroughChat ?? false,
    };

    return integrationWithFlag;
  }, [currentThreadIntegration, integrationsMap]);

  const handleIntegrationSelect = useCallback(
    (
      integration:
        | IntegrationWithIconRecord
        | NotConfiguredIntegrationWithIconRecord,
    ) => {
      if (!integrationsMap) return;

      // If it's a not configured integration, find its full configuration from filtered data
      if (
        "integr_config_exists" in integration &&
        !integration.integr_config_exists
      ) {
        const availableIntegration = availableIntegrationsToConfigure?.find(
          (available) => available.integr_name === integration.integr_name,
        );

        if (availableIntegration) {
          debugIntegrations(
            `[DEBUG]: open form for not configured integration: `,
            availableIntegration,
          );
          setCurrentNotConfiguredIntegration(availableIntegration);
          setCurrentIntegration(null);
          return;
        }
      }

      // For configured integrations, find the exact match from the original list
      const configuredIntegration = integrationsMap.integrations.find(
        (configured) =>
          configured.integr_name === integration.integr_name &&
          configured.integr_config_path ===
            (Array.isArray(integration.integr_config_path)
              ? integration.integr_config_path[0]
              : integration.integr_config_path),
      );

      if (configuredIntegration) {
        setCurrentIntegration(configuredIntegration);
        setCurrentNotConfiguredIntegration(null);
      }
    },
    [integrationsMap, availableIntegrationsToConfigure],
  );

  const handleSetCurrentIntegrationSchema = (
    schema: Integration["integr_schema"] | null,
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

  return {
    currentIntegration,
    setCurrentIntegration,
    currentNotConfiguredIntegration,
    setCurrentNotConfiguredIntegration,
    maybeIntegration,
    handleIntegrationSelect,
    currentIntegrationSchema,
    handleSetCurrentIntegrationSchema,
    currentIntegrationValues,
    handleSetCurrentIntegrationValues,
  };
}
