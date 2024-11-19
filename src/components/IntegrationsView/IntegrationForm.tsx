import { FC, useEffect } from "react";
import { useGetIntegrationDataByPathQuery } from "../../hooks/useGetIntegrationDataByPathQuery";
import { Spinner } from "../Spinner";
import { Button, Flex } from "@radix-ui/themes";

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

  return (
    <div>
      {JSON.stringify(integration.data)}
      <Flex gap="3" mt="4">
        <Button color="green" variant="solid" type="submit">
          Apply
        </Button>
        <Button
          color="ruby"
          onClick={() => console.log("clicked")}
          type="button"
        >
          Return
        </Button>
      </Flex>
    </div>
  );
};
