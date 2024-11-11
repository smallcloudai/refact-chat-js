import { ChangeEvent, FocusEvent, useCallback } from "react";
import {
  ariaDescribedByIds,
  BaseInputTemplateProps,
  examplesId,
  getInputProps,
  FormContextType,
  RJSFSchema,
  StrictRJSFSchema,
} from "@rjsf/utils";

import { ChangeEvent, FocusEvent } from "react";
import { getInputProps, RJSFSchema, BaseInputTemplateProps } from "@rjsf/utils";
import validator from "@rjsf/validator-ajv8";
import { Checkbox, TextField } from "@radix-ui/themes";

const isTextFieldType = (
  type?: string,
): type is TextField.RootProps["type"] => {
  switch (type) {
    case undefined:
    case "number":
    case "hidden":
    case "search":
    case "text":
    case "tel":
    case "url":
    case "email":
    case "date":
    case "time":
    case "datetime-local":
    case "month":
    case "password":
    case "week":
      return true;
    default:
      return false;
  }
};

type Props = BaseInputTemplateProps &
  React.InputHTMLAttributes<HTMLInputElement>;

function BaseInputTemplate(props: Props) {
  const {
    schema,
    id,
    options,
    label,
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    value,
    type,
    placeholder,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    required,
    disabled,
    readonly,
    autofocus,
    onChange,
    onChangeOverride,
    onBlur,
    onFocus,
    rawErrors,
    hideError,
    uiSchema: _uiSchema,
    registry: _registry,
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    formContext: _formContext,
    ...rest
  } = props;

  const onTextChange = useCallback(
    ({ target: { value: val } }: ChangeEvent<HTMLInputElement>) => {
      // Use the options.emptyValue if it is specified and newVal is also an empty string
      onChange(val === "" ? options.emptyValue || "" : val);
    },
    [onChange, options.emptyValue],
  );

  const onTextBlur = useCallback(
    ({ target: { value: val } }: FocusEvent<HTMLInputElement>) =>
      onBlur(id, val),
    [id, onBlur],
  );

  const onTextFocus = useCallback(
    ({ target: { value: val } }: FocusEvent<HTMLInputElement>) =>
      onFocus(id, val),
    [id, onFocus],
  );

  const {
    color: _color,
    // FIX this
    defaultValue: _defaultValue,
    size: _size,
    ...inputProps
  } = {
    ...rest,
    ...getInputProps(schema, type, options),
  };

  // TODO: errors
  const _hasError = rawErrors && rawErrors.length > 0 && !hideError;

  if (isTextFieldType(type)) {
    return (
      <TextField.Root
        {...inputProps}
        type={type}
        onChange={onChangeOverride ?? onTextChange}
        onBlur={onTextBlur}
        onFocus={onTextFocus}
      />
    );
  }

  // TODO:
  if (type === "radio") {
    //
  }

  // TODO:
  if (type === "checkbox") {
    //
  }

  // TODO: other types
  //  "color" | "button" | "checkbox" | "radio" | (string & {}) | "file" | "image" | "range" | "reset" | "submit"

  // return <input />;

  // TODO: fall back to the default

  //   return (
  //     <CustomTextInput
  //       id={id}
  //       label={label}
  //       value={value}
  //       placeholder={placeholder}
  //       disabled={disabled}
  //       readOnly={readonly}
  //       autoFocus={autofocus}
  //       error={hasError}
  //       errors={hasError ? rawErrors : undefined}
  //       onChange={onChangeOverride ?? onTextChange}
  //       onBlur={onTextBlur}
  //       onFocus={onTextFocus}
  //       {...inputProps}
  //     />
  //   );
}
