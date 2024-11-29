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
import { Button, DataList, Flex, Heading, Switch } from "@radix-ui/themes";
import {
  CustomDescriptionField,
  CustomInputField,
  CustomLabel,
} from "../CustomFieldsAndWidgets";
import { toPascalCase } from "../../../utils/toPascalCase";
import { newIntegrationChat } from "../../../features/Chat/Thread/actions";
import { useAppDispatch, useEventsBusForIDE } from "../../../hooks";

import { push } from "../../../features/Pages/pagesSlice";
import { clearInformation } from "../../../features/Errors/informationSlice";
import { IntegrationDocker } from "../IntegrationDocker";
import { formatMessagesForChat } from "../../../features/Chat/Thread/utils";

type IntegrationFormProps = {
  integrationPath: string;
  isApplying: boolean;
  isDisabled: boolean;
  availabilityValues: Record<string, boolean>;
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
  handleSubmit,
  handleChange,
  onSchema,
  onValues,
  setAvailabilityValues,
}) => {
  const { integration } = useGetIntegrationDataByPathQuery(integrationPath);
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
    console.log(`[DEBUG]: integration.data: `, integration);
  }, [integration, onSchema, onValues]);

  // TODO: could be hoisted to a top level function
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
                      integrationName={integration.data?.integr_name ?? ""}
                      integrationPath={integration.data?.project_path ?? ""}
                    />
                  ))}
                </Flex>
              )}
            </Flex>
          </DataList.Value>
        </DataList.Item>
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
        id={`form-${integration.data.integr_name}`}
      >
        <Flex direction="column" gap="2">
          <DataList.Root
            mt="2"
            mb="0"
            size="1"
            orientation={{
              xs: "horizontal",
              initial: "vertical",
            }}
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
          </DataList.Root>
          <DataList.Root
            size="1"
            orientation={{
              xs: "horizontal",
              initial: "vertical",
            }}
          >
            {Object.keys(integration.data.integr_schema.fields).map(
              (fieldKey) => {
                if (integration.data) {
                  return renderField({
                    fieldKey: fieldKey,
                    values: integration.data.integr_values,
                    field: integration.data.integr_schema.fields[fieldKey],
                  });
                }
              },
            )}
          </DataList.Root>
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
        </Flex>
      </form>
      {/* docker */}
      <Flex mt="6" direction="column" align="start" gap="3">
        <Heading as="h3" align="center" className={styles.SectionTitle}>
          Docker Containers
        </Heading>
        <IntegrationDocker dockerData={integration.data.integr_schema.docker} />
      </Flex>
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
      {/* </Flex> */}
    </DataList.Item>
  );
};
