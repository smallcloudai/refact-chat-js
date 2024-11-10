import { integrationsApi } from "../services/refact/integrations";

export const useSaveIntegrationData = () => {
  const [mutationTrigger] = integrationsApi.useSaveIntegrationMutation();

  return { saveIntegrationMutationTrigger: mutationTrigger };
};
