import React, { useEffect, useState } from "react";
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
  IntegrationWithIconResponse,
  // isDetailMessage,
} from "../../services/refact";
import { Spinner } from "../Spinner";
import { ErrorCallout } from "../Callout";
import { useAppDispatch, useAppSelector } from "../../hooks";
import { clearError, getErrorMessage } from "../../features/Errors/errorsSlice";
import styles from "./IntegrationsView.module.css";
// import { ExclamationTriangleIcon } from "@radix-ui/react-icons";
// import {
//   customFields,
//   customTemplates,
//   customWidgets,
// } from "./CustomFieldsAndWidgets";

import "./JSONFormStyles.css";
// import { useSaveIntegrationData } from "../../hooks/useSaveIntegrationData";
import { IntegrationForm } from "./IntegrationForm";

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

export const IntegrationsView: React.FC<{
  integrationsMap?: IntegrationWithIconResponse;
  // integrationsIcons?: IntegrationIcon[];
  isLoading: boolean;
  goBack?: () => void;
}> = ({ integrationsMap, isLoading, goBack }) => {
  const dispatch = useAppDispatch();
  const error = useAppSelector(getErrorMessage);
  // const { saveIntegrationMutationTrigger } = useSaveIntegrationData();

  const [currentIntegration, setCurrentIntegration] = useState<
    IntegrationWithIconResponse["integrations"][number] | null
  >(null);

  useEffect(() => {
    console.log(`[DEBUG]: integrationsData: `, integrationsMap);
  }, [integrationsMap]);

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

  // const handleSubmit = async (
  //   formData: Record<string, unknown>,
  //   integration: IntegrationWithIconResponse["integrations"][number],
  // ) => {
  //   console.log(`[DEBUG]: formData: `, formData);
  //   console.log(`[DEBUG]: integration: `, integration);
  //   // const {  } = integration;
  //   // await saveIntegrationMutationTrigger({
  //   //   enabled,
  //   //   name,
  //   //   schema,
  //   //   value: formData,
  //   // });
  //   setCurrentIntegration(null);
  // };

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
          width: "inherit",
        }}
      >
        {currentIntegration ? (
          <Heading as="h3" className={styles.SetupTitle} mb="4">
            Setup{" "}
            <img
              src={
                integrationsMap.integrations.find(
                  (integration) =>
                    integration.integr_name === currentIntegration.integr_name,
                )?.project_path ?? ""
              }
              className={styles.SetupIcon}
              alt={currentIntegration.integr_name}
            />
          </Heading>
        ) : (
          <Heading as="h3" align="center" mb="5">
            Integrations Setup
          </Heading>
        )}
        {currentIntegration ? (
          <Flex direction="column" align="start">
            <IntegrationForm
              integrationPath={currentIntegration.integr_config_path}
            />
            {/* <Form
              validator={validator}
              schema={currentIntegration.schema}
              liveOmit={true}
              omitExtraData={true}
              // formData={omitDetailField(currentIntegration.value)}
              formData={currentIntegration.value}
              className={styles.IntegrationForm}
              onSubmit={(event) =>
                void handleSubmit(
                  event.formData as Record<string, unknown>,
                  currentIntegration,
                )
              }
              onChange={handleFormChange}
              fields={customFields}
              widgets={customWidgets}
              templates={customTemplates}
            >
              <Flex gap="3" mt="4">
                <Button color="green" variant="solid" type="submit">
                  Apply
                </Button>
                <Button
                  color="ruby"
                  onClick={() => setCurrentIntegration(null)}
                  type="button"
                >
                  Return
                </Button>
              </Flex>
            </Form> */}
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
          <Flex align="start" justify="between" wrap="wrap" gap="4">
            {integrationsMap.integrations.map((integration, index) => (
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
                  {/* <img
                    src={
                      integrationsIcons.find(
                        (icon) => icon.name === integration.name,
                      )?.value ?? ""
                    }
                    alt={integration.name}
                    className={styles.icon}
                  /> */}
                  <Text>{integration.integr_name}</Text>
                </Flex>
              </Card>
            ))}
          </Flex>
        )}
      </Flex>
    </Box>
  );
};
