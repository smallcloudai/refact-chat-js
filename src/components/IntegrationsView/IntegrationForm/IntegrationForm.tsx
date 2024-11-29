/* eslint-disable no-console */
import React, { useCallback, useEffect, useMemo } from "react";
import classNames from "classnames";
import { useGetIntegrationDataByPathQuery } from "../../../hooks/useGetIntegrationDataByPathQuery";

import type { FC, FormEvent, Dispatch } from "react";
import type {
  Integration,
  IntegrationField,
  IntegrationPrimitive,
  SmartLink as SmartLinkType,
} from "../../../services/refact";

import styles from "./IntegrationForm.module.css";
import { Spinner } from "../../Spinner";
import { Button, Flex, Switch } from "@radix-ui/themes";
import {
  CustomDescriptionField,
  CustomInputField,
  CustomLabel,
} from "../CustomFieldsAndWidgets";
import { toPascalCase } from "../../../utils/toPascalCase";
import { type SmartLink } from "../../../services/refact";
import { newIntegrationChat } from "../../../features/Chat/Thread/actions";
import { useAppDispatch, useEventsBusForIDE } from "../../../hooks";
import { push } from "../../../features/Pages/pagesSlice";
import { clearInformation } from "../../../features/Errors/informationSlice";
import { formatMessagesForChat } from "../../../features/Chat/Thread/utils";

export type IntegrationFormProps = {
  integrationPath: string;
  isApplying: boolean;
  isDisabled: boolean;
  availabilityValues: Record<string, boolean>;
  // onCancel: () => void;
  handleSubmit: (event: FormEvent<HTMLFormElement>) => void;
  handleChange: (event: FormEvent<HTMLFormElement>) => void;
  onSchema: (schema: Integration["integr_schema"]) => void;
  onValues: (values: Integration["integr_values"]) => void;
  setAvailabilityValues: Dispatch<
    React.SetStateAction<Record<string, boolean>>
  >;
};

export const IntegrationForm: FC<IntegrationFormProps> = ({
  integrationPath,
  isApplying,
  isDisabled,
  availabilityValues,
  // onCancel,
  handleSubmit,
  handleChange,
  onSchema,
  onValues,
  setAvailabilityValues,
}) => {
  const { integration, cachedValues } =
    useGetIntegrationDataByPathQuery(integrationPath);

  // const [availabilityValues, setAvailabilityValues] = useState<
  //   Record<string, boolean>
  // >({});

  const handleAvailabilityChange = useCallback(
    (fieldName: string, value: boolean) => {
      setAvailabilityValues((prev) => ({ ...prev, [fieldName]: value }));
    },
    [setAvailabilityValues],
  );

  useEffect(() => {
    if (
      integration.data?.integr_values.available &&
      typeof integration.data.integr_values.available === "object"
    ) {
      Object.entries(integration.data.integr_values.available).forEach(
        ([key, value]) => {
          handleAvailabilityChange(key, value);
        },
      );
    }
  }, [integration, handleAvailabilityChange]);

  useEffect(() => {
    if (integration.data?.integr_schema) {
      onSchema(integration.data.integr_schema);
    }

    if (integration.data?.integr_values) {
      onValues(integration.data.integr_values);
    }
    console.log(`[DEBUG]: integration.data: `, integration.data);
  }, [integration, onSchema, onValues]);

  // TODO: could be hoisted to a top level function
  const renderField = useCallback(
    ({
      field,
      values,
      fieldKey,
      changed,
    }: {
      fieldKey: string;
      values: Integration["integr_values"];
      field: IntegrationField<NonNullable<IntegrationPrimitive>>;
      changed: boolean;
    }) => {
      const commonProps = {
        id: fieldKey,
        name: fieldKey,
        defaultValue: values[fieldKey]
          ? values[fieldKey]?.toString() // Use the value from 'values' if present
          : field.f_type === "string_short"
            ? Number(field.f_default)
            : field.f_default?.toString(), // Otherwise, use the default value from the schema
        placeholder: field.f_placeholder?.toString(),
        changed,
      };

      const maybeSmartlinks = field.smartlinks;

      return (
        <div
          key={fieldKey}
          style={{
            width: "100%",
          }}
        >
          <Flex gap="3" align="baseline" width="100%">
            <CustomLabel htmlFor={fieldKey} label={toPascalCase(fieldKey)} />
            <Flex direction="column" gap="1" align="start" width="100%">
              <CustomInputField
                {...commonProps}
                type={field.f_type === "int" ? "number" : "text"}
              />
              <CustomDescriptionField>{field.f_desc}</CustomDescriptionField>
            </Flex>
          </Flex>

          {maybeSmartlinks && (
            <Flex align="center" justify="end">
              {maybeSmartlinks.map((smartlink, index) => (
                <SmartLink
                  isSmall
                  key={`smartlink-${fieldKey}-${index}`}
                  smartlink={smartlink}
                  integrationName={integration.data?.integr_name ?? ""}
                  integrationPath={integration.data?.project_path ?? ""}
                />
              ))}
            </Flex>
          )}
        </div>
      );
    },
    [integration.data?.integr_name, integration.data?.project_path],
  );

  if (integration.isLoading) {
    return <Spinner spinning />;
  }

  if (!integration.data) {
    return (
      <div>
        <p>No integration found</p>
      </div>
    );
  }

  return (
    <Flex width="100%" direction="column" gap="2">
      <form
        onSubmit={handleSubmit}
        onChange={handleChange}
        className={styles.IntegrationForm}
        id={`form-${integration.data.integr_name}`}
      >
        {integration.data.integr_values.available &&
          Object.entries(integration.data.integr_values.available).map(
            ([key, _]: [string, boolean]) => (
              <IntegrationAvailability
                key={key}
                fieldName={key}
                value={availabilityValues[key]}
                onChange={handleAvailabilityChange}
              />
            ),
          )}
        {Object.keys(integration.data.integr_schema.fields).map((fieldKey) => {
          if (integration.data) {
            const cachedValue = cachedValues && cachedValues[fieldKey];
            const currentValue = integration.data.integr_values[fieldKey];
            // TBD: does this need all the fields ?
            return renderField({
              fieldKey: fieldKey,
              values: integration.data.integr_values,
              field: integration.data.integr_schema.fields[fieldKey],
              changed: cachedValue !== currentValue,
            });
          }
        })}
        <Flex justify="between" width="100%">
          <Flex gap="4">
            <Button
              color="green"
              variant="solid"
              type="submit"
              size="2"
              title={isDisabled ? "Cannot apply, no changes made" : "Apply"}
              className={classNames(
                { [styles.disabledButton]: isApplying || isDisabled },
                styles.button,
              )}
              disabled={isDisabled}
            >
              {isApplying ? "Applying..." : "Apply"}
            </Button>
          </Flex>
          <Flex align="center" gap="4">
            {integration.data.integr_schema.smartlinks.map(
              (smartlink, index) => {
                return (
                  <SmartLink
                    key={`smartlink-${index}`}
                    smartlink={smartlink}
                    integrationName={integration.data?.integr_name ?? ""}
                    integrationPath={integration.data?.project_path ?? ""}
                  />
                );
              },
            )}
          </Flex>
        </Flex>
      </form>
    </Flex>
  );
};

