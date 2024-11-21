import { useCallback, useEffect } from "react";
import classNames from "classnames";
import { useGetIntegrationDataByPathQuery } from "../../../hooks/useGetIntegrationDataByPathQuery";

import type { FC, FormEvent } from "react";
import type {
  Integration,
  IntegrationField,
  IntegrationPrimitive,
} from "../../../services/refact";

import styles from "./IntegrationForm.module.css";
import { Spinner } from "../../Spinner";
import { Button, Flex } from "@radix-ui/themes";
import {
  CustomDescriptionField,
  CustomInputField,
  CustomLabel,
} from "../CustomFieldsAndWidgets";
import { toPascalCase } from "../../../utils/toPascalCase";

type IntegrationFormProps = {
  integrationPath: string;
  isApplying: boolean;
  onReturn: () => void;
  handleSubmit: (event: FormEvent<HTMLFormElement>) => void;
  onSchema: (schema: Integration["integr_schema"]) => void;
};

export const IntegrationForm: FC<IntegrationFormProps> = ({
  integrationPath,
  isApplying,
  onReturn,
  handleSubmit,
  onSchema,
}) => {
  const { integration } = useGetIntegrationDataByPathQuery(integrationPath);
  // const [isApplying, setIsApplying] = useState<boolean>(false);

  useEffect(() => {
    console.log(`[DEBUG]: integration.data: `, integration.data);
  }, [integration]);

  useEffect(() => {
    if (integration.data?.integr_schema) {
      onSchema(integration.data.integr_schema);
    }
  }, [integration, onSchema]);

  const renderField = useCallback(
    ({
      field,
      values,
      fieldKey,
    }: {
      fieldKey: string;
      values: Integration["integr_values"];
      field: IntegrationField<NonNullable<IntegrationPrimitive>>;
    }) => {
      const commonProps = {
        id: fieldKey,
        name: fieldKey,
        defaultValue: values[fieldKey]
          ? values[fieldKey].toString() // Use the value from 'values' if present
          : field.f_type === "int"
            ? Number(field.f_default)
            : field.f_default?.toString(), // Otherwise, use the default value from the schema
        placeholder: field.f_placeholder?.toString(),
      };

      return (
        <div key={fieldKey}>
          <CustomLabel htmlFor={fieldKey} label={toPascalCase(fieldKey)} />
          <CustomDescriptionField>{field.f_desc}</CustomDescriptionField>
          <CustomInputField
            {...commonProps}
            type={field.f_type === "int" ? "number" : "text"}
          />
        </div>
      );
    },
    [],
  );

  if (integration.isLoading) {
    return <Spinner spinning />;
  }

  if (!integration.data) {
    return (
      <div>
        <p>No integration found</p>
        <Button
          color="ruby"
          onClick={onReturn}
          type="button"
          className={styles.button}
        >
          Return
        </Button>
      </div>
    );
  }

  return (
    <div>
      <form onSubmit={handleSubmit}>
        {Object.keys(integration.data.integr_schema.fields).map((fieldKey) => {
          if (integration.data) {
            return renderField({
              fieldKey: fieldKey,
              values: integration.data.integr_values,
              field: integration.data.integr_schema.fields[fieldKey],
            });
          }
        })}
        <Flex gap="3" mt="4">
          <Button
            color="green"
            variant="solid"
            type="submit"
            className={classNames(
              { [styles.disabledButton]: isApplying },
              styles.button,
            )}
          >
            {isApplying ? "Applying..." : "Apply"}
          </Button>
          <Button
            className={styles.button}
            color="ruby"
            onClick={onReturn}
            type="button"
          >
            Return
          </Button>
        </Flex>
      </form>
    </div>
  );
};
