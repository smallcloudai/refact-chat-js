import {
  CustomDescriptionField,
  CustomInputField,
  CustomLabel,
} from "../../components/IntegrationsView/CustomFieldsAndWidgets";
import type {
  Integration,
  IntegrationField,
  IntegrationPrimitive,
} from "../../services/refact";
import { DataList, Flex } from "@radix-ui/themes";
import { toPascalCase } from "../../utils/toPascalCase";
import { SmartLink } from "../../components/SmartLink";

export const renderIntegrationFormField = ({
  field,
  values,
  fieldKey,
  integrationName,
  integrationPath,
}: {
  fieldKey: string;
  values: Integration["integr_values"];
  field: IntegrationField<NonNullable<IntegrationPrimitive>>;
  integrationName: string;
  integrationPath: string;
}) => {
  const [f_type, f_size] = field.f_type.toString().split("_");

  const commonProps = {
    id: fieldKey,
    name: fieldKey,
    defaultValue: values[fieldKey]
      ? values[fieldKey]?.toString() // Use the value from 'values' if present
      : f_type === "string"
        ? Number(field.f_default)
        : field.f_default?.toString(), // Otherwise, use the default value from the schema
    placeholder: field.f_placeholder?.toString(),
  };

  const maybeSmartlinks = field.smartlinks;

  return (
    <DataList.Item
      key={fieldKey}
      style={{
        width: "100%",
      }}
    >
      <DataList.Label>
        <CustomLabel
          htmlFor={fieldKey}
          label={toPascalCase(fieldKey)}
          marginTop="7px"
        />
      </DataList.Label>
      <DataList.Value
        style={{
          width: "100%",
        }}
      >
        <Flex
          direction="column"
          gap="2"
          align="start"
          // width={f_size === "short" ? "50%" : "100%"}
          width={"100%"}
        >
          <CustomInputField
            {...commonProps}
            type={f_type === "int" ? "number" : "text"}
            size={f_size}
          />
          {field.f_desc && (
            <CustomDescriptionField>{field.f_desc}</CustomDescriptionField>
          )}
          {maybeSmartlinks && (
            <Flex align="center">
              {maybeSmartlinks.map((smartlink, index) => (
                <SmartLink
                  isSmall
                  key={`smartlink-${fieldKey}-${index}`}
                  smartlink={smartlink}
                  integrationName={integrationName}
                  integrationPath={integrationPath}
                />
              ))}
            </Flex>
          )}
        </Flex>
      </DataList.Value>
    </DataList.Item>
  );
};