const SmartLink: FC<{
  smartlink: SmartLinkType;
  integrationName: string;
  integrationPath: string;
  isSmall?: boolean;
}> = ({ smartlink, integrationName, integrationPath, isSmall = false }) => {
  const dispatch = useAppDispatch();

  const { queryPathThenOpenFile } = useEventsBusForIDE();

  const { sl_goto, sl_chat } = smartlink;

  // TODO: tidy this up, maybe hoist it up ?
  const handleClick = React.useCallback(() => {
    if (sl_goto) {
      console.log(`[DEBUG]: sl_goto: `, sl_goto);
      const [action, payload] = sl_goto.split(":");
      switch (action.toLowerCase()) {
        case "editor":
          void queryPathThenOpenFile({ file_name: payload });
          console.log(`[DEBUG]: opening path of ${payload}`);
          break;
        case "setting":
          console.log(
            `[DEBUG]: ${action}: opening integration of ${payload} name`,
          );
          break;
        default:
          console.log(`[DEBUG]: unexpected action, doing nothing`);
          break;
      }
      return;
    }
    if (!sl_chat) return;

    const messages = formatMessagesForChat(sl_chat);

    dispatch(clearInformation());
    dispatch(
      newIntegrationChat({
        integration: { name: integrationName, path: integrationPath },
        messages,
      }),
    );
    dispatch(push({ name: "chat" }));
  }, [
    sl_goto,
    sl_chat,
    dispatch,
    integrationName,
    integrationPath,
    queryPathThenOpenFile,
  ]);

  const title = sl_chat?.reduce<string[]>((acc, cur) => {
    if (typeof cur.content === "string")
      return [...acc, `${cur.role}: ${cur.content}`];
    return acc;
  }, []);

  return (
    <Button
      size={isSmall ? "1" : "2"}
      onClick={handleClick}
      title={title ? title.join("\n") : ""}
      color="gray"
      type="button"
      variant="outline"
    >
      {smartlink.sl_label}
    </Button>
  );
};

type IntegrationAvailabilityProps = {
  fieldName: string;
  value: boolean;
  onChange: (fieldName: string, value: boolean) => void;
};

const IntegrationAvailability: FC<IntegrationAvailabilityProps> = ({
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
    <div
      style={{
        width: "100%",
      }}
    >
      <Flex width="100%" gap="3">
        <CustomLabel label={toPascalCase(fieldName)} />
        <Flex width="100%" align="start" direction="column" gap="3">
          <Switch
            size="2"
            checked={value}
            onCheckedChange={handleSwitchChange}
          />
          <CustomDescriptionField>{availabilityMessage}</CustomDescriptionField>
        </Flex>
      </Flex>
    </div>
  );
};
