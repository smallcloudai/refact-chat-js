import React from "react";
import { Box, Card } from "@radix-ui/themes";
import { useGetLinksFromLsp } from "../../hooks";
import { Markdown } from "../Markdown";
import { WarningCallout } from "../Callout";

export const UncommittedChangesWarning: React.FC = () => {
  const linksRequest = useGetLinksFromLsp();

  if (!linksRequest.data?.uncommited_changes_warning) return null;

  return (
    <Box py="4">
      <Card asChild>
        <WarningCallout variant="surface" mx="0">
          <Markdown wrap>
            {linksRequest.data.uncommited_changes_warning}
          </Markdown>
        </WarningCallout>
      </Card>
    </Box>
  );
};
