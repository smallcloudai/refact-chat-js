/* eslint-disable react-refresh/only-export-components */
import React, { useEffect, useState } from "react";
import {
  Box,
  Checkbox,
  TextField,
  TextArea,
  Button,
  Text,
} from "@radix-ui/themes";
import {
  FieldProps,
  IconButtonProps,
  TitleFieldProps,
  WidgetProps,
} from "@rjsf/utils";
import { IntegrationSchema } from "../../services/refact";

// Custom String Field
const CustomStringField: React.FC<FieldProps<string, IntegrationSchema>> = ({
  id,
  label,
  onChange,
  formData,
}) => {
  const [inputValue, setInputValue] = useState<string>(formData ?? "");

  useEffect(() => {
    setInputValue(formData ?? "");
  }, [formData]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(e.target.value);
    onChange(e.target.value);
  };

  return (
    <Box mb="3">
      <label htmlFor={id}>{label}</label>
      <TextField.Root
        id={id}
        size="3"
        onChange={handleChange}
        value={inputValue}
      />
    </Box>
  );
};

const CustomTitleField: React.FC<FieldProps<string, IntegrationSchema>> = (
  props,
) => {
  return <h1 style={{ color: "red" }}>{props.title}</h1>;
};

// Custom Textarea Widget
const CustomTextareaWidget: React.FC<
  WidgetProps<string, IntegrationSchema>
> = ({ id, label, required, onChange, value }) => {
  const [inputValue, setInputValue] = useState<string>(
    typeof value === "string" ? value : "",
  );

  useEffect(() => {
    setInputValue(typeof value === "string" ? value : "");
  }, [value]);

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInputValue(e.target.value);
    onChange(e.target.value);
  };

  return (
    <Box>
      <label htmlFor={id}>
        {label}
        {required ? "* required" : null}
      </label>
      <TextArea id={id} value={inputValue} onChange={handleChange} />
    </Box>
  );
};

// Custom Checkbox Widget
const CustomCheckboxWidget: React.FC<
  WidgetProps<boolean, IntegrationSchema>
> = ({ id, label, required, onChange, value }) => {
  const [checked, setChecked] = useState<boolean>(
    typeof value === "boolean" ? value : false,
  );

  useEffect(() => {
    setChecked(typeof value === "boolean" ? value : false);
  }, [value]);

  const handleChange = (checked: boolean) => {
    setChecked(checked);
    onChange(checked);
  };

  return (
    <Box>
      <label htmlFor={id}>
        <Checkbox id={id} checked={checked} onCheckedChange={handleChange} />
        {label}
        {required ? "* required" : null}
      </label>
    </Box>
  );
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function AddButton(props: IconButtonProps<any, IntegrationSchema>) {
  const { icon, onClick, registry } = props;

  const handleClick: React.MouseEventHandler<HTMLButtonElement> = (event) => {
    console.log(`[DEBUG]: registry: `, registry);
    onClick && onClick(event);
  };
  return (
    <Button size="1" color="green" onClick={handleClick}>
      {icon} <Text>Add</Text>
    </Button>
  );
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function RemoveButton(props: IconButtonProps<any, IntegrationSchema>) {
  const { icon, onClick } = props;
  return (
    <Button size="1" color="ruby" onClick={onClick} type="button">
      {icon} <Text>Remove</Text>
    </Button>
  );
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function MoveUpButton(props: IconButtonProps<any, IntegrationSchema>) {
  const { icon, onClick } = props;
  return (
    <Button size="1" color="gray" highContrast onClick={onClick} type="button">
      {icon} <Text>Move Up</Text>
    </Button>
  );
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function MoveDownButton(props: IconButtonProps<any, IntegrationSchema>) {
  const { icon, onClick } = props;
  return (
    <Button size="1" color="gray" highContrast onClick={onClick} type="button">
      {icon} <Text>Move Down</Text>
    </Button>
  );
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function TitleFieldTemplate(props: TitleFieldProps<any, IntegrationSchema>) {
  const { id, title } = props;
  return (
    <header
      id={id}
      style={{
        display: id === "root__title" ? "none" : "initial",
        fontWeight: "600",
      }}
    >
      {title}
    </header>
  );
}

export const customFields = {
  StringField: CustomStringField,
  TitleField: CustomTitleField,
};

export const customWidgets = {
  TextareaWidget: CustomTextareaWidget,
  CheckboxWidget: CustomCheckboxWidget,
};

export const customTemplates = {
  ButtonTemplates: {
    AddButton,
    RemoveButton,
    MoveUpButton,
    MoveDownButton,
  },
  // ArrayFieldTemplate
  TitleFieldTemplate,
};
