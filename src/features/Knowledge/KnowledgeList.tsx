import React, { ChangeEvent, useCallback, useEffect, useState } from "react";
import {
  Card,
  Flex,
  Heading,
  Spinner,
  Text,
  Button,
  TextField,
  TextArea,
  TextAreaProps,
  Box,
  IconButton,
} from "@radix-ui/themes";
import {
  TrashIcon,
  Pencil1Icon,
  MagnifyingGlassIcon,
} from "@radix-ui/react-icons";
import {
  isAddMemoryRequest,
  knowledgeApi,
  MemoRecord,
  SubscribeArgs,
} from "../../services/refact/knowledge";
import { pop } from "../../features/Pages/pagesSlice";
import { useAppDispatch } from "../../hooks";
import { ScrollArea } from "../../components/ScrollArea";
import styles from "./Knowledge.module.css";

export const KnowledgeList: React.FC = () => {
  const [searchValue, setSearchValue] = useState<SubscribeArgs>(undefined);
  const request = knowledgeApi.useSubscribeQuery(searchValue);
  const dispatch = useAppDispatch();

  const [openForm, setOpenForm] = React.useState<boolean>(false);
  const [editing, setEditing] = React.useState<null | string>(null);

  const handleBack = React.useCallback(() => {
    if (openForm) {
      setOpenForm(false);
    } else {
      dispatch(pop());
    }
  }, [dispatch, openForm]);

  const handleSearch = useCallback((event: ChangeEvent<HTMLInputElement>) => {
    // debounce changes.
    if (event.target.value) {
      setSearchValue({ quick_search: event.target.value });
    } else {
      setSearchValue(undefined);
    }
  }, []);

  const memoryCount = Object.keys(request.data?.memories ?? {}).length;

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

        <TextField.Root
          placeholder="Search knowledge"
          value={searchValue?.quick_search ?? ""}
          onChange={handleSearch}
        >
          <TextField.Slot>
            <MagnifyingGlassIcon height="16" width="16" />
          </TextField.Slot>
        </TextField.Root>

        <Box>
          {openForm ? (
            <KnowledgeListForm onClose={() => setOpenForm(false)} />
          ) : (
            <Button onClick={() => setOpenForm(true)}>Add new knowledge</Button>
          )}
        </Box>
      </Flex>
      <ScrollArea scrollbars="vertical">
        <Flex direction="column" gap="4">
          {request.isLoading && <Spinner loading={request.isLoading} />}
          {/* TODO: this could happen if theres no knowledge, but may also happen while waiting for the stream */}
          {request.data?.loaded && memoryCount === 0 && (
            <Text>No knowledge items found</Text>
          )}

          {Object.values(request.data?.memories ?? {}).map((memory) => {
            return (
              <KnowledgeListItem
                key={memory.memid}
                memory={memory}
                editing={editing === memory.memid}
                onOpenEdit={() => setEditing(memory.memid)}
                onCloseEdit={() => setEditing(null)}
              />
            );
          })}
        </Flex>
      </ScrollArea>
    </Flex>
  );
};

type KnowledgeListItemProps = {
  memory: MemoRecord;
  editing: boolean;
  onOpenEdit: () => void;
  onCloseEdit: () => void;
};

const KnowledgeListItem: React.FC<KnowledgeListItemProps> = ({
  memory,
  editing,
  onOpenEdit,
  onCloseEdit,
}) => {
  const [deleteMemory, result] = knowledgeApi.useDeleteMemoryMutation();

  const handleDeletion = React.useCallback(() => {
    void deleteMemory(memory.memid);
    // TBD: handle errors
    // TBD: should we clear the form after submit?
    // event.currentTarget.reset();
  }, [deleteMemory, memory.memid]);

  if (editing) {
    return <EditKnowledgeForm memory={memory} onClose={onCloseEdit} />;
  }

  return (
    <Card>
      <Flex direction="column" gap="3">
        <Flex justify="between" align="center">
          <Text size="2" weight="bold">
            {memory.m_goal}
          </Text>
          <Flex gap="2" style={{ alignSelf: "flex-start" }}>
            <IconButton onClick={onOpenEdit} variant="outline">
              <Pencil1Icon />
            </IconButton>

            <IconButton
              onClick={handleDeletion}
              variant="outline"
              loading={result.isLoading}
            >
              <TrashIcon />
            </IconButton>
          </Flex>
        </Flex>

        <Text size="2">{memory.m_payload}</Text>
      </Flex>
    </Card>
  );
};

type EditKnowledgeFormProps = {
  memory: MemoRecord;
  onClose: () => void;
};

const EditKnowledgeForm: React.FC<EditKnowledgeFormProps> = ({
  memory,
  onClose,
}) => {
  const [submit, result] = knowledgeApi.useAddMemoryMutation();

  const handleSubmit = useCallback(
    (event: React.FormEvent<HTMLFormElement>) => {
      event.preventDefault();
      const formData = Object.fromEntries(new FormData(event.currentTarget));
      const nextMemory = { ...memory, ...formData };
      if (isAddMemoryRequest(nextMemory)) {
        // TODO: handle errors
        void submit(nextMemory);
      }
    },
    [memory, submit],
  );

  useEffect(() => {
    if (result.isSuccess) {
      onClose();
    }
  }, [onClose, result.isSuccess]);

  return (
    <Card asChild>
      <form onSubmit={handleSubmit} onReset={onClose}>
        <Flex gap="8" direction="column">
          <Flex direction="column" gap="3">
            <TextInput
              name="m_goal"
              label="Goal"
              defaultValue={memory.m_goal}
            />
            <TextInput
              name="m_project"
              label="Project"
              defaultValue={memory.m_project}
            />
            <TextAreaInput
              name="m_payload"
              label="Payload"
              defaultValue={memory.m_payload}
            />
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

// TODO: for adding, will change slightly
const KnowledgeListForm: React.FC<{ onClose: () => void }> = ({ onClose }) => {
  const [submit, result] = knowledgeApi.useAddMemoryMutation();

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const memory = Object.fromEntries(formData.entries());
    console.log({ memory });
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
            <TextInput name="goal" label="Goal" required />
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
