import { useCallback, useEffect, useMemo, useState } from "react";
import type { FormEvent, FC } from "react";
import {
  // Badge,
  Box,
  Card,
  Flex,
  Heading,
  // HoverCard,
  Text,
} from "@radix-ui/themes";
import {
  Integration,
  IntegrationWithIconResponse,
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
  const error = useAppSelector(getErrorMessage);
  const { saveIntegrationMutationTrigger } = useSaveIntegrationData();

  const [currentIntegration, setCurrentIntegration] = useState<
    IntegrationWithIconResponse["integrations"][number] | null
  >(null);

  const [currentIntegrationSchema, setCurrentIntegrationSchema] = useState<
    Integration["integr_schema"] | null
  >(null);

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

  const handleFormReturn = useCallback(() => {
    setCurrentIntegration(null);
  }, []);

  const handleSubmit = useCallback(
    async (event: FormEvent<HTMLFormElement>) => {
      if (!currentIntegration) return;
      console.log(`[DEBUG]: schema: `, currentIntegrationSchema);
      if (!currentIntegrationSchema) return;
      event.preventDefault();

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
      setCurrentIntegration(null);
      setCurrentIntegrationSchema(null);
    },
    [
      currentIntegration,
      saveIntegrationMutationTrigger,
      currentIntegrationSchema,
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

  // const handleFormChange = () => {
  //   console.log(`[DEBUG]: form changed`);
  // };

  // eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing
  if (error || !integrationsMap) {
    return (
      <ErrorCallout onClick={goBackAndClearError}>
        {error ?? "fetching integrations."}
      </ErrorCallout>
    );
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
          width: "100%",
        }}
      >
        {currentIntegration ? (
          <Heading as="h3" className={styles.SetupTitle} mb="4">
            Setup{" "}
            {/* <img
              src={
                integrationsMap.integrations.find(
                  (integration) =>
                    integration.integr_name === currentIntegration.integr_name,
                )?.project_path ?? ""
              }
              className={styles.SetupIcon}
              alt={currentIntegration.integr_name}
            />
             */}
            {currentIntegration.integr_name}
          </Heading>
        ) : (
          <Heading as="h3" align="center" mb="5">
            Integrations Setup
          </Heading>
        )}
        {currentIntegration ? (
          <Flex direction="column" align="start">
            <IntegrationForm
              handleSubmit={(event) => void handleSubmit(event)}
              integrationPath={currentIntegration.integr_config_path}
              onReturn={handleFormReturn}
              onSchema={handleSetCurrentIntegrationSchema}
            />
            {/* {currentIntegration.warning && (
              <WarningHoverCard
                label={
                  <Badge className={styles.IntegrationWarning} color="orange">
                    Has warnings
                  </Badge>
                }
                warning={currentIntegration.warning}
              />
            )} */}
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
