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
import {
  isRadioQuestion,
  RadioQuestion,
  SurveyQuestions,
} from "../../services/smallcloud";
import { useGetUserSurvey } from "../../hooks";

type RadioInputProps = Pick<RadioQuestion, "name" | "options" | "question"> & {
  onValueChange: (value: string) => void;
  disabled?: boolean;
};

const RadioInput: React.FC<RadioInputProps> = ({
  name,
  question,
  options,
  onValueChange,
  disabled,
}) => {
  return (
    <Box>
      <Heading size="5" mb="3">
        {question}
      </Heading>
      <RadioGroup.Root
        required
        disabled={disabled}
        name={name}
        onValueChange={onValueChange}
      >
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
  const { questionRequest, postSurvey, postSurveyResult } = useGetUserSurvey();

  const handleSubmit = React.useCallback(
    (event: React.FormEvent<HTMLFormElement>) => {
      event.preventDefault();
      const formData = new FormData(event.currentTarget);
      const entries = formData.entries();
      const json = Object.fromEntries(entries);
      // TODO: sending animation and thank you messages
      void postSurvey(json);
    },
    [postSurvey],
  );
  // TODO: conditions for showing the survey.
  console.log({ postSurveyResult });
  if (!questionRequest.data) return null; // Loading
  return (
    <Dialog.Root defaultOpen>
      <Dialog.Content asChild>
        <SurveyForm
          onSubmit={handleSubmit}
          questions={questionRequest.data}
          isFetching={postSurveyResult.isFetching}
        />
      </Dialog.Content>
    </Dialog.Root>
  );
};

const SurveyForm: React.FC<{
  onSubmit: (event: React.FormEvent<HTMLFormElement>) => void;
  questions: SurveyQuestions;
  isFetching: boolean;
}> = ({ questions, onSubmit, isFetching }) => {
  const [showTextInput, setShowTextInput] = React.useState<boolean>(false);
  const maybeOpenTextInput = React.useCallback((value: string) => {
    setShowTextInput(value === "other");
  }, []);
  return (
    <form onSubmit={onSubmit}>
      {questions.map((question) => {
        if (isRadioQuestion(question)) {
          return (
            <RadioInput
              key={question.name}
              question={question.question}
              name={question.name}
              options={question.options}
              onValueChange={maybeOpenTextInput}
              disabled={isFetching}
            />
          );
        }

        return null;
      })}

      <Flex gap="3" direction="column" pt="4">
        {showTextInput && (
          <TextField.Root
            required
            disabled={isFetching}
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
            <Button type="submit" disabled={isFetching}>
              Submit
            </Button>
          </Dialog.Close>
        </Flex>
      </Flex>
    </form>
  );
};
