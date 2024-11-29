import React from "react";
import { Flex, Button } from "@radix-ui/themes";
import { linksApi } from "../../services/refact/links";

export const ChatLinks: React.FC = () => {
  const linksRequest = linksApi.useGetLinksForChatQuery(null);
  if (!linksRequest.data) return null;

  return (
    <Flex gap="2" wrap="wrap">
      {linksRequest.data.links.map((link, index) => {
        const key = `chat-link-${index}`;
        return (
          <Button
            size="1"
            radius="full"
            key={key}
            title={link.action ?? link.goto}
          >
            {link.text}
          </Button>
        );
      })}
    </Flex>
  );
};
