import { useMemo } from "react";
import type {
  IntegrationWithIconResponse,
  GroupedIntegrationWithIconRecord,
} from "../services/refact";
import { areIntegrationsNotConfigured } from "../services/refact";

export function useIntegrationFiltering(
  integrationsMap?: IntegrationWithIconResponse,
) {
  const globalIntegrations = useMemo(() => {
    if (!integrationsMap?.integrations) return undefined;

    return integrationsMap.integrations.filter(
      (integration) =>
        integration.project_path === "" && integration.integr_config_exists,
    );
  }, [integrationsMap]);

  const projectSpecificIntegrations = useMemo(() => {
    if (!integrationsMap?.integrations) return undefined;

    return integrationsMap.integrations.filter(
      (integration) => integration.project_path !== "",
    );
  }, [integrationsMap]);

  const groupedProjectIntegrations = useMemo(() => {
    if (!projectSpecificIntegrations) return undefined;

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
  }, [projectSpecificIntegrations]);

  const availableIntegrationsToConfigure = useMemo(() => {
    if (!integrationsMap?.integrations) return undefined;

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
    filteredIntegrations.forEach((integration) => {
      integration.project_path.sort((a, _b) => (a === "" ? -1 : 1));
      integration.integr_config_path.sort((a, _b) =>
        a.includes(".config") ? -1 : 1,
      );
    });

    return filteredIntegrations;
  }, [integrationsMap]);

  return {
    globalIntegrations,
    groupedProjectIntegrations,
    availableIntegrationsToConfigure,
  };
}
