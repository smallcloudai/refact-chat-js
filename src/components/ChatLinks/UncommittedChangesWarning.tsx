import React, { useEffect, useState } from "react";
import { useGetLinksFromLsp } from "../../hooks";
import { Markdown } from "../Markdown";
import { Callout, Flex } from "@radix-ui/themes";
import { InfoCircledIcon } from "@radix-ui/react-icons";

export const UncommittedChangesWarning: React.FC = () => {
  const linksRequest = useGetLinksFromLsp();

  const [isOpened, setIsOpened] = useState<boolean>(
    !linksRequest.data?.uncommited_changes_warning,
  );

  useEffect(() => {
    if (linksRequest.data?.uncommited_changes_warning) {
      setIsOpened(true);
    } else {
      setIsOpened(false);
    }
  }, [linksRequest.data?.uncommited_changes_warning]);

  if (!linksRequest.data?.uncommited_changes_warning) return null;
  if (!isOpened) return null;

  return (
    <Callout.Root
      color="amber"
      my="4"
      onClick={() => setIsOpened(false)}
      style={{ overflowWrap: "anywhere" }}
    >
      <Flex direction="row" align="center" gap="4" position="relative">
        <Callout.Icon>
          <InfoCircledIcon />
        </Callout.Icon>

        <Markdown wrap>{linksRequest.data.uncommited_changes_warning}</Markdown>
      </Flex>
    </Callout.Root>
  );
};
