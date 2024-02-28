import React from "react";
import { Checkbox, Flex, Text } from "@radix-ui/themes";

export const FileUpload: React.FC<{
  onClick: (value: boolean) => void;
  fileName?: string;
  checked: boolean;
  disabled?: boolean;
}> = ({ onClick, fileName, ...props }) => {
  return (
    <Text as="label" size="2">
      <Flex gap="2">
        <Checkbox
          {...props}
          onCheckedChange={() => {
            onClick(!props.checked);
          }}
        />{" "}
        Attach {fileName ?? "a file"}
      </Flex>
    </Text>
  );
};
