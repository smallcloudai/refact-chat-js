import React from "react";
import { Checkbox, Flex, Text } from "@radix-ui/themes";

export const FileUpload: React.FC<{
  onClick: () => void;
  fileName?: string;
  checked: boolean;
}> = ({ onClick, fileName, checked }) => {
  return (
    <Text as="label" size="2">
      <Flex gap="2">
        <Checkbox
          checked={checked}
          onCheckedChange={() => {
            onClick();
          }}
        />{" "}
        Attach {fileName ?? "a file"}
      </Flex>
    </Text>
  );
};
