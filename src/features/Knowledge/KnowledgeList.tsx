import React from "react";
import { Card, Flex, Heading, Spinner, Text, DataList } from "@radix-ui/themes";
import { knowledgeApi, MemoRecord } from "../../services/refact/knowledge";

export const KnowledgeList: React.FC = () => {
  const request = knowledgeApi.useSubscribeQuery(undefined);

  const memoryCount = Object.keys(request.data?.memories ?? {}).length;

  // TBD: should the user be able to add a new memory ?
  return (
    <Flex direction="column" gap="4" px="4">
      <Heading as="h4">Knowledge</Heading>
      {request.isLoading && <Spinner loading={request.isLoading} />}
      {!request.isFetching && memoryCount === 0 && (
        <Text>No knowledge items found</Text>
      )}

      {Object.values(request.data?.memories ?? {}).map((memory) => {
        return <KnowledgeListItem key={memory.memid} memory={memory} />;
      })}
    </Flex>
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
