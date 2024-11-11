import React, { useCallback } from "react";
import { withTheme, ThemeProps, getDefaultRegistry } from "@rjsf/core";
import { RegistryWidgetsType, TemplatesType, WidgetProps } from "@rjsf/utils";
import { Text, TextField } from "@radix-ui/themes";

const defaultRegistry = getDefaultRegistry();
defaultRegistry.templates;

const MyTextWidget: React.FC<
  //  "number" | "search" | "time" | "text"
  // | "hidden" | "date" | "datetime-local" | "email"
  // | "month" | "password" | "tel" | "url" | "week" | undefined
  WidgetProps & { type: TextField.RootProps["type"] }
> = (props) => {
  const {
    id,
    label,
    onFocus,
    onBlur,
    defaultValue,
    color: _color,
    ...rest
  } = props;

  const handleOnFocus: React.FocusEventHandler<HTMLInputElement> = useCallback(
    (event) => onFocus(id, event.target.value),
    [onFocus, id],
  );

  const handleOnBlur: React.FocusEventHandler<HTMLInputElement> = useCallback(
    (event) => onBlur(id, event.target.value),
    [id, onBlur],
  );

  return (
    <Text as="label">
      {label}
      <TextField.Root
        id={id}
        {...rest}
        onFocus={handleOnFocus}
        onBlur={handleOnBlur}
        defaultValue={defaultValue ? String(defaultValue) : ""}
      />
    </Text>
  );
};

const MyWidgets: RegistryWidgetsType = {
  /**
AltDateTimeWidget
AltDateWidget
CheckboxesWidget
CheckboxWidget
ColorWidget
DateTimeWidget
DateWidget
EmailWidget
FileWidget
HiddenWidget
PasswordWidget
RadioWidget
RangeWidget
SelectWidget
TextareaWidget
TextWidget
TimeWidget
UpDownWidget
URLWidget
     */

  EmailWidget: (props) => <MyTextWidget {...props} type="email" />,
  PasswordWidget: (props) => <MyTextWidget {...props} type="password" />,
  UrlWidget: (props) => <MyTextWidget {...props} type="url" />,
  TextWidget: (props) => <MyTextWidget {...props} type="text" />,
};

const MyFieldTemplates: TemplatesType = {
  ...defaultRegistry.templates,
  // BaseInputTemplate:
};

const theme: ThemeProps = { widgets: MyWidgets, templates: MyFieldTemplates };

export const IntegrationsForm = withTheme(theme);
