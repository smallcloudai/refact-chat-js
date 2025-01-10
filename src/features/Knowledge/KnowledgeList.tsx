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
  Box,
  IconButton,
} from "@radix-ui/themes";
import { TrashIcon } from "@radix-ui/react-icons";
import {
  isAddMemoryRequest,
  knowledgeApi,
  MemoRecord,
} from "../../services/refact/knowledge";
import { pop } from "../../features/Pages/pagesSlice";
import { useAppDispatch } from "../../hooks";
import { ScrollArea } from "../../components/ScrollArea";
import styles from "./Knowledge.module.css";

export const KnowledgeList: React.FC = () => {
  const request = knowledgeApi.useListAllAndSubscribeQuery(undefined);
  const dispatch = useAppDispatch();

  const [openForm, setOpenForm] = React.useState<boolean>(false);

  const handleBack = React.useCallback(() => {
    if (openForm) {
      setOpenForm(false);
    } else {
      dispatch(pop());
    }
  }, [dispatch, openForm]);

  const memoryCount = Object.keys(request.data ?? {}).length;

  // TBD: should the user be able to add a new memory ?
  return (
    <Flex direction="column" overflowY="hidden" height="100%">
      <Flex direction="column" gap="4" mb="4">
        <Box>
          <Button variant="outline" onClick={handleBack}>
            Back
          </Button>
        </Box>

        <Heading ml="auto" mr="auto" as="h4">
          Knowledge
        </Heading>

        <Box>
          {openForm ? (
            <KnowledgeListForm onClose={() => setOpenForm(false)} />
          ) : (
            <Button onClick={() => setOpenForm(true)}>Add new knowledge</Button>
          )}
        </Box>
      </Flex>
      <ScrollArea scrollbars="vertical">
        <Flex direction="column" gap="4" px="4">
          {request.isLoading && <Spinner loading={request.isLoading} />}
          {/* TODO: this could happen if theres no knowledge, but may also happen while waiting for the stream */}
          {!request.isFetching && memoryCount === 0 && (
            <Text>No knowledge items found</Text>
          )}

          {Object.values(request.data ?? {}).map((memory) => {
            return <KnowledgeListItem key={memory.memid} memory={memory} />;
          })}
        </Flex>
      </ScrollArea>
    </Flex>
  );
};

const KnowledgeListItem: React.FC<{ memory: MemoRecord }> = ({ memory }) => {
  const [deleteMemory, result] = knowledgeApi.useDeleteMemoryMutation();
  const handleDeletion = React.useCallback(() => {
    void deleteMemory(memory.memid);
    // TBD: handle errors
    // TBD: should we clear the form after submit?
    // event.currentTarget.reset();
  }, [deleteMemory, memory.memid]);
  return (
    <Card>
      <Box position="absolute" right="3">
        <IconButton
          onClick={handleDeletion}
          variant="outline"
          loading={result.isLoading}
        >
          <TrashIcon />
        </IconButton>
      </Box>
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
    <Card asChild className={styles.knowledge__form}>
      <form onSubmit={handleSubmit} onReset={onClose}>
        <Flex gap="8" direction="column">
          <Flex direction="column" gap="4">
            <TextInput name="mem_type" label="Type" required />

            <TextInput name="goal" label="Goal" required />

            <TextInput name="project" label="Project" required />

            <TextInput name="origin" label="Origin" required />

            <TextAreaInput name="payload" label="Payload" required />
          </Flex>

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
    </Card>
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
