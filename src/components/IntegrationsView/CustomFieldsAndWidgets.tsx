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
  DescriptionFieldProps,
  FieldProps,
  FieldTemplateProps,
  IconButtonProps,
  WidgetProps,
} from "@rjsf/utils";
import { IntegrationSchema } from "../../services/refact";

function toPascalCase(value: string) {
  return value
    .split("_")
    .map((str) => str.charAt(0).toUpperCase() + str.slice(1))
    .join(" ")
    .split("-")
    .join(" ");
}

// Custom String Field
const CustomStringField: React.FC<FieldProps<string, IntegrationSchema>> = ({
  onChange,
  formData,
  name,
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
      <TextField.Root
        id={`root_${name}`}
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

const CustomDescriptionField: React.FC<
  FieldProps<string, IntegrationSchema>
> = (props) => {
  const { name } = props;
  return <Text style={{ color: "red" }}>{name}</Text>;
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
  const { icon, onClick } = props;

  return (
    <Button size="1" color="green" onClick={onClick}>
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

function TitleFieldTemplate() {
  return null;
}

function FieldTemplate(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  props: FieldTemplateProps<any, IntegrationSchema>,
) {
  const {
    id,
    classNames,
    label,
    help,
    required,
    description,
    errors,
    children,
  } = props;
  return (
    <Box className={classNames}>
      {id !== "root" && (
        <label htmlFor={id} className="control-label">
          {toPascalCase(label)}
          {required ? "*" : null}
        </label>
      )}
      {description}
      {children}
      {errors}
      {help}
    </Box>
  );
}

function DescriptionFieldTemplate(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  props: DescriptionFieldProps<any, IntegrationSchema>,
) {
  const { description, id } = props;

  return (
    <>
      {id !== "root__description" && (
        <Text id={id} size="3" my="2" className="field-description">
          {description}
        </Text>
      )}
    </>
  );
}

function ArrayFieldDescriptionTemplate() {
  return null;
}

export const customFields = {
  StringField: CustomStringField,
  TitleField: CustomTitleField,
  DescriptionField: CustomDescriptionField,
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
  FieldTemplate,
  DescriptionFieldTemplate,
  ArrayFieldDescriptionTemplate,
};
