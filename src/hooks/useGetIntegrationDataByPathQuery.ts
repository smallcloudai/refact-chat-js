import { integrationsApi } from "../services/refact/integrations";
import { useGetPing } from "./useGetPing";

export const useGetIntegrationDataByPathQuery = (integrationPath: string) => {
  const ping = useGetPing();
  const skip = !ping.data;
  console.log(`[DEBUG]: integrationPath: `, integrationPath);

  const integration = integrationsApi.useGetIntegrationByPathQuery(
    integrationPath,
    {
      skip,
    },
  );

  return {
    integration,
  };
};