// TODO: fix unsafe returns
/* eslint-disable @typescript-eslint/no-unsafe-return */
import React from "react";
import { Box, Checkbox, TextField, TextArea } from "@radix-ui/themes";
import { FieldProps, WidgetProps } from "@rjsf/utils";
import { IntegrationSchema } from "../../services/refact";

// Custom String Field
const CustomStringField: React.FC<FieldProps<string, IntegrationSchema>> = ({
  id,
  label,
  required,
  onChange,
  value,
}) => (
  <Box>
    <label htmlFor={id}>
      {label}
      {required ? "* required" : null}
    </label>
    <TextField.Root
      id={id}
      size="1"
      onChange={(e) => onChange(e.target.value)}
      value={typeof value === "string" ? value : ""}
    />
  </Box>
);

const CustomTitleField: React.FC<
  FieldProps<string, IntegrationSchema>
> = () => {
  return null;
};

// Custom Textarea Widget
const CustomTextareaWidget: React.FC<
  WidgetProps<string, IntegrationSchema>
> = ({ id, label, required, onChange, value }) => (
  <Box>
    <label htmlFor={id}>
      {label}
      {required ? "* required" : null}
    </label>
    <TextArea
      id={id}
      value={typeof value === "string" ? value : ""}
      onChange={(e) => onChange(e.target.value)}
    />
  </Box>
);

// Custom Checkbox Widget
const CustomCheckboxWidget: React.FC<
  WidgetProps<boolean, IntegrationSchema>
> = ({ id, label, required, onChange, value }) => (
  <Box>
    <label htmlFor={id}>
      <Checkbox
        id={id}
        checked={typeof value === "boolean" ? value : false}
        onCheckedChange={(checked) => onChange(checked)}
      />
      {label}
      {required ? "* required" : null}
    </label>
  </Box>
);

export const customFields = {
  StringField: CustomStringField,
  TitleField: CustomTitleField,
};

export const customWidgets = {
  TextareaWidget: CustomTextareaWidget,
  CheckboxWidget: CustomCheckboxWidget,
};
