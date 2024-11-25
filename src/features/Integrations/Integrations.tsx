import React, { useCallback, useState } from "react";
import { Flex, Button } from "@radix-ui/themes";
import { ArrowLeftIcon } from "@radix-ui/react-icons";
import { ScrollArea } from "../../components/ScrollArea";
import { PageWrapper } from "../../components/PageWrapper";
import type { Config } from "../Config/configSlice";
import { useGetIntegrationsQuery } from "../../hooks/useGetIntegrationsDataQuery";
import { IntegrationsView } from "../../components/IntegrationsView";

export type IntegrationsProps = {
  onCloseIntegrations?: () => void;
  backFromIntegrations: () => void;
  host: Config["host"];
  tabbed: Config["tabbed"];
};

export const Integrations: React.FC<IntegrationsProps> = ({
  onCloseIntegrations,
  backFromIntegrations,
  host,
  tabbed,
}) => {
  const LeftRightPadding =
    host === "web"
      ? { initial: "5", xl: "9" }
      : {
          initial: "2",
          xs: "2",
          sm: "4",
          md: "8",
          lg: "8",
          xl: "9",
        };

  const { integrations } = useGetIntegrationsQuery();
  const [isInnerIntegrationSelected, setIsInnerIntegrationSelected] =
    useState<boolean>(false);

  // useEffect(() => {
  //   console.log(`[DEBUG]: icons: `, icons);
  // }, [icons]);

  const handleIfInnerIntegrationWasSet = useCallback((state: boolean) => {
    setIsInnerIntegrationSelected(state);
  }, []);

  return (
    <PageWrapper
      host={host}
      style={{
        padding: 0,
        marginTop: isInnerIntegrationSelected ? 80 : 0,
      }}
    >
      {!isInnerIntegrationSelected && (
        <>
          {host === "vscode" && !tabbed ? (
            <Flex gap="2" pb="3">
              <Button variant="surface" onClick={backFromIntegrations}>
                <ArrowLeftIcon width="16" height="16" />
                Back
              </Button>
            </Flex>
          ) : (
            <Button
              mr="auto"
              variant="outline"
              onClick={onCloseIntegrations}
              mb="4"
            >
              Back
            </Button>
          )}
        </>
      )}
      <ScrollArea scrollbars="vertical" fullHeight>
        <Flex
          direction="column"
          justify="between"
          flexGrow="1"
          mr={LeftRightPadding}
          pr={LeftRightPadding}
          style={{
            width: "inherit",
            height: "100%",
          }}
        >
          <IntegrationsView
            handleIfInnerIntegrationWasSet={handleIfInnerIntegrationWasSet}
            integrationsMap={integrations.data}
            // integrationsIcons={icons.data}
            isLoading={integrations.isLoading}
            goBack={backFromIntegrations}
          />
        </Flex>
      </ScrollArea>
    </PageWrapper>
  );
};
