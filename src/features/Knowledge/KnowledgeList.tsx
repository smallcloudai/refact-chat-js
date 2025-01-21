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
  IconButton,
  HoverCard,
  DataList,
} from "@radix-ui/themes";
import {
  TrashIcon,
  Pencil1Icon,
  MagnifyingGlassIcon,
  LayersIcon,
  PlusIcon,
} from "@radix-ui/react-icons";
import {
  isAddMemoryRequest,
  isMemUpdateRequest,
  knowledgeApi,
  MemoRecord,
  MemUpdateRequest,
  SubscribeArgs,
  VecDbStatus,
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

  console.log(request.data?.status);

  // TBD: should the user be able to add a new memory ?
  return (
    <Flex direction="column" overflowY="hidden" height="100%">
      <Flex direction="column" gap="4" mb="4">
        <Flex justify="between">
          <Button variant="outline" onClick={handleBack}>
            Back
          </Button>

          <Flex gap="3">
            <TextField.Root
              placeholder="Search knowledge"
              value={searchValue?.quick_search ?? ""}
              onChange={handleSearch}
            >
              <TextField.Slot>
                <MagnifyingGlassIcon height="16" width="16" />
              </TextField.Slot>
            </TextField.Root>

            <IconButton
              variant="outline"
              title="Add new knowledge"
              disabled={openForm}
              onClick={() => setOpenForm(true)}
            >
              <PlusIcon />
            </IconButton>

            <VecDBStatus status={request.data?.status ?? null} />
          </Flex>
        </Flex>

        <Heading ml="auto" mr="auto" as="h4">
          Knowledge
        </Heading>

        {openForm && <KnowledgeListForm onClose={() => setOpenForm(false)} />}
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
  const [submit, result] = knowledgeApi.useUpdateMemoryMutation();

  const handleSubmit = useCallback(
    (event: React.FormEvent<HTMLFormElement>) => {
      event.preventDefault();
      const formData = Object.fromEntries(new FormData(event.currentTarget));
      const oldData: MemUpdateRequest = {
        memid: memory.memid,
        mem_type: memory.m_type,
        goal: memory.m_goal,
        project: memory.m_goal,
        payload: memory.m_payload,
        origin: memory.m_origin,
      };
      const updatedMemory = { ...oldData, ...formData };
      // TODO: handle errors
      if (isMemUpdateRequest(updatedMemory)) {
        void submit(updatedMemory);
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
            <TextInput name="goal" label="Goal" defaultValue={memory.m_goal} />
            <TextInput
              name="project"
              label="Project"
              defaultValue={memory.m_project}
            />
            <TextAreaInput
              name="payload"
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

export const VecDBStatus: React.FC<{ status: null | VecDbStatus }> = ({
  status,
}) => {
  if (status === null) {
    return (
      <IconButton disabled loading title="vecdb status">
        <LayersIcon /> Connecting to VecDB
      </IconButton>
    );
  }

  return (
    <HoverCard.Root>
      <HoverCard.Trigger>
        <IconButton variant="outline" title="vecdb status">
          <LayersIcon />
        </IconButton>
      </HoverCard.Trigger>

      <HoverCard.Content>
        <Text mx="auto">VecDb</Text>
        <DataList.Root size="1">
          <DataList.Item>
            <DataList.Label>Status</DataList.Label>
            <DataList.Value>{status.state}</DataList.Value>
          </DataList.Item>

          <DataList.Item>
            <DataList.Label>Unprocessed files</DataList.Label>
            <DataList.Value>{status.files_unprocessed}</DataList.Value>
          </DataList.Item>

          <DataList.Item>
            <DataList.Label>Total files</DataList.Label>
            <DataList.Value>{status.files_total}</DataList.Value>
          </DataList.Item>

          <DataList.Item>
            <DataList.Label>Database size</DataList.Label>
            <DataList.Value>{status.db_size}</DataList.Value>
          </DataList.Item>

          <DataList.Item>
            <DataList.Label>Database cache size</DataList.Label>
            <DataList.Value>{status.db_cache_size}</DataList.Value>
          </DataList.Item>

          <DataList.Item>
            <DataList.Label>Request made since start</DataList.Label>
            <DataList.Value>{status.requests_made_since_start}</DataList.Value>
          </DataList.Item>

          <DataList.Item>
            <DataList.Label>Vectors made since start</DataList.Label>
            <DataList.Value>{status.vectors_made_since_start}</DataList.Value>
          </DataList.Item>

          <DataList.Item>
            <DataList.Label>Queue additions</DataList.Label>
            <DataList.Value>{String(status.queue_additions)}</DataList.Value>
          </DataList.Item>

          <DataList.Item>
            <DataList.Label>Max files hit</DataList.Label>
            <DataList.Value>
              {String(status.vecdb_max_files_hit)}
            </DataList.Value>
          </DataList.Item>

          <DataList.Item>
            <DataList.Label>Errors</DataList.Label>
            <DataList.Value>
              {Object.keys(status.vecdb_errors).length}
            </DataList.Value>
          </DataList.Item>
        </DataList.Root>
      </HoverCard.Content>
    </HoverCard.Root>
  );
};
