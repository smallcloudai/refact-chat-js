import React from "react";
import {
  Flex,
  Text,
  Section,
  Heading,
  Container,
  Code,
  DataList,
} from "@radix-ui/themes";
import { Markdown } from "../Markdown";

type FimChoices = {
  code_completion: string;
  finish_reason: string;
  index: number;
}[];

type FimFile = {
  file_content: string;
  file_name: string;
  line1: number;
  line2: number;
};

type ContextFiles = FimFile[];

type ContextQueries = string[];

type Context = {
  attached_files: ContextFiles;
  was_looking_for: ContextQueries;
};

export type FimDebugData = {
  choices: FimChoices;
  context: Context;
  created: number;
  model: string;
  snippet_telemetry_id: number;
};

export type FimDebugProps = { data: FimDebugData };

export const FIMDebug: React.FC<FimDebugProps> = ({ data }) => {
  return (
    <Flex direction="column">
      <Heading>FIM debug</Heading>
      <Section size="1">
        <DataList.Root
          orientation={{
            initial: "vertical",
            xs: "horizontal",
          }}
        >
          <DataList.Item>
            <DataList.Label>Snippet</DataList.Label>
            <DataList.Value>{data.snippet_telemetry_id}</DataList.Value>
          </DataList.Item>
          <DataList.Item>
            <DataList.Label>Model</DataList.Label>
            <DataList.Value>{data.model}</DataList.Value>
          </DataList.Item>
          <DataList.Item>
            <DataList.Label>Created</DataList.Label>
            <DataList.Value>{data.created}</DataList.Value>
          </DataList.Item>
        </DataList.Root>
      </Section>

      <Heading size="5">Choices</Heading>
      <Section size="1">
        {data.choices.map((choice, i) => {
          return (
            <DataList.Root
              key={i}
              orientation={{
                initial: "vertical",
                xs: "horizontal",
              }}
            >
              <DataList.Item>
                <DataList.Label>Index</DataList.Label>
                <DataList.Value>{choice.index}</DataList.Value>
              </DataList.Item>
              <DataList.Item>
                <DataList.Label>Code</DataList.Label>
                <DataList.Value>
                  <Code>{choice.code_completion}</Code>
                </DataList.Value>
              </DataList.Item>
              <DataList.Item>
                <DataList.Label>Finish reason</DataList.Label>
                <DataList.Value>{choice.finish_reason}</DataList.Value>
              </DataList.Item>
            </DataList.Root>
          );
        })}
      </Section>

      <Heading size="5">Context Files</Heading>
      <Section size="1">
        {data.context.attached_files.map((file, i) => {
          return (
            <Container key={i}>
              <Text>
                File: {file.file_name}:{file.line1}-${file.line2}
              </Text>
              <Markdown>{"```\n" + file.file_content + "\n```"}</Markdown>
            </Container>
          );
        })}
      </Section>
    </Flex>
  );
};
