import React, { useEffect } from "react";
import {
  Card,
  Flex,
  Heading,
  Spinner,
  Text,
  DataList,
  Button,
  TextField,
  TextArea,
  TextAreaProps,
  Container,
} from "@radix-ui/themes";
import {
  isAddMemoryRequest,
  knowledgeApi,
  MemoRecord,
} from "../../services/refact/knowledge";
import { pop } from "../../features/Pages/pagesSlice";
import { useAppDispatch } from "../../hooks";

export const KnowledgeList: React.FC = () => {
  const request = knowledgeApi.useSubscribeQuery(undefined);
  const dispatch = useAppDispatch();

  const [openForm, setOpenForm] = React.useState<boolean>(false);

  const handleBack = React.useCallback(() => {
    if (openForm) {
      setOpenForm(false);
    } else {
      dispatch(pop());
    }
  }, [dispatch, openForm]);

  const memoryCount = Object.keys(request.data?.memories ?? {}).length;

  // TBD: should the user be able to add a new memory ?
  return (
    <Container>
      <Flex direction="column" gap="4" px="4">
        <Flex justify="between">
          <Button variant="outline" onClick={handleBack}>
            Back
          </Button>
          <Heading as="h4">Knowledge</Heading>
          {!openForm && (
            <Button onClick={() => setOpenForm(true)}>Add new knowledge</Button>
          )}
        </Flex>
        {openForm ? (
          <KnowledgeListForm onClose={() => setOpenForm(false)} />
        ) : (
          <>
            {request.isLoading && <Spinner loading={request.isLoading} />}
            {/* TODO: this could happen if theres no knowledge, but may also happen while waiting for the stream */}
            {!request.isFetching &&
              request.data?.loaded === true &&
              memoryCount === 0 && <Text>No knowledge items found</Text>}

            {Object.values(request.data?.memories ?? {}).map((memory) => {
              return <KnowledgeListItem key={memory.memid} memory={memory} />;
            })}
          </>
        )}
      </Flex>
    </Container>
  );
};

const KnowledgeListItem: React.FC<{ memory: MemoRecord }> = ({ memory }) => {
  return (
    <Card>
      <DataList.Root size="1">
        {Object.entries(memory).map(([key, value]) => {
          return (
            <DataList.Item key={key}>
              <DataList.Label>{key}</DataList.Label>
              <DataList.Value>{value}</DataList.Value>
            </DataList.Item>
          );
        })}
      </DataList.Root>
    </Card>
  );
};

const KnowledgeListForm: React.FC<{ onClose: () => void }> = ({ onClose }) => {
  const [submit, result] = knowledgeApi.useAddMemoryMutation();

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const memory = Object.fromEntries(formData.entries());
    if (isAddMemoryRequest(memory)) {
      // TODO: handle errors
      void submit(memory);
    }
    // setOpenForm(false);
    // TBD: should we clear the form after submit?
    // event.currentTarget.reset();
  };

  useEffect(() => {
    result.isSuccess && onClose();
  }, [result.isSuccess, onClose]);

  return (
    <form onSubmit={handleSubmit} onReset={onClose}>
      <Flex direction="column" gap="2">
        <TextInput name="mem_type" label="Type" required />

        <TextInput name="goal" label="Goal" required />

        <TextInput name="project" label="Project" required />

        <TextInput name="origin" label="Origin" required />

        <TextAreaInput name="payload" label="Payload" required />

        <Flex gap="3" justify="end">
          <Button type="submit" color="green">
            Save
          </Button>
          <Button variant="soft" color="gray" type="reset">
            Close
          </Button>
        </Flex>
      </Flex>
    </form>
  );
};

const TextInput: React.FC<TextField.RootProps & { label: React.ReactNode }> = ({
  label,
  ...props
}) => {
  return (
    <Text as="label" htmlFor={props.name}>
      {label}
      <TextField.Root {...props} />
    </Text>
  );
};

const TextAreaInput: React.FC<TextAreaProps & { label: React.ReactNode }> = ({
  label,
  ...props
}) => {
  return (
    <Text as="label" htmlFor={props.name}>
      {label}
      <TextArea {...props} />
    </Text>
  );
};
