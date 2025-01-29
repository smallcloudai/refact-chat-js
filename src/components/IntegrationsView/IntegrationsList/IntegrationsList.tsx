import { FC } from "react";
import { Flex, Grid, Heading, Text } from "@radix-ui/themes";
import { Markdown } from "../../Markdown";
import { IntegrationCard } from "../IntegrationCard";
import { formatPathName } from "../../../utils/formatPathName";
import type {
  IntegrationWithIconRecord,
  NotConfiguredIntegrationWithIconRecord,
  IntegrationWithIconResponse,
} from "../../../services/refact";

interface IntegrationsListProps {
  globalIntegrations?: IntegrationWithIconRecord[];
  groupedProjectIntegrations?: Record<
    string,
    IntegrationWithIconResponse["integrations"]
  >;
  availableIntegrationsToConfigure?: NotConfiguredIntegrationWithIconRecord[];
  onIntegrationSelect: (
    integration:
      | IntegrationWithIconRecord
      | NotConfiguredIntegrationWithIconRecord,
  ) => void;
}

export const IntegrationsList: FC<IntegrationsListProps> = ({
  globalIntegrations,
  groupedProjectIntegrations,
  availableIntegrationsToConfigure,
  onIntegrationSelect,
}) => {
  return (
    <Flex direction="column" width="100%" gap="4">
      <Text my="2">
        Integrations allow Refact.ai Agent to interact with other services and
        tools
      </Text>

      {/* Global Integrations */}
      <Flex
        align="start"
        direction="column"
        justify="between"
        gap="4"
        width="100%"
      >
        <Heading as="h4" size="3" style={{ width: "100%" }}>
          ⚙️ Globally configured {globalIntegrations?.length ?? 0}{" "}
          {globalIntegrations &&
            (globalIntegrations.length !== 1 ? "integrations" : "integration")}
        </Heading>
        <Text size="2" color="gray">
          Global configurations are shared in your IDE and available for all
          your projects.
        </Text>
        {globalIntegrations && (
          <Flex direction="column" align="start" gap="3" width="100%">
            {globalIntegrations.map((integration, index) => (
              <IntegrationCard
                key={`${index}-${integration.integr_config_path}`}
                integration={integration}
                handleIntegrationShowUp={onIntegrationSelect}
              />
            ))}
          </Flex>
        )}
      </Flex>

      {/* Project Specific Integrations */}
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
                    {integrations.length !== 1 ? "integrations" : "integration"}
                  </Flex>
                </Heading>
                <Text size="2" color="gray">
                  Folder-specific integrations are local integrations, which are
                  shared only in folder-specific scope.
                </Text>
                <Flex direction="column" align="start" gap="2" width="100%">
                  {integrations.map((integration, subIndex) => (
                    <IntegrationCard
                      key={`project-${index}-${subIndex}-${integration.integr_config_path}`}
                      integration={integration}
                      handleIntegrationShowUp={onIntegrationSelect}
                    />
                  ))}
                </Flex>
              </Flex>
            );
          },
        )}

      {/* Available Integrations */}
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
          {availableIntegrationsToConfigure?.map((integration, index) => (
            <IntegrationCard
              isNotConfigured
              key={`available-${index}-${JSON.stringify(
                integration.integr_config_path,
              )}`}
              integration={integration}
              handleIntegrationShowUp={onIntegrationSelect}
            />
          ))}
        </Grid>
      </Flex>
    </Flex>
  );
};
