import React, { useCallback, useEffect, useMemo } from "react";
import classNames from "classnames";
import { useGetIntegrationDataByPathQuery } from "../../../hooks/useGetIntegrationDataByPathQuery";

import type { FC, FormEvent } from "react";
import type {
  // ChatMessage,
  ChatMessages,
  Integration,
  IntegrationField,
  IntegrationPrimitive,
  // UserMessage,
} from "../../../services/refact";

import styles from "./IntegrationForm.module.css";
import { Spinner } from "../../Spinner";
import { Button, Flex, Heading } from "@radix-ui/themes";
import {
  CustomDescriptionField,
  CustomInputField,
  CustomLabel,
} from "../CustomFieldsAndWidgets";
import { toPascalCase } from "../../../utils/toPascalCase";
import { type SmartLink } from "../../../services/refact";
import {
  useAppDispatch,
  useAppSelector,
  useEventsBusForIDE,
  useSendChatRequest,
} from "../../../hooks";
import {
  setIsConfigFlag,
  setToolUse,
} from "../../../features/Chat/Thread/actions";
import { push } from "../../../features/Pages/pagesSlice";
import { selectChatId } from "../../../features/Chat";
import { clearInformation } from "../../../features/Errors/informationSlice";

type IntegrationFormProps = {
  integrationPath: string;
  isApplying: boolean;
  isDisabled: boolean;
  onCancel: () => void;
  handleSubmit: (event: FormEvent<HTMLFormElement>) => void;
  handleChange: (event: FormEvent<HTMLFormElement>) => void;
  onSchema: (schema: Integration["integr_schema"]) => void;
  onValues: (values: Integration["integr_values"]) => void;
};

export const IntegrationForm: FC<IntegrationFormProps> = ({
  integrationPath,
  isApplying,
  isDisabled,
  onCancel,
  handleSubmit,
  handleChange,
  onSchema,
  onValues,
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

    if (integration.data?.integr_values) {
      onValues(integration.data.integr_values);
    }
  }, [integration, onSchema, onValues]);

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
          ? values[fieldKey]?.toString() // Use the value from 'values' if present
          : field.f_type === "int"
            ? Number(field.f_default)
            : field.f_default?.toString(), // Otherwise, use the default value from the schema
        placeholder: field.f_placeholder?.toString(),
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
                />
              ))}
            </Flex>
          )}
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
        {Object.keys(integration.data.integr_schema.fields).map((fieldKey) => {
          if (integration.data) {
            return renderField({
              fieldKey: fieldKey,
              values: integration.data.integr_values,
              field: integration.data.integr_schema.fields[fieldKey],
            });
          }
        })}
        {/* TODO: think about enabled/disabled value */}
        {/* {integration.data.integr_values.available &&
          Object.entries(integration.data.integr_values.available).map(
            ([key, value]: [string, boolean]) => (
              <IntegrationAvailability
                key={key}
                fieldName={key}
                value={value}
              />
            ),
          )} */}
        <Flex gap="4">
          <Button
            color="green"
            variant="solid"
            type="submit"
            size="3"
            title={isDisabled ? "Cannot apply, no changes made" : "Apply"}
            className={classNames(
              { [styles.disabledButton]: isApplying || isDisabled },
              styles.button,
            )}
            disabled={isDisabled}
          >
            {isApplying ? "Applying changes..." : "Apply changes"}
          </Button>
          <Button
            color="ruby"
            variant="solid"
            type="button"
            size="3"
            onClick={onCancel}
            className={classNames(
              { [styles.disabledButton]: isApplying || isDisabled },
              styles.button,
            )}
            disabled={isDisabled}
          >
            Cancel changes
          </Button>
        </Flex>
      </form>
      {/** smart links */}
      <Flex my="6" direction="column" align="start" gap="3">
        <Heading as="h3" align="center" className={styles.SectionTitle}>
          Smart Links
        </Heading>
        {integration.data.integr_schema.smartlinks.map((smartlink, index) => {
          return <SmartLink key={`smartlink-${index}`} smartlink={smartlink} />;
        })}
      </Flex>
      {/* availability */}
      <Flex mt="4" direction="column" align="start" gap="3">
        <Heading as="h3" align="center" className={styles.SectionTitle}>
          Availability
        </Heading>
        {integration.data.integr_values.available && (
          <Flex mt="4" align="center" justify="between" width="100%">
            {Object.entries(integration.data.integr_values.available).map(
              ([key, value]: [string, boolean]) => (
                <IntegrationAvailability
                  key={key}
                  fieldName={key}
                  value={value}
                />
              ),
            )}
          </Flex>
        )}
      </Flex>
    </Flex>
  );
};

const SmartLink: FC<{
  smartlink: SmartLink;
  isSmall?: boolean;
}> = ({ smartlink, isSmall = false }) => {
  // TODO: send chat on click and navigate away
  const dispatch = useAppDispatch();
  const chatId = useAppSelector(selectChatId);

  const { queryPathThenOpenFile } = useEventsBusForIDE();

  const { sl_goto, sl_chat } = smartlink;

  const { sendMessages } = useSendChatRequest();
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

    const messages = sl_chat.reduce<ChatMessages>((acc, message) => {
      if (message.role === "user" && typeof message.content === "string") {
        return [
          ...acc,
          {
            role: message.role,
            content: message.content,
          },
        ];
      }

      // TODO: Other types.
      return acc;
    }, []);
    // dispatch(newChatAction()); id is out of date
    dispatch(setToolUse("agent"));
    dispatch(setIsConfigFlag({ id: chatId, isConfig: true }));
    dispatch(clearInformation());
    // TODO: make another version of send messages so there's no need to converting the messages
    // eslint-disable-next-line no-console, @typescript-eslint/no-unsafe-call
    sendMessages(messages)
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      .then(() => {
        dispatch(push({ name: "chat" }));
      })
      // eslint-disable-next-line no-console, @typescript-eslint/no-unsafe-member-access
      .catch(console.error);
  }, [chatId, sl_chat, sl_goto, dispatch, sendMessages, queryPathThenOpenFile]);

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
      color={isSmall ? "gray" : "mint"}
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
};

const IntegrationAvailability: FC<IntegrationAvailabilityProps> = ({
  fieldName,
  value,
}) => {
  const availabilityMessage = useMemo(
    () =>
      value
        ? `Available \`\`\`(${value})\`\`\``
        : `Not Available \`\`\`(${value})\`\`\``,
    [value],
  );

  return (
    <Flex width="50%" align="start" direction="column">
      <CustomLabel label={toPascalCase(fieldName)} width="100%" />
      <CustomDescriptionField>{availabilityMessage}</CustomDescriptionField>
      {/* <Switch size="1" defaultChecked={value} />
      <input
        type="hidden"
        name={`available[${fieldName}]`}
        value={JSON.stringify({ available: value })}
      /> */}
    </Flex>
  );
};
