import { FC, useEffect } from "react";
import { useGetIntegrationDataByPathQuery } from "../../hooks/useGetIntegrationDataByPathQuery";
import { Spinner } from "../Spinner";

type IntegrationFormProps = {
  integrationPath: string;
};

export const IntegrationForm: FC<IntegrationFormProps> = ({
  integrationPath,
}) => {
  const { integration } = useGetIntegrationDataByPathQuery(integrationPath);

  useEffect(() => {
    console.log(`[DEBUG]: integration: `, integration);
  }, [integration]);

  if (integration.isLoading) {
    return <Spinner spinning />;
  }

  return <div>{JSON.stringify(integration.data)}</div>;
};
