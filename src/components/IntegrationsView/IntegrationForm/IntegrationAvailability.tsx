import { DataList, Flex, Switch } from "@radix-ui/themes";
import { useMemo } from "react";
import type { FC } from "react";
import { CustomDescriptionField, CustomLabel } from "../CustomFieldsAndWidgets";
import { toPascalCase } from "../../../utils/toPascalCase";

type IntegrationAvailabilityProps = {
  fieldName: string;
  value: boolean;
  onChange: (fieldName: string, value: boolean) => void;
};

export const IntegrationAvailability: FC<IntegrationAvailabilityProps> = ({
  fieldName,
  value,
  onChange,
}) => {
  const availabilityMessage = useMemo(
    () =>
      value
        ? `Available \`\`\`(${value})\`\`\``
        : `Not Available \`\`\`(${value})\`\`\``,
    [value],
  );

  const handleSwitchChange = (checked: boolean) => {
    onChange(fieldName, checked);
  };

  return (
    <DataList.Item
      style={{
        marginBottom: "0.75rem",
      }}
    >
      {/* <Flex width="100%" gap="3"> */}
      <DataList.Label>
        <CustomLabel label={toPascalCase(fieldName)} />
      </DataList.Label>
      <DataList.Value>
        <Flex
          width="100%"
          align="center"
          gap="3"
          mt={{
            xs: "0",
            initial: "2",
          }}
        >
          <Switch
            size="2"
            checked={value}
            onCheckedChange={handleSwitchChange}
          />
          <CustomDescriptionField mb="0">
            {availabilityMessage}
          </CustomDescriptionField>
        </Flex>
      </DataList.Value>
    </DataList.Item>
  );
};
