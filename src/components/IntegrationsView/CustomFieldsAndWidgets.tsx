import {
  Box,
  Checkbox,
  TextField,
  TextArea,
  Button,
  Text,
} from "@radix-ui/themes";
import { Markdown } from "../Markdown";

// Custom Input Field
export const CustomInputField = ({
  value,
  defaultValue,
  placeholder,
  type,
  id,
  name,
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
}) => {
  return (
    <Box mb="3">
      <TextField.Root
        id={id}
        name={name}
        type={type}
        size="2"
        value={value}
        defaultValue={defaultValue}
        placeholder={placeholder}
      />
    </Box>
  );
};

export const CustomLabel = ({
  label,
  htmlFor,
}: {
  label: string;
  htmlFor?: string;
}) => {
  return (
    <label
      htmlFor={htmlFor}
      style={{
        display: "block",
        fontWeight: 500,
        fontSize: 14,
        lineHeight: 1.15,
        marginBottom: "0.5rem",
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
    <Text size="2" mb="2" style={{ display: "block", opacity: 0.85 }}>
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

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function AddButton() {
  return (
    <Button size="1" color="green">
      <Text>Add</Text>
    </Button>
  );
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function RemoveButton() {
  return (
    <Button size="1" color="ruby" type="button">
      <Text>Remove</Text>
    </Button>
  );
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function MoveUpButton() {
  return (
    <Button size="1" color="gray" highContrast type="button">
      <Text>Move Up</Text>
    </Button>
  );
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function MoveDownButton() {
  return (
    <Button size="1" color="gray" highContrast type="button">
      <Text>Move Down</Text>
    </Button>
  );
}
