import {
  Box,
  Checkbox,
  TextField,
  TextArea,
  Button,
  Text,
} from "@radix-ui/themes";
import { Markdown } from "../Markdown";
import classNames from "classnames";
import styles from "./IntegrationsView.module.css";
// Custom Input Field
export const CustomInputField = ({
  value,
  defaultValue,
  placeholder,
  type,
  id,
  name,
  changed,
}: {
  id?: string;
  type?:
    | "number"
    | "search"
    | "time"
    | "text"
    | "hidden"
    | "tel"
    | "url"
    | "email"
    | "date"
    | "password"
    | "datetime-local"
    | "month"
    | "week";
  value?: string;
  name?: string;
  defaultValue?: string | number;
  placeholder?: string;
  changed?: boolean;
}) => {
  return (
    <Box width="100%">
      <TextField.Root
        id={id}
        name={name}
        type={type}
        size="2"
        value={value}
        defaultValue={defaultValue}
        placeholder={placeholder}
        className={classNames(changed && styles.input_updated)}
      />
    </Box>
  );
};

export const CustomLabel = ({
  label,
  htmlFor,
  width,
}: {
  label: string;
  htmlFor?: string;
  width?: string;
}) => {
  return (
    <label
      htmlFor={htmlFor}
      style={{
        display: "block",
        fontWeight: 500,
        fontSize: 14,
        lineHeight: 1.15,
        width: width ? width : "40%",
      }}
    >
      {label}
    </label>
  );
};

export const CustomDescriptionField = ({
  children = "",
}: {
  children?: string;
}) => {
  return (
    <Text size="1" mb="2" style={{ display: "block", opacity: 0.85 }}>
      <Markdown>{children}</Markdown>
    </Text>
  );
};

// Custom Textarea Widget
export const CustomTextareaWidget = () => {
  return (
    <Box>
      <label htmlFor={"d"}>Test label * required</label>
      <TextArea id={"d"} />
    </Box>
  );
};

// Custom Checkbox Widget
export const CustomCheckboxWidget = () => {
  return (
    <Box>
      <label htmlFor={"d"}>
        <Checkbox id={"d"} />
        label * required
      </label>
    </Box>
  );
};
export function AddButton() {
  return (
    <Button size="1" color="green">
      <Text>Add</Text>
    </Button>
  );
}

export function RemoveButton() {
  return (
    <Button size="1" color="ruby" type="button">
      <Text>Remove</Text>
    </Button>
  );
}
export function MoveUpButton() {
  return (
    <Button size="1" color="gray" highContrast type="button">
      <Text>Move Up</Text>
    </Button>
  );
}
export function MoveDownButton() {
  return (
    <Button size="1" color="gray" highContrast type="button">
      <Text>Move Down</Text>
    </Button>
  );
}
