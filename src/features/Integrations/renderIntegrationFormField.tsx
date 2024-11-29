import {
  CustomBoolField,
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

type FieldType = "string" | "bool" | "int";

const isFieldType = (value: string): value is FieldType => {
  return ["string", "bool", "int"].includes(value);
};

const getDefaultValue = ({
  field,
  values,
  fieldKey,
  f_type,
}: {
  fieldKey: string;
  values: Integration["integr_values"];
  field: IntegrationField<NonNullable<IntegrationPrimitive>>;
  f_type: "bool" | "int" | "string";
}) => {
  if (values[fieldKey]) {
    return values[fieldKey]?.toString(); // Use the value from 'values' if present
  }

  if (f_type === "int") {
    return Number(field.f_default);
  }

  if (f_type === "bool") {
    return Boolean(field.f_default);
  }

  return field.f_default?.toString(); // Otherwise, use the default value from the schema
};

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
  const [f_type_raw, f_size] = field.f_type.toString().split("_");
  const f_type = isFieldType(f_type_raw) ? f_type_raw : "string";

  const commonProps = {
    id: fieldKey,
    name: fieldKey,
    defaultValue: getDefaultValue({ field, fieldKey, values, f_type }),
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
          label={field.f_label ? field.f_label : toPascalCase(fieldKey)}
          marginTop="7px"
        />
      </DataList.Label>
      <DataList.Value
        style={{
          width: "100%",
        }}
      >
        <Flex direction="column" gap="2" align="start" width={"100%"}>
          {f_type !== "bool" && (
            <CustomInputField
              {...commonProps}
              type={f_type === "int" ? "number" : "text"}
              size={f_size}
              defaultValue={commonProps.defaultValue?.toString()}
            />
          )}
          {f_type === "bool" && (
            <CustomBoolField
              {...commonProps}
              defaultValue={Boolean(commonProps.defaultValue)}
            />
          )}
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
