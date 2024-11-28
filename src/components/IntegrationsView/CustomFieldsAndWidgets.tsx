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
  width = "100%",
  size = "long",
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
  width?: string;
  size?: string;
}) => {
  return (
    <Box minWidth={width}>
      {size !== "multiline" ? (
        <TextField.Root
          id={id}
          name={name}
          type={type}
          size="2"
          value={value}
          defaultValue={defaultValue}
          placeholder={placeholder}
        />
      ) : (
        <TextArea
          id={id}
          name={name}
          size="2"
          rows={3}
          value={value}
          defaultValue={defaultValue?.toString()}
          placeholder={placeholder}
        />
      )}
    </Box>
  );
};

export const CustomLabel = ({
  label,
  htmlFor,
  marginTop,
}: {
  label: string;
  htmlFor?: string;
  marginTop?: string;
}) => {
  return (
    <label
      htmlFor={htmlFor}
      style={{
        display: "block",
        fontWeight: 500,
        fontSize: 14,
        lineHeight: 1.15,
        marginTop,
      }}
    >
      {label}
    </label>
  );
};

export const CustomDescriptionField = ({
  children = "",
  mb = "2",
}: {
  children?: string;
  mb?: string;
}) => {
  return (
    <Text size="1" mb={mb} style={{ display: "block", opacity: 0.85 }}>
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
