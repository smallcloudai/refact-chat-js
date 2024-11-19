import {
  Box,
  Checkbox,
  TextField,
  TextArea,
  Button,
  Text,
} from "@radix-ui/themes";

// NOTE: this function can be useful for making titles of fields look better (Pascal Case)
// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function toPascalCase(value: string) {
  return value
    .split("_")
    .map((str) => str.charAt(0).toUpperCase() + str.slice(1))
    .join(" ")
    .split("-")
    .join(" ");
}

// Custom String Field
const CustomStringField = () => {
  return (
    <Box mb="3">
      <TextField.Root size="3" />
    </Box>
  );
};

const CustomTitleField = () => {
  return <h1 style={{ color: "red" }}>TEST</h1>;
};

const CustomDescriptionField = () => {
  return <Text style={{ color: "red" }}>Test</Text>;
};

// Custom Textarea Widget
const CustomTextareaWidget = () => {
  return (
    <Box>
      <label htmlFor={"d"}>Test label * required</label>
      <TextArea id={"d"} />
    </Box>
  );
};

// Custom Checkbox Widget
const CustomCheckboxWidget = () => {
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
function AddButton() {
  return (
    <Button size="1" color="green">
      <Text>Add</Text>
    </Button>
  );
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function RemoveButton() {
  return (
    <Button size="1" color="ruby" type="button">
      <Text>Remove</Text>
    </Button>
  );
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function MoveUpButton() {
  return (
    <Button size="1" color="gray" highContrast type="button">
      <Text>Move Up</Text>
    </Button>
  );
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function MoveDownButton() {
  return (
    <Button size="1" color="gray" highContrast type="button">
      <Text>Move Down</Text>
    </Button>
  );
}

function TitleFieldTemplate() {
  return null;
}

function FieldTemplate() {
  return (
    <Box>
      <label htmlFor={"d"} className="control-label">
        label *
      </label>
    </Box>
  );
}

function DescriptionFieldTemplate() {
  return (
    <Text id={"d"} size="3" my="2" className="field-description">
      description
    </Text>
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
