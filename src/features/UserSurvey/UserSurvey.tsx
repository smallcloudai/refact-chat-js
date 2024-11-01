import React from "react";
import {
  Heading,
  Dialog,
  Flex,
  RadioGroup,
  TextField,
  Button,
  Box,
} from "@radix-ui/themes";
import { isRadioQuestion, RadioQuestion } from "../../services/smallcloud";
import { useGetUserSurvey } from "../../hooks";

type RadioInputProps = Pick<RadioQuestion, "name" | "options" | "question"> & {
  onValueChange: (value: string) => void;
};

const RadioInput: React.FC<RadioInputProps> = ({
  name,
  question,
  options,
  onValueChange,
}) => {
  return (
    <Box>
      <Heading size="5" mb="3">
        {question}
      </Heading>
      <RadioGroup.Root required name={name} onValueChange={onValueChange}>
        {options.map((option) => (
          <RadioGroup.Item key={option.value} value={option.value}>
            {option.title}
          </RadioGroup.Item>
        ))}
      </RadioGroup.Root>
    </Box>
  );
};

export const UserSurvey = () => {
  const [showTextInput, setShowTextInput] = React.useState<boolean>(false);
  const maybeOpenTextInput = React.useCallback((value: string) => {
    setShowTextInput(value === "other");
  }, []);

  const surveyQuestions = useGetUserSurvey();

  if (!surveyQuestions.data) return null;
  return (
    <Dialog.Root defaultOpen>
      <Dialog.Content asChild>
        <form
          onSubmit={(event) => {
            event.preventDefault();
            // const formData = new FormData(event.currentTarget);
            // const entries = formData.entries();
            // console.log({ entries });
            // console.log({ value, otherSource });
          }}
        >
          {surveyQuestions.data.map((question) => {
            if (isRadioQuestion(question)) {
              return (
                <RadioInput
                  key={question.name}
                  question={question.question}
                  name={question.name}
                  options={question.options}
                  onValueChange={maybeOpenTextInput}
                />
              );
            }

            return null;
          })}

          <Flex gap="3" direction="column" pt="4">
            {showTextInput && (
              <TextField.Root
                required
                disabled={!showTextInput}
                name="other_source"
                placeholder="Other..."
              />
            )}

            <Flex gap="3" mt="4" justify="end">
              <Dialog.Close>
                <Button variant="soft" color="gray">
                  Close
                </Button>
              </Dialog.Close>
              <Dialog.Close>
                <Button type="submit">Submit</Button>
              </Dialog.Close>
            </Flex>
          </Flex>
        </form>
      </Dialog.Content>
    </Dialog.Root>
  );
};
